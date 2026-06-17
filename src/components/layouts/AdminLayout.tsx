import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Swords, LayoutDashboard, Users, Medal, Trophy, Shield, ShoppingBag, Radio, Settings, Menu, ChevronLeft, LogOut } from 'lucide-react';

const adminLinks = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Usuários', href: '/admin/users', icon: Users },
  { label: 'Ranks', href: '/admin/ranks', icon: Medal },
  { label: 'Torneios', href: '/admin/tournaments', icon: Trophy },
  { label: 'Clans', href: '/admin/clans', icon: Shield },
  { label: 'Loja', href: '/admin/store', icon: ShoppingBag },
  { label: 'Streams', href: '/admin/streams', icon: Radio },
  { label: 'Configurações', href: '/admin/settings', icon: Settings },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (href: string) =>
    href === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(href);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
        <Swords className="h-5 w-5 text-sidebar-primary" />
        <span className="font-bold text-sidebar-primary tracking-widest uppercase text-sm">Admin</span>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        {adminLinks.map(({ label, href, icon: Icon }) => (
          <Link key={href} to={href} onClick={onClose}>
            <Button
              variant="ghost"
              className={`w-full justify-start gap-2 text-sm h-9 ${isActive(href) ? 'text-sidebar-primary bg-sidebar-accent' : 'text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent'}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Button>
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-sidebar-border flex flex-col gap-1">
        <Link to="/">
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent">
            <ChevronLeft className="h-4 w-4" /> Ver Site
          </Button>
        </Link>
        <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start gap-2 text-sm text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border">
        <SidebarContent />
      </aside>

      <div className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1.5 border border-border">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-56 p-0">
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="font-bold text-sm text-primary tracking-wider uppercase">Painel Admin</span>
        </div>
        <main className="flex-1 p-4 md:p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
