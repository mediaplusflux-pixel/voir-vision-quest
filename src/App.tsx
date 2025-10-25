import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Antenne from "./pages/Antenne";
import Bibliotheque from "./pages/Bibliotheque";
import Chaines from "./pages/Chaines";
import Grille from "./pages/Grille";
import Transmission from "./pages/Transmission";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminAuthProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminProtectedRoute><Admin /></AdminProtectedRoute>} />
              
              {/* User routes */}
              <Route path="/" element={<ProtectedRoute><Antenne /></ProtectedRoute>} />
              <Route path="/bibliotheque" element={<ProtectedRoute><Bibliotheque /></ProtectedRoute>} />
              <Route path="/chaines" element={<ProtectedRoute><Chaines /></ProtectedRoute>} />
              <Route path="/grille" element={<ProtectedRoute><Grille /></ProtectedRoute>} />
              <Route path="/transmission" element={<ProtectedRoute><Transmission /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </AdminAuthProvider>
  </QueryClientProvider>
);

export default App;
