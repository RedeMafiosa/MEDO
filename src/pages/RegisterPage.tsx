import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Swords, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUpWithUsername } = useAuth();
  const navigate = useNavigate();

  const validateUsername = (u: string) => /^[a-zA-Z0-9_]{3,20}$/.test(u);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUsername(username)) {
      toast.error('Usuário deve ter 3-20 caracteres (letras, números ou _)');
      return;
    }
    if (password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (password !== confirmPass) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (!agreed) {
      toast.error('Aceite os termos para continuar');
      return;
    }
    setLoading(true);
    const { error } = await signUpWithUsername(username.trim(), password);
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Erro ao criar conta');
    } else {
      toast.success('Conta criada com sucesso! Bem-vindo ao GamingHub!');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="border border-primary/50 p-3">
            <Swords className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-widest uppercase text-primary">GamingHub</h1>
            <p className="text-xs text-muted-foreground mt-1">Crie sua conta de jogador</p>
          </div>
        </div>

        <div className="border border-border bg-card p-6">
          <h2 className="text-lg font-bold mb-1">Criar Conta</h2>
          <p className="text-sm text-muted-foreground mb-6">Junte-se à arena dos melhores gamers</p>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">Usuário</Label>
              <Input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="ex: ProGamer123"
                className="bg-secondary border-border"
                autoComplete="username"
              />
              <p className="text-xs text-muted-foreground">3-20 chars: letras, números, _</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">Senha</Label>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="bg-secondary border-border pr-10"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-normal">Confirmar Senha</Label>
              <Input
                type="password"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder="Repita sua senha"
                className="bg-secondary border-border"
                autoComplete="new-password"
              />
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={v => setAgreed(v as boolean)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer">
                Li e aceito os{' '}
                <span className="text-primary underline cursor-pointer">Termos de Uso</span>{' '}
                e a{' '}
                <span className="text-primary underline cursor-pointer">Política de Privacidade</span>
              </label>
            </div>

            <Button type="submit" className="w-full font-bold tracking-wide" disabled={loading || !agreed}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'CRIAR CONTA'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Entrar</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
