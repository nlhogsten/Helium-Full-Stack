'use server'
import { createClient } from '@/utils/supabase/server'

export type FormState = {
  error: string | null
  success: boolean
}

export async function signIn(prevState: FormState, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message, success: false }
  }

  return { error: null, success: true }
}
