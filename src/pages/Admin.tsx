import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssignAmbulanceDialog } from "@/components/admin/AssignAmbulanceDialog";
import { ManageDriversPanel } from "@/components/admin/ManageDriversPanel";
import { AddHospitalDialog } from "@/components/admin/AddHospitalDialog";
import { AddAmbulanceDialog } from "@/components/admin/AddAmbulanceDialog";
import { useToast } from "@/hooks/use-toast";
import fastcarelogo from "../assets/fastcarelogo.png";
import {
  Hospital,
  Ambulance,
  AlertTriangle,
  LogOut,
  Activity,
  MapPin,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Admin() {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{
    id: string;
    patient_name: string;
    emergency_type: string;
    pickup_location: string;
  } | null>(null);
  const [bookingType, setBookingType] = useState<"emergency" | "transport">("emergency");

  const { data: hospitals } = useQuery({
    queryKey: ["admin-hospitals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("hospitals").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: ambulances } = useQuery({
    queryKey: ["admin-ambulances"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ambulances").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: emergencyBookings } = useQuery({
    queryKey: ["admin-emergency-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emergency_bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: transportBookings } = useQuery({
    queryKey: ["admin-transport-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transport_bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Update booking status
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      table,
    }: {
      id: string;
      status: string;
      table: "emergency_bookings" | "transport_bookings";
    }) => {
      const { error } = await supabase.from(table).update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          variables.table === "emergency_bookings"
            ? "admin-emergency-bookings"
            : "admin-transport-bookings",
        ],
      });
      toast({ title: "Status Updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    },
  });

  // Delete hospital mutation
  const deleteHospitalMutation = useMutation({
    mutationFn: async (hospitalId: string) => {
      const { error } = await supabase.from("hospitals").delete().eq("id", hospitalId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hospitals"] });
      toast({ title: "Hospital Deleted", description: "Hospital has been removed successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete hospital", variant: "destructive" });
    },
  });

  const availableAmbulances = ambulances?.filter((a) => a.status === "available").length || 0;
  const activeEmergencies =
    emergencyBookings?.filter(
      (b) => b.status === "pending" || b.status === "dispatched" || b.status === "in_progress"
    ).length || 0;
  const totalBeds = hospitals?.reduce((acc, h) => acc + (h.beds_available || 0), 0) || 0;

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "available":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "dispatched":
      case "confirmed":
        return "text-blue-600 bg-blue-100";
      case "in_progress":
        return "text-purple-600 bg-purple-100";
      case "completed":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-muted-foreground bg-secondary";
    }
  };

  const handleAssignAmbulance = (
    booking: { id: string; patient_name: string; emergency_type: string; pickup_location: string },
    type: "emergency" | "transport"
  ) => {
    setSelectedBooking(booking);
    setBookingType(type);
    setAssignDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              {/* <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
                <span className="text-background font-bold text-lg">F</span>
              </div> */}
              <div className="w-10 h-10 xl flex items-center justify-center overflow-hidden">
                <img
                 src={fastcarelogo}
                 alt="Logo"
                 className="w-full h-full object-contain"
                 />
              </div>
              <span className="text-xl font-semibold tracking-tight">FastCare Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="emergencies">Emergencies</TabsTrigger>
            <TabsTrigger value="transports">Transports</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
            <TabsTrigger value="ambulances">Ambulances</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Hospitals</CardTitle>
                  <Hospital className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{hospitals?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">{totalBeds} beds available</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Available Ambulances</CardTitle>
                  <Ambulance className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{availableAmbulances}</div>
                  <p className="text-xs text-muted-foreground">of {ambulances?.length || 0} total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Emergencies</CardTitle>
                  <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{activeEmergencies}</div>
                  <p className="text-xs text-muted-foreground">need attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Transport Bookings</CardTitle>
                  <Activity className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{transportBookings?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">recent bookings</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Emergencies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {emergencyBookings
                      ?.filter((b) => b.status === "pending")
                      .slice(0, 5)
                      .map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            <div>
                              <p className="font-medium text-sm">{booking.patient_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {booking.emergency_type}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleAssignAmbulance(
                                {
                                  id: booking.id,
                                  patient_name: booking.patient_name,
                                  emergency_type: booking.emergency_type,
                                  pickup_location: booking.pickup_location,
                                },
                                "emergency"
                              )
                            }
                          >
                            <Truck className="w-4 h-4 mr-1" />
                            Assign
                          </Button>
                        </div>
                      ))}
                    {(!emergencyBookings ||
                      emergencyBookings.filter((b) => b.status === "pending").length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No pending emergencies
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ambulance Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ambulances?.slice(0, 5).map((ambulance) => (
                      <div
                        key={ambulance.id}
                        className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Ambulance className="w-5 h-5" />
                          <div>
                            <p className="font-medium text-sm">{ambulance.vehicle_number}</p>
                            <p className="text-xs text-muted-foreground">{ambulance.vehicle_type}</p>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            ambulance.status
                          )}`}
                        >
                          {ambulance.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Emergencies Tab */}
          <TabsContent value="emergencies">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">Patient</th>
                        <th className="text-left py-3 px-4 font-medium">Type</th>
                        <th className="text-left py-3 px-4 font-medium">Location</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Created</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emergencyBookings?.map((booking) => (
                        <tr key={booking.id} className="border-b border-border">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{booking.patient_name}</p>
                              <p className="text-xs text-muted-foreground">{booking.patient_phone}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">{booking.emergency_type}</td>
                          <td className="py-3 px-4 text-muted-foreground max-w-[200px] truncate">
                            {booking.pickup_location}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-sm">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              {booking.status === "pending" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleAssignAmbulance(
                                      {
                                        id: booking.id,
                                        patient_name: booking.patient_name,
                                        emergency_type: booking.emergency_type,
                                        pickup_location: booking.pickup_location,
                                      },
                                      "emergency"
                                    )
                                  }
                                >
                                  Assign
                                </Button>
                              )}
                              {(booking.status === "dispatched" ||
                                booking.status === "in_progress") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      id: booking.id,
                                      status: "completed",
                                      table: "emergency_bookings",
                                    })
                                  }
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              {booking.status !== "cancelled" && booking.status !== "completed" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      id: booking.id,
                                      status: "cancelled",
                                      table: "emergency_bookings",
                                    })
                                  }
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transports Tab */}
          <TabsContent value="transports">
            <Card>
              <CardHeader>
                <CardTitle>Transport Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">Patient</th>
                        <th className="text-left py-3 px-4 font-medium">From</th>
                        <th className="text-left py-3 px-4 font-medium">To</th>
                        <th className="text-left py-3 px-4 font-medium">Scheduled</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transportBookings?.map((booking) => (
                        <tr key={booking.id} className="border-b border-border">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{booking.patient_name}</p>
                              <p className="text-xs text-muted-foreground">{booking.patient_phone}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground max-w-[150px] truncate">
                            {booking.pickup_location}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground max-w-[150px] truncate">
                            {booking.destination}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm">{booking.scheduled_date}</p>
                              <p className="text-xs text-muted-foreground">{booking.scheduled_time}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              {(booking.status === "scheduled" || booking.status === "confirmed") && !booking.ambulance_id && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleAssignAmbulance(
                                      {
                                        id: booking.id,
                                        patient_name: booking.patient_name,
                                        emergency_type: booking.transport_type || "Transport",
                                        pickup_location: booking.pickup_location,
                                      },
                                      "transport"
                                    )
                                  }
                                >
                                  Assign
                                </Button>
                              )}
                              {booking.ambulance_id && (
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                  Ambulance Assigned
                                </span>
                              )}
                              {booking.status !== "cancelled" && booking.status !== "completed" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      updateStatusMutation.mutate({
                                        id: booking.id,
                                        status: "completed",
                                        table: "transport_bookings",
                                      })
                                    }
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive"
                                    onClick={() =>
                                      updateStatusMutation.mutate({
                                        id: booking.id,
                                        status: "cancelled",
                                        table: "transport_bookings",
                                      })
                                    }
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers">
            <ManageDriversPanel />
          </TabsContent>

          {/* Hospitals Tab */}
          <TabsContent value="hospitals">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Hospital Management</CardTitle>
                <AddHospitalDialog />
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">Name</th>
                        <th className="text-left py-3 px-4 font-medium">Location</th>
                        <th className="text-left py-3 px-4 font-medium">Beds Available</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Rating</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hospitals?.map((hospital) => (
                        <tr key={hospital.id} className="border-b border-border">
                          <td className="py-3 px-4 font-medium">{hospital.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{hospital.location}</td>
                          <td className="py-3 px-4">
                            {hospital.beds_available} / {hospital.total_beds}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                                hospital.status
                              )}`}
                            >
                              {hospital.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{hospital.rating} ⭐</td>
                          <td className="py-3 px-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteHospitalMutation.mutate(hospital.id)}
                              disabled={deleteHospitalMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ambulances Tab */}
          <TabsContent value="ambulances">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ambulance Fleet</CardTitle>
                <AddAmbulanceDialog />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ambulances?.map((ambulance) => (
                    <div key={ambulance.id} className="p-4 border border-border rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Ambulance className="w-5 h-5" />
                          <span className="font-semibold">{ambulance.vehicle_number}</span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            ambulance.status
                          )}`}
                        >
                          {ambulance.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          <span>{ambulance.vehicle_type}</span>
                        </div>
                        {ambulance.current_latitude && ambulance.current_longitude && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {ambulance.current_latitude.toFixed(4)},{" "}
                              {ambulance.current_longitude.toFixed(4)}
                            </span>
                          </div>
                        )}
                        {ambulance.last_location_update && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              Updated: {new Date(ambulance.last_location_update).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Assign Ambulance Dialog */}
      <AssignAmbulanceDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        booking={selectedBooking}
        bookingType={bookingType}
      />
    </div>
  );
}
