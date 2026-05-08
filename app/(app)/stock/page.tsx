import { createSupabaseClient } from '@/src/lib/supabase'
import StockTable from '@/app/components/StockTable'

export const dynamic = 'force-dynamic'

export default async function StockPage() {
  const db = createSupabaseClient()
  const [{ data: currentData }, { data: comparisonData }] = await Promise.all([
    db.from('stock_current').select('*'),
    db.from('stock_comparison').select('*'),
  ])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Stock</h1>
        <p className="text-sm text-stone-500 mt-0.5">Inventario actual en todos los locales</p>
      </div>
      <StockTable rows={currentData ?? []} comparisonRows={comparisonData ?? []} />
    </div>
  )
}
