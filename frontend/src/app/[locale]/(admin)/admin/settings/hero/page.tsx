"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { updateHeroConfig, uploadHeroImage } from './actions';
import { Save, Image as ImageIcon, Layout, Type, Link as LinkIcon, Sparkles, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export default function HeroSettingsPage() {
  const [config, setConfig] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    bg_image_url: '',
    button_text: '',
    button_link: '',
    badge_text: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      const supabase = createClient();
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'hero_config')
        .single();
      
      if (data?.value) {
        setConfig(data.value);
      }
      setLoading(false);
    }
    loadConfig();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image_url' | 'bg_image_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadHeroImage(formData);
      if (res.success && res.url) {
        setConfig(prev => ({ ...prev, [field]: res.url }));
        toast.success(`${field === 'image_url' ? 'Hero' : 'Background'} image uploaded!`);
      } else {
        toast.error("Upload failed: " + res.error);
      }
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateHeroConfig(config);
      if (res.success) {
        toast.success("Hero section updated successfully!");
      } else {
        toast.error("Failed to update hero section: " + res.error);
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-border shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary">
            <Layout className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Site Architecture</span>
          </div>
          <h1 className="text-4xl font-light tracking-tighter text-foreground uppercase">
            Hero <span className="italic font-serif">Manager</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Customize the first impression your customers see on the storefront.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
        >
          {saving ? <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-border shadow-sm space-y-8">
            
            {/* Badge Text */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <Sparkles className="w-3 h-3 text-primary" />
                Badge Text
              </label>
              <input
                type="text"
                value={config.badge_text}
                onChange={(e) => setConfig({ ...config, badge_text: e.target.value })}
                placeholder="e.g. SkinIQ Boutique"
                className="w-full px-6 py-4 rounded-2xl bg-muted/50 border border-border focus:border-primary transition-all text-sm font-bold"
              />
            </div>

            {/* Title */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <Type className="w-3 h-3 text-primary" />
                Main Title
              </label>
              <textarea
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="Supports HTML like <br /> and <span>"
                rows={3}
                className="w-full px-6 py-4 rounded-2xl bg-muted/50 border border-border focus:border-primary transition-all text-sm font-bold"
              />
              <p className="text-[10px] text-muted-foreground italic">Tip: Use \n for new lines or HTML tags for styling.</p>
            </div>

            {/* Subtitle */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <Type className="w-3 h-3 text-primary" />
                Subtitle
              </label>
              <textarea
                value={config.subtitle}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                placeholder="A brief description of the boutique..."
                rows={3}
                className="w-full px-6 py-4 rounded-2xl bg-muted/50 border border-border focus:border-primary transition-all text-sm font-bold"
              />
            </div>

            {/* Background Texture/Image */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <Sparkles className="w-3 h-3 text-primary" />
                Text Background Overlay (Dynamic)
              </label>
              <div className="relative group">
                {config.bg_image_url ? (
                  <div className="relative w-full h-32 rounded-3xl overflow-hidden border border-border group-hover:border-primary/50 transition-all bg-muted">
                    <img src={config.bg_image_url} alt="BG Texture" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                      <label className="p-3 bg-white text-slate-900 rounded-full cursor-pointer hover:scale-110 transition-all">
                        <Upload className="w-4 h-4" />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'bg_image_url')} />
                      </label>
                      <button 
                        type="button"
                        onClick={() => setConfig({ ...config, bg_image_url: '' })}
                        className="p-3 bg-white text-red-500 rounded-full hover:scale-110 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 rounded-3xl border-2 border-dashed border-border bg-muted/20 hover:bg-muted/30 hover:border-primary/50 transition-all cursor-pointer group">
                    <Upload className="w-6 h-6 text-primary mb-2 opacity-40 group-hover:opacity-100 transition-all" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Upload Text Background Photo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'bg_image_url')} />
                  </label>
                )}
              </div>
              <p className="text-[9px] text-muted-foreground italic leading-tight">This photo will appear subtly behind the hero text with a parallax flow effect.</p>
            </div>

            {/* Hero Image Upload */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <ImageIcon className="w-3 h-3 text-primary" />
                Hero Image (Right Side)
              </label>
              
              <div className="relative group">
                {config.image_url ? (
                  <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-border group-hover:border-primary/50 transition-all">
                    <img src={config.image_url} alt="Hero" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                      <label className="p-4 bg-white text-slate-900 rounded-full cursor-pointer hover:scale-110 transition-all">
                        <Upload className="w-6 h-6" />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'image_url')} />
                      </label>
                      <button 
                        type="button"
                        onClick={() => setConfig({ ...config, image_url: '' })}
                        className="p-4 bg-white text-red-500 rounded-full hover:scale-110 transition-all"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-video rounded-3xl border-2 border-dashed border-border bg-muted/20 hover:bg-muted/30 hover:border-primary/50 transition-all cursor-pointer group">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl group-hover:scale-110 transition-all mb-4">
                      {uploading ? (
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent animate-spin rounded-full" />
                      ) : (
                        <Upload className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    <span className="text-sm font-bold text-foreground">Click to upload hero photo</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-black">PNG, JPG or WEBP (Max 5MB)</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'image_url')} />
                  </label>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  <Type className="w-3 h-3 text-primary" />
                  Button Text
                </label>
                <input
                  type="text"
                  value={config.button_text}
                  onChange={(e) => setConfig({ ...config, button_text: e.target.value })}
                  placeholder="Shop Now"
                  className="w-full px-6 py-4 rounded-2xl bg-muted/50 border border-border focus:border-primary transition-all text-sm font-bold"
                />
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  <LinkIcon className="w-3 h-3 text-primary" />
                  Button Link
                </label>
                <input
                  type="text"
                  value={config.button_link}
                  onChange={(e) => setConfig({ ...config, button_link: e.target.value })}
                  placeholder="/#store"
                  className="w-full px-6 py-4 rounded-2xl bg-muted/50 border border-border focus:border-primary transition-all text-sm font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground px-4">
            Live Preview (Rough Draft)
          </div>
          <div className="relative aspect-[4/5] lg:aspect-auto lg:h-[600px] w-full bg-white dark:bg-slate-900 rounded-[3rem] border border-border shadow-2xl overflow-hidden flex flex-col">
            {/* Header Mockup */}
            <div className="h-16 border-b border-border flex items-center px-8 justify-between opacity-40">
              <div className="font-black text-xs">SKINIQ</div>
              <div className="flex gap-4">
                <div className="w-8 h-1 bg-slate-200 rounded" />
                <div className="w-8 h-1 bg-slate-200 rounded" />
              </div>
            </div>

            {/* Hero Mockup Content */}
            <div className="flex-1 flex flex-col p-10 space-y-6 justify-center relative overflow-hidden">
               {/* Background Texture Preview */}
               {config.bg_image_url && (
                 <img 
                   src={config.bg_image_url} 
                   className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" 
                   alt="BG Preview" 
                 />
               )}

               <span className="relative z-10 inline-block px-3 py-1 rounded-full bg-secondary/50 text-primary text-[8px] font-black tracking-widest uppercase self-start">
                {config.badge_text || 'Badge Text'}
              </span>
              <h2 
                className="relative z-10 text-3xl font-light tracking-tighter leading-none"
                dangerouslySetInnerHTML={{ __html: config.title.replace(/\n/g, '<br/>') || 'Your Title Here' }}
              />
              <p className="relative z-10 text-xs text-muted-foreground leading-relaxed max-w-[200px]">
                {config.subtitle || 'Your subtitle description will appear here...'}
              </p>
              <div className="relative z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-3 text-[8px] font-black tracking-widest uppercase self-start">
                {config.button_text || 'Button'}
              </div>
            </div>

            {/* Image Preview Overlay */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-muted border-l border-border overflow-hidden">
              {config.image_url ? (
                <img src={config.image_url} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground opacity-20">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-slate-900 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
