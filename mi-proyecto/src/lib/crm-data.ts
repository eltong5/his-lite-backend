export type LeadStage = "Nuevo lead" | "Cotizacion" | "Negociacion" | "Cierre" | "Postventa";

export type LeadSource = "Landing Page" | "WhatsApp" | "Referido" | "Formulario" | "Llamada" | "Email";

export type LeadAdvisor = "Laura M" | "David P" | "Jorge R" | "Sin asignar";

export type LeadRow = {
  id: string;
  name: string;
  product: string;
  source: LeadSource;
  stage: LeadStage;
  advisor: LeadAdvisor;
  nextStep: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt?: string;
};

export const crmStats = [
  { label: "Leads activos", value: "128", detail: "+14% este mes" },
  { label: "Cotizaciones", value: "34", detail: "12 por cerrar" },
  { label: "Prima estimada", value: "$92,400", detail: "Pipeline actual" },
  { label: "Renovaciones", value: "16", detail: "Proximos 30 dias" },
];

export const pipelineStages = [
  { id: "nuevo", title: "Nuevo lead", count: 21, amount: "$18,300" },
  { id: "cotizacion", title: "Cotizacion", count: 14, amount: "$25,900" },
  { id: "negociacion", title: "Negociacion", count: 8, amount: "$21,400" },
  { id: "cierre", title: "Cierre", count: 5, amount: "$14,800" },
  { id: "postventa", title: "Postventa", count: 11, amount: "$12,000" },
];

export const leadRows: LeadRow[] = [
  {
    id: "lead-maria-lopez",
    name: "Maria Lopez",
    product: "Seguro Auto",
    source: "Landing Page",
    stage: "Cotizacion",
    advisor: "Laura M",
    nextStep: "Enviar propuesta hoy",
  },
  {
    id: "lead-carlos-ruiz",
    name: "Carlos Ruiz",
    product: "Seguro Vida",
    source: "WhatsApp",
    stage: "Negociacion",
    advisor: "David P",
    nextStep: "Llamada 4:00 PM",
  },
  {
    id: "lead-ana-martinez",
    name: "Ana Martinez",
    product: "Seguro Salud",
    source: "Referido",
    stage: "Nuevo lead",
    advisor: "Laura M",
    nextStep: "Calificar lead",
  },
  {
    id: "lead-constructora-delta",
    name: "Constructora Delta",
    product: "Poliza Empresarial",
    source: "Formulario",
    stage: "Cierre",
    advisor: "Jorge R",
    nextStep: "Validar documentos",
  },
];

export const clientRows = [
  {
    name: "Pedro Gomez",
    policy: "Auto Premium",
    renewal: "18 Abr 2026",
    status: "Al dia",
    owner: "Laura M",
  },
  {
    name: "Inversiones Nova",
    policy: "Empresarial Integral",
    renewal: "23 Abr 2026",
    status: "Pendiente",
    owner: "Jorge R",
  },
  {
    name: "Claudia Perez",
    policy: "Vida Familiar",
    renewal: "02 May 2026",
    status: "Seguimiento",
    owner: "David P",
  },
];

export const todayTasks = [
  { title: "Llamar a Maria Lopez para revisar cobertura", when: "10:30 AM", urgent: true },
  { title: "Enviar cotizacion a Carlos Ruiz", when: "11:15 AM", urgent: false },
  { title: "Confirmar documentos de Constructora Delta", when: "2:00 PM", urgent: true },
  { title: "Seguimiento postventa a Pedro Gomez", when: "4:30 PM", urgent: false },
];

export const activityFeed = [
  { title: "Nuevo lead desde landing page", detail: "Seguro Auto - hace 8 min" },
  { title: "Cotizacion enviada", detail: "Carlos Ruiz - hace 22 min" },
  { title: "Renovacion proxima", detail: "Inversiones Nova - hace 1 hora" },
  { title: "Ticket de soporte abierto", detail: "Claudia Perez - hace 2 horas" },
];
