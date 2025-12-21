import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseDriverLocationOptions {
  ambulanceId: string | null;
  enabled?: boolean;
  intervalMs?: number;
}

export function useDriverLocation({ 
  ambulanceId, 
  enabled = true, 
  intervalMs = 10000 
}: UseDriverLocationOptions) {
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const updateLocation = async (latitude: number, longitude: number) => {
    if (!ambulanceId) return;

    try {
      const { error: updateError } = await supabase
        .from("ambulances")
        .update({
          current_latitude: latitude,
          current_longitude: longitude,
          last_location_update: new Date().toISOString(),
        })
        .eq("id", ambulanceId);

      if (updateError) throw updateError;
      
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error("Failed to update location:", err);
      setError("Failed to update location");
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      toast({
        title: "Location Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setIsTracking(true);

    // Get immediate location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocation(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        console.error("Location error:", err);
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Set up continuous tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        updateLocation(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        console.error("Watch location error:", err);
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    toast({
      title: "Location Tracking Active",
      description: "Your location is now being shared with patients",
    });
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
    toast({
      title: "Location Tracking Stopped",
      description: "Your location is no longer being shared",
    });
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isTracking,
    lastUpdate,
    error,
    startTracking,
    stopTracking,
  };
}
