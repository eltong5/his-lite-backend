import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, BarChart3, Users } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-hero">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-ocean-bright/10 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 left-[5%] w-96 h-96 rounded-full bg-ocean-light/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="container relative z-10 mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-ocean-light/30 bg-ocean-mid/50 px-4 py-1.5 mb-8">
              <Shield className="w-4 h-4 text-ocean-light" />
              <span className="text-sm font-medium text-ocean-light">Plataforma #1 para agentes de seguros</span>
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-primary-foreground mb-6">
              Tu agencia de seguros,{" "}
              <span className="text-gradient">automatizada</span>
            </h1>
            
            <p className="text-lg md:text-xl text-ocean-surface/80 mb-10 max-w-lg font-body leading-relaxed">
              CRM, pipelines, renovaciones automáticas y más. Todo lo que necesitas para escalar tu negocio de seguros.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="lg" className="text-base px-8">
                Comenzar gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="hero-outline" size="lg" className="text-base px-8 text-ocean-light border-ocean-light/40 hover:bg-ocean-light/10">
                Ver demo
              </Button>
            </div>

            <div className="flex items-center gap-8 mt-12">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-ocean-light" />
                <span className="text-sm text-ocean-surface/70">+500 agentes activos</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-ocean-light" />
                <span className="text-sm text-ocean-surface/70">98% retención</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="rounded-2xl bg-card/10 backdrop-blur-sm border border-ocean-light/20 p-6 shadow-elevated">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-primary-foreground">Pipeline de Ventas</h3>
                    <span className="text-sm text-ocean-light">Hoy</span>
                  </div>
                  {[
                    { stage: "Lead Entrante", count: 12, color: "bg-ocean-light" },
                    { stage: "Cotización Enviada", count: 8, color: "bg-ocean-bright" },
                    { stage: "Underwriting", count: 5, color: "bg-primary" },
                    { stage: "Cierre / Emisión", count: 3, color: "bg-accent" },
                  ].map((item) => (
                    <div key={item.stage} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm text-ocean-surface/80 flex-1">{item.stage}</span>
                      <span className="text-sm font-semibold text-primary-foreground">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 rounded-xl bg-accent/20 backdrop-blur-sm border border-ocean-light/20 p-4 animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <Shield className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-ocean-surface/70">Póliza emitida</p>
                    <p className="text-sm font-bold text-primary-foreground">$12,500/mes</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
