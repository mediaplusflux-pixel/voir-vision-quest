import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LicenseProvider } from "@/contexts/LicenseContext";
import { PlaylistProvider } from "@/contexts/PlaylistContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import Antenne from "./pages/Antenne";
import Bibliotheque from "./pages/Bibliotheque";
import Chaines from "./pages/Chaines";
import Grille from "./pages/Grille";
import Transmission from "./pages/Transmission";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AdminAuthProvider>
            <LicenseProvider>
              <PlaylistProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  
                  {/* Protected routes */}
                  <Route path="/" element={<ProtectedRoute><Antenne /></ProtectedRoute>} />
                  <Route path="/chaines" element={<ProtectedRoute><Chaines /></ProtectedRoute>} />
                  <Route path="/bibliotheque" element={<ProtectedRoute><Bibliotheque /></ProtectedRoute>} />
                  <Route path="/grille" element={<ProtectedRoute><Grille /></ProtectedRoute>} />
                  <Route path="/transmission" element={<ProtectedRoute><Transmission /></ProtectedRoute>} />
                  
                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminProtectedRoute><Admin /></AdminProtectedRoute>} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </PlaylistProvider>
            </LicenseProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
