"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, X, ShoppingCart, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Fuse from 'fuse.js';
import { useCartStore } from '@/store/cartStore';
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface Product {
  id: string;
  name: string;
  description: string;
  retail_price: number;
  image_url: string;
  category: string;
  title_en?: string;
  description_en?: string;
}

export default function GlobalSearch() {
  const t = useTranslations('Search');
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  // Keyboard shortcut Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Fetch products on open
  useEffect(() => {
    if (isOpen && products.length === 0) {
      loadProducts();
    }
  }, [isOpen]);

  async function loadProducts() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('products')
      .select('id, name, description, retail_price, image_url, category, title_en, description_en')
      .eq('is_active', true);
    
    if (data) setProducts(data);
    setLoading(false);
  }

  // Fuzzy Search Logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fuse = new Fuse(products, {
      keys: ['name', 'description', 'category', 'title_en', 'description_en'],
      threshold: 0.3,
      distance: 100,
    });

    const searchResults = fuse.search(query).map(r => r.item);
    setResults(searchResults.slice(0, 8)); // Top 8 suggestions
  }, [query, products]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.retail_price,
      image_url: product.image_url,
      quantity: 1
    });
    setIsOpen(false);
  };

  return (
    <>
      {/* Search Trigger */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center sm:justify-start gap-3 p-2 sm:px-4 sm:py-2 bg-muted/50 rounded-full border border-border hover:border-primary/30 transition-all text-muted-foreground group w-10 h-10 sm:w-auto sm:h-auto sm:min-w-[200px]"
      >
        <Search className="w-5 h-5 sm:w-4 sm:h-4 group-hover:text-primary transition-colors" />
        <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest flex-1 text-left">
          {t?.('placeholder') || 'Search products...'}
        </span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[8px] font-black uppercase opacity-100">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>

      {/* Search Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl transition-all animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-border shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-in zoom-in-95 slide-in-from-top-4 duration-300">
            
            {/* Input Header */}
            <div className="p-6 border-b border-border flex items-center gap-4 bg-slate-50/50 dark:bg-white/5">
              <Search className="w-6 h-6 text-primary" />
              <input 
                ref={inputRef}
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t?.('placeholder') || 'Type to discover products...'}
                className="flex-1 bg-transparent border-none text-lg font-medium focus:outline-none placeholder:text-muted-foreground text-foreground"
              />
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              ) : query && (
                <button onClick={() => setQuery('')} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Results Section */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {!query && !loading && (
                <div className="py-20 text-center space-y-4 opacity-40">
                  <Search className="w-12 h-12 mx-auto text-primary" />
                  <p className="text-sm font-black uppercase tracking-[0.3em]">Start typing to explore</p>
                </div>
              )}

              {query && results.length === 0 && !loading && (
                <div className="py-20 text-center space-y-4">
                  <p className="text-muted-foreground italic">No products found matching "{query}"</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                {results.map((product) => (
                  <Link 
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-border transition-all"
                  >
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted border border-border flex-shrink-0">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1">
                        {product.category}
                      </p>
                      <p className="text-xs font-bold text-accent mt-1">
                        {product.retail_price.toLocaleString()} IQD
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={(e) => handleAddToCart(e, product)}
                        className="p-3 rounded-xl bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all shadow-lg shadow-primary/20"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                      <div className="p-3 rounded-xl border border-border group-hover:border-primary group-hover:text-primary transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-slate-50/50 dark:bg-white/5 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground">
              <div className="flex gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 border rounded bg-background">↑↓</kbd> to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 border rounded bg-background">↵</kbd> to select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 border rounded bg-background">esc</kbd> to close
              </span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
