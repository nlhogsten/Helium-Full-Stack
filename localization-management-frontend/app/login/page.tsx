'use client';
import { useActionState, useEffect } from 'react';
import { signIn } from './actions';
import { useRouter } from 'next/navigation';
import { SubmitButton } from './components/SubmitButton';

type FormState = {
  error: string;
  success: boolean;
}

const initialState: FormState = {
  error: '',
  success: false
}

export default function LoginPage() {
  const router = useRouter()
  const [state, formAction] = useActionState<FormState, FormData>(
    async (prevState, formData) => {
      return await signIn(prevState, formData)
    },
    initialState
  )

  useEffect(() => {
    if (state.success) {
      router.push('/')
    }
  }, [state.success, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-100 p-4 dark:bg-stone-900">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-stone-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-white">
            Helium Localization Manager
          </h1>
          <p className="mt-2 text-stone-600 dark:text-stone-400">
            See{' '}
            <a 
              href="https://github.com/nlhogsten/Helium-Full-Stack/blob/main/README.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Docs
            </a>{' '}
            for test account credentials
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-stone-700 dark:text-stone-300"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-stone-600 dark:bg-stone-700 dark:text-white sm:text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-stone-700 dark:text-stone-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-stone-600 dark:bg-stone-700 dark:text-white sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {state.error && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/30">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error signing in
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>{state.error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  )
}
