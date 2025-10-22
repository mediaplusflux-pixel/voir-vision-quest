import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Antenne from "./pages/Antenne";
import Bibliotheque from "./pages/Bibliotheque";
import Chaines from "./pages/Chaines";
import Grille from "./pages/Grille";
import Transmission from "./pages/Transmission";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Antenne /></ProtectedRoute>} />
            <Route path="/bibliotheque" element={<ProtectedRoute><Bibliotheque /></ProtectedRoute>} />
            <Route path="/chaines" element={<ProtectedRoute><Chaines /></ProtectedRoute>} />
            <Route path="/grille" element={<ProtectedRoute><Grille /></ProtectedRoute>} />
            <Route path="/transmission" element={<ProtectedRoute><Transmission /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
