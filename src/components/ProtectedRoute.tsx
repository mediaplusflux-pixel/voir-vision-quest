import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isAdmin, isLoading: isAdminLoading } = useAdminAuth();
  const [checkingSession, setCheckingSession] = useState(false);

  // Extra guard: confirm session before redirecting to avoid false negatives
  useEffect(() => {
    let mounted = true;
    const confirmSession = async () => {
      if (!isAuthenticated) {
        setCheckingSession(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          // Give AuthContext a tick to pick up the session event
          if (mounted) setTimeout(() => setCheckingSession(false), 50);
        } catch {
          if (mounted) setCheckingSession(false);
        }
      }
    };
    confirmSession();
    return () => { mounted = false; };
  }, [isAuthenticated]);

  if (isLoading || isAdminLoading || checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // If user is admin, allow access without activation key
  if (isAdmin) {
    return <>{children}</>;
  }

  // Otherwise, require authentication
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;