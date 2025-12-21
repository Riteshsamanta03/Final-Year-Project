import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { AIChatWidget } from "@/components/chat/AIChatWidget";
import { EmergencyTracker } from "@/components/tracking/EmergencyTracker";
import { 
  Phone, 
  MapPin, 
  AlertTriangle, 
  User, 
  Loader2,
  Ambulance,
  Navigation,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const emergencyTypes = [
  { value: "cardiac", label: "Cardiac Emergency" },
  { value: "accident", label: "Accident/Trauma" },
  { value: "stroke", label: "Stroke" },
  { value: "respiratory", label: "Breathing Difficulty" },
  { value: "pregnancy", label: "Pregnancy Emergency" },
  { value: "other", label: "Other Medical Emergency" },
];

export default function Emergency() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [bookingDetails, setBookingDetails] = useState<{
    id: string;
    eta: number;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    emergencyType: "",
    notes: "",
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationCoords({ lat: latitude, lng: longitude });

        try {
          // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en',
              },
            }
          );

          if (!response.ok) throw new Error("Geocoding failed");

          const data = await response.json();
          
          // Build a readable address from the response
          let address = data.display_name;
          
          // Try to create a shorter, more useful address
          if (data.address) {
            const parts = [];
            if (data.address.house_number) parts.push(data.address.house_number);
            if (data.address.road) parts.push(data.address.road);
            if (data.address.neighbourhood) parts.push(data.address.neighbourhood);
            if (data.address.suburb) parts.push(data.address.suburb);
            if (data.address.city || data.address.town || data.address.village) {
              parts.push(data.address.city || data.address.town || data.address.village);
            }
            if (data.address.postcode) parts.push(data.address.postcode);
            
            if (parts.length > 0) {
              address = parts.join(", ");
            }
          }

          setFormData((prev) => ({ ...prev, location: address }));
          toast({
            title: "Location Found",
            description: "Your current location has been filled in.",
          });
        } catch (error) {
          // If geocoding fails, use coordinates as fallback
          const coordsString = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
          setFormData((prev) => ({ ...prev, location: coordsString }));
          toast({
            title: "Location Found",
            description: "Using GPS coordinates as location.",
          });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        let message = "Unable to get your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out. Please try again.";
            break;
        }

        toast({
          title: "Location Error",
          description: message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("emergency_bookings")
        .insert({
          patient_id: user?.id,
          patient_name: formData.name,
          patient_phone: formData.phone,
          pickup_location: formData.location,
          pickup_latitude: locationCoords?.lat || null,
          pickup_longitude: locationCoords?.lng || null,
          emergency_type: formData.emergencyType,
          notes: formData.notes || null,
          status: "pending",
          eta_minutes: Math.floor(Math.random() * 5) + 8,
        })
        .select()
        .single();

      if (error) throw error;

      setBookingDetails({
        id: data.id,
        eta: data.eta_minutes || 10,
      });
      setIsBooked(true);
      toast({
        title: "Emergency Request Submitted",
        description: "An ambulance has been dispatched to your location.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit emergency request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear coords if user manually edits the location
    if (e.target.name === "location") {
      setLocationCoords(null);
    }
  };

  const handleReset = () => {
    setIsBooked(false);
    setBookingDetails(null);
    setLocationCoords(null);
    setFormData({
      name: "",
      phone: "",
      location: "",
      emergencyType: "",
      notes: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container-narrow px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive mb-6">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Emergency Services</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Request Emergency
              <br />
              Ambulance
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Fill out the form below and we'll dispatch the nearest 
              available ambulance to your location immediately.
            </p>
          </div>

          {!isBooked ? (
            <div className="max-w-xl mx-auto">
              {/* Quick Call Option */}
              <div className="mb-8 p-6 rounded-2xl bg-secondary border border-border text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  For fastest response, call directly:
                </p>
                <a 
                  href="tel:+1-800-FASTCARE"
                  className="inline-flex items-center gap-2 text-2xl font-bold hover:underline"
                >
                  <Phone className="w-6 h-6" />
                  1-800-FASTCARE
                </a>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter patient's name"
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-secondary border border-border outline-none focus:ring-2 focus:ring-foreground transition-all"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter contact number"
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-secondary border border-border outline-none focus:ring-2 focus:ring-foreground transition-all"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pickup Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter full address or landmark"
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-secondary border border-border outline-none focus:ring-2 focus:ring-foreground transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="mt-2 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 disabled:opacity-50"
                  >
                    {isGettingLocation ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Getting location...
                      </>
                    ) : locationCoords ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        GPS location captured
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4" />
                        Use current location
                      </>
                    )}
                  </button>
                </div>

                {/* Emergency Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Emergency Type *
                  </label>
                  <div className="relative">
                    <AlertTriangle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <select
                      name="emergencyType"
                      value={formData.emergencyType}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-secondary border border-border outline-none focus:ring-2 focus:ring-foreground transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select emergency type</option>
                      {emergencyTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any additional information for the responders..."
                    className="w-full px-4 py-4 rounded-xl bg-secondary border border-border outline-none focus:ring-2 focus:ring-foreground transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="emergency"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Dispatching Ambulance...
                    </>
                  ) : (
                    <>
                      <Ambulance className="w-5 h-5" />
                      Request Ambulance Now
                    </>
                  )}
                </Button>
              </form>
            </div>
          ) : bookingDetails ? (
            <EmergencyTracker
              bookingId={bookingDetails.id}
              initialEta={bookingDetails.eta}
              onReset={handleReset}
            />
          ) : null}
        </div>
      </main>
      <Footer />
      <AIChatWidget />
    </div>
  );
}
