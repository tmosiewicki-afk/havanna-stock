'use client'

import { useState } from 'react'
import type { MovementHistoryRow } from '../../lib/supabase'

type Props = {
  rows: MovementHistoryRow[]
}

const MOVEMENT_STYLES: Record<string, { label: string; color: string }> = {
  sale: { label: 'Venta', color: 'text-red-700 bg-red-100' },
  restock: { label: 'Reposición', color: 'text-green-700 bg-green-100' },
  adjustment: { label: 'Ajuste', color: 'text-amber-700 bg-amber-100' },
}

const FILTER_TYPES = [
  { key: 'sale', label: 'Venta' },
  { key: 'restock', label: 'Reposición' },
  { key: 'adjustment', label: 'Ajuste' },
]

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export default function HistorialTable({ rows }: Props) {
  const [location, setLocation] = useState<string | null>(null)
  const [type, setType] = useState<string | null>(null)

  const locations = [...new Set(rows.map((r) => r.location_name))].sort()

  const filtered = rows.filter((r) => {
    if (location && r.location_name !== location) return false
    if (type && r.movement_type !== type) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-stone-500">Local:</span>
          {['Todos', ...locations].map((l) => (
            <button
              key={l}
              onClick={() => setLocation(l === 'Todos' ? null : l)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                (l === 'Todos' ? location === null : location === l)
                  ? 'bg-stone-800 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-stone-500">Tipo:</span>
          {[{ key: null, label: 'Todos' }, ...FILTER_TYPES].map(({ key, label }) => (
            <button
              key={label}
              onClick={() => setType(key)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                type === key
                  ? 'bg-stone-800 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-left">
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
              <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide">
                Proveedor
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide">
                Notas
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-stone-400 text-sm">
                  Sin movimientos
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const style = MOVEMENT_STYLES[row.movement_type] ?? {
                  label: row.movement_type,
                  color: 'text-stone-600 bg-stone-100',
                }
                return (
                  <tr
                    key={row.id}
                    className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50"
                  >
                    <td className="px-4 py-2.5 text-stone-400 text-xs whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-4 py-2.5 text-stone-600">{row.location_name}</td>
                    <td className="px-4 py-2.5 font-medium text-stone-900">{row.product_name}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.color}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-stone-700">
                      {row.quantity} {row.unit_label}
                    </td>
                    <td className="px-4 py-2.5 text-stone-400 text-xs">
                      {row.supplier_name ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-stone-400 text-xs max-w-xs truncate">
                      {row.notes ?? '—'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-stone-400 text-right">
        {filtered.length} de {rows.length} movimientos
      </p>
    </div>
  )
}
