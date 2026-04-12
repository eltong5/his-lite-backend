import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 bg-hero relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 right-[20%] w-64 h-64 rounded-full bg-ocean-light/10 blur-3xl" />
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            ¿Listo para transformar tu agencia?
          </h2>
          <p className="text-ocean-surface/80 text-lg mb-10">
            Únete a cientos de agentes que ya están cerrando más pólizas con InsureTech.
          </p>
          <Button variant="hero" size="lg" className="text-base px-10">
            Comenzar prueba gratuita
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
