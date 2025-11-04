import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LicenseProvider } from "@/contexts/LicenseContext";
import { PlaylistProvider } from "@/contexts/PlaylistContext";
import Antenne from "./pages/Antenne";
import Bibliotheque from "./pages/Bibliotheque";
import Chaines from "./pages/Chaines";
import Grille from "./pages/Grille";
import Transmission from "./pages/Transmission";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LicenseProvider>
          <PlaylistProvider>
            <Routes>
            <Route path="/" element={<Antenne />} />
            <Route path="/chaines" element={<Chaines />} />
            <Route path="/bibliotheque" element={<Bibliotheque />} />
            <Route path="/grille" element={<Grille />} />
            <Route path="/transmission" element={<Transmission />} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </PlaylistProvider>
        </LicenseProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
