'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/zustand-stores/profileStore';
import { useSignOut } from '@/lib/react-query/profileHooks';

export function UserProfileDropdown() {
  // Read user directly from Zustand
  const user = useAuthStore((state) => state.user);
  const signOut = useSignOut();
  const [open, setOpen] = useState(false);

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

  // Loading state: show loader while Zustand user is undefined
  if (user === undefined) {
    return <div className="p-2">Loading…</div>;
  }

  // Not signed in
  if (!user) {
    return (
      <a href="/login" className="p-2 text-sm hover:underline">
        Sign In
      </a>
    );
  }

  return (
    <div id="user-dropdown" className="relative inline-block text-left">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center px-3 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
      >
        <span className="text-sm">{user.email}</span>
        {/* Simple down-arrow icon */}
        <svg
          className="ml-1 h-4 w-4"
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
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border rounded-md shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => signOut.mutate()}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
