import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { settingsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Settings, Palette, Type, Globe, Save, Loader2, RefreshCw } from 'lucide-react';

interface ThemeValues {
  primary_color: string;
  accent_color: string;
  bg_color: string;
  site_name: string;
  site_description: string;
  logo_url: string;
}

const DEFAULTS: ThemeValues = {
  primary_color: '#CCFF00',
  accent_color: '#FF2A2A',
  bg_color: '#0A0A0C',
  site_name: 'GamingHub',
  site_description: 'Compete. Connect. Conquer.',
  logo_url: '',
};

function hexToHSL(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyTheme(values: ThemeValues) {
  const root = document.documentElement;
  if (values.primary_color) {
    const hsl = hexToHSL(values.primary_color);
    root.style.setProperty('--primary', hsl);
    root.style.setProperty('--ring', hsl);
    root.style.setProperty('--sidebar-primary', hsl);
    root.style.setProperty('--sidebar-ring', hsl);
    root.style.setProperty('--chart-1', hsl);
  }
  if (values.accent_color) {
    const hsl = hexToHSL(values.accent_color);
    root.style.setProperty('--accent', hsl);
    root.style.setProperty('--chart-2', hsl);
  }
  if (values.bg_color) {
    const hsl = hexToHSL(values.bg_color);
    root.style.setProperty('--background', hsl);
  }
}

export default function AdminSettings() {
  const [values, setValues] = useState<ThemeValues>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const settings = await settingsApi.getAll();
      setValues({
        primary_color: settings['primary_color'] || DEFAULTS.primary_color,
        accent_color: settings['accent_color'] || DEFAULTS.accent_color,
        bg_color: settings['bg_color'] || DEFAULTS.bg_color,
        site_name: settings['site_name'] || DEFAULTS.site_name,
        site_description: settings['site_description'] || DEFAULTS.site_description,
        logo_url: settings['logo_url'] || DEFAULTS.logo_url,
      });
      setLoading(false);
    };
    load();
  }, []);

  // Live preview
  useEffect(() => {
    if (!loading) applyTheme(values);
  }, [values, loading]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.setMany({
        primary_color: values.primary_color,
        accent_color: values.accent_color,
        bg_color: values.bg_color,
        site_name: values.site_name,
        site_description: values.site_description,
        logo_url: values.logo_url,
      });
      toast.success('Configurações salvas com sucesso!');
    } catch { toast.error('Erro ao salvar configurações'); }
    setSaving(false);
  };

  const handleReset = () => {
    setValues(DEFAULTS);
    toast.success('Configurações redefinidas');
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex flex-col gap-4 max-w-2xl">
        {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-14 bg-muted" />)}
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" /> Configurações do Site
        </h1>
      </div>

      <div className="max-w-2xl flex flex-col gap-6">
        {/* Theme Colors */}
        <div className="border border-border bg-card p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" /> Cores do Tema
          </h2>
          <p className="text-xs text-muted-foreground mb-4">As alterações são aplicadas em tempo real como prévia.</p>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Cor Primária (neon)', key: 'primary_color' as keyof ThemeValues, desc: 'Botões, destaques, XP' },
              { label: 'Cor de Destaque (accent)', key: 'accent_color' as keyof ThemeValues, desc: 'LIVE, alertas, ações secundárias' },
              { label: 'Cor de Fundo', key: 'bg_color' as keyof ThemeValues, desc: 'Fundo principal da página' },
            ].map(({ label, key, desc }) => (
              <div key={key} className="flex items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={values[key] as string}
                      onChange={e => setValues(p => ({ ...p, [key]: e.target.value }))}
                      className="h-10 w-10 border border-border bg-secondary cursor-pointer p-0.5"
                    />
                    <Input
                      value={values[key] as string}
                      onChange={e => setValues(p => ({ ...p, [key]: e.target.value }))}
                      className="w-28 bg-secondary border-border font-mono text-sm"
                      maxLength={7}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Site Info */}
        <div className="border border-border bg-card p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> Informações do Site
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">Nome do Site</Label>
              <Input value={values.site_name} onChange={e => setValues(p => ({ ...p, site_name: e.target.value }))} placeholder="GamingHub" className="bg-secondary border-border" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">Descrição / Slogan</Label>
              <Input value={values.site_description} onChange={e => setValues(p => ({ ...p, site_description: e.target.value }))} placeholder="Compete. Connect. Conquer." className="bg-secondary border-border" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">URL do Logo</Label>
              <Input value={values.logo_url} onChange={e => setValues(p => ({ ...p, logo_url: e.target.value }))} placeholder="https://..." className="bg-secondary border-border" />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="border border-border bg-card p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <Type className="h-4 w-4 text-primary" /> Prévia do Tema
          </h2>
          <div className="border border-border p-4 flex flex-col gap-3" style={{ background: values.bg_color }}>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 flex items-center justify-center" style={{ borderColor: values.primary_color, border: `1px solid ${values.primary_color}` }}>
                <span style={{ color: values.primary_color }}>⚔</span>
              </div>
              <span className="font-black tracking-widest text-sm" style={{ color: values.primary_color }}>{values.site_name}</span>
            </div>
            <p className="text-xs" style={{ color: '#888' }}>{values.site_description}</p>
            <div className="flex gap-2">
              <div className="px-3 py-1.5 text-xs font-bold" style={{ background: values.primary_color, color: values.bg_color }}>ENTRAR</div>
              <div className="px-3 py-1.5 text-xs font-bold flex items-center gap-1" style={{ background: values.accent_color, color: '#fff' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-white" />AO VIVO
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="flex-1 font-bold">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" />SALVAR CONFIGURAÇÕES</>}
          </Button>
          <Button variant="ghost" onClick={handleReset} className="border border-border gap-2 text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-4 w-4" /> Redefinir
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
