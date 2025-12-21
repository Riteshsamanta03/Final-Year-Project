import { ArrowRight } from "lucide-react";
import appTrackingImage from "@/assets/app-tracking.jpg";
import paramedicsImage from "@/assets/paramedics.jpg";

const steps = [
  {
    number: "01",
    title: "Request Help",
    description: "Open the app and tap Emergency. We'll detect your location automatically.",
  },
  {
    number: "02",
    title: "Get Matched",
    description: "Our system finds the nearest available ambulance and dispatches immediately.",
  },
  {
    number: "03",
    title: "Track Arrival",
    description: "Watch your ambulance approach in real-time. Average arrival: 8 minutes.",
  },
  {
    number: "04",
    title: "Receive Care",
    description: "Get professional medical care. Your health records update automatically.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="section-padding bg-foreground text-background overflow-hidden">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-medium text-background/60 uppercase tracking-wider mb-4">
            How It Works
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Help arrives in
            <br />
            four simple steps.
          </h2>
        </div>

        {/* Image + Steps Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">
          {/* Left: Images */}
          <div className="relative order-2 lg:order-1">
            <div className="relative">
              {/* Main Image - Phone with app */}
              <div className="relative mx-auto w-72 lg:w-80">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-background/10">
                  <img 
                    src={appTrackingImage} 
                    alt="FastCare app showing ambulance tracking" 
                    className="w-full h-auto object-cover"
                  />
                </div>
                
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 to-blue-500/20 rounded-3xl blur-2xl -z-10" />
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 lg:right-8 bg-background text-foreground rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">Live Tracking</span>
                </div>
              </div>

              {/* ETA Badge */}
              <div className="absolute -bottom-4 -left-4 lg:left-8 bg-background text-foreground rounded-2xl p-4 shadow-xl">
                <div className="text-2xl font-bold">8 min</div>
                <div className="text-xs text-muted-foreground">Avg. Response</div>
              </div>
            </div>
          </div>

          {/* Right: Steps */}
          <div className="order-1 lg:order-2 space-y-6">
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className="group flex gap-4 p-4 rounded-xl hover:bg-background/5 transition-colors"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-background text-foreground flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                  {step.number}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                    {step.title}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-background/70 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Image Banner */}
        <div className="relative rounded-3xl overflow-hidden">
          <img 
            src={paramedicsImage} 
            alt="Professional paramedic team" 
            className="w-full h-64 lg:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/60 to-transparent" />
          <div className="absolute inset-0 flex items-center p-8 lg:p-12">
            <div className="max-w-md">
              <h3 className="text-2xl lg:text-3xl font-bold mb-3">Professional Care, Every Time</h3>
              <p className="text-background/80 leading-relaxed">
                Our certified paramedics are trained to handle any emergency. 
                With state-of-the-art equipment and continuous training, you're in safe hands.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
