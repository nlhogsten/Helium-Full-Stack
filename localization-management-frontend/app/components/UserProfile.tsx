'use client';
import { useState, useEffect, useTransition } from 'react';
import { useAuthStore } from '@/lib/zustand-stores/profileStore';
import { signOut, FormState } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';

const initialState: FormState = {
  error: null,
  success: false
};

export function UserProfileDropdown() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);

  // Initialize useTransition
  const [isPendingTransition, startTransition] = useTransition();

  const [state, formAction, isPendingAction] = useActionState<FormState, void>(
    async (prevState) => {
      const result = await signOut();
      return result;
    },
    initialState
  );

  const isCurrentlySigningOut = isPendingAction;


  useEffect(() => {
    if (state.success) {
      useAuthStore.getState().setUser(null);
      useAuthStore.getState().setSession(null);
      router.push('/login');
    }
  }, [state.success, router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const dropdown = document.getElementById('user-dropdown');
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      {state.error && (
        <div className="mb-2 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </div>
      )}

      {user === undefined && (
        <div className="px-3 py-2 text-sm text-stone-500 dark:text-stone-400">
          Loading…
        </div>
      )}

      {user && (
        <div id="user-dropdown" className="relative inline-block text-left">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex items-center px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:focus:ring-stone-400 transition-colors duration-200"
          >
            <span className="text-sm font-medium">{user.email}</span>
            <svg
              className={`ml-2 h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="border-t border-stone-200 dark:border-stone-700"></div>
              <button
                onClick={() => {
                  startTransition(() => {
                    formAction();
                  });
                }}
                disabled={isCurrentlySigningOut}
                className="flex items-center justify-center w-full text-left px-4 py-3 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCurrentlySigningOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
