import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Essential",
    price: "$49",
    period: "/mes",
    description: "Para agentes independientes que comienzan",
    features: [
      "CRM básico",
      "1 Pipeline de ventas",
      "Email Marketing",
      "500 contactos",
      "Soporte por email",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "$129",
    period: "/mes",
    description: "Para agencias en crecimiento",
    features: [
      "Todo de Essential",
      "Automatizaciones avanzadas",
      "Integración de llamadas",
      "WhatsApp Business",
      "IA para scoring de leads",
      "5,000 contactos",
      "Soporte prioritario",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$299",
    period: "/mes",
    description: "Para agencias enterprise",
    features: [
      "Todo de Professional",
      "White-label completo",
      "API Access",
      "Contactos ilimitados",
      "Soporte dedicado",
      "Integraciones personalizadas",
      "SLA garantizado",
    ],
    popular: false,
  },
];

const PricingSection = () => {
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
            Precios
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Planes que crecen contigo
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Sin contratos a largo plazo. Escala cuando estés listo.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-8 ${
                tier.popular
                  ? "border-primary bg-card shadow-elevated scale-105"
                  : "border-border bg-card shadow-card"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    Más popular
                  </span>
                </div>
              )}
              <h3 className="font-heading text-xl font-bold text-card-foreground mb-1">{tier.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>
              <div className="mb-6">
                <span className="font-heading text-4xl font-extrabold text-card-foreground">{tier.price}</span>
                <span className="text-muted-foreground">{tier.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-card-foreground">
                    <Check className="w-4 h-4 text-accent flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={tier.popular ? "default" : "outline"}
                className="w-full"
                size="lg"
              >
                Empezar ahora
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
