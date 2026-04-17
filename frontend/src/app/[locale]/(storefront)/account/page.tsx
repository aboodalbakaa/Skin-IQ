"use client";

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Lock, UserPlus, LogOut, Package, User } from 'lucide-react';
import OrderHistory from '@/components/account/OrderHistory';

export default function AccountPage() {
  const [session, setSession] = useState<any>(null);
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
    if (supabase) {
      supabase.auth.getSession().then((res: any) => {
        setSession(res.data.session);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    }
  }, [supabase]);

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
        router.refresh();
      }
    } else {
      const fullName = formData.get('full_name') as string;
      const phone = formData.get('phone_number') as string;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phone,
            role: 'CUSTOMER'
          }
        }
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data?.session) {
        // If confirmation is OFF, we get a session immediately
        router.refresh();
      } else {
        setSuccessMsg("Registration successful! You can now sign in.");
      }
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.refresh();
  };

  if (!mounted) return <div className="min-h-screen bg-background" />;

  if (session) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 bg-background">
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* Dashboard Header */}
          <div className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-black/5 flex flex-col md:flex-row justify-between items-center gap-8 group">
            <div className="text-center md:text-left">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#9A8C73]/10 text-[#9A8C73] text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                  <User aria-hidden="true" className="w-3 h-3" />
                  Premium Member
               </div>
              <h1 className="text-4xl md:text-5xl font-light text-foreground uppercase tracking-tight leading-none">
                Skin<span className="italic font-serif">IQ</span> Dashboard
              </h1>
              <p className="text-slate-900 dark:text-slate-100 mt-4 font-bold text-lg opacity-80">
                Welcome back, {session.user.email}
              </p>
            </div>
            
            <button 
              onClick={handleSignOut}
              className="group/logout flex items-center gap-3 px-8 py-4 bg-white/50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-lg active:scale-95"
            >
              Sign Out
              <LogOut className="w-4 h-4 group-hover/logout:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Main sections */}
          <div className="grid grid-cols-1 gap-16">
            <section className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-3xl bg-[#9A8C73] flex items-center justify-center text-white shadow-xl shadow-[#9A8C73]/20 rotate-3 group-hover:rotate-0 transition-transform">
                  <Package className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Order Sanctuary</h2>
                  <p className="text-slate-500 text-sm font-medium">Tracking your premium selections and delivery progress.</p>
                </div>
              </div>
              
              <div className="bg-white/30 dark:bg-transparent rounded-[2.5rem] border border-border overflow-hidden">
                 <OrderHistory userId={session.user.id} />
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md bg-white dark:bg-[#0D1518] p-8 rounded-3xl shadow-xl border border-border transition-colors">
        
        <div className="flex w-full bg-muted rounded-xl overflow-hidden mb-8 p-1">
          <button 
            type="button"
            onClick={() => { setIsLogin(true); setErrorMsg(""); setSuccessMsg(""); }}
            className={`flex-1 py-2.5 text-sm font-bold tracking-wide rounded-lg transition-all ${isLogin ? 'bg-white dark:bg-[#0D1518] text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => { setIsLogin(false); setErrorMsg(""); setSuccessMsg(""); }}
            className={`flex-1 py-2.5 text-sm font-bold tracking-wide rounded-lg transition-all ${!isLogin ? 'bg-white dark:bg-[#0D1518] text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Register
          </button>
        </div>

        <div className="text-center mb-6">
          <p className="text-muted-foreground text-sm">
            {isLogin ? 'Welcome back to SkinIQ' : 'Join our community for faster checkout'}
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
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                <input required name="full_name" type="text" className="px-4 py-3 rounded-xl border border-border bg-muted text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                <input required name="phone_number" type="tel" className="px-4 py-3 rounded-xl border border-border bg-muted text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
            <input required name="email" type="email" className="px-4 py-3 rounded-xl border border-border bg-muted text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
            <input required name="password" type="password" className="px-4 py-3 rounded-xl border border-border bg-muted text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-primary text-white rounded-xl font-medium transition-opacity hover:opacity-90 disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {loading ? '...' : (isLogin ? <><Lock className="w-4 h-4" /> Secure Login</> : <><UserPlus className="w-4 h-4" /> Create Account</>)}
          </button>
        </form>



      </div>
    </div>
  );
}
