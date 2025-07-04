'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/zustand-stores/profileStore';
import { signOut } from './actions';
import { useRouter } from 'next/navigation';
import { Spinner } from './Spinner';

export function UserProfileDropdown() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signOutState, setSignOutState] = useState<{ success: boolean; error: string | null }>({ 
    success: false, 
    error: null 
  });
  const router = useRouter();

  useEffect(() => {
    if (signOutState.success) {
      clearAuth();
      router.push('/');
    }
  }, [signOutState.success, router, clearAuth]);

  const handleSignOut = async () => {
    setOpen(false); // Close the dropdown when sign out is clicked
    setIsLoading(true);
    try {
      const result = await signOut();
      setSignOutState(result);
    } catch (error) {
      console.error('Sign out failed:', error);
      setSignOutState({ success: false, error: 'Failed to sign out' });
    } finally {
      setIsLoading(false);
    }
  };

  // Close dropdown when clicking outside
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
    <div id="user-dropdown" className="relative inline-block">
      <button
        onClick={() => !isLoading && setOpen((prev) => !prev)}
        className="flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-stone-700 border border-gray-200 dark:border-stone-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-500 dark:focus:ring-blue-300 focus:border-transparent transition-colors duration-200 cursor-pointer"
        disabled={isLoading}
      >
        {isLoading ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <>
            <span>{user?.email}</span>
            <svg
              className="ml-2 h-4 w-4 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-full min-w-[120px] rounded-lg shadow-lg bg-white dark:bg-stone-700 border border-gray-200 dark:border-stone-600">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="flex justify-center w-full px-4 py-2 text-sm text-gray-900 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500 dark:focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-stone-700 cursor-pointer"
              role="menuitem"
            >
              {isLoading ? <Spinner className="h-4 w-4" /> : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
