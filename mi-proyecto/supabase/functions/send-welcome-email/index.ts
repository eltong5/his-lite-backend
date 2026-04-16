import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WelcomeEmailPayload {
  email: string
  agencyName: string
  fullName?: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, agencyName, fullName }: WelcomeEmailPayload = await req.json()

    // Send welcome email using Supabase's built-in email service
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { error } = await supabaseAdmin.auth.admin.sendRawEmail({
      email: email,
      subject: `¡Bienvenido a InsureTech CRM, ${agencyName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Bienvenido a InsureTech CRM</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin-bottom: 10px;">🚀 ¡Bienvenido a InsureTech CRM!</h1>
            <p style="font-size: 18px; color: #666;">Tu agencia está lista para revolucionar sus ventas</p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1e40af; margin-top: 0;">✅ Registro completado</h2>
            <p><strong>Agencia:</strong> ${agencyName}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${fullName ? `<p><strong>Usuario:</strong> ${fullName}</p>` : ''}
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #1e40af;">🎯 ¿Qué puedes hacer ahora?</h3>
            <ul>
              <li><strong>Crear leads:</strong> Agrega prospectos manualmente o conecta formularios</li>
              <li><strong>Gestionar asesores:</strong> Invita a tu equipo</li>
              <li><strong>Pipeline automático:</strong> Mueve oportunidades por etapas</li>
              <li><strong>Leads desde Facebook:</strong> Próximamente integración automática</li>
            </ul>
          </div>

          <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #065f46; margin-top: 0;">💡 Próximos pasos:</h4>
            <ol style="color: #065f46;">
              <li>Configura tu primer asesor</li>
              <li>Crea algunos leads de prueba</li>
              <li>Explora el dashboard</li>
              <li>Conecta tus formularios web</li>
            </ol>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #666; font-size: 14px;">
              ¿Necesitas ayuda? Responde a este email o visita nuestro soporte.
            </p>
            <p style="color: #666; font-size: 12px; margin-top: 10px;">
              InsureTech CRM - Revoluciona tus ventas en seguros<br>
              © 2026 InsureTech. Todos los derechos reservados.
            </p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Welcome email sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error sending welcome email:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send welcome email'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})