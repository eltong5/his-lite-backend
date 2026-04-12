import { motion } from "framer-motion";
import { UserPlus, FileSearch, ClipboardCheck, Award, RefreshCw } from "lucide-react";

const stages = [
  { icon: UserPlus, label: "Prospección", desc: "Captura leads de Facebook Ads, formularios web y referidos" },
  { icon: FileSearch, label: "Cotización", desc: "Envía cotizaciones personalizadas con un clic" },
  { icon: ClipboardCheck, label: "Underwriting", desc: "Validación documental y análisis de riesgo" },
  { icon: Award, label: "Emisión", desc: "Cierre de póliza con firma digital integrada" },
  { icon: RefreshCw, label: "Renovación", desc: "Seguimiento automático 30 días antes del vencimiento" },
];

const PipelineSection = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-4 block">
            Pipeline
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Del lead a la renovación
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Un pipeline diseñado para cada etapa del ciclo de vida de una póliza de seguros.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-card border-2 border-primary/30 flex items-center justify-center mb-4 shadow-card">
                  <stage.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-foreground mb-1">{stage.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{stage.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PipelineSection;
