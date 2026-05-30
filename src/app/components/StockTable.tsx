'use client'

import { useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { StockCurrentRow, Database } from '../../lib/supabase'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

type EnrichedRow = StockCurrentRow & { supplier_name: string }

const SUPPLIERS = ['Havanna', 'Grandwich', 'Axion', 'Pepsi']

type Props = {
  rows: EnrichedRow[]
}

type EditingState = {
  key: string
  productId: string
  locationId: string
  originalValue: number
}

const LOW = (
  <span className="px-2 py-0.5 rounded text-xs font-medium text-red-700 bg-red-100">Bajo</span>
)
const OK = (
  <span className="px-2 py-0.5 rounded text-xs font-medium text-green-700 bg-green-50">OK</span>
)

export default function StockTable({ rows }: Props) {
  const [location, setLocation] = useState<string | null>(null)
  const [supplier, setSupplier] = useState<string | null>(null)

  const [localValues, setLocalValues] = useState<Record<string, number>>({})
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [editValue, setEditValue] = useState('')
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const editValueRef = useRef('')

  const locations = [...new Set(rows.map((r) => r.location_name))].sort()

  const filtered = rows.filter((r) => {
    if (location && r.location_name !== location) return false
    if (supplier && r.supplier_name !== supplier) return false
    return true
  })

  function cellKey(productId: string, locationId: string) {
    return `${productId}:${locationId}`
  }

  function setEditValueSafe(v: string) {
    setEditValue(v)
    editValueRef.current = v
  }

  function startEdit(row: EnrichedRow, currentValue: number) {
    const key = cellKey(row.product_id, row.location_id)
    setEditing({ key, productId: row.product_id, locationId: row.location_id, originalValue: currentValue })
    setEditValueSafe(String(currentValue))
    setErrorKey(null)
  }

  async function saveEdit() {
    if (!editing) return
    const { productId, locationId, originalValue } = editing
    const key = editing.key
    const newQty = Math.round(Number(editValueRef.current))

    setEditing(null)

    if (!editValueRef.current || isNaN(newQty) || newQty < 0 || newQty === originalValue) return

    setLocalValues((prev) => ({ ...prev, [key]: newQty }))

    const { error } = await supabase
      .from('stock')
      .upsert(
        { location_id: locationId, product_id: productId, quantity: newQty },
        { onConflict: 'location_id,product_id' },
      )

    if (error) {
      setLocalValues((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      setErrorKey(key)
      setTimeout(() => setErrorKey((prev) => (prev === key ? null : prev)), 3000)
    }
  }

  function cancelEdit() {
    setEditing(null)
  }

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
              filtered.map((row) => {
                const key = cellKey(row.product_id, row.location_id)
                const qty = localValues[key] ?? row.quantity
                const isLow = localValues[key] !== undefined ? false : row.is_low_stock
                const isEditing = editing?.key === key
                const hasError = errorKey === key

                return (
                  <tr
                    key={row.id}
                    className={`border-b border-stone-50 last:border-0 ${isLow ? 'bg-red-50/40' : ''}`}
                  >
                    <td className="px-4 py-2.5 font-medium text-stone-900">{row.product_name}</td>
                    <td className="px-4 py-2.5 text-stone-400 text-xs">{row.category_label}</td>
                    <td className="px-4 py-2.5 text-stone-600">{row.location_name}</td>
                    <td className="px-4 py-2.5 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editValue}
                          autoFocus
                          className="w-16 text-right text-sm font-bold border border-stone-400 rounded px-1 py-0 focus:outline-none focus:ring-1 focus:ring-stone-500"
                          onChange={(e) => setEditValueSafe(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur()
                            if (e.key === 'Escape') cancelEdit()
                          }}
                        />
                      ) : (
                        <button
                          onClick={() => startEdit(row, qty)}
                          title={hasError ? 'Error al guardar — valor sin cambios' : 'Clic para editar'}
                          className={`font-bold rounded px-1 -mx-1 hover:bg-stone-100 transition-colors cursor-pointer ${
                            hasError ? 'text-red-400' : isLow ? 'text-red-600' : 'text-stone-800'
                          }`}
                        >
                          {qty}
                          {hasError && <span className="ml-1 text-xs font-normal text-red-400">!</span>}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-stone-400 text-xs">{row.unit_label}</td>
                    <td className="px-4 py-2.5 text-right text-stone-400 text-xs">
                      {row.min_stock_alert}
                    </td>
                    <td className="px-4 py-2.5">{isLow ? LOW : OK}</td>
                  </tr>
                )
              })
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
