import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AIChatWidget } from "@/components/chat/AIChatWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  FileHeart, 
  Shield, 
  Share2, 
  Lock, 
  User,
  Calendar,
  Pill,
  AlertCircle,
  Plus,
  X,
  Save,
  Loader2,
  Phone,
  ArrowRight,
  Edit,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Bank-Level Security",
    description: "256-bit encryption protects all your medical data.",
  },
  {
    icon: <Share2 className="w-6 h-6" />,
    title: "Controlled Sharing",
    description: "Choose exactly what to share with each healthcare provider.",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "HIPAA Compliant",
    description: "Fully compliant with healthcare privacy regulations.",
  },
];

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function HealthID() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [newAllergy, setNewAllergy] = useState("");
  const [newMedication, setNewMedication] = useState("");
  const [newCondition, setNewCondition] = useState("");

  const [formData, setFormData] = useState({
    blood_type: "",
    date_of_birth: "",
    allergies: [] as string[],
    medications: [] as string[],
    chronic_conditions: [] as string[],
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  // Fetch health record
  const { data: healthRecord, isLoading } = useQuery({
    queryKey: ["health-record", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch profile for name
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Update form when data loads
  useEffect(() => {
    if (healthRecord) {
      setFormData({
        blood_type: healthRecord.blood_type || "",
        date_of_birth: healthRecord.date_of_birth || "",
        allergies: healthRecord.allergies || [],
        medications: healthRecord.medications || [],
        chronic_conditions: healthRecord.chronic_conditions || [],
        emergency_contact_name: healthRecord.emergency_contact_name || "",
        emergency_contact_phone: healthRecord.emergency_contact_phone || "",
      });
    }
  }, [healthRecord]);

  // Create health record
  const createHealthRecord = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      // Generate a unique health ID
      const healthId = `FC-${new Date().getFullYear()}-${Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase()}`;

      const { error } = await supabase.from("health_records").insert({
        user_id: user.id,
        health_id: healthId,
        ...formData,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-record"] });
      toast({
        title: "Health ID Created",
        description: "Your Health ID has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create Health ID. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update health record
  const updateHealthRecord = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("health_records")
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-record"] });
      setIsEditing(false);
      toast({
        title: "Health ID Updated",
        description: "Your health information has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addItem = (type: "allergies" | "medications" | "chronic_conditions", value: string) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], value.trim()],
    }));
    if (type === "allergies") setNewAllergy("");
    if (type === "medications") setNewMedication("");
    if (type === "chronic_conditions") setNewCondition("");
  };

  const removeItem = (type: "allergies" | "medications" | "chronic_conditions", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (healthRecord) {
      updateHealthRecord.mutate();
    } else {
      createHealthRecord.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container-wide px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6">
              <FileHeart className="w-4 h-4" />
              <span className="text-sm font-medium">Personal Health ID</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Your Health,
              <br />
              Your Control.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Create your secure Health ID to store medical records, 
              prescriptions, and allergies. Share with providers on your terms.
            </p>
          </div>

          {!healthRecord && !isEditing ? (
            <>
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
                {features.map((feature) => (
                  <div 
                    key={feature.title}
                    className="p-6 rounded-2xl bg-secondary/50 border border-transparent hover:border-border transition-all text-center"
                  >
                    <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center mx-auto mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>

              {/* CTA Card */}
              <div className="max-w-xl mx-auto">
                <div className="p-8 rounded-3xl bg-foreground text-background text-center">
                  <div className="w-16 h-16 rounded-2xl bg-background text-foreground flex items-center justify-center mx-auto mb-6">
                    <FileHeart className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Create Your Health ID</h2>
                  <p className="text-background/70 mb-8">
                    Join 500,000+ patients who securely manage their 
                    health records with FastCare.
                  </p>
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={() => setIsEditing(true)}
                    className="gap-2 group"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <p className="mt-6 text-sm text-background/50">
                    Free forever • No credit card required
                  </p>
                </div>
              </div>
            </>
          ) : isEditing || !healthRecord ? (
            /* Health ID Form */
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileHeart className="w-5 h-5" />
                    {healthRecord ? "Edit Health Information" : "Create Your Health ID"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Blood Type</Label>
                      <select
                        value={formData.blood_type}
                        onChange={(e) => setFormData((prev) => ({ ...prev, blood_type: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border outline-none focus:ring-2 focus:ring-foreground transition-all"
                      >
                        <option value="">Select blood type</option>
                        {bloodTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData((prev) => ({ ...prev, date_of_birth: e.target.value }))}
                        className="h-12"
                      />
                    </div>
                  </div>

                  {/* Allergies */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Allergies
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add an allergy..."
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem("allergies", newAllergy))}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => addItem("allergies", newAllergy)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.allergies.map((allergy, index) => (
                        <Badge key={index} variant="secondary" className="gap-1 pr-1">
                          {allergy}
                          <button
                            onClick={() => removeItem("allergies", index)}
                            className="ml-1 hover:bg-foreground/10 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Medications */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      Current Medications
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a medication..."
                        value={newMedication}
                        onChange={(e) => setNewMedication(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem("medications", newMedication))}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => addItem("medications", newMedication)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.medications.map((medication, index) => (
                        <Badge key={index} variant="secondary" className="gap-1 pr-1">
                          {medication}
                          <button
                            onClick={() => removeItem("medications", index)}
                            className="ml-1 hover:bg-foreground/10 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Chronic Conditions */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <FileHeart className="w-4 h-4" />
                      Chronic Conditions
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a condition..."
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem("chronic_conditions", newCondition))}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => addItem("chronic_conditions", newCondition)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.chronic_conditions.map((condition, index) => (
                        <Badge key={index} variant="secondary" className="gap-1 pr-1">
                          {condition}
                          <button
                            onClick={() => removeItem("chronic_conditions", index)}
                            className="ml-1 hover:bg-foreground/10 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Contact Name</Label>
                        <Input
                          placeholder="Full name"
                          value={formData.emergency_contact_name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, emergency_contact_name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contact Phone</Label>
                        <Input
                          type="tel"
                          placeholder="Phone number"
                          value={formData.emergency_contact_phone}
                          onChange={(e) => setFormData((prev) => ({ ...prev, emergency_contact_phone: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4">
                    {healthRecord && (
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    )}
                    <Button
                      onClick={handleSubmit}
                      disabled={createHealthRecord.isPending || updateHealthRecord.isPending}
                      className="gap-2"
                    >
                      {createHealthRecord.isPending || updateHealthRecord.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {healthRecord ? "Save Changes" : "Create Health ID"}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Health ID Dashboard */
            <div className="max-w-4xl mx-auto">
              {/* Profile Card */}
              <div className="p-8 rounded-3xl bg-secondary border border-border mb-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{profile?.full_name || "User"}</h2>
                      <p className="text-muted-foreground font-mono">{healthRecord.health_id}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InfoItem 
                    icon={<Calendar className="w-4 h-4" />} 
                    label="Date of Birth" 
                    value={healthRecord.date_of_birth 
                      ? new Date(healthRecord.date_of_birth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : "Not set"
                    } 
                  />
                  <InfoItem 
                    icon={<User className="w-4 h-4" />} 
                    label="Blood Type" 
                    value={healthRecord.blood_type || "Not set"} 
                  />
                  <InfoItem 
                    icon={<AlertCircle className="w-4 h-4" />} 
                    label="Allergies" 
                    value={`${healthRecord.allergies?.length || 0} Listed`} 
                  />
                  <InfoItem 
                    icon={<Pill className="w-4 h-4" />} 
                    label="Medications" 
                    value={`${healthRecord.medications?.length || 0} Active`} 
                  />
                </div>
              </div>

              {/* Details Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Allergies */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                      Allergies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {healthRecord.allergies && healthRecord.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {healthRecord.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="text-sm">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No allergies recorded</p>
                    )}
                  </CardContent>
                </Card>

                {/* Medications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Pill className="w-5 h-5" />
                      Medications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {healthRecord.medications && healthRecord.medications.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {healthRecord.medications.map((medication, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            {medication}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No medications recorded</p>
                    )}
                  </CardContent>
                </Card>

                {/* Chronic Conditions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileHeart className="w-5 h-5" />
                      Chronic Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {healthRecord.chronic_conditions && healthRecord.chronic_conditions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {healthRecord.chronic_conditions.map((condition, index) => (
                          <Badge key={index} variant="outline" className="text-sm">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No conditions recorded</p>
                    )}
                  </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      Emergency Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {healthRecord.emergency_contact_name ? (
                      <div className="space-y-2">
                        <p className="font-medium">{healthRecord.emergency_contact_name}</p>
                        {healthRecord.emergency_contact_phone && (
                          <a 
                            href={`tel:${healthRecord.emergency_contact_phone}`}
                            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            {healthRecord.emergency_contact_phone}
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No emergency contact set</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Share Status */}
              <div className="mt-8 p-4 rounded-xl bg-secondary/50 border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {healthRecord.is_shared ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                  <div>
                    <p className="font-medium">
                      {healthRecord.is_shared ? "Health ID is Shared" : "Health ID is Private"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {healthRecord.is_shared 
                        ? "Healthcare providers can access your health information"
                        : "Only you can see your health information"
                      }
                    </p>
                  </div>
                </div>
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

function InfoItem({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-background">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-medium">{value}</p>
    </div>
  );
}
