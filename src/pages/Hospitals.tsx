import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AIChatWidget } from "@/components/chat/AIChatWidget";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  Bed,
  Stethoscope,
  ArrowRight,
  Search,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

const hospitals = [
  {
    id: 1,
    name: "Metro General Hospital",
    location: "123 Healthcare Ave, Downtown",
    phone: "(555) 123-4567",
    distance: "2.3 miles",
    bedsAvailable: 45,
    totalBeds: 120,
    departments: ["Emergency", "Cardiology", "Neurology", "Orthopedics"],
    status: "available",
    rating: 4.8,
  },
  {
    id: 2,
    name: "City Medical Center",
    location: "456 Medical Blvd, Midtown",
    phone: "(555) 234-5678",
    distance: "3.1 miles",
    bedsAvailable: 12,
    totalBeds: 80,
    departments: ["Emergency", "Pediatrics", "Internal Medicine"],
    status: "limited",
    rating: 4.6,
  },
  {
    id: 3,
    name: "University Health System",
    location: "789 University Dr, Campus",
    phone: "(555) 345-6789",
    distance: "4.5 miles",
    bedsAvailable: 78,
    totalBeds: 200,
    departments: ["Emergency", "Trauma", "Oncology", "Cardiology", "Neurology"],
    status: "available",
    rating: 4.9,
  },
  {
    id: 4,
    name: "Riverside Community Hospital",
    location: "321 River Road, Eastside",
    phone: "(555) 456-7890",
    distance: "5.2 miles",
    bedsAvailable: 0,
    totalBeds: 60,
    departments: ["Emergency", "General Surgery"],
    status: "full",
    rating: 4.4,
  },
  {
    id: 5,
    name: "St. Mary's Medical Center",
    location: "654 Faith Street, Westend",
    phone: "(555) 567-8901",
    distance: "6.8 miles",
    bedsAvailable: 33,
    totalBeds: 150,
    departments: ["Emergency", "Maternity", "Pediatrics", "Cardiology"],
    status: "available",
    rating: 4.7,
  },
];

export default function Hospitals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const departments = ["all", "Emergency", "Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Oncology"];

  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || 
      hospital.departments.includes(selectedDepartment);
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container-wide px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">Partner Network</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Find Your Hospital
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Access our network of verified partner hospitals with 
              real-time bed availability and instant booking.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hospitals or locations..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-secondary border border-border outline-none focus:ring-2 focus:ring-foreground transition-all"
                />
              </div>

              {/* Department Filter */}
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-4 rounded-xl bg-secondary border border-border outline-none focus:ring-2 focus:ring-foreground transition-all appearance-none cursor-pointer min-w-[200px]"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "all" ? "All Departments" : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hospital Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredHospitals.map((hospital) => (
              <HospitalCard key={hospital.id} hospital={hospital} />
            ))}
          </div>

          {filteredHospitals.length === 0 && (
            <div className="text-center py-20">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No hospitals found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <AIChatWidget />
    </div>
  );
}

function HospitalCard({ hospital }: { hospital: typeof hospitals[0] }) {
  const statusConfig = {
    available: { label: "Available", className: "bg-foreground text-background" },
    limited: { label: "Limited", className: "bg-muted text-muted-foreground" },
    full: { label: "Full", className: "bg-destructive/10 text-destructive" },
  };

  const status = statusConfig[hospital.status as keyof typeof statusConfig];

  return (
    <div className="group p-6 rounded-2xl bg-secondary/50 border border-transparent hover:border-border hover:bg-secondary transition-all duration-500 hover-lift">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">{hospital.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{hospital.location}</span>
            <span>•</span>
            <span>{hospital.distance}</span>
          </div>
        </div>
        <span className={cn("px-3 py-1 rounded-full text-xs font-medium", status.className)}>
          {status.label}
        </span>
      </div>

      {/* Bed Availability */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm">
            <Bed className="w-4 h-4" />
            <span>Bed Availability</span>
          </div>
          <span className="text-sm font-medium">
            {hospital.bedsAvailable} / {hospital.totalBeds}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-foreground rounded-full transition-all duration-500"
            style={{ width: `${(hospital.bedsAvailable / hospital.totalBeds) * 100}%` }}
          />
        </div>
      </div>

      {/* Departments */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm mb-2">
          <Stethoscope className="w-4 h-4" />
          <span>Departments</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {hospital.departments.map((dept) => (
            <span 
              key={dept}
              className="px-3 py-1 rounded-full bg-muted text-xs font-medium"
            >
              {dept}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="default" className="flex-1 gap-2 group/btn">
          <CheckCircle2 className="w-4 h-4" />
          Request Admission
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
        <Button variant="outline" size="icon">
          <Phone className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
