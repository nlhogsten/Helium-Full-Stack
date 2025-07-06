'use client';
import { useFormStatus } from 'react-dom';
import { Spinner } from '@/app/components/Spinner';

export function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative flex w-full justify-center items-center rounded-md bg-blue-400 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 min-h-[38px]"
    >
      {pending ? <Spinner className="h-5 w-5" /> : 'Sign in'}
    </button>
  )
}
