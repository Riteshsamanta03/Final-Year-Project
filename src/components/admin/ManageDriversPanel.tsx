import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Users,
  Truck,
  UserPlus,
  UserMinus,
  Loader2,
  MapPin,
  Clock,
} from "lucide-react";

export function ManageDriversPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [selectedAmbulance, setSelectedAmbulance] = useState<string>("");

  // Fetch drivers (users with driver role)
  const { data: drivers, isLoading: loadingDrivers } = useQuery({
    queryKey: ["admin-drivers"],
    queryFn: async () => {
      const { data: driverRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "driver");

      if (rolesError) throw rolesError;

      if (!driverRoles || driverRoles.length === 0) return [];

      const driverIds = driverRoles.map((r) => r.user_id);

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", driverIds);

      if (profilesError) throw profilesError;
      return profiles;
    },
  });

  // Fetch ambulances with driver info
  const { data: ambulances, isLoading: loadingAmbulances } = useQuery({
    queryKey: ["admin-ambulances-with-drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ambulances")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Get unassigned ambulances
  const unassignedAmbulances = ambulances?.filter((a) => !a.driver_id) || [];

  // Get unassigned drivers
  const assignedDriverIds = ambulances?.map((a) => a.driver_id).filter(Boolean) || [];
  const unassignedDrivers = drivers?.filter(
    (d) => !assignedDriverIds.includes(d.user_id)
  ) || [];

  // Assign driver to ambulance
  const assignMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("ambulances")
        .update({ driver_id: selectedDriver })
        .eq("id", selectedAmbulance);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ambulances-with-drivers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ambulances"] });
      queryClient.invalidateQueries({ queryKey: ["available-ambulances-for-dispatch"] });
      toast({
        title: "Driver Assigned",
        description: "Driver has been assigned to the ambulance.",
      });
      setAssignDialogOpen(false);
      setSelectedDriver("");
      setSelectedAmbulance("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign driver.",
        variant: "destructive",
      });
    },
  });

  // Unassign driver from ambulance
  const unassignMutation = useMutation({
    mutationFn: async (ambulanceId: string) => {
      const { error } = await supabase
        .from("ambulances")
        .update({ driver_id: null })
        .eq("id", ambulanceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ambulances-with-drivers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ambulances"] });
      queryClient.invalidateQueries({ queryKey: ["available-ambulances-for-dispatch"] });
      toast({
        title: "Driver Removed",
        description: "Driver has been removed from the ambulance.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove driver.",
        variant: "destructive",
      });
    },
  });

  const getDriverName = (driverId: string | null) => {
    if (!driverId) return "Unassigned";
    const driver = drivers?.find((d) => d.user_id === driverId);
    return driver?.full_name || "Unknown Driver";
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{drivers?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Drivers</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {ambulances?.filter((a) => a.driver_id).length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Assigned Vehicles</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unassignedDrivers.length}</p>
              <p className="text-sm text-muted-foreground">Unassigned Drivers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assign Driver Dialog */}
      <div className="flex justify-end">
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Assign Driver to Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Driver to Ambulance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Select Driver</Label>
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedDrivers.length > 0 ? (
                      unassignedDrivers.map((driver) => (
                        <SelectItem key={driver.user_id} value={driver.user_id}>
                          {driver.full_name || driver.user_id}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No unassigned drivers
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Ambulance</Label>
                <Select
                  value={selectedAmbulance}
                  onValueChange={setSelectedAmbulance}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an ambulance" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedAmbulances.length > 0 ? (
                      unassignedAmbulances.map((amb) => (
                        <SelectItem key={amb.id} value={amb.id}>
                          {amb.vehicle_number} ({amb.vehicle_type})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No unassigned ambulances
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setAssignDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => assignMutation.mutate()}
                  disabled={
                    !selectedDriver ||
                    !selectedAmbulance ||
                    assignMutation.isPending
                  }
                  className="flex-1"
                >
                  {assignMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Assign"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ambulance-Driver Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAmbulances || loadingDrivers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ambulances?.map((ambulance) => (
                <div
                  key={ambulance.id}
                  className="p-4 border border-border rounded-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      <span className="font-semibold">
                        {ambulance.vehicle_number}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        ambulance.status === "available"
                          ? "bg-green-100 text-green-700"
                          : ambulance.status === "on_duty"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      {ambulance.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <p className="text-muted-foreground">{ambulance.vehicle_type}</p>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span
                        className={
                          ambulance.driver_id
                            ? "text-foreground"
                            : "text-muted-foreground italic"
                        }
                      >
                        {getDriverName(ambulance.driver_id)}
                      </span>
                    </div>
                    {ambulance.current_latitude && ambulance.current_longitude && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs">
                          {ambulance.current_latitude.toFixed(4)},{" "}
                          {ambulance.current_longitude.toFixed(4)}
                        </span>
                      </div>
                    )}
                    {ambulance.last_location_update && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">
                          {new Date(ambulance.last_location_update).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {ambulance.driver_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => unassignMutation.mutate(ambulance.id)}
                      disabled={unassignMutation.isPending}
                    >
                      <UserMinus className="w-4 h-4" />
                      Remove Driver
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Driver List */}
      <Card>
        <CardHeader>
          <CardTitle>All Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingDrivers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : drivers && drivers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Phone</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Assigned Vehicle
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => {
                    const assignedAmbulance = ambulances?.find(
                      (a) => a.driver_id === driver.user_id
                    );
                    return (
                      <tr key={driver.id} className="border-b border-border">
                        <td className="py-3 px-4 font-medium">
                          {driver.full_name || "—"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {driver.phone || "—"}
                        </td>
                        <td className="py-3 px-4">
                          {assignedAmbulance ? (
                            <span className="text-sm">
                              {assignedAmbulance.vehicle_number}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              assignedAmbulance
                                ? "bg-green-100 text-green-700"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {assignedAmbulance ? "Active" : "Available"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No drivers registered yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
