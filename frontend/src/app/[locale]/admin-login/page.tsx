"use client";

import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AdminLogin() {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return createClient();
  }, []);

  useEffect(() => {
    setMounted(true);
    
    async function checkAuth() {
      if (supabase) {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          router.push('/admin');
          router.refresh();
        }
      }
    }

    checkAuth();
  }, [supabase, router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!supabase) return;
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Verify admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from('app_users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userData && (userData.role === 'ADMIN' || userData.role === 'SUPER_ADMIN')) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(tCommon('error'));
        await supabase.auth.signOut();
      }
    }
    setLoading(false);
  };

  if (!mounted) return <div className="min-h-screen bg-muted" />;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted">
      <div className="w-full max-w-sm">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-bold text-2xl tracking-widest text-primary uppercase">
            Skin<span className="text-accent font-light italic">IQ</span>
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mt-1">Administration</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-[#0D1518] p-8 rounded-2xl shadow-lg border border-border transition-colors">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
            <div className="p-2.5 bg-primary rounded-xl">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('login_title')}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('login_subtitle')}</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-email" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {tCommon('email') || 'Email'}
              </label>
              <input 
                id="admin-email"
                required 
                name="email" 
                type="email" 
                autoComplete="email"
                placeholder="admin@skiniq.com"
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-password" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {tCommon('password') || 'Password'}
              </label>
              <input 
                id="admin-password"
                required 
                name="password" 
                type="password" 
                autoComplete="current-password"
                placeholder="••••••••"
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400" 
              />
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="mt-2 flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-white rounded-xl text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {tCommon('loading')}</>
              ) : (
                <><Lock className="w-4 h-4" /> {t('submit_login') || t('login_title')}</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Protected by Supabase Auth & RLS
        </p>
      </div>
    </div>
  );
}
