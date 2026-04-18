import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { CreditCard, Plus, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const BillingPage = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: invoices } = useQuery({
    queryKey: ['invoices', user?.clinic_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('invoices')
        .select('*, patient:patients(first_name, last_name)')
        .eq('clinic_id', user?.clinic_id)
        .order('issue_date', { ascending: false })
        .limit(50)
      return data || []
    },
    enabled: !!user?.clinic_id,
  })

  const { data: patients } = useQuery({
    queryKey: ['patients-billing', user?.clinic_id],
    queryFn: async () => {
      const { data } = await supabase.from('patients').select('id, first_name, last_name').eq('clinic_id', user?.clinic_id).eq('is_active', true)
      return data || []
    },
    enabled: !!user?.clinic_id,
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <DollarSign className="h-4 w-4 text-gray-500" />
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Facturación</h1>
          <p className="text-muted-foreground">Gestiona las facturas e ingresos</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Nueva Factura</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Nueva Factura</DialogTitle></DialogHeader>
            <InvoiceForm patients={patients || []} onSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/. {stats.total.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/. {stats.pending.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cobrado</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/. {stats.paid.toFixed(2)}</div>
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
                <TableHead>Paciente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay facturas</TableCell>
                </TableRow>
              ) : (
                invoices?.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{format(new Date(invoice.issue_date), 'dd/MM/yyyy', { locale: es })}</TableCell>
                    <TableCell>{invoice.patient?.first_name} {invoice.patient?.last_name}</TableCell>
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

const InvoiceForm = ({ patients, onSubmit }: { patients: any[], onSubmit: (data: InvoiceFormData) => void }) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { items: [{ description: '', quantity: 1, unit_price: 0 }] },
  })

  const items = watch('items')

  const addItem = () => {
    setValue('items', [...items, { description: '', quantity: 1, unit_price: 0 }])
  }

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

      <div className="space-y-2">
        <Label>Items</Label>
        {items.map((_, index) => (
          <div key={index} className="flex gap-2">
            <Input placeholder="Descripción" className="flex-1" {...register(`items.${index}.description`)} />
            <Input type="number" placeholder="Cantidad" className="w-20" {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
            <Input type="number" placeholder="Precio" className="w-24" {...register(`items.${index}.unit_price`, { valueAsNumber: true })} />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addItem}>+ Agregar Item</Button>
      </div>

      <div className="space-y-2">
        <Label>Notas</Label>
        <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2" rows={2} {...register('notes')} />
      </div>

      <Button type="submit" className="w-full">Crear Factura</Button>
    </form>
  )
}