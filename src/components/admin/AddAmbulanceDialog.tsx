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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";

export function AddAmbulanceDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    vehicle_number: "",
    vehicle_type: "standard",
  });

  const addAmbulanceMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ambulances").insert({
        vehicle_number: formData.vehicle_number,
        vehicle_type: formData.vehicle_type,
        status: "available",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ambulances"] });
      toast({ title: "Ambulance Added", description: "New ambulance has been added to the fleet." });
      setOpen(false);
      setFormData({
        vehicle_number: "",
        vehicle_type: "standard",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add ambulance. Please try again.",
        variant: "destructive",
      });
      console.error("Add ambulance error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicle_number) {
      toast({
        title: "Missing Information",
        description: "Please enter the vehicle number.",
        variant: "destructive",
      });
      return;
    }
    addAmbulanceMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Ambulance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Ambulance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle_number">Vehicle Number *</Label>
            <Input
              id="vehicle_number"
              value={formData.vehicle_number}
              onChange={(e) => setFormData((prev) => ({ ...prev, vehicle_number: e.target.value }))}
              placeholder="AMB-001"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle_type">Vehicle Type</Label>
            <Select
              value={formData.vehicle_type}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, vehicle_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="advanced">Advanced Life Support</SelectItem>
                <SelectItem value="basic">Basic Life Support</SelectItem>
                <SelectItem value="neonatal">Neonatal</SelectItem>
                <SelectItem value="cardiac">Cardiac Care</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addAmbulanceMutation.isPending}>
              {addAmbulanceMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Ambulance"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
