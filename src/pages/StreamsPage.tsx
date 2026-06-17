import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { streamsApi } from '@/services/api';
import type { Stream } from '@/types/index';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Radio, Search, Eye } from 'lucide-react';

export default function StreamsPage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      const data = await streamsApi.getAll('live', 0, 50);
      setStreams(data);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = streams.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.game || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider flex items-center gap-2">
              <Radio className="h-6 w-6 text-accent" /> Streams Ao Vivo
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Assista os melhores jogadores em ação</p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar streams ou jogos..." className="pl-9 bg-secondary border-border" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="aspect-video bg-muted" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-border text-muted-foreground">
            <Radio className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhuma stream ao vivo no momento</p>
            <p className="text-sm mt-1">Volte mais tarde!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(s => (
              <Link key={s.id} to={`/streams/${s.id}`}>
                <div className="border border-border bg-card hover:border-accent/50 transition-colors h-full flex flex-col">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {s.thumbnail_url ? (
                      <img src={s.thumbnail_url} alt={s.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Radio className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    {s.status === 'live' && (
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-accent px-2 py-1 text-xs font-bold text-accent-foreground">
                        <span className="live-pulse w-1.5 h-1.5 bg-accent-foreground rounded-full" />
                        AO VIVO
                      </div>
                    )}
                    {s.is_featured && (
                      <Badge className="absolute top-2 right-2 text-xs bg-primary text-primary-foreground">DESTAQUE</Badge>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col gap-1">
                    <p className="text-sm font-semibold line-clamp-1 text-balance">{s.title}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                      <span className="font-mono">{s.game || 'Gaming'}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{s.viewers.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
