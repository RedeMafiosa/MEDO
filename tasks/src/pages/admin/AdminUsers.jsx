const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Search, Mail, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminUsers() {
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => db.entities.User.list("-created_date", 100),
  });

  const filtered = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Utilizadores
        </h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-secondary border-none" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-border">
            <tr className="text-left">
              <th className="px-4 py-3 text-xs text-muted-foreground font-semibold uppercase">Utilizador</th>
              <th className="px-4 py-3 text-xs text-muted-foreground font-semibold uppercase">Email</th>
              <th className="px-4 py-3 text-xs text-muted-foreground font-semibold uppercase">Role</th>
              <th className="px-4 py-3 text-xs text-muted-foreground font-semibold uppercase">Registado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">A carregar...</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                        {(u.full_name || "U")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{u.full_name || "—"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />{u.email}
                </td>
                <td className="px-4 py-3">
                  <Badge className={u.role === "admin" ? "bg-primary/20 text-primary border-primary/30" : "bg-secondary text-muted-foreground border-none"}>
                    {u.role === "admin" ? <><Shield className="w-3 h-3 mr-1" />Admin</> : "Utilizador"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {u.created_date ? formatDistanceToNow(new Date(u.created_date), { addSuffix: true, locale: ptBR }) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p>Nenhum utilizador encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}