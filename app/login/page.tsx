'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, { error: null })

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-red-800 flex items-center justify-center text-white text-lg font-bold mx-auto mb-3 select-none">
            H
          </div>
          <h1 className="text-xl font-semibold text-stone-900">Havanna Stock</h1>
          <p className="text-sm text-stone-400 mt-1">Ingresá con tu cuenta</p>
        </div>

        <form
          action={action}
          className="space-y-4 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm"
        >
          {state.error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-stone-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-700"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-stone-700 mb-1.5">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-700"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2.5 rounded-xl bg-red-800 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors mt-2"
          >
            {pending ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
