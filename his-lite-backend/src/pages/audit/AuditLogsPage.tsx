import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Shield, Search, Download, Filter } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const AuditLogsPage = () => {
  const { user } = useAuth()
  const [filter, setFilter] = useState<string>('all')

  const { data: logs } = useQuery({
    queryKey: ['audit-logs', user?.clinic_id, filter],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*, user:profiles(first_name, last_name)')
        .eq('clinic_id', user?.clinic_id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (filter !== 'all') {
        query = query.eq('action', filter)
      }

      const { data } = await query
      return data || []
    },
    enabled: !!user?.clinic_id && user?.role === 'admin',
  })

  const getActionBadge = (action: string) => {
    const badges: Record<string, string> = {
      create: 'bg-green-100 text-green-800',
      read: 'bg-blue-100 text-blue-800',
      update: 'bg-yellow-100 text-yellow-800',
      delete: 'bg-red-100 text-red-800',
      login: 'bg-purple-100 text-purple-800',
      logout: 'bg-gray-100 text-gray-800',
    }
    return badges[action] || 'bg-gray-100'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Auditoría</h1>
          <p className="text-muted-foreground">Registro de actividades del sistema</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50">
          <Download className="h-4 w-4" />
          Exportar
        </button>
      </div>

      <div className="flex gap-2">
        {['all', 'create', 'read', 'update', 'delete', 'login'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === f ? 'bg-primary text-primary-foreground' : 'border hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Historial de Actividad
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay registros de auditoría
                  </TableCell>
                </TableRow>
              ) : (
                logs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </TableCell>
                    <TableCell>
                      {log.user ? `${log.user.first_name} ${log.user.last_name}` : 'Sistema'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{log.resource_type}</span>
                      {log.resource_id && <span className="text-xs text-muted-foreground ml-1">#{log.resource_id.slice(0, 8)}</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{log.ip_address || '-'}</TableCell>
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