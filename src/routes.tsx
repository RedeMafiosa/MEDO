import type { ReactNode } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ClansPage from './pages/ClansPage';
import ClanDetailPage from './pages/ClanDetailPage';
import TournamentsPage from './pages/TournamentsPage';
import TournamentDetailPage from './pages/TournamentDetailPage';
import StreamsPage from './pages/StreamsPage';
import StreamDetailPage from './pages/StreamDetailPage';
import StorePage from './pages/StorePage';
import RankingPage from './pages/RankingPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRanks from './pages/admin/AdminRanks';
import AdminTags from './pages/admin/AdminTags';
import AdminTournaments from './pages/admin/AdminTournaments';
import AdminClans from './pages/admin/AdminClans';
import AdminStore from './pages/admin/AdminStore';
import AdminStreams from './pages/admin/AdminStreams';
import AdminSettings from './pages/admin/AdminSettings';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  { name: 'Home', path: '/', element: <HomePage />, public: true },
  { name: 'Login', path: '/login', element: <LoginPage />, public: true },
  { name: 'Registro', path: '/register', element: <RegisterPage />, public: true },
  { name: 'Clans', path: '/clans', element: <ClansPage />, public: true },
  { name: 'Clan Detalhe', path: '/clans/:id', element: <ClanDetailPage />, public: true },
  { name: 'Torneios', path: '/tournaments', element: <TournamentsPage />, public: true },
  { name: 'Torneio Detalhe', path: '/tournaments/:id', element: <TournamentDetailPage />, public: true },
  { name: 'Streams', path: '/streams', element: <StreamsPage />, public: true },
  { name: 'Stream Detalhe', path: '/streams/:id', element: <StreamDetailPage />, public: true },
  { name: 'Loja', path: '/store', element: <StorePage />, public: true },
  { name: 'Ranking', path: '/ranking', element: <RankingPage />, public: true },
  { name: 'Meu Perfil', path: '/profile', element: <ProfilePage />, public: true },
  { name: 'Perfil', path: '/profile/:id', element: <ProfilePage />, public: true },
  { name: 'Admin Dashboard', path: '/admin', element: <AdminDashboard /> },
  { name: 'Admin Usuários', path: '/admin/users', element: <AdminUsers /> },
  { name: 'Admin Ranks', path: '/admin/ranks', element: <AdminRanks /> },
  { name: 'Admin Tags',  path: '/admin/tags',  element: <AdminTags /> },
  { name: 'Admin Torneios', path: '/admin/tournaments', element: <AdminTournaments /> },
  { name: 'Admin Clans', path: '/admin/clans', element: <AdminClans /> },
  { name: 'Admin Loja', path: '/admin/store', element: <AdminStore /> },
  { name: 'Admin Streams', path: '/admin/streams', element: <AdminStreams /> },
  { name: 'Admin Config', path: '/admin/settings', element: <AdminSettings /> },
];
