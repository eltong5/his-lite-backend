import { FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { CrmShell } from "@/components/crm/CrmShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LeadAdvisor, LeadRow, LeadSource, LeadStage, leadRows } from "@/lib/crm-data";

const STORAGE_KEY = "crm-leads";

const stageOptions: LeadStage[] = ["Nuevo lead", "Cotizacion", "Negociacion", "Cierre", "Postventa"];
const sourceOptions: LeadSource[] = ["Landing Page", "WhatsApp", "Referido", "Formulario", "Llamada", "Email"];
const advisorOptions: LeadAdvisor[] = ["Laura M", "David P", "Jorge R", "Sin asignar"];

type LeadFormState = {
  name: string;
  product: string;
  source: LeadSource;
  stage: LeadStage;
  advisor: LeadAdvisor;
  nextStep: string;
  email: string;
  phone: string;
  notes: string;
};

const defaultFormState: LeadFormState = {
  name: "",
  product: "",
  source: "Landing Page",
  stage: "Nuevo lead",
  advisor: "Sin asignar",
  nextStep: "",
  email: "",
  phone: "",
  notes: "",
};

const LeadsPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [form, setForm] = useState<LeadFormState>(defaultFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormState, string>>>({});
  const [leads, setLeads] = useState<LeadRow[]>(() => {
    if (typeof window === "undefined") {
      return leadRows;
    }

    const storedLeads = window.localStorage.getItem(STORAGE_KEY);
    if (!storedLeads) {
      return leadRows;
    }

    try {
      const parsedLeads = JSON.parse(storedLeads) as LeadRow[];
      return parsedLeads.length > 0 ? parsedLeads : leadRows;
    } catch {
      return leadRows;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesStage = stageFilter === "all" || lead.stage === stageFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [lead.name, lead.product, lead.source, lead.advisor, lead.nextStep, lead.email ?? "", lead.phone ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStage && matchesQuery;
    });
  }, [leads, query, stageFilter]);

  const handleInputChange = (field: keyof LeadFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const resetForm = () => {
    setForm(defaultFormState);
    setErrors({});
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof LeadFormState, string>> = {};

    if (!form.name.trim()) nextErrors.name = "Ingresa el nombre del lead.";
    if (!form.product.trim()) nextErrors.product = "Indica el producto de interes.";
    if (!form.nextStep.trim()) nextErrors.nextStep = "Define el proximo paso comercial.";
    if (!form.email.trim() && !form.phone.trim()) {
      nextErrors.email = "Agrega email o telefono para poder contactar.";
      nextErrors.phone = "Agrega email o telefono para poder contactar.";
    }

    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newLead: LeadRow = {
      id: `lead-${Date.now()}`,
      name: form.name.trim(),
      product: form.product.trim(),
      source: form.source,
      stage: form.stage,
      advisor: form.advisor,
      nextStep: form.nextStep.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      notes: form.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    setLeads((current) => [newLead, ...current]);
    resetForm();
    setDialogOpen(false);
  };

  return (
    <CrmShell
      title="Gestion de leads"
      description="Aqui vamos a capturar lo que llegue desde la landing, formularios y WhatsApp. Esta pantalla ya queda lista para conectarse a una fuente real despues."
      actionLabel="Crear lead"
      onAction={() => setDialogOpen(true)}
    >
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo lead</DialogTitle>
            <DialogDescription>
              Captura el lead manualmente para probar el flujo comercial del CRM antes de conectarlo a una fuente real.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lead-name">Nombre o empresa</Label>
                <Input
                  id="lead-name"
                  value={form.name}
                  onChange={(event) => handleInputChange("name", event.target.value)}
                  placeholder="Ej. Maria Lopez"
                />
                {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-product">Producto</Label>
                <Input
                  id="lead-product"
                  value={form.product}
                  onChange={(event) => handleInputChange("product", event.target.value)}
                  placeholder="Ej. Seguro Auto"
                />
                {errors.product ? <p className="text-sm text-destructive">{errors.product}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-email">Email</Label>
                <Input
                  id="lead-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => handleInputChange("email", event.target.value)}
                  placeholder="cliente@correo.com"
                />
                {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-phone">Telefono</Label>
                <Input
                  id="lead-phone"
                  value={form.phone}
                  onChange={(event) => handleInputChange("phone", event.target.value)}
                  placeholder="+57 300 000 0000"
                />
                {errors.phone ? <p className="text-sm text-destructive">{errors.phone}</p> : null}
              </div>

              <div className="space-y-2">
                <Label>Canal</Label>
                <Select value={form.source} onValueChange={(value) => handleInputChange("source", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un canal" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceOptions.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Etapa</Label>
                <Select value={form.stage} onValueChange={(value) => handleInputChange("stage", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {stageOptions.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Asesor</Label>
                <Select value={form.advisor} onValueChange={(value) => handleInputChange("advisor", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el asesor" />
                  </SelectTrigger>
                  <SelectContent>
                    {advisorOptions.map((advisor) => (
                      <SelectItem key={advisor} value={advisor}>
                        {advisor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-next-step">Proximo paso</Label>
                <Input
                  id="lead-next-step"
                  value={form.nextStep}
                  onChange={(event) => handleInputChange("nextStep", event.target.value)}
                  placeholder="Ej. Llamar y calificar"
                />
                {errors.nextStep ? <p className="text-sm text-destructive">{errors.nextStep}</p> : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-notes">Notas</Label>
              <Textarea
                id="lead-notes"
                value={form.notes}
                onChange={(event) => handleInputChange("notes", event.target.value)}
                placeholder="Contexto comercial, objeciones o informacion de la solicitud."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar lead</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="border-0 shadow-card">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Embudo comercial</p>
            <CardTitle className="mt-1 text-xl">Entrada de oportunidades</CardTitle>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-[240px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-9"
                placeholder="Buscar por nombre, producto o canal"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="min-w-[180px]">
                <SelectValue placeholder="Filtrar por etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las etapas</SelectItem>
                {stageOptions.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Nuevo lead
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/50 px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              {filteredLeads.length} lead{filteredLeads.length === 1 ? "" : "s"} visibles
            </p>
            <p className="text-muted-foreground">
              Total guardados localmente: <span className="font-medium text-foreground">{leads.length}</span>
            </p>
          </div>

          {filteredLeads.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-background px-6 py-10 text-center">
              <p className="font-semibold text-foreground">No encontramos leads con ese filtro</p>
              <p className="mt-2 text-sm text-muted-foreground">Prueba con otra busqueda o crea un lead nuevo.</p>
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div key={lead.id} className="grid gap-3 rounded-2xl border border-border/80 bg-background p-4 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr] lg:items-center">
                <div>
                  <p className="font-semibold text-foreground">{lead.name}</p>
                  <p className="text-sm text-muted-foreground">{lead.product}</p>
                  {lead.email || lead.phone ? (
                    <p className="mt-1 text-xs text-muted-foreground">{lead.email ?? lead.phone}</p>
                  ) : null}
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
            ))
          )}
        </CardContent>
      </Card>
    </CrmShell>
  );
};

export default LeadsPage;
