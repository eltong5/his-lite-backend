import { motion } from "framer-motion";
import { GitBranch, Bell, RefreshCw, FileText, MessageSquare, Calendar } from "lucide-react";

const features = [
  {
    icon: GitBranch,
    title: "Pipeline Inteligente",
    description: "5 etapas diseñadas para el ciclo de vida de pólizas: desde prospección hasta renovación.",
  },
  {
    icon: Bell,
    title: "Automatización Total",
    description: "Asignación round-robin, notificaciones SMS y secuencias de nurturing automáticas.",
  },
  {
    icon: RefreshCw,
    title: "Renovaciones Automáticas",
    description: "Alertas 30 días antes del vencimiento con creación automática de oportunidades.",
  },
  {
    icon: FileText,
    title: "Generación de Contratos",
    description: "Integración con DocuSign y Formstack para firmas digitales instantáneas.",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Business",
    description: "Comunícate con tus prospectos y clientes directamente desde el CRM.",
  },
  {
    icon: Calendar,
    title: "Citas Integradas",
    description: "Sincronización con Google y Outlook Calendar para asesorías sin fricciones.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-4 block">
            Funcionalidades
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Todo lo que tu agencia necesita
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Herramientas diseñadas específicamente para el flujo de trabajo de agentes de seguros.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-2xl border border-border bg-card p-8 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-bold text-card-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
