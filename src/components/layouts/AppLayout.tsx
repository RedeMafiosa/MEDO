import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: ReactNode;
  /** Optional left sidebar (e.g. on the home page) */
  sidebar?: ReactNode;
}

export function AppLayout({ children, sidebar }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <Navbar />
      <div className="flex flex-1 min-w-0 overflow-x-hidden">
        {sidebar}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        <p>© 2026 GamingHub. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
