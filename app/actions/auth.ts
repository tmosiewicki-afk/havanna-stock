'use server'

import { redirect } from 'next/navigation'
import { createAuthClient } from '@/src/lib/supabase-ssr'

export async function login(
  _state: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createAuthClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email o contraseña incorrectos' }
  }

  redirect('/')
}

export async function logout() {
  const supabase = await createAuthClient()
  await supabase.auth.signOut()
  redirect('/login')
}
