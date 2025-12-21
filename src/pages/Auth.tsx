import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import fastcarelogo from "../assets/fastcarelogo.png";
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type AuthMode = "login" | "signup";
type UserRole = "patient" | "driver" | "admin";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("patient");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { signIn, signUp, user, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Use useEffect to handle redirects instead of during render
  useEffect(() => {
    if (!authLoading && user) {
      // Redirect to home page after sign in
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        await signIn(formData.email, formData.password);
      } else {
        await signUp(formData.email, formData.password, formData.name, selectedRole);
        setMode("login");
      }
    } catch (error) {
      // Error is handled in auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-12">
            {/* <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-lg">F</span>
            </div> */}
            <div className="w-10 h-10 xl flex items-center justify-center overflow-hidden">
                <img
                 src={fastcarelogo}
                 alt="Logo"
                 className="w-full h-full object-contain"
                 />
            </div>
            <span className="text-xl font-semibold tracking-tight">FastCare</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "login" 
                ? "Enter your credentials to access your account."
                : "Start your healthcare journey with FastCare."}
            </p>
          </div>

          {/* Role Selection (Signup only) */}
          {mode === "signup" && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">I am a...</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "patient", label: "Patient" },
                  { value: "driver", label: "Driver" },
                  // { value: "admin", label: "Admin" },
                ].map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value as UserRole)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      selectedRole === role.value
                        ? "bg-foreground text-background"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your name"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-secondary border border-border outline-none focus:ring-2 focus:ring-foreground transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-secondary border border-border outline-none focus:ring-2 focus:ring-foreground transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-4 rounded-xl bg-secondary border border-border outline-none focus:ring-2 focus:ring-foreground transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle Mode */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-medium text-foreground hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-foreground text-background items-center justify-center p-12">
        <div className="max-w-md text-center">

          {/* <div className="w-20 h-20 rounded-2xl bg-background/10 flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl font-bold">F</span>
          </div> */}

          <div className="flex items-center justify-center gap-3 mx-auto mb-8">
  
  {/* Logo */}
      <div className="w-14 h-14 rounded-2xl  flex items-center justify-center overflow-hidden">
         <img
         src={fastcarelogo}
         alt="FastCare Logo"
         className="w-full h-full object-contain"
         />
      </div>

 {/* Brand Name */}
      <span className="text-2xl font-bold tracking-tight text-white">
         FastCare
      </span>
     </div>

          
          <h2 className="text-3xl font-bold mb-4">
            Healthcare at the speed of life.
          </h2>
          <p className="text-background/70 leading-relaxed">
            Join over 500,000 patients who trust FastCare for emergency services, 
            health records, and instant access to partner hospitals.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-background/10">
            <div>
              <p className="text-2xl font-bold">99.7%</p>
              <p className="text-sm text-background/50">Success Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold">8 min</p>
              <p className="text-sm text-background/50">Avg. Response</p>
            </div>
            <div>
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-background/50">Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
