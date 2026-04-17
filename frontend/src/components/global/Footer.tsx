import { Link } from '@/i18n/routing';

export default function Footer() {
  return (
    <footer className="w-full bg-muted border-t border-border transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Brand & Copyright */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
          <Link href="/" className="font-bold text-xl tracking-widest text-primary uppercase">
            Skin<span className="text-accent font-light italic">IQ</span>
          </Link>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SkinIQ. All rights reserved.
          </p>
        </div>

        {/* System Links for Partners / Admins */}
        <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <Link href="/wholesale" className="hover:text-primary transition-colors">
            Partner Registration
          </Link>
          <Link href="/admin-login" className="hover:text-primary transition-colors">
            Admin Dashboard
          </Link>
        </div>

      </div>
    </footer>
  );
}
