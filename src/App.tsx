import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LicenseProvider } from "@/contexts/LicenseContext";
import { PlaylistProvider } from "@/contexts/PlaylistContext";
import AntenneNew from "./pages/AntenneNew";
import BibliothequeNew from "./pages/BibliothequeNew";
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
              <Route path="/" element={<AntenneNew />} />
              <Route path="/chaines" element={<Chaines />} />
              <Route path="/bibliotheque" element={<BibliothequeNew />} />
              <Route path="/antenne" element={<AntenneNew />} />
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
