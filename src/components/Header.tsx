import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Key } from "lucide-react";

const Header = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/chaines", label: "Chaînes" },
    { path: "/bibliotheque", label: "Bibliothèque" },
    { path: "/", label: "Antenne" },
    { path: "/grille", label: "Grille" },
    { path: "/transmission", label: "Transmission TNT" },
  ];

  return (
    <header className="bg-black border-b border-border px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-1 text-2xl font-bold">
            <span className="text-foreground">MEDIA</span>
            <span className="text-primary">+</span>
          </Link>
          
          <nav className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-base transition-colors hover:text-foreground",
                  location.pathname === item.path
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-foreground text-lg font-mono">
            {new Date().toLocaleTimeString('fr-FR')}
          </div>
          <Link 
            to="/chaines" 
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Gérer la licence"
          >
            <Key className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
