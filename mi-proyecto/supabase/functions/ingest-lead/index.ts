import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LeadPayload {
  name?: string
  phone?: string
  email?: string
  city?: string
  country?: string
  age?: number
  product?: string
  source?: string
  campaignName?: string
  externalLeadId?: string
  notes?: string
  agencyId?: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Facebook webhook verification
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === 'your_verify_token') {
      return new Response(challenge, { headers: corsHeaders })
    }

    return new Response('Forbidden', { status: 403, headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )

    const payload = await req.json()

    // Handle Facebook webhook format
    let lead: LeadPayload = payload

    if (payload.object === 'page' && payload.entry) {
      // Facebook webhook format
      const entry = payload.entry[0]
      const change = entry.changes[0]
      const leadgenData = change.value

      // Map Facebook fields to our format
      const fieldData: Record<string, string> = {}
      leadgenData.field_data.forEach((field: any) => {
        fieldData[field.name] = field.values[0]
      })

      lead = {
        name: fieldData.full_name,
        phone: fieldData.phone_number,
        email: fieldData.email,
        externalLeadId: leadgenData.leadgen_id,
        source: 'Facebook Ads',
        campaignName: fieldData.campaign_name || 'Facebook Lead',
        agencyId: payload.agencyId, // Pass in webhook or use default
      }
    }

    // Validate required fields
    if (!lead.name || !lead.phone || !lead.product) {
      throw new Error('Missing required fields: name, phone, product')
    }

    // Get or create agency
    let agencyId = lead.agencyId
    if (!agencyId) {
      // Default agency for demo
      const { data: agencies } = await supabaseClient
        .from('agencies')
        .select('id')
        .limit(1)

      if (agencies && agencies.length > 0) {
        agencyId = agencies[0].id
      } else {
        throw new Error('No agency found and no agencyId provided')
      }
    }

    // Check for duplicate lead
    if (lead.externalLeadId) {
      const { data: existingLead } = await supabaseClient
        .from('leads')
        .select('id')
        .eq('agency_id', agencyId)
        .eq('external_lead_id', lead.externalLeadId)
        .single()

      if (existingLead) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Lead already exists',
            duplicate: true,
            leadId: existingLead.id
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        )
      }
    }

    // Get available advisors for the agency
    const { data: advisors } = await supabaseClient
      .from('advisors')
      .select('id, full_name')
      .eq('agency_id', agencyId)
      .eq('active', true)

    // Assign advisor (simple round-robin or first available)
    let assignedAdvisor = 'Sin asignar'
    let advisorId = null

    if (advisors && advisors.length > 0) {
      const randomAdvisor = advisors[Math.floor(Math.random() * advisors.length)]
      assignedAdvisor = randomAdvisor.full_name
      advisorId = randomAdvisor.id
    }

    // Create the lead
    const { data: newLead, error: insertError } = await supabaseClient
      .from('leads')
      .insert({
        agency_id: agencyId,
        advisor_id: advisorId,
        name: lead.name.trim(),
        product: lead.product.trim(),
        source: lead.source || 'API',
        stage: 'Nuevo lead',
        advisor_name: assignedAdvisor,
        next_step: 'Contactar y calificar',
        email: lead.email?.trim() || null,
        phone: lead.phone?.trim() || null,
        city: lead.city?.trim() || null,
        country: lead.country?.trim() || null,
        age: lead.age || null,
        campaign_name: lead.campaignName?.trim() || null,
        external_lead_id: lead.externalLeadId?.trim() || null,
        notes: lead.notes?.trim() || null,
      })
      .select('id')
      .single()

    if (insertError) {
      throw insertError
    }

    // Create follow-up task
    await supabaseClient
      .from('tasks')
      .insert({
        agency_id: agencyId,
        advisor_id: advisorId,
        lead_id: newLead.id,
        title: 'Seguimiento inicial del lead',
        due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        urgent: true,
        subject_name: lead.name.trim(),
        stage: 'Nuevo lead',
        advisor_name: assignedAdvisor,
        channel: lead.phone ? 'WhatsApp' : lead.email ? 'Email' : 'CRM',
        status: 'Pendiente',
        entity_type: 'lead',
        notes: `Lead creado via API. ${lead.notes || ''}`,
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lead created successfully',
        leadId: newLead.id,
        assignedAdvisor,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error processing lead:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})