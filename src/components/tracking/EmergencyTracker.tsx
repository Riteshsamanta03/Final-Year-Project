import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  Ambulance,
  MapPin,
  Phone,
  Navigation,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmergencyTrackerProps {
  bookingId: string;
  initialEta: number;
  onReset: () => void;
}

type BookingStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled";

interface BookingData {
  id: string;
  status: string | null;
  eta_minutes: number | null;
  ambulance_id: string | null;
  pickup_location: string;
  emergency_type: string;
  created_at: string;
}

interface AmbulanceData {
  id: string;
  vehicle_number: string;
  vehicle_type: string | null;
  current_latitude: number | null;
  current_longitude: number | null;
  status: string | null;
}

const statusSteps = [
  { key: "pending", label: "Request Received", icon: CheckCircle2 },
  { key: "accepted", label: "Ambulance Assigned", icon: Ambulance },
  { key: "in_progress", label: "En Route to You", icon: Navigation },
  { key: "completed", label: "Arrived", icon: MapPin },
];

export function EmergencyTracker({ bookingId, initialEta, onReset }: EmergencyTrackerProps) {
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [ambulance, setAmbulance] = useState<AmbulanceData | null>(null);
  const [eta, setEta] = useState(initialEta);
  const { toast } = useToast();

  // Fetch initial booking data
  useEffect(() => {
    const fetchBooking = async () => {
      const { data, error } = await supabase
        .from("emergency_bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (error) {
        console.error("Error fetching booking:", error);
        return;
      }

      setBooking(data);
      if (data.eta_minutes) setEta(data.eta_minutes);

      // Fetch ambulance if assigned
      if (data.ambulance_id) {
        const { data: ambData } = await supabase
          .from("ambulances")
          .select("*")
          .eq("id", data.ambulance_id)
          .single();
        if (ambData) setAmbulance(ambData);
      }
    };

    fetchBooking();
  }, [bookingId]);

  // Subscribe to real-time booking updates
  useEffect(() => {
    const channel = supabase
      .channel(`booking-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "emergency_bookings",
          filter: `id=eq.${bookingId}`,
        },
        (payload) => {
          const newData = payload.new as BookingData;
          setBooking(newData);
          if (newData.eta_minutes) setEta(newData.eta_minutes);

          // Show toast for status changes
          const statusLabels: Record<string, string> = {
            accepted: "Ambulance has been assigned to your request",
            in_progress: "Ambulance is now en route to your location",
            completed: "Ambulance has arrived at your location",
            cancelled: "Your booking has been cancelled",
          };

          if (newData.status && statusLabels[newData.status]) {
            toast({
              title: "Status Update",
              description: statusLabels[newData.status],
            });
          }

          // Fetch ambulance if newly assigned
          if (newData.ambulance_id && !ambulance) {
            supabase
              .from("ambulances")
              .select("*")
              .eq("id", newData.ambulance_id)
              .single()
              .then(({ data }) => {
                if (data) setAmbulance(data);
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, ambulance, toast]);

  // Subscribe to ambulance location updates
  useEffect(() => {
    if (!ambulance?.id) return;

    const channel = supabase
      .channel(`ambulance-${ambulance.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ambulances",
          filter: `id=eq.${ambulance.id}`,
        },
        (payload) => {
          const newData = payload.new as AmbulanceData;
          setAmbulance(newData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ambulance?.id]);

  // Countdown timer for ETA
  useEffect(() => {
    if (booking?.status === "completed" || booking?.status === "cancelled") return;

    const interval = setInterval(() => {
      setEta((prev) => Math.max(0, prev - 1 / 60)); // Decrease by 1 second
    }, 1000);

    return () => clearInterval(interval);
  }, [booking?.status]);

  const getCurrentStepIndex = () => {
    if (!booking?.status) return 0;
    const index = statusSteps.findIndex((step) => step.key === booking.status);
    return index === -1 ? 0 : index;
  };

  const currentStepIndex = getCurrentStepIndex();

  if (booking?.status === "cancelled") {
    return (
      <div className="max-w-xl mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-8">
          <XCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Booking Cancelled</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Your emergency booking has been cancelled.
        </p>
        <Button onClick={onReset}>Make New Request</Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* ETA Card */}
      <div className="p-8 rounded-2xl bg-secondary border border-border mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Clock className="w-6 h-6" />
          <span className="text-4xl font-bold">
            {booking?.status === "completed" ? (
              "Arrived"
            ) : (
              `${Math.ceil(eta)} min`
            )}
          </span>
        </div>
        <p className="text-muted-foreground">
          {booking?.status === "completed"
            ? "Ambulance has arrived"
            : "Estimated arrival time"}
        </p>
      </div>

      {/* Ambulance Info */}
      {ambulance && (
        <div className="p-4 rounded-xl bg-foreground text-background mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center">
                <Ambulance className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">{ambulance.vehicle_number}</p>
                <p className="text-sm text-background/70 capitalize">
                  {ambulance.vehicle_type} Ambulance
                </p>
              </div>
            </div>
            {ambulance.current_latitude && ambulance.current_longitude && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps?q=${ambulance.current_latitude},${ambulance.current_longitude}`,
                    "_blank"
                  );
                }}
                className="gap-1"
              >
                <Navigation className="w-4 h-4" />
                Track
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Status Timeline */}
      <div className="space-y-4">
        {statusSteps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                isCurrent
                  ? "bg-foreground text-background"
                  : isCompleted
                  ? "bg-secondary"
                  : "bg-secondary/50 opacity-50"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCurrent
                    ? "bg-background text-foreground animate-pulse"
                    : isCompleted
                    ? "bg-foreground text-background"
                    : "bg-muted"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">{step.label}</p>
                {isCurrent && (
                  <p
                    className={`text-sm ${
                      isCurrent ? "text-background/70" : "text-muted-foreground"
                    }`}
                  >
                    In progress...
                  </p>
                )}
                {isCompleted && (
                  <p className="text-sm text-muted-foreground">Completed</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact Support */}
      <div className="mt-8 p-4 rounded-xl bg-secondary/50 border border-border">
        <p className="text-sm text-muted-foreground mb-2">Need assistance?</p>
        <a
          href="tel:+1-800-FASTCARE"
          className="inline-flex items-center gap-2 font-semibold hover:underline"
        >
          <Phone className="w-4 h-4" />
          1-800-FASTCARE
        </a>
      </div>

      {booking?.status === "completed" && (
        <Button onClick={onReset} className="w-full mt-8">
          Make Another Request
        </Button>
      )}
    </div>
  );
}
