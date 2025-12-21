import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-ambulance.jpg";
const benefits = ["No credit card required", "HIPAA compliant", "24/7 support", "Instant booking"];
export function CTASection() {
  return <section className="section-padding bg-background">
      <div className="container-wide">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img src={heroImage} alt="Emergency response" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-foreground/90" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-12 md:p-20 text-background">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 border border-background/20 mb-8">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-medium text-background/90">Available 24/7</span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Ready when you are.
              </h2>
              <p className="text-lg md:text-xl text-background/80 max-w-xl mx-auto mb-10 leading-relaxed">
                Join over 500,000 patients who trust FastCare for their 
                healthcare needs. Start with a free account today.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                <Link to="/auth">
                  <Button className="gap-2 group bg-background text-foreground hover:bg-background/90 h-14 px-8 text-base">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/emergency">
                  <Button variant="outline" className="gap-2 h-14 px-8 text-base border-background/30 text-red-50 bg-destructive">
                    <Phone className="w-5 h-5" />
                    Book Emergency
                  </Button>
                </Link>
              </div>

              {/* Benefits */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                {benefits.map(benefit => <div key={benefit} className="flex items-center gap-2 text-background/70">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm">{benefit}</span>
                  </div>)}
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
      </div>
    </section>;
}