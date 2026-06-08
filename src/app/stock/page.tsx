export const dynamic = 'force-dynamic'

import { createSupabaseClient } from '../../lib/supabase'
import StockTable from '../components/StockTable'

function resolveSupplier(categoryName: string, codigoHavanna: string | null): string {
  console.log('resolveSupplier:', categoryName, codigoHavanna)
  if (categoryName === 'havanna') return 'Havanna'
  if (categoryName === 'bebidas') return 'Pepsi'
  if (codigoHavanna && /^(UN|HV)/i.test(codigoHavanna)) return 'Grandwich'
  return 'Externo'
}

export default async function StockPage() {
  const db = createSupabaseClient()

  const [{ data: stockData }, { data: productsData }] = await Promise.all([
    db.from('stock_current').select('*'),
    db.from('products').select('id, codigo_havanna' as any),
  ])

  const codeByProductId: Record<string, string | null> = {}
  for (const p of (productsData ?? []) as any[]) {
    codeByProductId[p.id] = p.codigo_havanna ?? null
  }

  const rows = (stockData ?? []).map((r) => ({
    ...r,
    supplier_name: resolveSupplier(r.category_name, codeByProductId[r.product_id] ?? null),
  }))

  console.log('rows con Pepsi:', rows.filter((r) => r.supplier_name === 'Pepsi').length, 'de', rows.length)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Stock</h1>
        <p className="text-sm text-stone-500 mt-0.5">Inventario actual en todos los locales</p>
      </div>
      <StockTable rows={rows} />
    </div>
  )
}
