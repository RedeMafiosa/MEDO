import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { streamsApi } from '@/services/api';
import type { Stream, StreamMessage } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Radio, ArrowLeft, Eye, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/db/supabase';

export default function StreamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stream, setStream] = useState<Stream | null>(null);
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const [s, msgs] = await Promise.all([streamsApi.getById(id), streamsApi.getMessages(id, 50)]);
      setStream(s);
      setMessages(msgs);
      setLoading(false);
    };
    load();

    const channel = streamsApi.subscribeToMessages(id, (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !newMsg.trim()) return;
    setSending(true);
    try {
      await streamsApi.sendMessage(id, user.id, newMsg.trim());
      setNewMsg('');
    } catch {
      toast.error('Erro ao enviar mensagem');
    }
    setSending(false);
  };

  if (loading) return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-4">
        <Skeleton className="aspect-video bg-muted" />
      </div>
    </AppLayout>
  );
  if (!stream) return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-muted-foreground">Stream não encontrada</div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <Button variant="ghost" size="sm" className="mb-4 gap-2 text-muted-foreground hover:text-foreground" onClick={() => navigate('/streams')}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Video + info */}
          <div className="flex-1 min-w-0">
            <div className="aspect-video bg-secondary border border-border relative">
              {stream.stream_url ? (
                <iframe src={stream.stream_url} className="w-full h-full" allowFullScreen title={stream.title} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <Radio className="h-12 w-12 text-muted-foreground opacity-40" />
                  <p className="text-sm text-muted-foreground">Player não disponível</p>
                </div>
              )}
              {stream.status === 'live' && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-accent px-2 py-1 text-xs font-bold text-accent-foreground">
                  <span className="live-pulse w-1.5 h-1.5 bg-accent-foreground rounded-full" />
                  AO VIVO
                </div>
              )}
            </div>
            <div className="border border-t-0 border-border bg-card p-4">
              <h1 className="text-lg font-bold text-balance mb-1">{stream.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {stream.game && <span className="font-mono text-foreground font-medium">{stream.game}</span>}
                <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{stream.viewers.toLocaleString()} espectadores</span>
                <span>por <span className="text-primary font-medium">{(stream as unknown as { streamer: { username: string } }).streamer?.username || 'Streamer'}</span></span>
              </div>
              {stream.description && <p className="text-sm text-muted-foreground mt-2 text-pretty">{stream.description}</p>}
            </div>
          </div>

          {/* Chat */}
          <div className="w-full lg:w-80 shrink-0 flex flex-col border border-border bg-card" style={{ height: 'min(480px, 70vh)' }}>
            <div className="border-b border-border p-3 flex items-center gap-2">
              <Radio className="h-4 w-4 text-accent" />
              <span className="text-sm font-bold uppercase tracking-wider">Chat</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0">
              {messages.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Seja o primeiro a comentar!</p>
              ) : messages.map(m => (
                <div key={m.id} className="text-xs">
                  <span className="font-bold text-primary">{(m as unknown as { profile: { username: string } }).profile?.username || 'Jogador'}: </span>
                  <span className="text-foreground break-words">{m.content}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="border-t border-border p-2 flex gap-2">
              {user ? (
                <>
                  <Input
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    placeholder="Enviar mensagem..."
                    className="flex-1 min-w-0 text-xs h-8 bg-secondary border-border px-2"
                    maxLength={200}
                  />
                  <Button type="submit" size="sm" className="h-8 w-8 p-0 shrink-0" disabled={sending || !newMsg.trim()}>
                    {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  </Button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground py-1 text-center w-full">Faça login para participar do chat</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
