import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDriverLocation } from "@/hooks/useDriverLocation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Calendar,
  ArrowRight,
  Loader2,
  ExternalLink,
  Map,
  Locate,
  LocateOff,
} from "lucide-react";

type BookingStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled";

export default function DriverDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch driver's assigned ambulance
  const { data: ambulance } = useQuery({
    queryKey: ["driver-ambulance", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("ambulances")
        .select("*")
        .eq("driver_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Driver location tracking
  const { isTracking, lastUpdate, startTracking, stopTracking } = useDriverLocation({
    ambulanceId: ambulance?.id || null,
    enabled: !!ambulance?.id,
  });

  // Fetch assigned emergency bookings
  const { data: emergencyBookings, isLoading: loadingEmergency } = useQuery({
    queryKey: ["driver-emergency-bookings", ambulance?.id],
    queryFn: async () => {
      if (!ambulance?.id) return [];
      const { data, error } = await supabase
        .from("emergency_bookings")
        .select("*, hospitals:destination_hospital_id(name, location)")
        .eq("ambulance_id", ambulance.id)
        .in("status", ["pending", "accepted", "in_progress"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!ambulance?.id,
  });

  // Fetch assigned transport bookings
  const { data: transportBookings, isLoading: loadingTransport } = useQuery({
    queryKey: ["driver-transport-bookings", ambulance?.id],
    queryFn: async () => {
      if (!ambulance?.id) return [];
      const { data, error } = await supabase
        .from("transport_bookings")
        .select("*")
        .eq("ambulance_id", ambulance.id)
        .in("status", ["scheduled", "in_progress"])
        .order("scheduled_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!ambulance?.id,
  });

  // Update emergency booking status
  const updateEmergencyStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      const { error } = await supabase
        .from("emergency_bookings")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["driver-emergency-bookings"] });
      toast({
        title: "Status Updated",
        description: `Booking marked as ${variables.status}`,
      });
      setUpdatingId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
      setUpdatingId(null);
    },
  });

  // Update transport booking status
  const updateTransportStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("transport_bookings")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["driver-transport-bookings"] });
      toast({
        title: "Status Updated",
        description: `Transport marked as ${variables.status}`,
      });
      setUpdatingId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
      setUpdatingId(null);
    },
  });

  const openNavigation = (location: string) => {
    const encodedLocation = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, "_blank");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "accepted":
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
        return "bg-purple-100 text-purple-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-secondary text-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="section-padding pt-32">
        <div className="container-wide">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Driver Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your assigned bookings and update trip status.
            </p>
          </div>

          {/* Ambulance Info & Location Tracking */}
          {ambulance && (
            <Card className="mb-8">
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{ambulance.vehicle_number}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {ambulance.vehicle_type} Ambulance
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant={isTracking ? "destructive" : "default"}
                    size="sm"
                    onClick={isTracking ? stopTracking : startTracking}
                    className="gap-2"
                  >
                    {isTracking ? (
                      <>
                        <LocateOff className="w-4 h-4" />
                        Stop Tracking
                      </>
                    ) : (
                      <>
                        <Locate className="w-4 h-4" />
                        Start Tracking
                      </>
                    )}
                  </Button>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      ambulance.status === "available"
                        ? "bg-green-100 text-green-700"
                        : ambulance.status === "on_duty"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {ambulance.status?.replace("_", " ")}
                  </span>
                </div>
              </CardContent>
              {isTracking && lastUpdate && (
                <div className="px-6 pb-4">
                  <p className="text-xs text-muted-foreground">
                    Last location update: {lastUpdate.toLocaleTimeString()}
                  </p>
                </div>
              )}
            </Card>
          )}

          {!ambulance && (
            <Card className="mb-8">
              <CardContent className="p-8 text-center">
                <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Ambulance Assigned</h3>
                <p className="text-sm text-muted-foreground">
                  Contact your administrator to be assigned to an ambulance.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Pickup Locations List */}
          {ambulance && emergencyBookings && emergencyBookings.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Pickup Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emergencyBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-destructive/10 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        </div>
                        <div>
                          <p className="font-medium">{booking.patient_name}</p>
                          <p className="text-sm text-muted-foreground">{booking.pickup_location}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openNavigation(booking.pickup_location)}>
                        <Navigation className="w-4 h-4 mr-1" />
                        Navigate
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Emergency Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Emergency Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingEmergency ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : emergencyBookings && emergencyBookings.length > 0 ? (
                  <div className="space-y-4">
                    {emergencyBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 rounded-xl border border-border bg-secondary/30"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{booking.patient_name}</h4>
                            <p className="text-sm text-muted-foreground capitalize">
                              {booking.emergency_type.replace("_", " ")}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                              booking.status || "pending"
                            )}`}
                          >
                            {booking.status?.replace("_", " ")}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{booking.pickup_location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <a
                              href={`tel:${booking.patient_phone}`}
                              className="hover:underline"
                            >
                              {booking.patient_phone}
                            </a>
                          </div>
                          {booking.eta_minutes && (
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>ETA: {booking.eta_minutes} min</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openNavigation(booking.pickup_location)}
                            className="gap-1"
                          >
                            <Navigation className="w-4 h-4" />
                            Navigate
                            <ExternalLink className="w-3 h-3" />
                          </Button>

                          {booking.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setUpdatingId(booking.id);
                                updateEmergencyStatus.mutate({
                                  id: booking.id,
                                  status: "accepted",
                                });
                              }}
                              disabled={updatingId === booking.id}
                            >
                              {updatingId === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Accept"
                              )}
                            </Button>
                          )}

                          {booking.status === "accepted" && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setUpdatingId(booking.id);
                                updateEmergencyStatus.mutate({
                                  id: booking.id,
                                  status: "in_progress",
                                });
                              }}
                              disabled={updatingId === booking.id}
                            >
                              {updatingId === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Start Trip"
                              )}
                            </Button>
                          )}

                          {booking.status === "in_progress" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setUpdatingId(booking.id);
                                updateEmergencyStatus.mutate({
                                  id: booking.id,
                                  status: "completed",
                                });
                              }}
                              disabled={updatingId === booking.id}
                            >
                              {updatingId === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Complete
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No active emergency bookings</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transport Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Scheduled Transports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTransport ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : transportBookings && transportBookings.length > 0 ? (
                  <div className="space-y-4">
                    {transportBookings.map((transport) => (
                      <div
                        key={transport.id}
                        className="p-4 rounded-xl border border-border bg-secondary/30"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{transport.patient_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {transport.scheduled_date} • {transport.scheduled_time}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                              transport.status || "scheduled"
                            )}`}
                          >
                            {transport.status}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-muted-foreground">Pickup</p>
                              <p>{transport.pickup_location}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <ArrowRight className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-muted-foreground">Destination</p>
                              <p>{transport.destination}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <a
                              href={`tel:${transport.patient_phone}`}
                              className="hover:underline"
                            >
                              {transport.patient_phone}
                            </a>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openNavigation(transport.pickup_location)}
                            className="gap-1"
                          >
                            <Navigation className="w-4 h-4" />
                            Navigate
                          </Button>

                          {transport.status === "scheduled" && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setUpdatingId(transport.id);
                                updateTransportStatus.mutate({
                                  id: transport.id,
                                  status: "in_progress",
                                });
                              }}
                              disabled={updatingId === transport.id}
                            >
                              {updatingId === transport.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Start Trip"
                              )}
                            </Button>
                          )}

                          {transport.status === "in_progress" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setUpdatingId(transport.id);
                                updateTransportStatus.mutate({
                                  id: transport.id,
                                  status: "completed",
                                });
                              }}
                              disabled={updatingId === transport.id}
                            >
                              {updatingId === transport.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Complete
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No scheduled transports</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
