export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function buildWhatsAppLink(phone, message) {
  const cleanPhone = String(phone || '').replace(/\D/g, '')
  const text = encodeURIComponent(message || 'Hola, quiero agendar una cita')
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : '#contact'
}
