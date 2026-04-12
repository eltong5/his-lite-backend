import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-ocean-deep/80 backdrop-blur-lg border-b border-ocean-mid/30">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-ocean-light" />
          <span className="font-heading text-xl font-bold text-primary-foreground">InsureTech</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-ocean-surface/70 hover:text-ocean-light transition-colors">Funciones</a>
          <a href="#pipeline" className="text-sm text-ocean-surface/70 hover:text-ocean-light transition-colors">Pipeline</a>
          <a href="#pricing" className="text-sm text-ocean-surface/70 hover:text-ocean-light transition-colors">Precios</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" className="text-ocean-surface/80 hover:text-primary-foreground hover:bg-ocean-mid/50">
              Iniciar sesión
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="hero" size="sm">Prueba gratis</Button>
          </Link>
        </div>

        <button className="md:hidden text-primary-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-ocean-deep border-t border-ocean-mid/30 px-6 py-4 space-y-3">
          <a href="#features" className="block text-sm text-ocean-surface/70 py-2">Funciones</a>
          <a href="#pipeline" className="block text-sm text-ocean-surface/70 py-2">Pipeline</a>
          <a href="#pricing" className="block text-sm text-ocean-surface/70 py-2">Precios</a>
          <Link to="/dashboard">
            <Button variant="hero" size="sm" className="w-full mt-2">Prueba gratis</Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
