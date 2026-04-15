import { FormEvent, useState } from "react";

import { CrmShell } from "@/components/crm/CrmShell";
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
import { getCurrentAgency } from "@/features/agencies/agencyService";
import { LocalStorageAgencyStore } from "@/features/agencies/localStorageAgencyStore";

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
  const [form, setForm] = useState<AgencyFormState>(() => toFormState(getCurrentAgency(agencyStore)));
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof AgencyFormState, string>>>({});

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    agencyStore.saveCurrent({
      id: form.id,
      name: form.name.trim(),
      slug: form.slug.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      plan: form.plan,
      teamSize: Number(form.teamSize),
    });

    setSavedMessage("Agencia actualizada. Recarga o navega entre modulos para ver los cambios reflejados en todo el CRM.");
  };

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
            <div className="grid gap-4 md:grid-cols-2">
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
              <Button type="submit">Guardar cambios</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </CrmShell>
  );
};

export default AgencyPage;
