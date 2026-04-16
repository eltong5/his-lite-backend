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
import { AdvisorRecord, AdvisorRole } from "@/features/advisors/advisorModel";
import { getCurrentAgency } from "@/features/agencies/agencyService";
import { LocalStorageAgencyStore } from "@/features/agencies/localStorageAgencyStore";
import { LocalStorageAdvisorStore } from "@/features/advisors/localStorageAdvisorStore";
import { createAdvisorAsync, loadAdvisors } from "@/features/advisors/advisorService";

const advisorStore = new LocalStorageAdvisorStore();
const agencyStore = new LocalStorageAgencyStore();
const roleOptions: AdvisorRole[] = ["Admin", "Asesor"];

type AdvisorFormState = {
  fullName: string;
  email: string;
  phone: string;
  role: AdvisorRole;
};

const defaultFormState: AdvisorFormState = {
  fullName: "",
  email: "",
  phone: "",
  role: "Asesor",
};

const AdvisorsPage = () => {
  const currentAgency = getCurrentAgency(agencyStore);
  const [advisors, setAdvisors] = useState<AdvisorRecord[]>([]);
  const [form, setForm] = useState<AdvisorFormState>(defaultFormState);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof AdvisorFormState, string>>>({});
  const [isLoadingAdvisors, setIsLoadingAdvisors] = useState(true);
  const [isSavingAdvisor, setIsSavingAdvisor] = useState(false);

  useEffect(() => {
    let active = true;

    const loadAdvisorsAsync = async () => {
      setIsLoadingAdvisors(true);
      try {
        const advisors = await loadAdvisors(advisorStore);
        if (active) {
          setAdvisors(advisors);
        }
      } catch (error) {
        console.error("Error loading advisors:", error);
        if (active) {
          setSavedMessage("Error al cargar asesores. Verifica la conexión a la base de datos.");
        }
      } finally {
        if (active) {
          setIsLoadingAdvisors(false);
        }
      }
    };

    void loadAdvisorsAsync();

    return () => {
      active = false;
    };
  }, [currentAgency.id]);

  const handleInputChange = (field: keyof AdvisorFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSavedMessage(null);
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof AdvisorFormState, string>> = {};

    if (!form.fullName.trim()) nextErrors.fullName = "Ingresa el nombre del asesor.";
    if (!form.email.trim()) nextErrors.email = "Ingresa el email del asesor.";

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSavingAdvisor(true);
    try {
      const draft = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || undefined,
        role: form.role,
        agencyId: currentAgency.id,
        active: true,
      };

      const updatedAdvisors = await createAdvisorAsync(advisorStore, draft);
      setAdvisors(updatedAdvisors);

      setSavedMessage("Asesor creado. Ya queda disponible para asignar leads y clientes.");
      setForm(defaultFormState);
    } catch (error) {
      console.error("Error creating advisor:", error);
      setSavedMessage("Error al crear asesor. Verifica la conexión a la base de datos.");
    } finally {
      setIsSavingAdvisor(false);
    }
  };

  return (
    <CrmShell
      title="Equipo comercial"
      description="Administra los asesores de la agencia para dejar de depender de nombres fijos y preparar la base multiusuario."
      actionLabel="Guardar asesor"
      flowLabel="Usuarios internos"
      channelsLabel="Asignacion comercial"
      statusLabel="Asesores conectados"
      onAction={() => document.getElementById("advisor-form")?.requestSubmit()}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-0 shadow-card">
          <CardHeader>
            <p className="text-sm text-muted-foreground">Agencia actual</p>
            <CardTitle className="mt-1 text-xl">Asesores activos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingAdvisors ? (
              <div className="rounded-2xl border border-dashed border-border/80 bg-background p-6 text-sm text-muted-foreground">
                Cargando asesores desde la fuente actual...
              </div>
            ) : advisors.length ? (
              advisors.map((advisor) => (
                <div key={advisor.id} className="rounded-2xl border border-border/80 bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{advisor.fullName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{advisor.email}</p>
                      {advisor.phone ? <p className="mt-1 text-sm text-muted-foreground">{advisor.phone}</p> : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{advisor.role}</Badge>
                      <Badge variant={advisor.active ? "outline" : "destructive"}>{advisor.active ? "Activo" : "Inactivo"}</Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 bg-background p-6 text-sm text-muted-foreground">
                Esta agencia todavia no tiene asesores cargados.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <p className="text-sm text-muted-foreground">Nuevo asesor</p>
            <CardTitle className="mt-1 text-xl">Agregar al equipo</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="advisor-form" className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="advisor-name">Nombre *</Label>
                <Input
                  id="advisor-name"
                  value={form.fullName}
                  onChange={(event) => handleInputChange("fullName", event.target.value)}
                  placeholder="Ej. Ana Gomez"
                />
                {errors.fullName ? <p className="text-sm text-destructive">{errors.fullName}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="advisor-email">Email *</Label>
                <Input
                  id="advisor-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => handleInputChange("email", event.target.value)}
                  placeholder="ana@agencia.com"
                />
                {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="advisor-phone">Telefono</Label>
                <Input
                  id="advisor-phone"
                  value={form.phone}
                  onChange={(event) => handleInputChange("phone", event.target.value)}
                  placeholder="+57 300 000 0000"
                />
              </div>

              <div className="space-y-2">
                <Label>Rol</Label>
                <Select value={form.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {savedMessage ? <p className="text-sm text-primary">{savedMessage}</p> : null}

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoadingAdvisors || isSavingAdvisor}>
                  {isSavingAdvisor ? "Guardando..." : "Guardar asesor"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </CrmShell>
  );
};

export default AdvisorsPage;
