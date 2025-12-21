import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import fastcarelogo from "../../assets/fastcarelogo.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Heart, 
  Ambulance, 
  Shield, 
  ArrowRight,
  UserCircle,
  Truck,
  Settings
} from "lucide-react";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Check if this is a first-time user
      const welcomeShown = localStorage.getItem(`welcome_shown_${user.id}`);
      if (!welcomeShown) {
        // Small delay to let the page load first
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleClose = () => {
    if (user) {
      localStorage.setItem(`welcome_shown_${user.id}`, 'true');
    }
    setIsOpen(false);
  };

  const handleGoToDashboard = () => {
    handleClose();
    switch (userRole) {
      case "admin":
        navigate("/admin");
        break;
      case "driver":
        navigate("/driver");
        break;
      default:
        navigate("/dashboard");
    }
  };

  const getRoleContent = () => {
    switch (userRole) {
      case "admin":
        return {
          icon: Settings,
          title: "Welcome, Admin!",
          description: "You now have full access to manage hospitals, ambulances, and drivers.",
          features: [
            { icon: Ambulance, text: "Manage ambulance fleet" },
            { icon: Heart, text: "Add and update hospitals" },
            { icon: UserCircle, text: "Assign drivers to vehicles" },
          ],
          buttonText: "Go to Admin Dashboard",
        };
      case "driver":
        return {
          icon: Truck,
          title: "Welcome, Driver!",
          description: "You're now part of the FastCare emergency response team.",
          features: [
            { icon: Ambulance, text: "View assigned ambulance" },
            { icon: Shield, text: "Accept emergency bookings" },
            { icon: Heart, text: "Help save lives" },
          ],
          buttonText: "Go to Driver Dashboard",
        };
      default:
        return {
          icon: UserCircle,
          title: "Welcome to FastCare!",
          description: "Your personal healthcare companion is ready to serve you.",
          features: [
            { icon: Ambulance, text: "Request emergency services" },
            { icon: Heart, text: "Manage your health records" },
            { icon: Shield, text: "Book medical transport" },
          ],
          buttonText: "Go to Dashboard",
        };
    }
  };

  const content = getRoleContent();
  const IconComponent = content.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          {/* <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div> */}
          <div className="w-10 h-10 xl flex items-center justify-center overflow-hidden mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center">
                <img
                 src={fastcarelogo}
                 alt="Logo"
                 className="w-full h-full object-contain"
                 />
              </div>
          <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <IconComponent className="w-6 h-6" />
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-6">
          {content.features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              
              <span className="font-medium">{feature.text}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleGoToDashboard} className="w-full gap-2">
            {content.buttonText}
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" onClick={handleClose} className="w-full">
            Explore on my own
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}