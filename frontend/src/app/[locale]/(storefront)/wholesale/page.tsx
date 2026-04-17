"use client";

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Lock, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function WholesalePortal() {
  const t = useTranslations('Wholesale');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return createClient();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!supabase) return;
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push('/admin'); // Re-evaluate their role inside /admin layout
        router.refresh();
      }
    } else {
      const fullName = formData.get('full_name') as string;
      const phone = formData.get('phone_number') as string;
      const business = formData.get('business_name') as string;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phone,
            business_name: business,
            role: 'CUSTOMER' // Defaults to restricted until Admin approves
          }
        }
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        // If confirmation is OFF, we get a session immediately
        router.push('/admin');
        router.refresh();
      } else {
        setSuccessMsg(t('registration_complete') || "Account created successfully. You can now log in.");
      }
    }
    setLoading(false);
  };

  if (!mounted) return <div className="min-h-screen" />;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md bg-white dark:bg-[#0D1518] p-8 rounded-3xl shadow-xl border border-border transition-colors">
        
        <div className="flex w-full bg-muted rounded-xl overflow-hidden mb-8 p-1">
          <button 
            type="button"
            onClick={() => { setIsLogin(true); setErrorMsg(""); setSuccessMsg(""); }}
            className={`flex-1 py-2.5 text-sm font-bold tracking-wide rounded-lg transition-all ${isLogin ? 'bg-white dark:bg-[#0D1518] text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t('submit_login')}
          </button>
          <button 
            type="button"
            onClick={() => { setIsLogin(false); setErrorMsg(""); setSuccessMsg(""); }}
            className={`flex-1 py-2.5 text-sm font-bold tracking-wide rounded-lg transition-all ${!isLogin ? 'bg-white dark:bg-[#0D1518] text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t('submit_register')}
          </button>
        </div>

        <div className="text-center mb-6">
          <p className="text-muted-foreground text-sm">
            {isLogin ? t('login_subtitle') : t('register_subtitle')}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {!isLogin && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('full_name')}</label>
                <input required name="full_name" type="text" className="px-4 py-3 rounded-xl border border-border bg-muted text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('business_name')}</label>
                <input required name="business_name" type="text" className="px-4 py-3 rounded-xl border border-border bg-muted text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('phone_number')}</label>
                <input required name="phone_number" type="tel" className="px-4 py-3 rounded-xl border border-border bg-muted text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('email')}</label>
            <input required name="email" type="email" className="px-4 py-3 rounded-xl border border-border bg-muted text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('password')}</label>
            <input required name="password" type="password" className="px-4 py-3 rounded-xl border border-border bg-muted text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-primary text-white rounded-xl font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? '...' : (isLogin ? <><Lock className="w-4 h-4" /> {t('submit_login')}</> : <><UserPlus className="w-4 h-4" /> {t('submit_register')}</>)}
          </button>
        </form>



      </div>
    </div>
  );
}
