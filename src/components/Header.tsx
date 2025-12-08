import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const navItems = [
    { path: "/chaines", label: "Chaînes" },
    { path: "/bibliotheque", label: "Bibliothèque" },
    { path: "/", label: "Antenne" },
    { path: "/grille", label: "Grille" },
    { path: "/transmission", label: "Transmission TNT" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
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
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-foreground text-lg font-mono">
            {new Date().toLocaleTimeString('fr-FR')}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <User className="w-5 h-5" />
                <span className="max-w-[150px] truncate text-sm">
                  {user?.email || "Utilisateur"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Connecté</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
