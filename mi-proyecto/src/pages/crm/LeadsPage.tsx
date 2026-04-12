import { Plus, Search, SlidersHorizontal } from "lucide-react";

import { CrmShell } from "@/components/crm/CrmShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { leadRows } from "@/lib/crm-data";

const LeadsPage = () => {
  return (
    <CrmShell
      title="Gestion de leads"
      description="Aqui vamos a capturar lo que llegue desde la landing, formularios y WhatsApp. Esta pantalla ya queda lista para conectarse a una fuente real despues."
      actionLabel="Crear lead"
    >
      <Card className="border-0 shadow-card">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Embudo comercial</p>
            <CardTitle className="mt-1 text-xl">Entrada de oportunidades</CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline">
              <Search className="h-4 w-4" />
              Buscar
            </Button>
            <Button variant="outline">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </Button>
            <Button>
              <Plus className="h-4 w-4" />
              Nuevo lead
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {leadRows.map((lead) => (
            <div key={lead.name} className="grid gap-3 rounded-2xl border border-border/80 bg-background p-4 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr] lg:items-center">
              <div>
                <p className="font-semibold text-foreground">{lead.name}</p>
                <p className="text-sm text-muted-foreground">{lead.product}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Canal</p>
                <p className="mt-1 text-sm text-foreground">{lead.source}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Etapa</p>
                <Badge className="mt-1">{lead.stage}</Badge>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Asesor</p>
                <p className="mt-1 text-sm text-foreground">{lead.advisor}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Proximo paso</p>
                <p className="mt-1 text-sm text-foreground">{lead.nextStep}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </CrmShell>
  );
};

export default LeadsPage;
