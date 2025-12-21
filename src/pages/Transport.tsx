import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AIChatWidget } from "@/components/chat/AIChatWidget";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone,
  Car,
  CheckCircle2,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const timeSlots = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM",
];

const transportTypes = [
  { 
    value: "wheelchair", 
    label: "Wheelchair Accessible",
    description: "For patients requiring wheelchair transport"
  },
  { 
    value: "stretcher", 
    label: "Stretcher Transport",
    description: "For patients who need to lie down"
  },
  { 
    value: "ambulatory", 
    label: "Ambulatory",
    description: "For patients who can walk with minimal assistance"
  },
];

export default function Transport() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pickup: "",
    destination: "",
    notes: "",
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("transport_bookings")
        .insert({
          patient_id: user?.id,
          patient_name: formData.name,
          patient_phone: formData.phone,
          pickup_location: formData.pickup,
          destination: formData.destination,
          scheduled_date: selectedDate,
          scheduled_time: selectedTime,
          transport_type: selectedType,
          notes: formData.notes || null,
          status: "scheduled",
        });

      if (error) throw error;

      setIsBooked(true);
      toast({
        title: "Transport Scheduled",
        description: `Your transport has been confirmed for ${selectedDate} at ${selectedTime}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule transport. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container-narrow px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6">
              <Car className="w-4 h-4" />
              <span className="text-sm font-medium">Medical Transport</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Schedule Your
              <br />
              Transport
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Book non-emergency medical transport for appointments, 
              check-ups, or follow-up visits up to 7 days in advance.
            </p>
          </div>

          {!isBooked ? (
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium mb-4">
                  Select Date *
                </label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() + i + 1);
                    const dateStr = date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    });
                    const dayStr = date.toLocaleDateString('en-US', { 
                      weekday: 'short' 
                    });
                    const value = date.toISOString().split('T')[0];
                    
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedDate(value)}
                        className={`p-3 rounded-xl text-center transition-all ${
                          selectedDate === value
                            ? "bg-foreground text-background"
                            : "bg-secondary hover:bg-secondary/80"
                        }`}
                      >
                        <p className="text-xs text-inherit opacity-70">{dayStr}</p>
                        <p className="font-medium">{dateStr}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium mb-4">
                  Select Time *
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        selectedTime === time
                          ? "bg-foreground text-background"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transport Type */}
              <div>
                <label className="block text-sm font-medium mb-4">
                  Transport Type *
                </label>
                <div className="space-y-3">
                  {transportTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSelectedType(type.value)}
                      className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                        selectedType === type.value
                          ? "bg-foreground text-background"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedType === type.value
                          ? "border-background"
                          : "border-muted-foreground"
                      }`}>
                        {selectedType === type.value && (
                          <div className="w-2.5 h-2.5 rounded-full bg-background" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{type.label}</p>
                        <p className={`text-sm ${
                          selectedType === type.value
                            ? "text-background/70"
                            : "text-muted-foreground"
                        }`}>
                          {type.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Patient's name"
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-secondary border border-border outline-none focus:ring-2 focus:ring-foreground transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="Contact number"
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-secondary border border-border outline-none focus:ring-2 focus:ring-foreground transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Pickup Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      name="pickup"
                      value={formData.pickup}
                      onChange={handleInputChange}
                      required
                      placeholder="Full pickup address"
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-secondary border border-border outline-none focus:ring-2 focus:ring-foreground transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Destination *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      required
                      placeholder="Hospital or clinic address"
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-secondary border border-border outline-none focus:ring-2 focus:ring-foreground transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Special Instructions</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any special requirements or notes..."
                    className="w-full px-4 py-4 rounded-xl bg-secondary border border-border outline-none focus:ring-2 focus:ring-foreground transition-all resize-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="hero"
                className="w-full gap-2"
                disabled={isSubmitting || !selectedDate || !selectedTime || !selectedType}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Confirm Booking
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            /* Success State */
            <div className="max-w-xl mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-foreground text-background flex items-center justify-center mx-auto mb-8 animate-scale-in">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Transport Confirmed!</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Your medical transport has been scheduled. You'll receive 
                a confirmation SMS and reminder before your appointment.
              </p>

              {/* Booking Details */}
              <div className="p-8 rounded-2xl bg-secondary border border-border mb-8 text-left">
                <h3 className="font-semibold mb-6">Booking Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">{selectedTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Car className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Transport Type</p>
                      <p className="font-medium">
                        {transportTypes.find(t => t.value === selectedType)?.label}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" onClick={() => setIsBooked(false)}>
                  Book Another Transport
                </Button>
                <Button variant="default" asChild>
                  <a href="/">Return Home</a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <AIChatWidget />
    </div>
  );
}
