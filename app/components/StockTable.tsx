'use client'

import { useState, useMemo, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { StockCurrentRow, StockComparisonRow, Database } from '@/src/lib/supabase'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

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

function axionTypeOrder(name: string): number {
  const n = name.toLowerCase()
  if (n.includes('leche') || n.includes('queso crema')) return 0
  if (n.includes('medialuna') || n.startsWith('pan ') || n.includes('cinnamon') || n.includes('pain au')) return 1
  if (/muffin|torta|cookie|bud[ií]n|cheese cake|lemon pie|marquise/.test(n)) return 2
  if (n.includes('tarteleta') || n.includes('bowl')) return 3
  if (/syrup|concentrado|pur[eé]|variegato|base |alm[ií]bar|salsa|jugo de/.test(n)) return 4
  if (/hellmanns|mayonesa|ketchup|mostaza|guacamole|aceite|aceto|sal /.test(n)) return 5
  return 6
}

function typeOrder(supplierName: string, productName: string): number {
  if (supplierName === 'Havanna') return havannaTypeOrder(productName)
  if (supplierName === 'Axion') return axionTypeOrder(productName)
  return 0
}

function sortProducts<T extends { supplier_name: string; product_name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ai = SUPPLIERS.indexOf(a.supplier_name)
    const bi = SUPPLIERS.indexOf(b.supplier_name)
    const ao = ai === -1 ? SUPPLIERS.length : ai
    const bo = bi === -1 ? SUPPLIERS.length : bi
    if (ao !== bo) return ao - bo
    const ta = typeOrder(a.supplier_name, a.product_name)
    const tb = typeOrder(b.supplier_name, b.product_name)
    if (ta !== tb) return ta - tb
    return a.product_name.localeCompare(b.product_name, 'es')
  })
}

type Props = {
  rows: EnrichedCurrentRow[]
  comparisonRows: EnrichedComparisonRow[]
}

type EditingState = {
  key: string
  productId: string
  locationName: string
  originalValue: number
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
  const [search, setSearch] = useState('')

  const [localValues, setLocalValues] = useState<Record<string, number>>({})
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [editValue, setEditValue] = useState('')
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const editValueRef = useRef('')

  const locations = [...new Set(rows.map((r) => r.location_name))].sort()

  const locationIdByName = useMemo(() => {
    const map: Record<string, string> = {}
    for (const r of rows) map[r.location_name] = r.location_id
    return map
  }, [rows])

  // Map comparison view column slugs to actual DB location names
  const acunaName = useMemo(
    () => locations.find((l) => /a[cç]u[nñ]a/i.test(l)) ?? 'Acuña',
    [locations],
  )
  const triunviratoName = useMemo(
    () => locations.find((l) => /triunvirato/i.test(l)) ?? 'Triunvirato',
    [locations],
  )

  const showComparison = location === null

  const matchesSearch = (name: string) =>
    !search || name.toLowerCase().includes(search.toLowerCase())

  const filteredRows = sortProducts(
    rows.filter((r) => {
      if (location && r.location_name !== location) return false
      if (supplier && r.supplier_name !== supplier) return false
      if (!matchesSearch(r.product_name)) return false
      return true
    }),
  )

  const filteredComparison = sortProducts(
    comparisonRows.filter((r) => {
      if (supplier && r.supplier_name !== supplier) return false
      if (!matchesSearch(r.product_name)) return false
      return true
    }),
  )

  function cellKey(productId: string, locationName: string) {
    return `${productId}:${locationName}`
  }

  function displayValue(productId: string, locationName: string, fallback: number) {
    return localValues[cellKey(productId, locationName)] ?? fallback
  }

  function setEditValueSafe(v: string) {
    setEditValue(v)
    editValueRef.current = v
  }

  function startEdit(productId: string, locationName: string, currentValue: number) {
    setEditing({
      key: cellKey(productId, locationName),
      productId,
      locationName,
      originalValue: currentValue,
    })
    setEditValueSafe(String(currentValue))
    setErrorKey(null)
  }

  async function saveEdit() {
    if (!editing) return
    const { productId, locationName, originalValue } = editing
    const key = editing.key
    const raw = editValueRef.current
    const newQty = Math.round(Number(raw))

    setEditing(null)

    if (!raw || isNaN(newQty) || newQty < 0 || newQty === originalValue) return

    const locationId = locationIdByName[locationName]
    if (!locationId) return

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

  function renderStockCell(
    productId: string,
    locationName: string,
    fallback: number,
    isLow: boolean,
  ) {
    const key = cellKey(productId, locationName)
    const value = displayValue(productId, locationName, fallback)
    const isEditing = editing?.key === key
    const hasError = errorKey === key

    if (isEditing) {
      return (
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
      )
    }

    return (
      <button
        onClick={() => startEdit(productId, locationName, value)}
        title={hasError ? 'Error al guardar — valor sin cambios' : 'Clic para editar'}
        className={`font-bold rounded px-1 -mx-1 hover:bg-stone-100 transition-colors cursor-pointer ${
          hasError ? 'text-red-400' : isLow ? 'text-red-600' : 'text-stone-800'
        }`}
      >
        {value}
        {hasError && <span className="ml-1 text-xs font-normal text-red-400">!</span>}
      </button>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar producto..."
        className="w-full max-w-sm px-3 py-1.5 rounded border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300"
      />

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
                  const acunaVal = displayValue(row.product_id, acunaName, row.acuna_qty)
                  const triunviratoVal = displayValue(
                    row.product_id,
                    triunviratoName,
                    row.triunvirato_qty,
                  )
                  const acunaLow =
                    localValues[cellKey(row.product_id, acunaName)] !== undefined
                      ? false
                      : row.acuna_low
                  const triunviratoLow =
                    localValues[cellKey(row.product_id, triunviratoName)] !== undefined
                      ? false
                      : row.triunvirato_low
                  const isLow = acunaLow || triunviratoLow
                  return (
                    <tr
                      key={row.product_id}
                      className={`border-b border-stone-50 last:border-0 ${isLow ? 'bg-red-50/40' : ''}`}
                    >
                      <td className="px-4 py-2.5 font-medium text-stone-900">{row.product_name}</td>
                      <td className="px-4 py-2.5 text-stone-400 text-xs">{row.category_label}</td>
                      <td className="px-4 py-2.5 text-right">
                        {renderStockCell(row.product_id, acunaName, row.acuna_qty, acunaLow)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {renderStockCell(
                          row.product_id,
                          triunviratoName,
                          row.triunvirato_qty,
                          triunviratoLow,
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right text-stone-600">
                        {acunaVal + triunviratoVal}
                      </td>
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
                filteredRows.map((row) => {
                  const isLow =
                    localValues[cellKey(row.product_id, row.location_name)] !== undefined
                      ? false
                      : row.is_low_stock
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-stone-50 last:border-0 ${isLow ? 'bg-red-50/40' : ''}`}
                    >
                      <td className="px-4 py-2.5 font-medium text-stone-900">{row.product_name}</td>
                      <td className="px-4 py-2.5 text-stone-400 text-xs">{row.category_label}</td>
                      <td className="px-4 py-2.5 text-stone-600">{row.location_name}</td>
                      <td className="px-4 py-2.5 text-right">
                        {renderStockCell(row.product_id, row.location_name, row.quantity, isLow)}
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
      )}

      <p className="text-xs text-stone-400 text-right">
        {showComparison
          ? `${filteredComparison.length} de ${comparisonRows.length} productos`
          : `${filteredRows.length} de ${rows.length} entradas`}
      </p>
    </div>
  )
}
