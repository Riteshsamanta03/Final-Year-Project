import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export function RoleBasedRedirect() {
  const { user, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }

    // Get the intended destination from state, or determine based on role
    const from = location.state?.from?.pathname;

    if (from && from !== "/dashboard") {
      navigate(from, { replace: true });
      return;
    }

    // Redirect based on role
    switch (userRole) {
      case "admin":
        navigate("/admin", { replace: true });
        break;
      case "driver":
        navigate("/driver", { replace: true });
        break;
      case "patient":
      default:
        navigate("/dashboard", { replace: true });
        break;
    }
  }, [user, userRole, isLoading, navigate, location.state]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
