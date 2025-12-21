import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";

export function AddHospitalDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    phone: "",
    total_beds: "",
    beds_available: "",
    latitude: "",
    longitude: "",
  });

  const addHospitalMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("hospitals").insert({
        name: formData.name,
        location: formData.location,
        phone: formData.phone || null,
        total_beds: formData.total_beds ? parseInt(formData.total_beds) : 0,
        beds_available: formData.beds_available ? parseInt(formData.beds_available) : 0,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        status: "available",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hospitals"] });
      toast({ title: "Hospital Added", description: "New hospital has been added successfully." });
      setOpen(false);
      setFormData({
        name: "",
        location: "",
        phone: "",
        total_beds: "",
        beds_available: "",
        latitude: "",
        longitude: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add hospital. Please try again.",
        variant: "destructive",
      });
      console.error("Add hospital error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least name and location.",
        variant: "destructive",
      });
      return;
    }
    addHospitalMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Hospital
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Hospital</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Hospital Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="City General Hospital"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Address *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="123 Medical Center Dr"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_beds">Total Beds</Label>
              <Input
                id="total_beds"
                type="number"
                value={formData.total_beds}
                onChange={(e) => setFormData((prev) => ({ ...prev, total_beds: e.target.value }))}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beds_available">Available Beds</Label>
              <Input
                id="beds_available"
                type="number"
                value={formData.beds_available}
                onChange={(e) => setFormData((prev) => ({ ...prev, beds_available: e.target.value }))}
                placeholder="50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData((prev) => ({ ...prev, latitude: e.target.value }))}
                placeholder="40.7128"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData((prev) => ({ ...prev, longitude: e.target.value }))}
                placeholder="-74.0060"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addHospitalMutation.isPending}>
              {addHospitalMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Hospital"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
