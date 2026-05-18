'use client'

import { useState } from 'react'
import type { StockCurrentRow } from '../../lib/supabase'

type EnrichedRow = StockCurrentRow & { supplier_name: string }

const SUPPLIERS = ['Havanna', 'Grandwich', 'Axion', 'Pepsi']

type Props = {
  rows: EnrichedRow[]
}

export default function StockTable({ rows }: Props) {
  const [location, setLocation] = useState<string | null>(null)
  const [supplier, setSupplier] = useState<string | null>(null)

  const locations = [...new Set(rows.map((r) => r.location_name))].sort()

  const filtered = rows.filter((r) => {
    if (location && r.location_name !== location) return false
    if (supplier && r.supplier_name !== supplier) return false
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
          <span className="text-xs text-stone-500">Proveedor:</span>
          {['Todos', ...SUPPLIERS].map((s) => (
            <button
              key={s}
              onClick={() => setSupplier(s === 'Todos' ? null : s)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                (s === 'Todos' ? supplier === null : supplier === s)
                  ? 'bg-stone-800 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {s}
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
                Producto
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide">
                Categoría
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide">
                Local
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide text-right">
                Stock
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide">
                Unidad
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide text-right">
                Umbral
              </th>
              <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-stone-400 text-sm">
                  Sin resultados
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-stone-50 last:border-0 ${
                    row.is_low_stock ? 'bg-red-50/40' : ''
                  }`}
                >
                  <td className="px-4 py-2.5 font-medium text-stone-900">{row.product_name}</td>
                  <td className="px-4 py-2.5 text-stone-400 text-xs">{row.category_label}</td>
                  <td className="px-4 py-2.5 text-stone-600">{row.location_name}</td>
                  <td
                    className={`px-4 py-2.5 text-right font-bold ${
                      row.is_low_stock ? 'text-red-600' : 'text-stone-800'
                    }`}
                  >
                    {row.quantity}
                  </td>
                  <td className="px-4 py-2.5 text-stone-400 text-xs">{row.unit_label}</td>
                  <td className="px-4 py-2.5 text-right text-stone-400 text-xs">
                    {row.min_stock_alert}
                  </td>
                  <td className="px-4 py-2.5">
                    {row.is_low_stock ? (
                      <span className="px-2 py-0.5 rounded text-xs font-medium text-red-700 bg-red-100">
                        Bajo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs font-medium text-green-700 bg-green-50">
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-stone-400 text-right">
        {filtered.length} de {rows.length} entradas
      </p>
    </div>
  )
}
