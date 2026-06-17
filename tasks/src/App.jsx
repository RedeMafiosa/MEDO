import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import Streams from '@/pages/Streams';
import StreamView from '@/pages/StreamView';
import Store from '@/pages/Store';
import WalletPage from '@/pages/WalletPage';
import VipPage from '@/pages/VipPage';
import Ranking from '@/pages/Ranking';
import Support from '@/pages/Support';
import Feed from '@/pages/Feed';
import Rooms from '@/pages/Rooms';
import GeneralChat from '@/pages/GeneralChat';
import Rules from '@/pages/Rules';
import Privacy from '@/pages/Privacy';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminStreams from '@/pages/admin/AdminStreams';
import AdminStore from '@/pages/admin/AdminStore';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminVip from '@/pages/admin/AdminVip';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminTags from '@/pages/admin/AdminTags';
import AdminMembers from '@/pages/admin/AdminMembers';
import AdminRooms from '@/pages/admin/AdminRooms';
import Profile from '@/pages/Profile';
import Inventory from '@/pages/Inventory';
import Gaming from '@/pages/Gaming';
import Flashgame from '@/pages/Flashgame';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <span className="text-sm text-muted-foreground font-display">FlashStream</span>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/streams" element={<Streams />} />
        <Route path="/stream/:id" element={<StreamView />} />
        <Route path="/store" element={<Store />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/vip" element={<VipPage />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/support" element={<Support />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/chat" element={<GeneralChat />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/gaming" element={<Gaming />} />
        <Route path="/flashgame" element={<Flashgame />} />
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="streams" element={<AdminStreams />} />
          <Route path="store" element={<AdminStore />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="vip" element={<AdminVip />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="tags" element={<AdminTags />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="rooms" element={<AdminRooms />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster position="bottom-right" theme="dark" />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App