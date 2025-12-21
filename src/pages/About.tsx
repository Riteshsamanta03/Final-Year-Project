import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AIChatWidget } from "@/components/chat/AIChatWidget";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Shield, 
  Clock, 
  Users, 
  Award,
  ArrowRight,
  Target,
  Zap,
  Globe
} from "lucide-react";

const stats = [
  { value: "500K+", label: "Patients Served" },
  { value: "99.7%", label: "Success Rate" },
  { value: "8 min", label: "Avg Response" },
  { value: "2,500+", label: "Partner Hospitals" },
];

const values = [
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Patient First",
    description: "Every decision we make starts with the patient. Their health, comfort, and peace of mind are our priorities.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Speed Matters",
    description: "In emergencies, every second counts. We've built our entire platform around minimizing response times.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Trust & Security",
    description: "Your health data is sacred. We employ bank-level security and are fully HIPAA compliant.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Universal Access",
    description: "Healthcare should be accessible to everyone, everywhere. We're working to make that a reality.",
  },
];

const team = [
  {
    name: "Biswanath Maiti",
    role: "BWU/BTA/22/301",
    bio: "BTech CSE (AI & ML)",
  },
  {
    name: "Arghya Ghosh",
    role: "BWU/BTA/22/315",
    bio: "BTech CSE (AI & ML)",
  },
  {
    name: "Ritesh Samanta",
    role: "BWU/BTA/22/316",
    bio: "BTech CSE (AI & ML)",
  },
  {
    name: "Surajit Patra",
    role: "BWU/BTA/22/313",
    bio: "BTech CSE (AI & ML)",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        {/* Hero */}
        <section className="section-padding">
          <div className="container-wide">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">About FastCare</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Redefining
                <br />
                healthcare access.
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                We believe that quality healthcare shouldn't be limited by 
                location, time, or circumstance. FastCare was built to make 
                emergency care instant and accessible to everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-secondary">
          <div className="container-wide px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="section-padding">
          <div className="container-wide">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium">Our Mission</span>
                </div>
                <h2 className="text-4xl font-bold tracking-tight mb-6">
                  Making emergency care
                  <br />
                  accessible to all.
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  FastCare was founded in 2025 by a team who saw firsthand how delayed emergency response 
                  could impact outcomes.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our platform connects patients with verified ambulances in seconds, 
                  provides real-time tracking, and gives hospitals advance notice to 
                  prepare for arrivals — saving precious minutes that can mean the 
                  difference between life and death.
                </p>
              </div>
              <div className="bg-foreground text-background rounded-3xl p-12">
                <blockquote className="text-2xl font-medium leading-relaxed mb-8">
                  "In emergency medicine, we always say time is tissue. 
                  FastCare is built on that principle — every feature is 
                  designed to reduce response times."
                </blockquote>
                {/* <div>
                  <p className="font-semibold">Dr. Sarah Chen</p>
                  <p className="text-background/70">CEO & Co-Founder</p>
                </div> */}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-secondary">
          <div className="container-wide">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold tracking-tight mb-4">Our Values</h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                The principles that guide everything we do.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <div 
                  key={value.title}
                  className="p-6 rounded-2xl bg-background border border-border"
                >
                  <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center mb-6">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section-padding">
          <div className="container-wide">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Leadership</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight mb-4">
                Meet Our Team
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Healthcare veterans and technologists united by a common mission.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <div 
                  key={member.name}
                  className="p-6 rounded-2xl bg-secondary/50 border border-transparent hover:border-border transition-all text-center group"
                >
                  <div className="w-20 h-20 rounded-2xl bg-foreground text-background flex items-center justify-center mx-auto mb-6 text-2xl font-bold transition-transform group-hover:scale-110">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-foreground text-background">
          <div className="container-narrow text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Join us in redefining
              <br />
              healthcare access.
            </h2>
            <p className="text-xl text-background/70 max-w-xl mx-auto mb-10">
              Whether you're a patient, healthcare provider, or want to join our 
              team — we'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button variant="secondary" size="lg" className="gap-2 group">
                  Get Started
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href="mailto:careers@fastcare.com">
                <Button variant="ghost" size="lg" className="text-background hover:text-background hover:bg-background/10">
                  Join Our Team
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <AIChatWidget />
    </div>
  );
}
