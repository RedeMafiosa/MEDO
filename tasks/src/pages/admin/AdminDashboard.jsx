const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Users, Radio, ShoppingBag, Coins, Diamond, Gem, Crown,
  Palette, Image, Settings, FileText, Shield, MessageCircle,
  BarChart3, Zap, TrendingUp, Eye, Activity, Lock, LogIn, Hash
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

const ADMIN_USER = "unzag";
const ADMIN_PASS = "123456";

function AdminLogin({ onSuccess }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem("admin_auth", "1");
      onSuccess();
    } else {
      setError("Credenciais inválidas.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-14 h-14 rounded-full bg-red-600/15 flex items-center justify-center">
            <Shield className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-display font-bold">Acesso Admin</h2>
          <p className="text-sm text-muted-foreground">Introduza as credenciais de administrador</p>
        </div>
        {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Utilizador" value={user} onChange={e => setUser(e.target.value)} className="pl-10 h-11" required />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} className="pl-10 h-11" required />
          </div>
          <Button type="submit" className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold gap-2">
            <LogIn className="w-4 h-4" /> Entrar no Painel
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

const adminMenu = [
  { icon: BarChart3, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Utilizadores", path: "/admin/users" },
  { icon: Users, label: "Membros & XP", path: "/admin/members" },
  { icon: FileText, label: "Tags", path: "/admin/tags" },
  { icon: Radio, label: "Streams", path: "/admin/streams" },
  { icon: ShoppingBag, label: "Loja", path: "/admin/store" },
  { icon: Crown, label: "VIP", path: "/admin/vip" },
  { icon: Hash, label: "Salas", path: "/admin/rooms" },
  { icon: Settings, label: "Configurações", path: "/admin/settings" },
];

function AdminSidebar() {
  const location = useLocation();
  return (
    <aside className="w-56 bg-card border-r border-border h-full overflow-y-auto p-3 flex-shrink-0">
      <div className="flex items-center gap-2 px-3 py-2 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <span className="font-display font-bold text-sm">Admin Panel</span>
      </div>
      <div className="space-y-0.5">
        {adminMenu.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

function DashboardHome() {
  const { data: streams = [] } = useQuery({
    queryKey: ["admin-streams"],
    queryFn: () => db.entities.Stream.list("-created_date", 50),
  });
  const { data: storeItems = [] } = useQuery({
    queryKey: ["admin-store"],
    queryFn: () => db.entities.StoreItem.list("-created_date", 50),
  });
  const { data: transactions = [] } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: () => db.entities.Transaction.list("-created_date", 50),
  });

  const liveCount = streams.filter(s => s.status === "live").length;
  const totalViewers = streams.reduce((sum, s) => sum + (s.viewers || 0), 0);
  const totalRevenue = transactions.filter(t => t.type === "purchase" && t.currency === "eur").reduce((sum, t) => sum + (t.amount || 0), 0);

  const stats = [
    { icon: Radio, label: "Streams ao Vivo", value: liveCount, color: "text-red-400", bg: "bg-red-400/10" },
    { icon: Eye, label: "Viewers", value: totalViewers, color: "text-blue-400", bg: "bg-blue-400/10" },
    { icon: ShoppingBag, label: "Produtos", value: storeItems.length, color: "text-green-400", bg: "bg-green-400/10" },
    { icon: TrendingUp, label: "Receita (€)", value: `€${totalRevenue.toFixed(2)}`, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { icon: Activity, label: "Transações", value: transactions.length, color: "text-purple-400", bg: "bg-purple-400/10" },
    { icon: Zap, label: "Total Streams", value: streams.length, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Streams */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Streams Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {streams.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-purple-800 flex items-center justify-center text-xs font-bold">
                  {s.streamer_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.streamer_name}</p>
                </div>
                <Badge className={s.status === "live" ? "bg-red-600 text-white border-none" : "bg-secondary text-muted-foreground border-none"}>
                  {s.status === "live" ? "AO VIVO" : "Offline"}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Eye className="w-3 h-3" />{s.viewers || 0}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  const location = useLocation();
  const isExactAdmin = location.pathname === "/admin";
  const { user } = useAuth();
  const [adminAuthed, setAdminAuthed] = useState(() => sessionStorage.getItem("admin_auth") === "1");

  // Se não tiver feito login admin, pede credenciais
  if (!adminAuthed) {
    return <AdminLogin onSuccess={() => setAdminAuthed(true)} />;
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-6">
        {isExactAdmin ? <DashboardHome /> : <Outlet />}
      </div>
    </div>
  );
}