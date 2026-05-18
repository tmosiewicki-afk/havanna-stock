'use client'

import { useState } from 'react'
import type { StockCurrentRow, StockComparisonRow } from '@/src/lib/supabase'

type EnrichedCurrentRow = StockCurrentRow & { supplier_name: string }
type EnrichedComparisonRow = StockComparisonRow & { supplier_name: string }

const SUPPLIERS = ['Havanna', 'Grandwich', 'Axion', 'Pepsi']

function havannaTypeOrder(name: string): number {
  const n = name.toLowerCase()
  if (/alfajor|havannet|coronita|medall[oó]n|miniaturas|barrita|waffle|mini mix/.test(n)) return 0
  if (n.includes('galletita')) return 1
  if (n.includes('tableta')) return 2
  if (/bombon|bombón/.test(n)) return 3
  if (n.includes('trufa')) return 4
  if (n.includes('cuadradito')) return 5
  if (n.includes('muffin')) return 6
  if (n.includes('dulce de leche')) return 7
  if (n.includes('syrup')) return 8
  if (n.startsWith('té')) return 9
  return 10
}

function sortProducts<T extends { supplier_name: string; product_name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ai = SUPPLIERS.indexOf(a.supplier_name)
    const bi = SUPPLIERS.indexOf(b.supplier_name)
    const ao = ai === -1 ? SUPPLIERS.length : ai
    const bo = bi === -1 ? SUPPLIERS.length : bi
    if (ao !== bo) return ao - bo
    if (a.supplier_name === 'Havanna') {
      const ta = havannaTypeOrder(a.product_name)
      const tb = havannaTypeOrder(b.product_name)
      if (ta !== tb) return ta - tb
    }
    return a.product_name.localeCompare(b.product_name, 'es')
  })
}

type Props = {
  rows: EnrichedCurrentRow[]
  comparisonRows: EnrichedComparisonRow[]
}

const LOW = (
  <span className="px-2 py-0.5 rounded text-xs font-medium text-red-700 bg-red-100">Bajo</span>
)
const OK = (
  <span className="px-2 py-0.5 rounded text-xs font-medium text-green-700 bg-green-50">OK</span>
)

export default function StockTable({ rows, comparisonRows }: Props) {
  const [location, setLocation] = useState<string | null>(null)
  const [supplier, setSupplier] = useState<string | null>(null)

  const locations = [...new Set(rows.map((r) => r.location_name))].sort()

  const showComparison = location === null

  const filteredRows = sortProducts(
    rows.filter((r) => {
      if (location && r.location_name !== location) return false
      if (supplier && r.supplier_name !== supplier) return false
      return true
    }),
  )

  const filteredComparison = sortProducts(
    comparisonRows.filter((r) => {
      if (supplier && r.supplier_name !== supplier) return false
      return true
    }),
  )

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

      {/* Comparison table (Todos) */}
      {showComparison ? (
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
                <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide text-right">
                  Acuña
                </th>
                <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide text-right">
                  Triunvirato
                </th>
                <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide text-right">
                  Total
                </th>
                <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide">
                  Unidad
                </th>
                <th className="px-4 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wide">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredComparison.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-stone-400 text-sm">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                filteredComparison.map((row) => {
                  const isLow = row.acuna_low || row.triunvirato_low
                  return (
                    <tr
                      key={row.product_id}
                      className={`border-b border-stone-50 last:border-0 ${isLow ? 'bg-red-50/40' : ''}`}
                    >
                      <td className="px-4 py-2.5 font-medium text-stone-900">{row.product_name}</td>
                      <td className="px-4 py-2.5 text-stone-400 text-xs">{row.category_label}</td>
                      <td
                        className={`px-4 py-2.5 text-right font-bold ${row.acuna_low ? 'text-red-600' : 'text-stone-800'}`}
                      >
                        {row.acuna_qty}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right font-bold ${row.triunvirato_low ? 'text-red-600' : 'text-stone-800'}`}
                      >
                        {row.triunvirato_qty}
                      </td>
                      <td className="px-4 py-2.5 text-right text-stone-600">{row.total_qty}</td>
                      <td className="px-4 py-2.5 text-stone-400 text-xs">{row.unit_label}</td>
                      <td className="px-4 py-2.5">{isLow ? LOW : OK}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Per-location table */
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
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-stone-400 text-sm">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-stone-50 last:border-0 ${row.is_low_stock ? 'bg-red-50/40' : ''}`}
                  >
                    <td className="px-4 py-2.5 font-medium text-stone-900">{row.product_name}</td>
                    <td className="px-4 py-2.5 text-stone-400 text-xs">{row.category_label}</td>
                    <td className="px-4 py-2.5 text-stone-600">{row.location_name}</td>
                    <td
                      className={`px-4 py-2.5 text-right font-bold ${row.is_low_stock ? 'text-red-600' : 'text-stone-800'}`}
                    >
                      {row.quantity}
                    </td>
                    <td className="px-4 py-2.5 text-stone-400 text-xs">{row.unit_label}</td>
                    <td className="px-4 py-2.5 text-right text-stone-400 text-xs">
                      {row.min_stock_alert}
                    </td>
                    <td className="px-4 py-2.5">{row.is_low_stock ? LOW : OK}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-stone-400 text-right">
        {showComparison
          ? `${filteredComparison.length} de ${comparisonRows.length} productos`
          : `${filteredRows.length} de ${rows.length} entradas`}
      </p>
    </div>
  )
}
