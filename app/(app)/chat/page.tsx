'use client'

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react'

type ToolCall = {
  id: string
  name: string
  input: unknown
  result?: unknown
  isError?: boolean
  done: boolean
}

type DisplayMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  toolCalls: ToolCall[]
}

const TOOL_LABELS: Record<string, string> = {
  record_sale: 'Registrando venta',
  record_restock: 'Registrando reposición',
  adjust_stock: 'Ajustando stock',
  query_stock: 'Consultando stock',
  get_low_stock_alerts: 'Verificando alertas',
  get_movement_history: 'Consultando historial',
}

const SUGGESTIONS = [
  'Mostrar stock de Acuña',
  'Alertas de stock bajo',
  'Registrá venta de 3 alfajores en Acuña',
  'Historial de los últimos movimientos',
]

function ToolCallBadge({ call }: { call: ToolCall }) {
  const label = TOOL_LABELS[call.name] ?? call.name
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs mb-1 ${
        !call.done
          ? 'border border-amber-200 bg-amber-50 text-amber-700'
          : call.isError
            ? 'border border-red-200 bg-red-50 text-red-600'
            : 'border border-stone-200 bg-stone-50 text-stone-400'
      }`}
    >
      <span className={`text-base leading-none ${!call.done ? 'animate-spin' : ''}`}>
        {!call.done ? '◌' : call.isError ? '✗' : '✓'}
      </span>
      <span className="font-medium">{label}</span>
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [apiMessages, setApiMessages] = useState<unknown[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function resizeTextarea() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = '44px'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setTimeout(resizeTextarea, 0)
    setLoading(true)

    const userMsg: DisplayMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      toolCalls: [],
    }
    setMessages((prev) => [...prev, userMsg])

    const payload = [...apiMessages, { role: 'user', content: text }]

    const assistantId = crypto.randomUUID()
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', text: '', toolCalls: [] },
    ])

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
      })

      if (!res.ok || !res.body) {
        throw new Error(`Error ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          if (!part.trim()) continue

          let eventName = ''
          let eventData = ''
          for (const line of part.split('\n')) {
            if (line.startsWith('event: ')) eventName = line.slice(7).trim()
            if (line.startsWith('data: ')) eventData = line.slice(6)
          }
          if (!eventData) continue

          const data = JSON.parse(eventData) as Record<string, unknown>

          if (eventName === 'text') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, text: m.text + (data.text as string) } : m,
              ),
            )
          } else if (eventName === 'tool_start') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      toolCalls: [
                        ...m.toolCalls,
                        {
                          id: data.id as string,
                          name: data.name as string,
                          input: data.input,
                          done: false,
                        },
                      ],
                    }
                  : m,
              ),
            )
          } else if (eventName === 'tool_done') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      toolCalls: m.toolCalls.map((tc) =>
                        tc.id === (data.id as string)
                          ? {
                              ...tc,
                              result: data.result,
                              isError: data.isError as boolean,
                              done: true,
                            }
                          : tc,
                      ),
                    }
                  : m,
              ),
            )
          } else if (eventName === 'done') {
            if (Array.isArray(data.messages)) {
              setApiMessages(data.messages)
            }
          } else if (eventName === 'error') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, text: `Error: ${data.message as string}` }
                  : m,
              ),
            )
          }
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, text: 'Error al conectar con el agente. Intentá de nuevo.' }
            : m,
        ),
      )
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as FormEvent)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 px-6 py-4 border-b border-stone-200 bg-white">
        <h1 className="text-base font-semibold text-stone-900">Chat con el Agente</h1>
        <p className="text-xs text-stone-400">
          Registrá ventas, reposiciones y consultá el stock en lenguaje natural
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 px-6 py-6">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center min-h-64 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-800 flex items-center justify-center text-white text-lg font-bold select-none">
              H
            </div>
            <div>
              <p className="text-sm font-medium text-stone-700">Asistente de stock Havanna</p>
              <p className="text-xs text-stone-400 mt-1 max-w-xs">
                Puedo registrar ventas, reposiciones y ajustes, y responder consultas sobre
                inventario.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 max-w-sm w-full">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s)
                    textareaRef.current?.focus()
                  }}
                  className="text-left px-3 py-2 rounded-lg border border-stone-200 text-xs text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5 max-w-2xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' ? (
                  <div className="max-w-[80%]">
                    {msg.toolCalls.map((tc) => (
                      <ToolCallBadge key={tc.id} call={tc} />
                    ))}
                    {(msg.text !== '' || msg.toolCalls.length === 0) && (
                      <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm bg-white border border-stone-200 text-stone-800 mt-1">
                        {msg.text || (
                          <span className="text-stone-400 italic">Pensando…</span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm bg-red-800 text-white">
                    {msg.text}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 z-10 px-6 py-4 border-t border-stone-200 bg-white">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                resizeTextarea()
              }}
              onKeyDown={handleKeyDown}
              placeholder="Escribí tu consulta o pedí registrar una operación..."
              rows={1}
              disabled={loading}
              style={{ height: '44px', maxHeight: '120px' }}
              className="flex-1 resize-none rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-700 disabled:bg-stone-50 disabled:text-stone-400 overflow-y-auto"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-red-800 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              style={{ height: '44px' }}
            >
              {loading ? '...' : 'Enviar'}
            </button>
          </div>
          <p className="text-[10px] text-stone-400 mt-1.5 text-right">
            Enter para enviar · Shift+Enter para nueva línea
          </p>
        </form>
      </div>
    </div>
  )
}
