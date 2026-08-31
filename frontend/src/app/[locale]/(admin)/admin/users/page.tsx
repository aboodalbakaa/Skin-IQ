'use client';

import { useCallback, useEffect, useState } from 'react';
import UserManagementTable, { type AppUser } from './UserManagementTable';
import { postAdminJson } from '@/utils/admin-api';

export const dynamic = 'force-dynamic';

export default function UserManagementPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [filter, setFilter] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedUsers = await postAdminJson<AppUser[]>('getAllUsers');
      setFilter(new URLSearchParams(window.location.search).get('filter') || undefined);
      setUsers(loadedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <div className="max-w-7xl mx-auto w-full space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-foreground">User & Role <span className="italic">Management</span></h1>
          <p className="text-muted-foreground mt-2 font-medium tracking-wide">Assign permissions, approve partners, and manage business roles.</p>
        </div>
      </div>

      {loading && (
        <div className="grid gap-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="p-6 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-500/20">
          <p className="font-medium">Error loading users</p>
          <p className="text-sm mt-1 opacity-75">{error}</p>
          <button
            onClick={loadUsers}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <UserManagementTable initialUsers={users} filter={filter} />
      )}
    </div>
  );
}
