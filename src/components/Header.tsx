import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Shield, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const Header = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { isAdmin, logout: adminLogout } = useAdminAuth();
  
  const navItems = [
    { path: "/chaines", label: "Chaînes" },
    { path: "/bibliotheque", label: "Bibliothèque" },
    { path: "/", label: "Antenne" },
    { path: "/grille", label: "Grille" },
    { path: "/transmission", label: "Transmission TNT" },
  ];

  const handleLogout = async () => {
    if (isAdmin) {
      await adminLogout();
    } else {
      logout();
    }
  };

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
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "text-base transition-colors hover:text-foreground flex items-center gap-2",
                  location.pathname === "/admin"
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-foreground text-lg font-mono">
            {new Date().toLocaleTimeString('fr-FR')}
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
