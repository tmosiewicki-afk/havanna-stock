import { createSupabaseClient } from '@/src/lib/supabase'

export const dynamic = 'force-dynamic'

async function getData() {
  const db = createSupabaseClient()
  const [stockRes, alertsRes, movementsRes] = await Promise.all([
    db.from('stock_current').select('*'),
    db.from('low_stock_alerts').select('*'),
    db.from('movement_history').select('*').limit(8),
  ])
  return {
    stock: stockRes.data ?? [],
    alerts: alertsRes.data ?? [],
    movements: movementsRes.data ?? [],
  }
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

const MOVEMENT_STYLES: Record<string, { label: string; color: string }> = {
  sale: { label: 'Venta', color: 'text-red-700 bg-red-50' },
  restock: { label: 'Reposición', color: 'text-green-700 bg-green-50' },
  adjustment: { label: 'Ajuste', color: 'text-amber-700 bg-amber-50' },
}

export default async function DashboardPage() {
  const { stock, alerts, movements } = await getData()

  const totalProducts = new Set(stock.map((s) => s.product_id)).size
  const lowCount = alerts.length

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Dashboard</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          {new Intl.DateTimeFormat('es-AR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          }).format(new Date())}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className={`rounded-lg border p-4 ${
            lowCount > 0 ? 'border-red-200 bg-red-50' : 'border-stone-200 bg-white'
          }`}
        >
          <p className="text-xs text-stone-500 uppercase tracking-wide">Stock bajo</p>
          <p
            className={`text-3xl font-bold mt-1 ${
              lowCount > 0 ? 'text-red-700' : 'text-stone-300'
            }`}
          >
            {lowCount}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            {lowCount === 0
              ? 'Todo en orden'
              : `producto${lowCount !== 1 ? 's' : ''} bajo el umbral`}
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <p className="text-xs text-stone-500 uppercase tracking-wide">Productos activos</p>
          <p className="text-3xl font-bold mt-1 text-stone-800">{totalProducts}</p>
          <p className="text-xs text-stone-400 mt-1">en catálogo</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <p className="text-xs text-stone-500 uppercase tracking-wide">Locales</p>
          <p className="text-3xl font-bold mt-1 text-stone-800">2</p>
          <p className="text-xs text-stone-400 mt-1">Acuña · Triunvirato</p>
        </div>
      </div>

      {/* Low stock alerts */}
      {alerts.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-red-100 bg-red-50">
            <span className="text-sm font-medium text-red-700">⚠ Alertas de stock bajo</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide">
                  Local
                </th>
                <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide">
                  Producto
                </th>
                <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide">
                  Categoría
                </th>
                <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide text-right">
                  Stock
                </th>
                <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide text-right">
                  Umbral
                </th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, i) => (
                <tr key={i} className="border-b border-stone-50 last:border-0">
                  <td className="px-4 py-2.5 text-stone-600">{alert.location_name}</td>
                  <td className="px-4 py-2.5 font-medium text-stone-900">{alert.product_name}</td>
                  <td className="px-4 py-2.5 text-stone-400 text-xs">{alert.category_label}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-red-600">
                    {alert.current_stock}
                  </td>
                  <td className="px-4 py-2.5 text-right text-stone-400">{alert.alert_threshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent movements */}
      <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100">
          <h2 className="text-sm font-medium text-stone-700">Actividad reciente</h2>
        </div>
        {movements.length === 0 ? (
          <p className="px-4 py-8 text-sm text-stone-400 text-center">
            Sin movimientos registrados
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide">
                  Fecha
                </th>
                <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide">
                  Local
                </th>
                <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide">
                  Producto
                </th>
                <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide">
                  Tipo
                </th>
                <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide text-right">
                  Cant.
                </th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => {
                const style = MOVEMENT_STYLES[m.movement_type] ?? {
                  label: m.movement_type,
                  color: 'text-stone-600 bg-stone-100',
                }
                return (
                  <tr key={m.id} className="border-b border-stone-50 last:border-0">
                    <td className="px-4 py-2.5 text-stone-400 text-xs whitespace-nowrap">
                      {formatDate(m.created_at)}
                    </td>
                    <td className="px-4 py-2.5 text-stone-600">{m.location_name}</td>
                    <td className="px-4 py-2.5 font-medium text-stone-900">{m.product_name}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.color}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-stone-700">
                      {m.quantity} {m.unit_label}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
