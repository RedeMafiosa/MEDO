import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { streamsApi } from '@/services/api';
import type { Stream } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Radio, CheckCircle, XCircle, Star, Eye, Trash2 } from 'lucide-react';

const statusColor: Record<string, string> = {
  pending: 'bg-chart-5/20 text-chart-5 border border-chart-5/30',
  live: 'bg-accent/20 text-accent border border-accent/30',
  offline: 'bg-muted text-muted-foreground',
  rejected: 'bg-destructive/20 text-destructive border border-destructive/30',
};
const statusLabel: Record<string, string> = {
  pending: 'Pendente', live: 'Ao Vivo', offline: 'Offline', rejected: 'Rejeitada',
};

export default function AdminStreams() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setStreams(await streamsApi.getAll('all', 0, 100));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    await streamsApi.update(id, { status: 'live' });
    toast.success('Stream aprovada');
    await load();
  };
  const reject = async (id: string) => {
    await streamsApi.update(id, { status: 'rejected' });
    toast.success('Stream rejeitada');
    await load();
  };
  const toggleFeatured = async (s: Stream) => {
    await streamsApi.update(s.id, { is_featured: !s.is_featured });
    toast.success(s.is_featured ? 'Destaque removido' : 'Stream destacada');
    await load();
  };
  const handleDelete = async (id: string) => {
    await streamsApi.delete(id);
    toast.success('Stream removida');
    await load();
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" /> Streams
        </h1>
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-border bg-secondary">
              {['Título', 'Streamer', 'Jogo', 'Status', 'Espectadores', 'Destaque', 'Ações'].map(h => (
                <th key={h} className="text-left text-xs text-muted-foreground font-medium py-3 px-4 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array(4).fill(0).map((_, i) => (
              <tr key={i}><td colSpan={7} className="px-4 py-2"><Skeleton className="h-8 bg-muted" /></td></tr>
            )) : streams.map(s => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="py-3 px-4 whitespace-nowrap text-sm font-medium max-w-[160px] truncate">{s.title}</td>
                <td className="py-3 px-4 whitespace-nowrap text-sm text-muted-foreground">
                  {(s as unknown as { streamer: { username: string } }).streamer?.username || '—'}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-sm font-mono text-muted-foreground">{s.game || '—'}</td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <Badge className={`text-xs ${statusColor[s.status]}`}>{statusLabel[s.status]}</Badge>
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-sm stat-mono flex items-center gap-1">
                  <Eye className="h-3 w-3 text-muted-foreground" />{s.viewers}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <button onClick={() => toggleFeatured(s)} className={`p-1 ${s.is_featured ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                    <Star className={`h-4 w-4 ${s.is_featured ? 'fill-current' : ''}`} />
                  </button>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {s.status === 'pending' && (
                      <>
                        <Button size="sm" variant="ghost" className="h-7 gap-1 border border-border hover:border-primary hover:text-primary text-xs" onClick={() => approve(s.id)}>
                          <CheckCircle className="h-3.5 w-3.5" /> Aprovar
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 gap-1 border border-border hover:border-destructive hover:text-destructive text-xs" onClick={() => reject(s.id)}>
                          <XCircle className="h-3.5 w-3.5" /> Rejeitar
                        </Button>
                      </>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 border border-border hover:border-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card border-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover Stream?</AlertDialogTitle>
                          <AlertDialogDescription>"{s.title}" será removida permanentemente.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(s.id)} className="bg-destructive text-destructive-foreground">Remover</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && streams.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhuma stream encontrada</div>
        )}
      </div>
    </AdminLayout>
  );
}
