import type { Tool } from '@anthropic-ai/sdk/resources/messages'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './supabase'

type DB = SupabaseClient<Database>
type ToolInput = Record<string, unknown>

// ===== Tool definitions =====

export const agentTools: Tool[] = [
  {
    name: 'record_sale',
    description:
      'Registra una venta en un local, descontando el stock del producto indicado. Falla si el stock es insuficiente.',
    input_schema: {
      type: 'object' as const,
      properties: {
        location_name: {
          type: 'string',
          description: 'Nombre del local: "Acuña" o "Triunvirato"',
        },
        product_name: {
          type: 'string',
          description: 'Nombre del producto tal como figura en el catálogo',
        },
        quantity: {
          type: 'number',
          description: 'Cantidad vendida (mayor a 0)',
        },
        notes: {
          type: 'string',
          description: 'Notas opcionales sobre la venta',
        },
      },
      required: ['location_name', 'product_name', 'quantity'],
    },
  },
  {
    name: 'record_restock',
    description:
      'Registra una reposición de stock en un local, sumando la cantidad al stock actual del producto.',
    input_schema: {
      type: 'object' as const,
      properties: {
        location_name: {
          type: 'string',
          description: 'Nombre del local: "Acuña" o "Triunvirato"',
        },
        product_name: {
          type: 'string',
          description: 'Nombre del producto tal como figura en el catálogo',
        },
        quantity: {
          type: 'number',
          description: 'Cantidad repuesta (mayor a 0)',
        },
        supplier_name: {
          type: 'string',
          description: 'Nombre del proveedor (opcional, para comidas externas)',
        },
        notes: {
          type: 'string',
          description: 'Notas opcionales sobre la reposición',
        },
      },
      required: ['location_name', 'product_name', 'quantity'],
    },
  },
  {
    name: 'adjust_stock',
    description:
      'Ajusta el stock de un producto a una cantidad exacta. Usar para correcciones tras inventario físico.',
    input_schema: {
      type: 'object' as const,
      properties: {
        location_name: {
          type: 'string',
          description: 'Nombre del local: "Acuña" o "Triunvirato"',
        },
        product_name: {
          type: 'string',
          description: 'Nombre del producto tal como figura en el catálogo',
        },
        new_quantity: {
          type: 'number',
          description: 'Cantidad real contada en el inventario físico',
        },
        notes: {
          type: 'string',
          description: 'Motivo del ajuste o diferencia encontrada',
        },
      },
      required: ['location_name', 'product_name', 'new_quantity'],
    },
  },
  {
    name: 'query_stock',
    description:
      'Consulta el stock actual de todos los productos. Filtra por local y/o categoría si se especifica.',
    input_schema: {
      type: 'object' as const,
      properties: {
        location_name: {
          type: 'string',
          description: 'Filtrar por local: "Acuña" o "Triunvirato". Omitir para ver ambos.',
        },
        category: {
          type: 'string',
          enum: ['havanna', 'external_food'],
          description: 'Filtrar por categoría de producto',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_low_stock_alerts',
    description:
      'Devuelve los productos con stock por debajo del umbral mínimo configurado. Ordenados de menor a mayor stock.',
    input_schema: {
      type: 'object' as const,
      properties: {
        location_name: {
          type: 'string',
          description: 'Filtrar por local. Omitir para ver alertas de ambos locales.',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_movement_history',
    description:
      'Consulta el historial de movimientos (ventas, reposiciones, ajustes) ordenado por fecha descendente.',
    input_schema: {
      type: 'object' as const,
      properties: {
        location_name: {
          type: 'string',
          description: 'Filtrar por local',
        },
        product_name: {
          type: 'string',
          description: 'Filtrar por nombre de producto (búsqueda parcial)',
        },
        movement_type: {
          type: 'string',
          enum: ['sale', 'restock', 'adjustment'],
          description: 'Filtrar por tipo de movimiento',
        },
        limit: {
          type: 'number',
          description: 'Máximo de registros a devolver (por defecto: 20)',
        },
      },
      required: [],
    },
  },
  {
    name: 'bulk_restock',
    description:
      'Registra múltiples reposiciones de stock en un solo local en una única operación. Usar siempre al procesar remitos con varios productos.',
    input_schema: {
      type: 'object' as const,
      properties: {
        location_name: {
          type: 'string',
          description: 'Nombre del local: "Acuña" o "Triunvirato"',
        },
        items: {
          type: 'array',
          description: 'Lista de productos a reponer',
          items: {
            type: 'object',
            properties: {
              product_name: {
                type: 'string',
                description: 'Nombre del producto tal como figura en el catálogo',
              },
              quantity: {
                type: 'number',
                description: 'Cantidad repuesta (mayor a 0)',
              },
              unit: {
                type: 'string',
                description: 'Unidad de medida del remito: "UN" (unidad) o "CAJ" (caja)',
              },
            },
            required: ['product_name', 'quantity'],
          },
        },
      },
      required: ['location_name', 'items'],
    },
  },
]

// ===== Executor =====

export async function executeAgentTool(
  toolName: string,
  input: ToolInput,
  db: DB,
): Promise<unknown> {
  try {
    switch (toolName) {
      case 'record_sale':
        return await recordSale(input, db)
      case 'record_restock':
        return await recordRestock(input, db)
      case 'adjust_stock':
        return await adjustStock(input, db)
      case 'query_stock':
        return await queryStock(input, db)
      case 'get_low_stock_alerts':
        return await getLowStockAlerts(input, db)
      case 'get_movement_history':
        return await getMovementHistory(input, db)
      case 'bulk_restock':
        return await bulkRestock(input, db)
      default:
        throw new Error(`Tool desconocida: ${toolName}`)
    }
  } catch (err) {
    console.error(`[agent-tools] error en ${toolName}:`, err)
    throw err
  }
}

// ===== Resolvers (nombre → UUID) =====

async function resolveLocationId(name: string, db: DB): Promise<string> {
  const { data, error } = await db
    .from('locations')
    .select('id')
    .ilike('name', name)
    .single()
  if (error || !data) throw new Error(`Local no encontrado: "${name}"`)
  return data.id
}

async function resolveProductId(name: string, db: DB): Promise<string> {
  const { data, error } = await db
    .from('products')
    .select('id, name')
    .ilike('name', `%${name}%`)
    .eq('is_active', true)
  if (error) throw new Error(`Error buscando producto: ${error.message}`)

  if (!data || data.length === 0) {
    return resolveProductIdByWords(name, db)
  }
  if (data.length > 1) {
    const names = (data as { id: string; name: string }[]).map((p) => p.name).join(', ')
    throw new Error(`Varios productos coinciden con "${name}": ${names}. Especificá el nombre completo.`)
  }
  return (data as { id: string; name: string }[])[0].id
}

async function resolveProductIdByWords(name: string, db: DB): Promise<string> {
  const significantWords = name.split(/\s+/).filter((w) => w.length > 3)
  if (significantWords.length === 0) throw new Error(`Producto no encontrado: "${name}"`)

  const orFilter = significantWords.map((w) => `name.ilike.%${w}%`).join(',')
  const { data, error } = await db
    .from('products')
    .select('id, name')
    .or(orFilter)
    .eq('is_active', true)

  if (error) throw new Error(`Error buscando producto: ${error.message}`)
  if (!data || data.length === 0) throw new Error(`Producto no encontrado: "${name}"`)

  type ProductRow = { id: string; name: string }
  const scored = (data as ProductRow[]).map((p) => {
    const productWords = p.name.toLowerCase().split(/\s+/)
    const matches = significantWords.filter((w) =>
      productWords.some((pw) => pw.includes(w.toLowerCase()) || w.toLowerCase().includes(pw)),
    )
    return { ...p, score: matches.length }
  })

  scored.sort((a, b) => b.score - a.score)

  if (scored[0].score === 0) throw new Error(`Producto no encontrado: "${name}"`)

  if (scored.length === 1 || scored[0].score > scored[1].score) {
    return scored[0].id
  }

  const topScore = scored[0].score
  const tied = scored.filter((p) => p.score === topScore)
  const names = tied.map((p) => p.name).join(', ')
  throw new Error(`Varios productos coinciden con "${name}": ${names}. Especificá el nombre completo.`)
}

async function resolveSupplierIdOptional(
  name: string | undefined,
  db: DB,
): Promise<string | null> {
  if (!name) return null
  const { data } = await db.from('suppliers').select('id').ilike('name', name).single()
  return data?.id ?? null
}

// ===== Tool implementations =====

async function recordSale(input: ToolInput, db: DB) {
  const locationId = await resolveLocationId(input.location_name as string, db)
  const productId = await resolveProductId(input.product_name as string, db)

  const { data, error } = await db.rpc('record_sale', {
    p_location_id: locationId,
    p_product_id: productId,
    p_quantity: input.quantity as number,
    p_notes: (input.notes as string) ?? null,
  })

  if (error) {
    console.error('[agent-tools] record_sale supabase error:', JSON.stringify(error))
    throw new Error(error.message)
  }
  return { success: true, movement: data }
}

async function recordRestock(input: ToolInput, db: DB) {
  const locationId = await resolveLocationId(input.location_name as string, db)
  const productId = await resolveProductId(input.product_name as string, db)
  const supplierId = await resolveSupplierIdOptional(
    input.supplier_name as string | undefined,
    db,
  )

  const { data, error } = await db.rpc('record_restock', {
    p_location_id: locationId,
    p_product_id: productId,
    p_quantity: input.quantity as number,
    p_supplier_id: supplierId,
    p_notes: (input.notes as string) ?? null,
  })

  if (error) throw new Error(error.message)
  return { success: true, movement: data }
}

async function adjustStock(input: ToolInput, db: DB) {
  const locationId = await resolveLocationId(input.location_name as string, db)
  const productId = await resolveProductId(input.product_name as string, db)

  const { data, error } = await db.rpc('adjust_stock', {
    p_location_id: locationId,
    p_product_id: productId,
    p_new_quantity: input.new_quantity as number,
    p_notes: (input.notes as string) ?? null,
  })

  if (error) throw new Error(error.message)
  return { success: true, movement: data }
}

async function queryStock(input: ToolInput, db: DB) {
  let query = db.from('stock_current').select('*')

  if (input.location_name) {
    query = query.ilike('location_name', `%${input.location_name as string}%`)
  }
  if (input.category) {
    query = query.ilike('category_name', `%${input.category as string}%`)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

async function getLowStockAlerts(input: ToolInput, db: DB) {
  let query = db.from('low_stock_alerts').select('*')

  if (input.location_name) {
    query = query.ilike('location_name', input.location_name as string)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

async function getMovementHistory(input: ToolInput, db: DB) {
  const limit = (input.limit as number) ?? 20
  let query = db.from('movement_history').select('*').limit(limit)

  if (input.location_name) {
    query = query.ilike('location_name', input.location_name as string)
  }
  if (input.product_name) {
    query = query.ilike('product_name', `%${input.product_name as string}%`)
  }
  if (input.movement_type) {
    query = query.eq('movement_type', input.movement_type as 'sale' | 'restock' | 'adjustment')
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

type BulkItem = { product_name: string; quantity: number; unit?: string }

async function bulkRestock(input: ToolInput, db: DB) {
  const locationId = await resolveLocationId(input.location_name as string, db)
  const items = input.items as BulkItem[]

  // Resolve all product IDs in parallel, capturing per-item failures
  const resolved = await Promise.all(
    items.map(async (item) => {
      try {
        const productId = await resolveProductId(item.product_name, db)
        return { ok: true as const, productId, item }
      } catch (err) {
        return {
          ok: false as const,
          item,
          reason: err instanceof Error ? err.message : String(err),
        }
      }
    }),
  )

  const successes = resolved.filter((r) => r.ok === true) as Array<{
    ok: true
    productId: string
    item: BulkItem
  }>
  const failures = resolved.filter((r) => r.ok === false) as Array<{
    ok: false
    item: BulkItem
    reason: string
  }>

  if (successes.length === 0) {
    return {
      registered: 0,
      failed: failures.map((f) => ({ product_name: f.item.product_name, reason: f.reason })),
    }
  }

  // Bulk insert all movements in a single query
  const { error: movError } = await db.from('movements').insert(
    successes.map((r) => ({
      location_id: locationId,
      product_id: r.productId,
      movement_type: 'restock' as const,
      quantity: r.item.quantity,
      notes: r.item.unit ? `UM: ${r.item.unit}` : null,
    })),
  )

  if (movError) throw new Error(`Error insertando movimientos: ${movError.message}`)

  // Fetch current stock for all resolved products in one query
  const productIds = successes.map((r) => r.productId)
  const { data: currentStock, error: stockFetchError } = await db
    .from('stock')
    .select('product_id, quantity')
    .eq('location_id', locationId)
    .in('product_id', productIds)

  if (stockFetchError) throw new Error(`Error leyendo stock actual: ${stockFetchError.message}`)

  const stockMap = Object.fromEntries(
    (currentStock ?? []).map((s) => [s.product_id, s.quantity]),
  )

  // Bulk upsert updated stock quantities in a single query
  const now = new Date().toISOString()
  const { error: stockError } = await db.from('stock').upsert(
    successes.map((r) => ({
      location_id: locationId,
      product_id: r.productId,
      quantity: (stockMap[r.productId] ?? 0) + r.item.quantity,
      last_updated: now,
    })),
    { onConflict: 'location_id,product_id' },
  )

  if (stockError) throw new Error(`Error actualizando stock: ${stockError.message}`)

  return {
    registered: successes.length,
    failed: failures.map((f) => ({ product_name: f.item.product_name, reason: f.reason })),
  }
}
