import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleBasedRedirect } from "@/components/auth/RoleBasedRedirect";
import { WelcomeModal } from "@/components/auth/WelcomeModal";
import Index from "./pages/Index";
import Emergency from "./pages/Emergency";
import Hospitals from "./pages/Hospitals";
import HealthID from "./pages/HealthID";
import Transport from "./pages/Transport";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import DriverDashboard from "./pages/DriverDashboard";
import ProfileSettings from "./pages/ProfileSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <WelcomeModal />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/about" element={<About />} />
            <Route path="/hospitals" element={<Hospitals />} />
            {/* Role-based redirect route */}
            <Route
              path="/redirect"
              element={
                <ProtectedRoute>
                  <RoleBasedRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver"
              element={
                <ProtectedRoute allowedRoles={["driver", "admin"]}>
                  <DriverDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/emergency" element={<Emergency />} />
            <Route
              path="/health-id"
              element={
                <ProtectedRoute>
                  <HealthID />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transport"
              element={
                <ProtectedRoute>
                  <Transport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
