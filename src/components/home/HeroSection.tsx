import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, ArrowRight, Shield, Clock, Heart, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-ambulance.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Blur */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Emergency ambulance" 
          className="w-full h-full object-cover scale-110"
        />
        {/* Multi-layer blur overlay */}
        <div className="absolute inset-0 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-background/80" />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
      
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />

      <div className="relative z-10 container-wide px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-border/50 mb-8 animate-fade-up shadow-lg">
            <div className="relative">
              <Sparkles className="w-4 h-4 text-red-500" />
              <div className="absolute inset-0 animate-ping">
                <Sparkles className="w-4 h-4 text-red-500/50" />
              </div>
            </div>
            <span className="text-sm font-medium">Trusted by 500,000+ patients nationwide</span>
          </div>

          {/* Main Headline with enhanced styling */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tighter mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <span className="block ">Healthcare at the</span>
            <span className="block mt-2 relative">
              <span className="relative z-10 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                speed of life.
              </span>
              {/* Underline accent */}
              <svg className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-64 sm:w-80 lg:w-96 h-3" viewBox="0 0 300 12" fill="none">
                <path 
                  d="M2 10C50 2 100 2 150 6C200 10 250 10 298 4" 
                  stroke="url(#underlineGradient)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  className="animate-draw-line"
                />
                <defs>
                  <linearGradient id="underlineGradient" x1="0" y1="0" x2="300" y2="0">
                    <stop offset="0%" stopColor="hsl(0, 84%, 60%)" />
                    <stop offset="50%" stopColor="hsl(220, 84%, 60%)" />
                    <stop offset="100%" stopColor="hsl(280, 84%, 60%)" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-up" style={{ animationDelay: '200ms' }}>
            Instant ambulance booking, verified hospitals, and your complete health 
            records — all in one secure platform designed for modern healthcare.
          </p>

          {/* CTA Buttons with enhanced styling */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <Link to="/emergency">
              <Button variant="hero" className="gap-2 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Emergency Booking
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
            <Link to="/transport">
              <Button variant="hero-outline" className="gap-2 group backdrop-blur-sm">
                <Calendar className="w-5 h-5" />
                Schedule Transport
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Button>
            </Link>
          </div>

          {/* Stats with cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-fade-up" style={{ animationDelay: '400ms' }}>
            <StatCard 
              value="99.7%" 
              label="Success Rate" 
              icon={<Heart className="w-5 h-5" />}
              color="text-red-500"
            />
            <StatCard 
              value="50K+" 
              label="Lives Saved" 
              icon={<Shield className="w-5 h-5" />}
              color="text-blue-500"
            />
            <StatCard 
              value="8 min" 
              label="Avg. Response" 
              icon={<Clock className="w-5 h-5" />}
              color="text-amber-500"
            />
            <StatCard 
              value="24/7" 
              label="Support" 
              icon={<Phone className="w-5 h-5" />}
              color="text-green-500"
            />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      {/* <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-foreground/20 flex items-start justify-center p-2 backdrop-blur-sm">
          <div className="w-1 h-2 bg-foreground/40 rounded-full animate-pulse" />
        </div>
      </div> */}
    </section>
  );
}

function StatCard({ 
  value, 
  label, 
  icon,
  color
}: { 
  value: string; 
  label: string; 
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="group p-4 md:p-6 rounded-2xl glass border border-border/50 hover:border-border transition-all duration-300 hover-lift">
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className={`${color} transition-transform group-hover:scale-110`}>
          {icon}
        </span>
        <span className="text-2xl md:text-3xl font-bold">{value}</span>
      </div>
      <p className="text-xs md:text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
