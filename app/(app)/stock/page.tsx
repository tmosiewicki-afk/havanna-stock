import { createSupabaseClient } from '@/src/lib/supabase'
import StockTable from '@/app/components/StockTable'

export const dynamic = 'force-dynamic'

function resolveSupplier(categoryName: string, codigoHavanna: string | null): string {
  if (categoryName === 'havanna') return 'Havanna'
  if (codigoHavanna && /^(UN|HV)/i.test(codigoHavanna)) return 'Grandwich'
  return 'Externo'
}

export default async function StockPage() {
  const db = createSupabaseClient()
  const [{ data: currentData }, { data: comparisonData }, { data: productsData }] = await Promise.all([
    db.from('stock_current').select('*'),
    db.from('stock_comparison').select('*'),
    db.from('products').select('id, codigo_havanna, category_id, product_categories!inner(name)' as any),
  ])

  const supplierByProductId: Record<string, string> = {}
  for (const p of (productsData ?? []) as any[]) {
    supplierByProductId[p.id] = resolveSupplier(
      p.product_categories?.name ?? '',
      p.codigo_havanna ?? null,
    )
  }

  const rows = (currentData ?? []).map((r) => ({
    ...r,
    supplier_name: supplierByProductId[r.product_id] ?? 'Externo',
  }))

  const comparisonRows = (comparisonData ?? []).map((r) => ({
    ...r,
    supplier_name: supplierByProductId[r.product_id] ?? 'Externo',
  }))

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Stock</h1>
        <p className="text-sm text-stone-500 mt-0.5">Inventario actual en todos los locales</p>
      </div>
      <StockTable rows={rows} comparisonRows={comparisonRows} />
    </div>
  )
}
