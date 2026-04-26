export const bookingChannels = ['whatsapp', 'supabase-lead', 'future-calendar']

export function getBookingModeLabel(mode) {
  const labels = {
    whatsapp: 'WhatsApp',
    'supabase-lead': 'Lead en Supabase',
    'future-calendar': 'Calendario futuro',
  }

  return labels[mode] || mode
}
