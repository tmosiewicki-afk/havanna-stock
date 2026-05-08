import { createSupabaseClient } from '@/src/lib/supabase'
import HistorialTable from '@/app/components/HistorialTable'

export const dynamic = 'force-dynamic'

export default async function HistorialPage() {
  const db = createSupabaseClient()
  const { data } = await db.from('movement_history').select('*').limit(100)
  const rows = data ?? []

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Historial de movimientos</h1>
        <p className="text-sm text-stone-500 mt-0.5">Últimos 100 movimientos registrados</p>
      </div>
      <HistorialTable rows={rows} />
    </div>
  )
}
