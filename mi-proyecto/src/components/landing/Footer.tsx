import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-ocean-deep border-t border-ocean-mid/30">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-ocean-light" />
            <span className="font-heading font-bold text-primary-foreground">InsureTech</span>
          </div>
          <p className="text-sm text-ocean-surface/50">
            © 2026 InsureTech. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
