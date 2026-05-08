import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Havanna Stock',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full bg-stone-50 text-stone-900 antialiased">{children}</body>
    </html>
  )
}
