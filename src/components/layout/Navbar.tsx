import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, User, LogOut, Settings, LayoutDashboard, Shield, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import fastcarelogo from "../../assets/fastcarelogo.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/hospitals", label: "Hospitals" },
  { href: "/health-id", label: "Health ID" },
  { href: "/transport", label: "Transport" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();

  // Fetch user profile to get the first name
  const { data: profile } = useQuery({
    queryKey: ["navbar-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!user?.id,
  });

  // Get first name from profile or user metadata
  const getFirstName = () => {
    if (profile?.full_name) {
      return profile.full_name.split(" ")[0];
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(" ")[0];
    }
    return user?.email?.split("@")[0] || "User";
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const getDashboardLink = () => {
    if (userRole === "admin") return "/admin";
    if (userRole === "driver") return "/driver";
    return "/dashboard";
  };

  const getDashboardIcon = () => {
    if (userRole === "admin") return Shield;
    if (userRole === "driver") return Truck;
    return LayoutDashboard;
  };

  const getDashboardLabel = () => {
    if (userRole === "admin") return "Admin";
    if (userRole === "driver") return "Driver";
    return "Dashboard";
  };

  const DashboardIcon = getDashboardIcon();

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "glass py-3"
          : "bg-transparent py-6"
      )}
    >
      <div className="container-wide px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group"
          >
            {/* <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <span className="text-background font-bold text-lg">F</span>
            </div> */}
            <div className="w-10 h-10 xl flex items-center justify-center overflow-hidden">
                <img
                 src={fastcarelogo}
                 alt="Logo"
                 className="w-full h-full object-contain"
                 />
            </div>
            <span className="text-xl font-semibold tracking-tight ">FastCare</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-all duration-300 hover:text-foreground relative",
                  location.pathname === link.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
                {location.pathname === link.href && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-foreground rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <Link to={getDashboardLink()}>
                <Button variant="outline" size="sm" className="gap-2">
                  <DashboardIcon className="w-4 h-4" />
                  {getDashboardLabel()}
                </Button>
              </Link>
            )}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    Hi, {getFirstName()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardLink()} className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
            <Link to="/emergency">
              <Button variant="default" size="sm" className="gap-2">
                <Phone className="w-4 h-4" />
                Emergency
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-6 pb-6 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-lg font-medium py-2 transition-colors",
                    location.pathname === link.href
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 py-2 text-sm font-medium">
                      <User className="w-4 h-4" />
                      Hi, {getFirstName()}
                    </div>
                    <Link to={getDashboardLink()}>
                      <Button variant="outline" className="w-full gap-2">
                        <DashboardIcon className="w-4 h-4" />
                        {getDashboardLabel()}
                      </Button>
                    </Link>
                    <Link to="/profile">
                      <Button variant="ghost" className="w-full gap-2">
                        <Settings className="w-4 h-4" />
                        Profile Settings
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full gap-2 text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link to="/auth">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                )}
                <Link to="/emergency">
                  <Button variant="default" className="w-full gap-2">
                    <Phone className="w-4 h-4" />
                    Emergency Booking
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
