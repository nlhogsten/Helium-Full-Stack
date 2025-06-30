'use server';
import { createClient } from '@/utils/supabase/server'

type FormState = {
  error: string;
  success: boolean;
}

export async function signIn(_prevState: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()

  if (!email || !password) {
    return { error: 'Email and password are required', success: false }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message, success: false }
    }

    // On successful login, explicitly return an empty string for error
    return { success: true, error: '' }
  } catch (error) {
    console.error('Sign in error:', error)
    // Ensure the error message is a string
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { error: errorMessage, success: false }
  }
}
