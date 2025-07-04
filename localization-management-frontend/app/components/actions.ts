'use server';
import { createClient } from '@/utils/supabase/server';

export type FormState = {
  error: string | null
  success: boolean
}

export async function signOut(): Promise<FormState> {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()

    return { success: true, error: null }
  } catch (error) {
    console.error('Error during sign out:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during sign out';
    return { error: errorMessage, success: false }
  }
}
