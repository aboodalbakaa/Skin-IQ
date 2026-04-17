'use client';

import { useState } from 'react';
import { User, Search, Shield, MoreHorizontal, CheckCircle } from 'lucide-react';
import { updateUserRole } from './actions';

interface AppUser {
  id: string;
  email: string | null;
  full_name: string | null;
  business_name: string | null;
  role: string;
  created_at: string;
}

export default function UserManagementTable({ initialUsers }: { initialUsers: AppUser[] }) {
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredUsers = initialUsers.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.business_name?.toLowerCase().includes(search.toLowerCase())
  );

  const roles = ['CUSTOMER', 'WHOLESALE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'];

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoadingId(userId);
    try {
      await updateUserRole(userId, newRole);
    } catch (err) {
      alert('Failed to update role. Ensure you have Super Admin permissions for this action.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search partners by name, email or business..." 
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#0D1518] border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-slate-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Modern User Table */}
      <div className="bg-white dark:bg-[#0D1518] rounded-[24px] shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-border">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Partner Info</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Current Role</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Assign New Role</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary shadow-sm border border-white">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{user.full_name}</div>
                        <div className="text-xs text-slate-400 font-medium">{user.email}</div>
                        {user.business_name && (
                          <div className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full inline-block mt-1 font-bold">
                            {user.business_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                      user.role === 'SUPER_ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      user.role === 'ADMIN' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      user.role === 'MANAGER' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      user.role === 'WHOLESALE' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <select 
                        disabled={loadingId === user.id}
                        className="bg-white dark:bg-[#0D1518] border border-border text-foreground text-xs font-bold px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 cursor-pointer"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        {roles.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      {loadingId === user.id && (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="py-20 text-center">
              <Shield className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <div className="text-slate-400 font-medium">No partners matching your search.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
