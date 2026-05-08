'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'

function IconGrid() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconChat() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function IconPackage() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}

const links = [
  { href: '/', label: 'Dashboard', icon: <IconGrid /> },
  { href: '/chat', label: 'Chat con Agente', icon: <IconChat /> },
  { href: '/stock', label: 'Stock', icon: <IconPackage /> },
  { href: '/historial', label: 'Historial', icon: <IconClock /> },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 bg-stone-900 flex flex-col h-full">
      <div className="px-5 pt-6 pb-5 border-b border-stone-700/60">
        <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-0.5">Havanna</p>
        <h1 className="text-base font-semibold text-white">Gestión de Stock</h1>
      </div>
      <nav className="py-3 flex-1">
        <ul className="space-y-0.5">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded text-sm transition-colors ${
                    active
                      ? 'bg-red-800 text-white'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="px-3 py-3 border-t border-stone-700/60">
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded text-sm text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
