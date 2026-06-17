const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from "react";

import { useAuth } from "@/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, Coins, Diamond, Gem, Plus, ArrowUpRight, ArrowDownLeft, Gift, RefreshCw, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";

const typeIcons = {
  purchase: ArrowUpRight,
  donation: Gift,
  reward: TrendingUp,
  transfer: ArrowDownLeft,
  refund: RefreshCw,
};

const statusColors = {
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  refunded: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function WalletPage() {
  const { user } = useAuth();

  const { data: walletData } = useQuery({
    queryKey: ["wallet-me", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const w = await db.entities.Wallet.filter({ user_id: user.id }, "-created_date", 1);
      return w[0] || null;
    },
    enabled: !!user?.id,
    staleTime: 0,
    refetchInterval: 5000,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return db.entities.Transaction.filter({ user_id: user.id }, "-created_date", 20);
    },
    enabled: !!user?.id,
  });

  const wallet = walletData || { tokens: 0, diamonds: 0, gems: 0 };

  const balances = [
    { icon: Coins, label: "Tokens", value: wallet.tokens || 0, color: "text-yellow-400", bg: "from-yellow-500/20 to-amber-500/10", border: "border-yellow-500/20" },
    { icon: Diamond, label: "Diamantes", value: wallet.diamonds || 0, color: "text-cyan-400", bg: "from-cyan-500/20 to-blue-500/10", border: "border-cyan-500/20" },
    { icon: Gem, label: "Gemas", value: wallet.gems || 0, color: "text-emerald-400", bg: "from-emerald-500/20 to-green-500/10", border: "border-emerald-500/20" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            Carteira
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Gere as tuas moedas e transações</p>
        </div>
        <Link to="/store">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Comprar Moedas
          </Button>
        </Link>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {balances.map((b, i) => (
          <motion.div
            key={b.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`bg-gradient-to-br ${b.bg} ${b.border} border`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <b.icon className={`w-8 h-8 ${b.color}`} />
                  <Badge variant="outline" className={`${b.color} border-current text-[10px]`}>
                    {b.label}
                  </Badge>
                </div>
                <p className="text-3xl font-display font-bold">{b.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Saldo disponível</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <ArrowUpRight className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Sem transações</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Moeda</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map(tx => {
                  const Icon = typeIcons[tx.type] || ArrowUpRight;
                  return (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="capitalize text-sm">{tx.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{tx.description || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] capitalize">{tx.currency}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {tx.amount >= 0 ? "+" : ""}{tx.amount}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[tx.status]} border text-[10px]`}>
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {tx.created_date ? format(new Date(tx.created_date), "dd/MM/yyyy HH:mm") : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}