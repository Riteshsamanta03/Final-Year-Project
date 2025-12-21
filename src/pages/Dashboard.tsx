import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  User,
  Heart,
  Calendar,
  AlertTriangle,
  ArrowRight,
  FileText,
  Clock,
  Settings,
} from "lucide-react";

export default function Dashboard() {
  const { user, userRole } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: healthRecord } = useQuery({
    queryKey: ["health-record", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: recentBookings } = useQuery({
    queryKey: ["recent-bookings", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("emergency_bookings")
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: upcomingTransport } = useQuery({
    queryKey: ["upcoming-transport", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("transport_bookings")
        .select("*")
        .eq("patient_id", user.id)
        .gte("scheduled_date", new Date().toISOString().split("T")[0])
        .order("scheduled_date", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="section-padding pt-32">
        <div className="container-wide">
          {/* Welcome Section */}
          <div className="flex items-start justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {profile?.full_name || user?.email?.split("@")[0]}
              </h1>
              <p className="text-muted-foreground">
                Manage your health records, bookings, and more from your dashboard.
              </p>
            </div>
            <Link to="/profile">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Profile Settings
              </Button>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <Link to="/emergency">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-destructive/20 bg-destructive/5">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Emergency</h3>
                    <p className="text-sm text-muted-foreground">Book ambulance now</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/transport">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Schedule Transport</h3>
                    <p className="text-sm text-muted-foreground">Plan your ride</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/health-id">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Health ID</h3>
                    <p className="text-sm text-muted-foreground">View your records</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Health Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Health Summary</CardTitle>
                <Link to="/health-id">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {healthRecord ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <span className="text-sm">Blood Type</span>
                      <span className="font-semibold">{healthRecord.blood_type || "Not set"}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <span className="text-sm">Allergies</span>
                      <span className="font-semibold">
                        {healthRecord.allergies?.length || 0} recorded
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <span className="text-sm">Medications</span>
                      <span className="font-semibold">
                        {healthRecord.medications?.length || 0} active
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <span className="text-sm">Health ID</span>
                      <span className="font-mono text-sm">{healthRecord.health_id || "Not generated"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No health record found</p>
                    <Link to="/health-id">
                      <Button>Create Health ID</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {recentBookings && recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          <div>
                            <p className="font-medium text-sm">{booking.emergency_type}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(booking.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            booking.status === "completed"
                              ? "bg-green-100 text-green-600"
                              : booking.status === "cancelled"
                              ? "bg-red-100 text-red-600"
                              : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No recent bookings</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Transport */}
          {upcomingTransport && upcomingTransport.length > 0 && (
            <Card className="mt-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Upcoming Transport</CardTitle>
                <Link to="/transport">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingTransport.map((transport) => (
                    <div key={transport.id} className="p-4 border border-border rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">
                          {transport.scheduled_date}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {transport.scheduled_time}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          <strong>From:</strong> {transport.pickup_location}
                        </p>
                        <p className="text-muted-foreground">
                          <strong>To:</strong> {transport.destination}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
