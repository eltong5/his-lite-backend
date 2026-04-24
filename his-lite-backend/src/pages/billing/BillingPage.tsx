import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { invoiceSchema, type InvoiceFormData } from '@/lib/schemas'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table'
import { CreditCard, Plus, DollarSign, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const BillingPage = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const queryClient = useQueryClient()

  const isPatient = user?.role === 'patient'

  // Si el usuario es paciente, obtenemos su ID de la tabla patients
  const { data: patientProfile } = useQuery({
    queryKey: ['patient-profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user?.id)
        .single()
      return data
    },
    enabled: !!user?.id && isPatient,
  })

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', user?.clinic_id, patientProfile?.id],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('*, patient:patients(first_name, last_name)')
        .eq('clinic_id', user?.clinic_id)

      if (isPatient) {
        if (!patientProfile?.id) return []
        query = query.eq('patient_id', patientProfile.id)
      }

      const { data } = await query
        .order('issue_date', { ascending: false })
        .limit(50)
      return data || []
    },
    enabled: !!user?.clinic_id && (!isPatient || !!patientProfile?.id),
  })

  // Obtener items de la factura seleccionada
  const { data: invoiceItems } = useQuery({
    queryKey: ['invoice-items', selectedInvoice?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', selectedInvoice.id)
      return data || []
    },
    enabled: !!selectedInvoice?.id && isDetailOpen,
  })

  const { data: patients } = useQuery({
    queryKey: ['patients-billing', user?.clinic_id],
    queryFn: async () => {
      const { data } = await supabase.from('patients').select('id, first_name, last_name').eq('clinic_id', user?.clinic_id).eq('is_active', true)
      return data || []
    },
    enabled: !!user?.clinic_id && !isPatient,
  })

  const createInvoice = useMutation({
    mutationFn: async (data: InvoiceFormData & { clinic_id: string; invoice_number: string }) => {
      const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
      const taxAmount = subtotal * 0.18 // 18% IGV
      const total = subtotal + taxAmount

      const { data: invoice, error } = await supabase.from('invoices').insert({
        clinic_id: data.clinic_id,
        patient_id: data.patient_id,
        invoice_number: data.invoice_number,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: data.due_date,
        subtotal,
        tax_amount: taxAmount,
        total_amount: total,
        status: 'pending',
        notes: data.notes,
      }).select().single()

      if (error) throw error

      for (const item of data.items) {
        await supabase.from('invoice_items').insert({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
        })
      }

      return invoice
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast({ title: 'Factura creada' })
      setIsOpen(false)
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })

  const handleSubmit = (data: InvoiceFormData) => {
    const invoiceNumber = `INV-${Date.now()}`
    createInvoice.mutate({ ...data, clinic_id: user?.clinic_id || '', invoice_number: invoiceNumber })
  }

  const handleViewDetail = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsDetailOpen(true)
  }

  const stats = {
    total: invoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0,
    pending: invoices?.filter(i => i.status === 'pending').reduce((sum, inv) => sum + inv.total_amount, 0) || 0,
    paid: invoices?.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0) || 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isPatient ? 'Mis Pagos y Facturas' : 'Facturación'}
          </h1>
          <p className="text-muted-foreground">
            {isPatient ? 'Consulta tus recibos y el estado de tus cuentas' : 'Gestiona las facturas e ingresos'}
          </p>
        </div>
        {!isPatient && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Nueva Factura</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Nueva Factura</DialogTitle></DialogHeader>
              <InvoiceForm patients={patients || []} onSubmit={handleSubmit} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {isPatient ? 'Total Acumulado' : 'Total Facturado'}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/. {stats.total.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendiente de Pago</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">S/. {stats.pending.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">S/. {stats.paid.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Factura</TableHead>
                <TableHead>Fecha</TableHead>
                {!isPatient && <TableHead>Paciente</TableHead>}
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isPatient ? 5 : 6} className="text-center py-8">Cargando...</TableCell>
                </TableRow>
              ) : invoices?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isPatient ? 5 : 6} className="text-center py-8 text-muted-foreground">No hay facturas registradas</TableCell>
                </TableRow>
              ) : (
                invoices?.map((invoice) => (
                  <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetail(invoice)}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{format(new Date(invoice.issue_date), 'dd/MM/yyyy', { locale: es })}</TableCell>
                    {!isPatient && (
                      <TableCell>{invoice.patient?.first_name} {invoice.patient?.last_name}</TableCell>
                    )}
                    <TableCell>S/. {invoice.total_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-gray-100'
                      }`}>
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(invoice);
                      }}>
                        Ver Detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Detalle de Factura */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Factura: {selectedInvoice?.invoice_number}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                <div>
                  <Label className="text-muted-foreground">Fecha de Emisión</Label>
                  <p className="font-medium">{format(new Date(selectedInvoice.issue_date), 'PPP', { locale: es })}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <p className="capitalize font-bold">{selectedInvoice.status}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-primary font-bold">Conceptos</Label>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="py-2">Descripción</TableHead>
                        <TableHead className="py-2 text-right">Cant.</TableHead>
                        <TableHead className="py-2 text-right">Precio</TableHead>
                        <TableHead className="py-2 text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceItems?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="py-2">{item.description}</TableCell>
                          <TableCell className="py-2 text-right">{item.quantity}</TableCell>
                          <TableCell className="py-2 text-right">S/. {item.unit_price.toFixed(2)}</TableCell>
                          <TableCell className="py-2 text-right">S/. {item.total_price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-1 pt-4 border-t">
                <div className="flex justify-between w-48 text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>S/. {selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-48 text-sm text-muted-foreground">
                  <span>IGV (18%):</span>
                  <span>S/. {selectedInvoice.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-48 text-lg font-bold border-t pt-1 mt-1">
                  <span>Total:</span>
                  <span className="text-primary">S/. {selectedInvoice.total_amount.toFixed(2)}</span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Notas:</Label>
                  <p className="text-sm italic bg-muted/20 p-2 rounded">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

const InvoiceForm = ({ patients, onSubmit }: { patients: any[], onSubmit: (data: InvoiceFormData) => void }) => {
  const { register, control, handleSubmit, formState: { errors } } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { 
      items: [{ description: '', quantity: 1, unit_price: 0 }] 
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Paciente</Label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2" {...register('patient_id')}>
          <option value="">Seleccionar paciente</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
        </select>
        {errors.patient_id && <p className="text-sm text-destructive">{errors.patient_id.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Fecha Vencimiento</Label>
        <Input type="date" {...register('due_date')} />
        {errors.due_date && <p className="text-sm text-destructive">{errors.due_date.message}</p>}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, unit_price: 0 })}>
            <Plus className="mr-2 h-4 w-4" /> Agregar Item
          </Button>
        </div>
        
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-2 p-3 border rounded-lg bg-slate-50/50">
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Input placeholder="Descripción" {...register(`items.${index}.description` as const)} />
                {errors.items?.[index]?.description && (
                  <p className="text-xs text-destructive">{errors.items[index]?.description?.message}</p>
                )}
              </div>
              <div className="w-24 space-y-1">
                <Input type="number" placeholder="Cant." {...register(`items.${index}.quantity` as const, { valueAsNumber: true })} />
                {errors.items?.[index]?.quantity && (
                  <p className="text-xs text-destructive">{errors.items[index]?.quantity?.message}</p>
                )}
              </div>
              <div className="w-28 space-y-1">
                <Input type="number" step="0.01" placeholder="Precio" {...register(`items.${index}.unit_price` as const, { valueAsNumber: true })} />
                {errors.items?.[index]?.unit_price && (
                  <p className="text-xs text-destructive">{errors.items[index]?.unit_price?.message}</p>
                )}
              </div>
              {fields.length > 1 && (
                <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
        {errors.items?.root && <p className="text-sm text-destructive">{errors.items.root.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Notas</Label>
        <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2" {...register('notes')} />
        {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
      </div>

      <Button type="submit" className="w-full">Crear Factura</Button>
    </form>
  )
}