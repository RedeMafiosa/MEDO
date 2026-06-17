import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, Swords, Home, Shield, Trophy, Radio, ShoppingBag, BarChart3, User, Settings, LogOut, LogIn } from 'lucide-react';
import { MemberTag } from '@/components/ui/member-tag';

const navLinks = [
  { label: 'Início', href: '/', icon: Home },
  { label: 'Clans', href: '/clans', icon: Shield },
  { label: 'Torneios', href: '/tournaments', icon: Trophy },
  { label: 'Streams', href: '/streams', icon: Radio },
  { label: 'Loja', href: '/store', icon: ShoppingBag },
  { label: 'Ranking', href: '/ranking', icon: BarChart3 },
];

export function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <nav className="flex h-14 items-center px-4 md:px-6 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Swords className="h-6 w-6 text-primary" />
          <span className="font-bold text-base text-primary tracking-widest uppercase hidden sm:block">GamingHub</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map(({ label, href, icon: Icon }) => (
            <Link key={href} to={href}>
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1.5 text-sm font-medium ${isActive(href) ? 'text-primary border border-primary/30 bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Button>
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1.5 text-sm font-medium ${isActive('/admin') ? 'text-primary border border-primary/30 bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Settings className="h-3.5 w-3.5" />
                Admin
              </Button>
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {user && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 border border-border px-2 py-1 hover:border-primary/50 transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback className="text-xs bg-secondary text-primary font-bold">
                      {profile.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left min-w-0">
                    <p className="text-xs font-medium truncate max-w-24">{profile.username}</p>
                    <p className="text-xs text-muted-foreground font-mono">{profile.coins} 🪙</p>
                  </div>
                  {isAdmin && <MemberTag variant="admin" label="Admin" size="sm" className="hidden md:inline-flex" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to={`/profile/${profile.id}`} className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Meu Perfil
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" /> Painel Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button size="sm" className="gap-1.5 font-medium">
                <LogIn className="h-4 w-4" />
                Entrar
              </Button>
            </Link>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden border border-border p-1.5">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-0">
              <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
                <Swords className="h-5 w-5 text-sidebar-primary" />
                <span className="font-bold text-sidebar-primary tracking-widest uppercase">GamingHub</span>
              </div>
              <nav className="p-3 flex flex-col gap-1">
                {navLinks.map(({ label, href, icon: Icon }) => (
                  <Link key={href} to={href} onClick={() => setMobileOpen(false)}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-2 text-sm ${isActive(href) ? 'text-sidebar-primary bg-sidebar-accent' : 'text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent'}`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Button>
                  </Link>
                ))}
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className={`w-full justify-start gap-2 text-sm ${isActive('/admin') ? 'text-sidebar-primary bg-sidebar-accent' : 'text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent'}`}>
                      <Settings className="h-4 w-4" /> Admin
                    </Button>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
