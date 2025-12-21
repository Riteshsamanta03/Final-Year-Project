import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

type AppRole = "admin" | "driver" | "patient";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, userRole, session } = useAuth();
  const location = useLocation();

  // Prevent back button access after logout by checking session validity
  useEffect(() => {
    // If there's no valid session, the auth state listener will handle it
    if (!session && !isLoading) {
      // Force clear any stale state
      window.history.replaceState(null, '', location.pathname);
    }
  }, [session, isLoading, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No user or no valid session - redirect to auth
  if (!user || !session) {
    // Replace current history entry to prevent back button access
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Wait for role to be fetched
  if (allowedRoles && !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Check role-based access
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    switch (userRole) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "driver":
        return <Navigate to="/driver" replace />;
      case "patient":
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
