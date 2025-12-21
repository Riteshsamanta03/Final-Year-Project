import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Ambulance } from "lucide-react";

interface AssignAmbulanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: {
    id: string;
    patient_name: string;
    emergency_type: string;
    pickup_location: string;
  } | null;
  bookingType: "emergency" | "transport";
}

export function AssignAmbulanceDialog({
  open,
  onOpenChange,
  booking,
  bookingType,
}: AssignAmbulanceDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAmbulance, setSelectedAmbulance] = useState<string>("");
  const [etaMinutes, setEtaMinutes] = useState<string>("15");

  interface AmbulanceWithDriver {
    id: string;
    vehicle_number: string;
    vehicle_type: string | null;
    driver_name: string | null;
    has_driver: boolean;
  }

  const { data: availableAmbulances, isLoading } = useQuery<AmbulanceWithDriver[]>({
    queryKey: ["available-ambulances-for-dispatch"],
    queryFn: async (): Promise<AmbulanceWithDriver[]> => {
      // Fetch all available ambulances
      const { data: ambulanceData, error } = await supabase
        .from("ambulances")
        .select("id, vehicle_number, vehicle_type, driver_id")
        .eq("status", "available");
      if (error) throw error;

      if (!ambulanceData || ambulanceData.length === 0) return [];

      // Fetch driver names for ambulances that have drivers
      const driverIds = ambulanceData.map((a) => a.driver_id).filter(Boolean) as string[];
      let profiles: { user_id: string; full_name: string | null }[] = [];
      
      if (driverIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", driverIds);
        profiles = profileData || [];
      }

      // Merge driver names
      return ambulanceData.map((amb) => ({
        id: amb.id,
        vehicle_number: amb.vehicle_number,
        vehicle_type: amb.vehicle_type,
        driver_name: amb.driver_id 
          ? profiles.find((p) => p.user_id === amb.driver_id)?.full_name || "Unknown Driver"
          : null,
        has_driver: !!amb.driver_id,
      }));
    },
    enabled: open,
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!booking || !selectedAmbulance) throw new Error("Missing data");

      const table = bookingType === "emergency" ? "emergency_bookings" : "transport_bookings";
      
      // Update booking with ambulance
      const updateData: Record<string, unknown> = {
        ambulance_id: selectedAmbulance,
        status: bookingType === "emergency" ? "dispatched" : "confirmed",
      };
      
      if (bookingType === "emergency") {
        updateData.eta_minutes = parseInt(etaMinutes);
      }

      const { error: bookingError } = await supabase
        .from(table)
        .update(updateData)
        .eq("id", booking.id);

      if (bookingError) throw bookingError;

      // Update ambulance status
      const { error: ambulanceError } = await supabase
        .from("ambulances")
        .update({ status: "on_duty" })
        .eq("id", selectedAmbulance);

      if (ambulanceError) throw ambulanceError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-emergency-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-transport-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ambulances"] });
      queryClient.invalidateQueries({ queryKey: ["available-ambulances"] });
      toast({
        title: "Ambulance Assigned",
        description: "The ambulance has been dispatched successfully.",
      });
      onOpenChange(false);
      setSelectedAmbulance("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to assign ambulance. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ambulance className="w-5 h-5" />
            Assign Ambulance
          </DialogTitle>
        </DialogHeader>

        {booking && (
          <div className="space-y-4">
            <div className="p-3 bg-secondary rounded-lg">
              <p className="font-medium">{booking.patient_name}</p>
              <p className="text-sm text-muted-foreground">
                {booking.emergency_type}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                📍 {booking.pickup_location}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Select Ambulance</Label>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : availableAmbulances && availableAmbulances.length > 0 ? (
                <Select
                  value={selectedAmbulance}
                  onValueChange={setSelectedAmbulance}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an ambulance" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAmbulances.map((amb) => (
                      <SelectItem key={amb.id} value={amb.id}>
                        <span className="font-medium">{amb.vehicle_number}</span>
                        <span className="text-muted-foreground ml-2">
                          ({amb.vehicle_type}) - {amb.has_driver ? amb.driver_name : "No Driver"}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground py-2">
                  No ambulances are available. Please check ambulance statuses.
                </p>
              )}
            </div>

            {bookingType === "emergency" && (
              <div className="space-y-2">
                <Label>Estimated Time of Arrival (minutes)</Label>
                <Input
                  type="number"
                  value={etaMinutes}
                  onChange={(e) => setEtaMinutes(e.target.value)}
                  min="1"
                  max="120"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => assignMutation.mutate()}
                disabled={!selectedAmbulance || assignMutation.isPending}
                className="flex-1"
              >
                {assignMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Dispatch"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
