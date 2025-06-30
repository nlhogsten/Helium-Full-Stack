// actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
// No longer need NextResponse for server actions returning data to client components

export type FormState = {
  error: string | null // Keep error as string | null
  success: boolean
  // redirectTo is not strictly needed here if client handles redirect
}

export async function signOut(): Promise<FormState> {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()

    // On successful sign out, return a success state
    return { success: true, error: null }
  } catch (error) {
    console.error('Error during sign out:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during sign out';
    return { error: errorMessage, success: false }
  }
}
