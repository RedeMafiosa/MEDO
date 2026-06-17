import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { clansApi } from '@/services/api';
import type { Clan } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Shield, Search, Trash2, Users, Zap } from 'lucide-react';

export default function AdminClans() {
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    setClans(await clansApi.getAll(0, 200));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = clans.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.tag.toLowerCase().includes(search.toLowerCase())
  );

  const handleDissolve = async (id: string) => {
    await clansApi.delete(id);
    toast.success('Clan dissolvido');
    await load();
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" /> Clans
        </h1>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar clan..." className="pl-9 bg-secondary border-border" />
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-border bg-secondary">
              {['Nome', 'Tag', 'Líder', 'Membros', 'XP Total', 'Ações'].map(h => (
                <th key={h} className="text-left text-xs text-muted-foreground font-medium py-3 px-4 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array(4).fill(0).map((_, i) => (
              <tr key={i}><td colSpan={6} className="px-4 py-2"><Skeleton className="h-8 bg-muted" /></td></tr>
            )) : filtered.map(c => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="py-3 px-4 whitespace-nowrap font-semibold text-sm">{c.name}</td>
                <td className="py-3 px-4 whitespace-nowrap text-sm font-mono text-primary bg-primary/5">[{c.tag}]</td>
                <td className="py-3 px-4 whitespace-nowrap text-sm text-muted-foreground">
                  {(c as unknown as { leader: { username: string } }).leader?.username || '—'}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-sm stat-mono flex items-center gap-1">
                  <Users className="h-3 w-3 text-muted-foreground" />{c.member_count}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-sm stat-mono text-primary">
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{c.total_xp.toLocaleString()}</span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-7 gap-1.5 border border-border hover:border-destructive hover:text-destructive text-xs">
                        <Trash2 className="h-3.5 w-3.5" /> Dissolver
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Dissolver Clan?</AlertDialogTitle>
                        <AlertDialogDescription>O clan "{c.name}" será dissolvido. Todos os membros serão removidos.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDissolve(c.id)} className="bg-destructive text-destructive-foreground">Dissolver</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhum clan encontrado</div>
        )}
      </div>
    </AdminLayout>
  );
}
