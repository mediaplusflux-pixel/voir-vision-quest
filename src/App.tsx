import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Antenne />} />
          <Route path="/bibliotheque" element={<Bibliotheque />} />
          <Route path="/chaines" element={<Chaines />} />
          <Route path="/grille" element={<Grille />} />
          <Route path="/transmission" element={<Transmission />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
