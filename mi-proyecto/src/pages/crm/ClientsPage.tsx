import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarClock, FileText, ShieldCheck } from "lucide-react";

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
import { listActiveAdvisorNames, loadAdvisors } from "@/features/advisors/advisorService";
import { LocalStorageAdvisorStore } from "@/features/advisors/localStorageAdvisorStore";
import { LocalStorageClientRepository } from "@/features/clients/localStorageClientRepository";
import { ClientStatus } from "@/features/clients/clientModel";
import {
  buildClientHealth,
  buildUpcomingRenewals,
  createClientAsync,
  listClients,
  loadClients,
} from "@/features/clients/clientService";
import { LeadAdvisor } from "@/lib/crm-data";

const clientRepository = new LocalStorageClientRepository();
const advisorStore = new LocalStorageAdvisorStore();
const statusOptions: ClientStatus[] = ["Al dia", "Seguimiento", "Pendiente"];

type ClientFormState = {
  fullName: string;
  product: string;
  policyNumber: string;
  renewalDate: string;
  status: ClientStatus;
  advisor: LeadAdvisor;
  email: string;
  phone: string;
  city: string;
  country: string;
  notes: string;
};

const defaultFormState: ClientFormState = {
  fullName: "",
  product: "",
  policyNumber: "",
  renewalDate: "",
  status: "Al dia",
  advisor: "Sin asignar",
  email: "",
  phone: "",
  city: "",
  country: "",
  notes: "",
};

const ClientsPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ClientFormState>(defaultFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof ClientFormState, string>>>({});
  const [clients, setClients] = useState(() => listClients(clientRepository));
  const [isSavingClient, setIsSavingClient] = useState(false);
  const clientHealth = useMemo(() => buildClientHealth(clients), [clients]);
  const upcomingRenewals = useMemo(() => buildUpcomingRenewals(clients), [clients]);
  const [advisorVersion, setAdvisorVersion] = useState(0);
  const advisorOptions = useMemo(() => listActiveAdvisorNames(advisorStore) as LeadAdvisor[], [dialogOpen, advisorVersion]);

  useEffect(() => {
    let active = true;

    const syncAdvisors = async () => {
      await loadAdvisors(advisorStore);
      if (active) {
        setAdvisorVersion((current) => current + 1);
      }
    };

    void syncAdvisors();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const syncClients = async () => {
      const syncedClients = await loadClients(clientRepository);
      if (active) {
        setClients(syncedClients);
      }
    };

    void syncClients();

    return () => {
      active = false;
    };
  }, []);

  const resetForm = () => {
    setForm(defaultFormState);
    setErrors({});
  };

  const handleInputChange = (field: keyof ClientFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof ClientFormState, string>> = {};

    if (!form.fullName.trim()) nextErrors.fullName = "Ingresa el nombre del cliente.";
    if (!form.product.trim()) nextErrors.product = "Indica el producto o poliza.";
    if (!form.renewalDate.trim()) nextErrors.renewalDate = "Define la fecha de renovacion.";

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSavingClient(true);
    const nextClients = await createClientAsync(clientRepository, {
        fullName: form.fullName,
        product: form.product,
        policyNumber: form.policyNumber || undefined,
        renewalDate: form.renewalDate,
        status: form.status,
        advisor: form.advisor,
        sourceLeadId: "manual-client",
        email: form.email || undefined,
        phone: form.phone || undefined,
        city: form.city || undefined,
        country: form.country || undefined,
        notes: form.notes || undefined,
      });
    setClients(nextClients);

    resetForm();
    setDialogOpen(false);
    setIsSavingClient(false);
  };

  return (
    <CrmShell
      title="Clientes y polizas"
      description="Esta vista organiza la postventa del MVP: clientes activos, renovaciones y responsables. Es la base para soporte y seguimiento posterior."
      actionLabel="Nuevo cliente"
      flowLabel="Conversion de lead a cliente"
      channelsLabel="Postventa y renovaciones"
      statusLabel="Clientes conectados"
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
            <DialogTitle>Nuevo cliente</DialogTitle>
            <DialogDescription>
              Registra un cliente manualmente para alimentar la cartera activa mientras conectamos la conversion automatica desde leads.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client-name">Nombre del cliente *</Label>
                <Input
                  id="client-name"
                  value={form.fullName}
                  onChange={(event) => handleInputChange("fullName", event.target.value)}
                  placeholder="Ej. Pepito Perez"
                />
                {errors.fullName ? <p className="text-sm text-destructive">{errors.fullName}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-product">Producto o poliza *</Label>
                <Input
                  id="client-product"
                  value={form.product}
                  onChange={(event) => handleInputChange("product", event.target.value)}
                  placeholder="Ej. Seguro Vida Familiar"
                />
                {errors.product ? <p className="text-sm text-destructive">{errors.product}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-policy">Numero de poliza</Label>
                <Input
                  id="client-policy"
                  value={form.policyNumber}
                  onChange={(event) => handleInputChange("policyNumber", event.target.value)}
                  placeholder="Ej. POL-2026-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-renewal">Renovacion *</Label>
                <Input
                  id="client-renewal"
                  type="date"
                  value={form.renewalDate}
                  onChange={(event) => handleInputChange("renewalDate", event.target.value)}
                />
                {errors.renewalDate ? <p className="text-sm text-destructive">{errors.renewalDate}</p> : null}
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Asesor</Label>
                <Select value={form.advisor} onValueChange={(value) => handleInputChange("advisor", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un asesor" />
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
                <Label htmlFor="client-email">Email</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => handleInputChange("email", event.target.value)}
                  placeholder="cliente@correo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-phone">Telefono</Label>
                <Input
                  id="client-phone"
                  value={form.phone}
                  onChange={(event) => handleInputChange("phone", event.target.value)}
                  placeholder="+57 300 000 0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-city">Ciudad</Label>
                <Input
                  id="client-city"
                  value={form.city}
                  onChange={(event) => handleInputChange("city", event.target.value)}
                  placeholder="Ej. Bogota"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-country">Pais</Label>
                <Input
                  id="client-country"
                  value={form.country}
                  onChange={(event) => handleInputChange("country", event.target.value)}
                  placeholder="Ej. Colombia"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-notes">Notas</Label>
              <Textarea
                id="client-notes"
                value={form.notes}
                onChange={(event) => handleInputChange("notes", event.target.value)}
                placeholder="Seguimiento, observaciones o detalles de la poliza."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSavingClient}>
                {isSavingClient ? "Guardando..." : "Guardar cliente"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-0 shadow-card">
          <CardHeader>
            <p className="text-sm text-muted-foreground">Base activa</p>
            <CardTitle className="mt-1 text-xl">Cartera de clientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {clients.length ? (
              clients.map((client) => (
                <div key={client.id} className="grid gap-3 rounded-2xl border border-border/80 bg-background p-4 md:grid-cols-[1fr_1fr_0.8fr_0.8fr] md:items-center">
                  <div>
                    <p className="font-semibold text-foreground">{client.fullName}</p>
                    <p className="text-sm text-muted-foreground">{client.product}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Renovacion</p>
                    <p className="mt-1 text-sm text-foreground">{client.renewalDate}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Estado</p>
                    <Badge className="mt-1" variant={client.status === "Pendiente" ? "destructive" : "secondary"}>
                      {client.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Asesor</p>
                    <p className="mt-1 text-sm text-foreground">{client.advisor}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 bg-background p-6 text-sm text-muted-foreground">
                Aun no hay clientes reales. Cuando un lead pase a `Postventa`, aparecera aqui como base inicial de clientes.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <p className="text-sm text-muted-foreground">Indicadores</p>
              <CardTitle className="mt-1 text-xl">Salud de la cartera</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-background p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium text-foreground">{clientHealth.activePercentage}% clientes activos</p>
                    <p className="text-sm text-muted-foreground">Base calculada desde clientes en postventa</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-background p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{clientHealth.criticalRenewals} renovaciones en seguimiento</p>
                    <p className="text-sm text-muted-foreground">Clientes con proximo paso pendiente</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardHeader>
              <p className="text-sm text-muted-foreground">Renovaciones</p>
              <CardTitle className="mt-1 text-xl">Proximos vencimientos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingRenewals.length ? (
                upcomingRenewals.map((renewal) => (
                  <div key={renewal.id} className="rounded-2xl border border-border/80 bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{renewal.clientName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{renewal.product}</p>
                        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarClock className="h-4 w-4" />
                          {renewal.renewalDate}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">Asesor: {renewal.advisor}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            renewal.priority === "Alta"
                              ? "destructive"
                              : renewal.priority === "Media"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {renewal.priority}
                        </Badge>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {renewal.daysRemaining <= 0
                            ? "Vence hoy o ya vencio"
                            : `${renewal.daysRemaining} dia${renewal.daysRemaining === 1 ? "" : "s"}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border/80 bg-background p-6 text-sm text-muted-foreground">
                  Todavia no hay renovaciones visibles en cartera.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </CrmShell>
  );
};

export default ClientsPage;
