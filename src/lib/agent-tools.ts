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
    .select('id')
    .ilike('name', name)
    .eq('is_active', true)
    .single()
  if (error || !data) throw new Error(`Producto no encontrado: "${name}"`)
  return data.id
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
    query = query.ilike('location_name', input.location_name as string)
  }
  if (input.category) {
    query = query.eq('category_name', input.category as string)
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
