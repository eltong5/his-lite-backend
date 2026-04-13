import { FormEvent, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search } from "lucide-react";
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
import { LeadAdvisor, LeadRow, LeadSource, LeadStage } from "@/lib/crm-data";
import { LocalStorageLeadRepository } from "@/features/leads/localStorageLeadRepository";
import { createLead, listLeads, updateLead } from "@/features/leads/leadService";
import { leadStageOptions } from "@/features/leads/leadMetadata";

const stageOptions: LeadStage[] = leadStageOptions;
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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d\s()-]{7,}$/;
const leadRepository = new LocalStorageLeadRepository();

const LeadsPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [form, setForm] = useState<LeadFormState>(defaultFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormState, string>>>({});
  const [leads, setLeads] = useState<LeadRow[]>(() => listLeads(leadRepository));

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
    setEditingLeadId(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (lead: LeadRow) => {
    setEditingLeadId(lead.id);
    setForm({
      name: lead.name,
      product: lead.product,
      source: lead.source,
      stage: lead.stage,
      advisor: lead.advisor,
      nextStep: lead.nextStep,
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      notes: lead.notes ?? "",
    });
    setErrors({});
    setDialogOpen(true);
  };

  const openDetailDialog = (lead: LeadRow) => {
    setSelectedLead(lead);
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof LeadFormState, string>> = {};
    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phone.trim();

    if (!form.name.trim()) nextErrors.name = "Ingresa el nombre del lead.";
    if (!form.product.trim()) nextErrors.product = "Indica el producto de interes.";
    if (!form.nextStep.trim()) nextErrors.nextStep = "Define el proximo paso comercial.";
    if (!trimmedEmail && !trimmedPhone) {
      nextErrors.email = "Agrega email o telefono para poder contactar.";
      nextErrors.phone = "Agrega email o telefono para poder contactar.";
    }
    if (trimmedEmail && !emailPattern.test(trimmedEmail)) {
      nextErrors.email = "Ingresa un email valido.";
    }
    if (trimmedPhone && !phonePattern.test(trimmedPhone)) {
      nextErrors.phone = "Ingresa un telefono valido.";
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

    const draft = {
      name: form.name.trim(),
      product: form.product.trim(),
      source: form.source,
      stage: form.stage,
      advisor: form.advisor,
      nextStep: form.nextStep.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    setLeads(editingLeadId ? updateLead(leadRepository, editingLeadId, draft) : createLead(leadRepository, draft));
    resetForm();
    setDialogOpen(false);
  };

  return (
    <CrmShell
      title="Gestion de leads"
      description="Aqui vamos a capturar lo que llegue desde la landing, formularios y WhatsApp. Esta pantalla ya queda lista para conectarse a una fuente real despues."
      actionLabel="Crear lead"
      flowLabel="Captura y seguimiento de leads"
      channelsLabel="Landing, WhatsApp y referidos"
      statusLabel="Leads operativos"
      onAction={openCreateDialog}
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
            <DialogTitle>{editingLeadId ? "Editar lead" : "Nuevo lead"}</DialogTitle>
            <DialogDescription>
              {editingLeadId
                ? "Actualiza la informacion comercial del lead para mantener el seguimiento al dia."
                : "Captura el lead manualmente para probar el flujo comercial del CRM antes de conectarlo a una fuente real."}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lead-name">Nombre o empresa *</Label>
                <Input
                  id="lead-name"
                  value={form.name}
                  onChange={(event) => handleInputChange("name", event.target.value)}
                  placeholder="Ej. Maria Lopez"
                />
                {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-product">Producto *</Label>
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
                <Label htmlFor="lead-next-step">Proximo paso *</Label>
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

            <p className="text-sm text-muted-foreground">
              Los campos con * son minimos para capturar el lead. Debes completar al menos uno entre email o telefono.
            </p>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editingLeadId ? "Guardar cambios" : "Guardar lead"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedLead !== null} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Detalle del lead</DialogTitle>
            <DialogDescription>
              Vista resumida para revisar el estado comercial y los datos de contacto del lead.
            </DialogDescription>
          </DialogHeader>

          {selectedLead ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1 rounded-xl border border-border/70 bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Nombre o empresa</p>
                <p className="font-medium text-foreground">{selectedLead.name}</p>
              </div>
              <div className="space-y-1 rounded-xl border border-border/70 bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Producto</p>
                <p className="font-medium text-foreground">{selectedLead.product}</p>
              </div>
              <div className="space-y-1 rounded-xl border border-border/70 bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Canal</p>
                <p className="font-medium text-foreground">{selectedLead.source}</p>
              </div>
              <div className="space-y-1 rounded-xl border border-border/70 bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Etapa</p>
                <div>
                  <Badge>{selectedLead.stage}</Badge>
                </div>
              </div>
              <div className="space-y-1 rounded-xl border border-border/70 bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Asesor</p>
                <p className="font-medium text-foreground">{selectedLead.advisor}</p>
              </div>
              <div className="space-y-1 rounded-xl border border-border/70 bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Proximo paso</p>
                <p className="font-medium text-foreground">{selectedLead.nextStep}</p>
              </div>
              <div className="space-y-1 rounded-xl border border-border/70 bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{selectedLead.email ?? "No registrado"}</p>
              </div>
              <div className="space-y-1 rounded-xl border border-border/70 bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Telefono</p>
                <p className="font-medium text-foreground">{selectedLead.phone ?? "No registrado"}</p>
              </div>
              <div className="space-y-1 rounded-xl border border-border/70 bg-muted/30 p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Notas</p>
                <p className="font-medium text-foreground">{selectedLead.notes ?? "Sin notas registradas"}</p>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSelectedLead(null)}>
              Cerrar
            </Button>
            {selectedLead ? (
              <Button
                type="button"
                onClick={() => {
                  setSelectedLead(null);
                  openEditDialog(selectedLead);
                }}
              >
                Editar lead
              </Button>
            ) : null}
          </DialogFooter>
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
            <Button onClick={openCreateDialog}>
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
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto px-0 text-primary hover:text-primary"
                      onClick={() => openDetailDialog(lead)}
                    >
                      <Eye className="h-4 w-4" />
                      Ver detalle
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto px-0 text-primary hover:text-primary"
                      onClick={() => openEditDialog(lead)}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                  </div>
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
