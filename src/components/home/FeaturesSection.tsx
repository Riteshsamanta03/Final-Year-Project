import { 
  Ambulance, 
  Building2, 
  FileHeart, 
  MessageSquare, 
  MapPin, 
  Lock,
  ArrowUpRight
} from "lucide-react";
import hospitalImage from "@/assets/hospital-building.jpg";
import doctorImage from "@/assets/doctor-patient.jpg";

const features = [
  {
    icon: <Ambulance className="w-6 h-6" />,
    title: "Emergency Booking",
    description: "Book an ambulance in seconds with real-time GPS tracking. Our network of certified drivers ensures help arrives when you need it most.",
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: "Hospital Network",
    description: "Access our verified network of partner hospitals. Check bed availability, departments, and get instant admission support.",
  },
  {
    icon: <FileHeart className="w-6 h-6" />,
    title: "Personal Health ID",
    description: "Create your secure health profile. Store medical records, prescriptions, and share with doctors on your terms.",
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Live Tracking",
    description: "Track your ambulance in real-time from booking to arrival. Stay informed every step of the way.",
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "AI Health Assistant",
    description: "Get instant answers to health questions. Our AI assistant helps with bookings, health guidance, and more.",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "HIPAA Compliant",
    description: "Your health data is protected with enterprise-grade encryption. We take your privacy seriously.",
  },
];

export function FeaturesSection() {
  return (
    <section className="section-padding bg-background overflow-hidden">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Why FastCare
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Everything you need,
            <br />
            nothing you don't.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We've reimagined healthcare access with a focus on speed, 
            simplicity, and security. No more waiting. No more confusion.
          </p>
        </div>

        {/* Image + Features Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          {/* Left: Image Collage */}
          <div className="relative">
            <div className="relative">
              {/* Main Image */}
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={hospitalImage} 
                  alt="Modern hospital building" 
                  className="w-full h-80 lg:h-96 object-cover"
                />
              </div>
              
              {/* Floating Second Image */}
              <div className="absolute -bottom-8 -right-4 lg:-right-8 w-48 lg:w-56 rounded-2xl overflow-hidden shadow-xl border-4 border-background">
                <img 
                  src={doctorImage} 
                  alt="Doctor with patient" 
                  className="w-full h-56 lg:h-64 object-cover"
                />
              </div>

              {/* Stats Badge */}
              <div className="absolute top-6 -left-4 lg:-left-8 glass rounded-2xl p-4 shadow-lg">
                <div className="text-3xl font-bold text-foreground">200+</div>
                <div className="text-sm text-muted-foreground">Partner Hospitals</div>
              </div>
            </div>
          </div>

          {/* Right: Key Features */}
          <div className="space-y-6 lg:pl-8">
            <h3 className="text-2xl font-bold mb-8">Built for critical moments</h3>
            {features.slice(0, 3).map((feature, index) => (
              <div 
                key={feature.title}
                className="group flex gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-1 flex items-center gap-2">
                    {feature.title}
                    <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.slice(3).map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <div 
      className="group p-8 rounded-2xl bg-secondary/50 border border-transparent hover:border-border hover:bg-secondary transition-all duration-500 hover-lift"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
