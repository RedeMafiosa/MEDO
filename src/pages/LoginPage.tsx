import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Swords, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('unzag');
  const [password, setPassword] = useState('123456');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signInWithUsername } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setLoading(true);
    const { error } = await signInWithUsername(username.trim(), password);
    setLoading(false);
    if (error) {
      toast.error('Credenciais inválidas. Tente novamente.');
    } else {
      toast.success(`Bem-vindo de volta, ${username}!`);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="border border-primary/50 p-3">
            <Swords className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-widest uppercase text-primary">GamingHub</h1>
            <p className="text-xs text-muted-foreground mt-1">Compete. Connect. Conquer.</p>
          </div>
        </div>

        {/* Form card */}
        <div className="border border-border bg-card p-6">
          <h2 className="text-lg font-bold mb-1">Entrar</h2>
          <p className="text-sm text-muted-foreground mb-6">Acesse sua conta de jogador</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">Usuário</Label>
              <Input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Seu nome de usuário"
                className="bg-secondary border-border"
                autoComplete="username"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">Senha</Label>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="bg-secondary border-border pr-10"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full font-bold tracking-wide" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ENTRAR'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Não tem conta?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">Criar conta</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
