import { FormEvent, useEffect, useState } from "react";

import { CrmShell } from "@/components/crm/CrmShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgencyPlan, AgencyRecord } from "@/features/agencies/agencyModel";
import { getCurrentAgency, listAgencies, loadAgencies, saveAgency } from "@/features/agencies/agencyService";
import { LocalStorageAgencyStore } from "@/features/agencies/localStorageAgencyStore";
import {
  checkSupabaseConnection,
  SupabaseConnectionResult,
} from "@/integrations/supabase/health";

const agencyStore = new LocalStorageAgencyStore();
const planOptions: AgencyPlan[] = ["Starter", "Growth", "Pro"];

type AgencyFormState = {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  plan: AgencyPlan;
  teamSize: string;
};

const toFormState = (agency: AgencyRecord): AgencyFormState => ({
  id: agency.id,
  name: agency.name,
  slug: agency.slug,
  city: agency.city,
  country: agency.country,
  plan: agency.plan,
  teamSize: String(agency.teamSize),
});

const AgencyPage = () => {
  const [agencies, setAgencies] = useState(() => listAgencies(agencyStore));
  const [form, setForm] = useState<AgencyFormState>(() => toFormState(getCurrentAgency(agencyStore)));
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof AgencyFormState, string>>>({});
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseConnectionResult | null>(null);
  const [isCheckingSupabase, setIsCheckingSupabase] = useState(false);
  const [isLoadingAgencies, setIsLoadingAgencies] = useState(true);
  const [isSavingAgency, setIsSavingAgency] = useState(false);

  useEffect(() => {
    let active = true;

    const syncAgencies = async () => {
      const syncedAgencies = await loadAgencies(agencyStore);
      if (!active) {
        return;
      }

      const currentAgency = getCurrentAgency(agencyStore);
      setAgencies(syncedAgencies);
      setForm(toFormState(currentAgency));
      setIsLoadingAgencies(false);
    };

    void syncAgencies();

    return () => {
      active = false;
    };
  }, []);

  const handleInputChange = (field: keyof AgencyFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSavedMessage(null);
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof AgencyFormState, string>> = {};
    const teamSize = Number(form.teamSize);

    if (!form.name.trim()) nextErrors.name = "Ingresa el nombre de la agencia.";
    if (!form.slug.trim()) nextErrors.slug = "Ingresa un slug para la agencia.";
    if (!form.city.trim()) nextErrors.city = "Ingresa la ciudad.";
    if (!form.country.trim()) nextErrors.country = "Ingresa el pais.";
    if (!Number.isInteger(teamSize) || teamSize < 1 || teamSize > 500) {
      nextErrors.teamSize = "Ingresa un numero de asesores entre 1 y 500.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const updatedAgency = {
      id: form.id,
      name: form.name.trim(),
      slug: form.slug.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      plan: form.plan,
      teamSize: Number(form.teamSize),
    };

    setIsSavingAgency(true);
    const savedAgency = await saveAgency(agencyStore, updatedAgency);
    const nextAgencies = agencyStore.list();

    setAgencies(nextAgencies);
    setForm(toFormState(savedAgency));
    setSavedMessage("Agencia actualizada y sincronizada con la base actual del CRM.");
    setIsSavingAgency(false);
  };

  const handleAgencySwitch = (agencyId: string) => {
    const agency = agencies.find((item) => item.id === agencyId);
    if (!agency) {
      return;
    }

    agencyStore.saveCurrent(agency);
    setForm(toFormState(agency));
    setSavedMessage("Agencia cambiada. Navega a otros modulos para ver los datos de esa cuenta.");
  };

  const handleSupabaseCheck = async () => {
    setIsCheckingSupabase(true);
    const result = await checkSupabaseConnection();
    setSupabaseStatus(result);
    setIsCheckingSupabase(false);
  };

  const supabaseBadgeLabel =
    supabaseStatus?.status === "ready"
      ? "Conectado"
      : supabaseStatus?.status === "schema-missing"
        ? "Falta esquema"
        : supabaseStatus?.status === "unreachable"
          ? "Error de conexion"
          : "Pendiente";

  return (
    <CrmShell
      title="Configuracion de agencia"
      description="Aqui puedes ajustar la identidad basica de la cuenta para acercar el CRM al modo SaaS multiagencia."
      actionLabel="Guardar agencia"
      flowLabel="Identidad de cuenta"
      channelsLabel="Base SaaS"
      statusLabel="Agencia editable"
      onAction={() => document.getElementById("agency-form")?.requestSubmit()}
    >
      <Card className="border-0 shadow-card">
        <CardHeader>
          <p className="text-sm text-muted-foreground">Cuenta actual</p>
          <CardTitle className="mt-1 text-xl">Datos de la agencia</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="agency-form" className="space-y-5" onSubmit={handleSubmit}>
            {isLoadingAgencies ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                Cargando agencias desde la fuente actual...
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Seleccionar agencia</Label>
                <Select value={form.id} onValueChange={handleAgencySwitch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una agencia" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agency-name">Nombre *</Label>
                <Input
                  id="agency-name"
                  value={form.name}
                  onChange={(event) => handleInputChange("name", event.target.value)}
                  placeholder="Ej. Agencia Seguros Andinos"
                />
                {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="agency-slug">Slug *</Label>
                <Input
                  id="agency-slug"
                  value={form.slug}
                  onChange={(event) => handleInputChange("slug", event.target.value)}
                  placeholder="Ej. seguros-andinos"
                />
                {errors.slug ? <p className="text-sm text-destructive">{errors.slug}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="agency-city">Ciudad *</Label>
                <Input
                  id="agency-city"
                  value={form.city}
                  onChange={(event) => handleInputChange("city", event.target.value)}
                  placeholder="Ej. Bogota"
                />
                {errors.city ? <p className="text-sm text-destructive">{errors.city}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="agency-country">Pais *</Label>
                <Input
                  id="agency-country"
                  value={form.country}
                  onChange={(event) => handleInputChange("country", event.target.value)}
                  placeholder="Ej. Colombia"
                />
                {errors.country ? <p className="text-sm text-destructive">{errors.country}</p> : null}
              </div>

              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={form.plan} onValueChange={(value) => handleInputChange("plan", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {planOptions.map((plan) => (
                      <SelectItem key={plan} value={plan}>
                        {plan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agency-team-size">Numero de asesores *</Label>
                <Input
                  id="agency-team-size"
                  inputMode="numeric"
                  value={form.teamSize}
                  onChange={(event) => handleInputChange("teamSize", event.target.value)}
                  placeholder="Ej. 4"
                />
                {errors.teamSize ? <p className="text-sm text-destructive">{errors.teamSize}</p> : null}
              </div>
            </div>

            {savedMessage ? <p className="text-sm text-primary">{savedMessage}</p> : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoadingAgencies || isSavingAgency}>
                {isSavingAgency ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-card">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Infraestructura</p>
            <CardTitle className="mt-1 text-xl">Conexion con Supabase</CardTitle>
          </div>
          <Badge variant={supabaseStatus?.status === "ready" ? "default" : "secondary"}>
            {supabaseBadgeLabel}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Esta prueba valida si el frontend ya puede hablar con tu proyecto de Supabase y si la
            tabla base <span className="font-medium text-foreground">agencies</span> ya existe.
          </p>

          {supabaseStatus ? (
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-foreground">
              {supabaseStatus.message}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
              Todavia no se ha ejecutado la prueba de conexion.
            </div>
          )}

          <div className="flex justify-end">
            <Button type="button" onClick={handleSupabaseCheck} disabled={isCheckingSupabase}>
              {isCheckingSupabase ? "Probando..." : "Probar conexion Supabase"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </CrmShell>
  );
};

export default AgencyPage;
