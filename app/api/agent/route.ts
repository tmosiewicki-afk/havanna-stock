import Anthropic from '@anthropic-ai/sdk'
import type {
  MessageParam,
  Tool,
  ToolUseBlock,
  ToolResultBlockParam,
} from '@anthropic-ai/sdk/resources/messages'
import { createSupabaseClient } from '@/src/lib/supabase'
import { agentTools, executeAgentTool } from '@/src/lib/agent-tools'

export const maxDuration = 60

const anthropic = new Anthropic()
const MAX_ITERATIONS = 10

const SYSTEM_PROMPT = `Sos el asistente de gestión de stock de los locales Havanna. Ayudás a registrar ventas, reposiciones y ajustes de inventario, y respondés consultas sobre el stock actual.

Locales disponibles: Acuña, Triunvirato.

Reglas:
- Siempre confirmá qué operación realizaste y el resultado.
- Si el stock es insuficiente para una venta, informalo claramente.
- Los nombres de productos y locales no son case-sensitive.
- Para ajustes de inventario físico usá adjust_stock con la cantidad real contada.
- Si el usuario menciona un producto sin especificar "caja", asumí que es por unidad. Solo preguntá si hay ambigüedad real (ej: el usuario dice explícitamente "una caja" pero no queda claro de qué tamaño).

Procesamiento de remitos por imagen:
- Cuando el usuario adjunta una foto de un remito, extraé todos los productos y cantidades de la tabla.
- Las columnas clave son Descripción y Cantidad. La columna UM indica si es UN (unidad) o CAJ (caja).
- El local se puede inferir del encabezado del remito (ej: 'Acuña de Figueroa' = local Acuña). Si no está claro, preguntá al usuario.
- Por cada producto encontrado, llamá a record_restock con el nombre del producto, cantidad y local.
- Algunos ítems del remito pueden no existir en el catálogo (bolsas, etiquetas, materiales de embalaje). Ignoralos silenciosamente y no intentes registrarlos.
- Al finalizar, mostrá un resumen de qué se registró y qué se ignoró por no estar en el catálogo.
- Si un nombre de producto del remito no coincide exactamente con el catálogo, intentá la coincidencia más cercana antes de descartarlo.`

const cachedTools: Tool[] = agentTools.map((tool: Tool, i: number) =>
  i === agentTools.length - 1
    ? { ...tool, cache_control: { type: 'ephemeral' as const } }
    : tool,
)

function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export async function POST(request: Request) {
  let body: { messages: MessageParam[] }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400 })
  }

  if (!Array.isArray(body?.messages)) {
    return new Response(JSON.stringify({ error: 'Se requiere messages[]' }), { status: 400 })
  }

  const db = createSupabaseClient()
  const messages: MessageParam[] = [...body.messages]

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      const send = (chunk: string) => controller.enqueue(enc.encode(chunk))

      try {
        for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
          const apiStream = anthropic.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 4096,
            output_config: { effort: 'medium' },
            system: [
              {
                type: 'text',
                text: SYSTEM_PROMPT,
                cache_control: { type: 'ephemeral' },
              },
            ],
            tools: cachedTools,
            messages,
          })

          apiStream.on('text', (text) => {
            send(sse('text', { text }))
          })

          const msg = await apiStream.finalMessage()

          messages.push({ role: 'assistant', content: msg.content })

          if (msg.stop_reason === 'end_turn') {
            break
          }

          if (msg.stop_reason !== 'tool_use') {
            break
          }

          const toolUseBlocks = msg.content.filter(
            (b): b is ToolUseBlock => b.type === 'tool_use',
          )

          const toolResults: ToolResultBlockParam[] = []

          for (const block of toolUseBlocks) {
            send(sse('tool_start', { id: block.id, name: block.name, input: block.input }))

            let result: unknown
            let isError = false

            try {
              result = await executeAgentTool(block.name, block.input as Record<string, unknown>, db)
            } catch (err) {
              result = { error: err instanceof Error ? err.message : String(err) }
              isError = true
            }

            send(sse('tool_done', { id: block.id, name: block.name, result, isError }))

            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: JSON.stringify(result),
              is_error: isError,
            })
          }

          messages.push({ role: 'user', content: toolResults })
        }

        send(sse('done', { messages }))
      } catch (err) {
        console.error('[agent] error en agentic loop:', err)
        send(sse('error', { message: err instanceof Error ? err.message : String(err) }))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
