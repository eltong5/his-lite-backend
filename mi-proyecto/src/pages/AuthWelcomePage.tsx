import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ensureTenantIfMissing } from "@/features/auth/agencyBootstrap";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

const AuthWelcomePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [bootstrapping, setBootstrapping] = useState(true);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [missingAgency, setMissingAgency] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setBootstrapping(false);
      return;
    }
    if (loading) {
      return;
    }
    if (!user) {
      setBootstrapping(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        await ensureTenantIfMissing(user);
        if (supabase) {
          const { data: prof } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
          if (!prof) {
            setMissingAgency(true);
          }
        }
        if (typeof window !== "undefined" && window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      } catch (e) {
        if (!cancelled) {
          setBootstrapError(e instanceof Error ? e.message : "No se pudo completar el acceso.");
        }
      } finally {
        if (!cancelled) {
          setBootstrapping(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-ocean-deep flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-ocean-light/20 bg-card/95">
          <CardHeader className="text-center">
            <CardTitle>Configuracion pendiente</CardTitle>
            <CardDescription>Supabase no esta configurado en esta instalacion.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild variant="secondary">
              <Link to="/login">Ir al inicio de sesion</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || bootstrapping) {
    return (
      <div className="min-h-screen bg-ocean-deep flex flex-col items-center justify-center gap-4 p-4 text-ocean-light">
        <Loader2 className="h-10 w-10 animate-spin text-ocean-light" aria-hidden />
        <p className="text-center text-sm text-ocean-surface/90 max-w-sm">
          Estamos validando tu correo y preparando tu espacio en el CRM. Esto solo toma un momento.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-ocean-deep flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-ocean-light/20 bg-card/95">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Shield className="h-10 w-10 text-ocean-light" />
            </div>
            <CardTitle>Enlace caducado o invalido</CardTitle>
            <CardDescription>
              No encontramos una sesion activa. Solicita un nuevo correo de confirmacion o inicia sesion con tu email y
              contrasena.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link to="/login">Ir a iniciar sesion</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bootstrapError) {
    return (
      <div className="min-h-screen bg-ocean-deep flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive/30 bg-card/95">
          <CardHeader>
            <CardTitle className="text-destructive">No pudimos finalizar el acceso</CardTitle>
            <CardDescription className="text-foreground/80">{bootstrapError}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline" asChild className="w-full">
              <Link to="/login">Volver al inicio de sesion</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ocean-deep flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-ocean-light/25 bg-card/95 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="h-9 w-9 text-emerald-400" aria-hidden />
          </div>
          <CardTitle className="text-2xl font-heading">Correo confirmado: ya puedes operar en el CRM</CardTitle>
          <CardDescription className="text-base text-foreground/80 pt-2 text-left space-y-3">
            <p>
              Tu cuenta de <span className="font-semibold text-foreground">InsureTech CRM</span> quedo verificada. Desde
              ahora puedes centralizar leads, pipeline, clientes, tareas y renovaciones en un solo lugar, sin depender
              de hojas de calculo dispersas.
            </p>
            {missingAgency ? (
              <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
                Tu correo esta listo, pero no encontramos los datos de tu agencia en el registro. Entra al CRM y completa
                la ficha en <span className="font-medium">Agencia</span>, o registra una cuenta nueva desde{" "}
                <Link to="/login" className="font-medium underline-offset-2 hover:underline">
                  Crear cuenta
                </Link>
                .
              </p>
            ) : null}
            <p className="text-sm text-muted-foreground">
              Sesion iniciada como <span className="font-medium text-foreground">{user.email}</span>. Al entrar veras el
              tablero de tu agencia y podras invitar a tu equipo cuando lo necesites.
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-2">
          <Button size="lg" className="w-full font-semibold" onClick={() => navigate("/crm")}>
            Entrar al CRM ahora
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Si cierras esta ventana, puedes volver a entrar desde{" "}
            <Link to="/login" className="text-ocean-light underline-offset-2 hover:underline">
              Iniciar sesion
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthWelcomePage;
