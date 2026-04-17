import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-outfit)] bg-background">
      <main className="flex flex-col gap-8 items-center text-center max-w-2xl">
        <div className="glass p-12 rounded-[2.5rem] interactive-hover border border-border">
          <h1 className="text-6xl font-extrabold tracking-tighter mb-4 text-primary">
            Skin<span className="text-accent font-bold italic">IQ</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Premium AI-driven destination for holistic health, exclusive wholesale ordering, and uncompromising quality.
          </p>
          
          <div className="flex gap-4 items-center justify-center flex-col sm:flex-row">
            <a
              className="rounded-full transition-all flex items-center justify-center bg-primary text-white gap-2 hover:opacity-90 text-sm sm:text-base h-14 px-10 shadow-xl shadow-primary/20 interactive-hover font-bold"
              href="/en"
            >
              Enter Experience
            </a>
          </div>
        </div>
      </main>
      <footer className="text-xs text-muted-foreground flex gap-6 flex-wrap items-center justify-center absolute bottom-12 uppercase tracking-widest font-bold">
        <p>© 2026 SkinIQ. All rights reserved.</p>
      </footer>
    </div>
  );
}
