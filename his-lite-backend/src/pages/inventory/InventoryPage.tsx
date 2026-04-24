import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { medicationSchema, inventorySchema, type MedicationFormData, type InventoryFormData } from '@/lib/schemas'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Package, Plus, AlertTriangle, TrendingDown } from 'lucide-react'

export const InventoryPage = () => {
  const { user } = useAuth()
  const [medOpen, setMedOpen] = useState(false)
  const [invOpen, setInvOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: medications } = useQuery({
    queryKey: ['medications', user?.clinic_id],
    queryFn: async () => {
      const { data } = await supabase.from('medications').select('*').eq('clinic_id', user?.clinic_id).eq('is_active', true)
      return data || []
    },
    enabled: !!user?.clinic_id,
  })

  const { data: inventory } = useQuery({
    queryKey: ['inventory', user?.clinic_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('inventory')
        .select('*, medication:medications(name, min_stock_level)')
        .eq('clinic_id', user?.clinic_id)
      return data || []
    },
    enabled: !!user?.clinic_id,
  })

  const createMedication = useMutation({
    mutationFn: async (data: MedicationFormData & { clinic_id: string }) => {
      const { data: med, error } = await supabase.from('medications').insert({ ...data, clinic_id: data.clinic_id }).select().single()
      if (error) throw error
      return med
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] })
      toast({ title: 'Medicamento creado' })
      setMedOpen(false)
    },
    onError: (error: any) => toast({ title: 'Error', description: error.message, variant: 'destructive' }),
  })

  const createInventory = useMutation({
    mutationFn: async (data: InventoryFormData & { clinic_id: string }) => {
      const { data: inv, error } = await supabase.from('inventory').insert({ ...data, clinic_id: data.clinic_id }).select().single()
      if (error) throw error
      return inv
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast({ title: 'Stock agregado' })
      setInvOpen(false)
    },
    onError: (error: any) => toast({ title: 'Error', description: error.message, variant: 'destructive' }),
  })

  const lowStockItems = inventory?.filter(item => item.quantity <= (item.medication?.min_stock_level || 10)) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground">Gestiona medicamentos y stock</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={medOpen} onOpenChange={setMedOpen}>
            <DialogTrigger asChild><Button variant="outline"><Plus className="mr-2 h-4 w-4" />Nuevo Medicamento</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nuevo Medicamento</DialogTitle></DialogHeader>
              <MedicationForm onSubmit={(data) => createMedication.mutate({ ...data, clinic_id: user?.clinic_id || '' })} />
            </DialogContent>
          </Dialog>
          <Dialog open={invOpen} onOpenChange={setInvOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Agregar Stock</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Agregar al Inventario</DialogTitle></DialogHeader>
              <InventoryForm medications={medications || []} onSubmit={(data) => createInventory.mutate({ ...data, clinic_id: user?.clinic_id || '' })} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Stock Bajo ({lowStockItems.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map(item => (
                <span key={item.id} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                  {item.medication?.name}: {item.quantity} unidades
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Medicamentos</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Categoría</TableHead><TableHead>Stock Min</TableHead></TableRow></TableHeader>
              <TableBody>
                {medications?.map(med => (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium">{med.name}</TableCell>
                    <TableCell>{med.category || '-'}</TableCell>
                    <TableCell>{med.min_stock_level}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Inventario Actual</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Medicamento</TableHead><TableHead>Cantidad</TableHead><TableHead>Vence</TableHead></TableRow></TableHeader>
              <TableBody>
                {inventory?.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.medication?.name}</TableCell>
                    <TableCell className={item.quantity <= (item.medication?.min_stock_level || 10) ? 'text-red-500 font-medium' : ''}>
                      {item.quantity}
                    </TableCell>
                    <TableCell>{item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const MedicationForm = ({ onSubmit }: { onSubmit: (data: MedicationFormData) => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: { min_stock_level: 10 }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Nombre</Label>
        <Input {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Nombre Genérico</Label>
        <Input {...register('generic_name')} />
        {errors.generic_name && <p className="text-sm text-destructive">{errors.generic_name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Categoría</Label>
          <Input {...register('category')} />
          {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Unidad</Label>
          <Input {...register('unit')} placeholder="ej. tabletas" />
          {errors.unit && <p className="text-sm text-destructive">{errors.unit.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Stock Mínimo</Label>
        <Input type="number" {...register('min_stock_level', { valueAsNumber: true })} />
        {errors.min_stock_level && <p className="text-sm text-destructive">{errors.min_stock_level.message}</p>}
      </div>
      <Button type="submit" className="w-full">Crear</Button>
    </form>
  )
}

const InventoryForm = ({ medications, onSubmit }: { medications: any[], onSubmit: (data: InventoryFormData) => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<InventoryFormData>({ 
    resolver: zodResolver(inventorySchema) 
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Medicamento</Label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2" {...register('medication_id')}>
          <option value="">Seleccionar</option>
          {medications.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        {errors.medication_id && <p className="text-sm text-destructive">{errors.medication_id.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cantidad</Label>
          <Input type="number" {...register('quantity', { valueAsNumber: true })} />
          {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Costo Unitario</Label>
          <Input type="number" step="0.01" {...register('unit_cost', { valueAsNumber: true })} />
          {errors.unit_cost && <p className="text-sm text-destructive">{errors.unit_cost.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Lote</Label>
          <Input {...register('batch_number')} />
          {errors.batch_number && <p className="text-sm text-destructive">{errors.batch_number.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Fecha Vencimiento</Label>
          <Input type="date" {...register('expiration_date')} />
          {errors.expiration_date && <p className="text-sm text-destructive">{errors.expiration_date.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Proveedor</Label>
        <Input {...register('supplier')} />
        {errors.supplier && <p className="text-sm text-destructive">{errors.supplier.message}</p>}
      </div>
      <Button type="submit" className="w-full">Agregar</Button>
    </form>
  )
}