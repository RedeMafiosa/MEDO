const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useAuth } from "@/lib/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, ExternalLink, CreditCard, Smartphone, Copy, Check, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { addXP, xpForVipTier } from "@/lib/xpSystem.js";

const PAYPAL_EMAIL = "redemafiosa@hotmail.com";
const MBWAY_NUMBER = "+351 912 345 678";

export default function PaymentModal({ plan, onClose }) {
  const { user } = useAuth();
  const [method, setMethod] = useState(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [phone, setPhone] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!plan) return null;

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "phone") { setCopiedPhone(true); setTimeout(() => setCopiedPhone(false), 2000); }
    else { setCopiedEmail(true); setTimeout(() => setCopiedEmail(false), 2000); }
    toast.success("Copiado!");
  };

  const xpReward = xpForVipTier(plan?.tier || plan?.name || "");

  const grantXPAndNotify = async () => {
    if (user?.id) {
      const profiles = await db.entities.UserProfile.filter({ user_id: user.id }, "-created_date", 1);
      if (profiles[0]) {
        await addXP(base44, user.id, profiles[0].id, profiles[0].xp || 0, xpReward);
        // Store which VIP tier the user has
        await db.entities.UserProfile.update(profiles[0].id, { vip_tier: plan?.tier || "" });
      } else {
        await db.entities.UserProfile.create({
          user_id: user.id, username: user.full_name || "User",
          xp: xpReward, level: 1, vip_tier: plan?.tier || ""
        });
      }
    }
  };

  const handlePayPal = async () => {
    const note = encodeURIComponent(`VIP ${plan.name} | User: ${user?.full_name || user?.email}`);
    const link = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(PAYPAL_EMAIL)}&amount=${plan.price_monthly?.toFixed(2)}&currency_code=EUR&item_name=${encodeURIComponent("VIP " + plan.name)}&custom=${note}`;
    window.open(link, "_blank");
    try {
      await grantXPAndNotify();
      if (user?.email) {
        await db.integrations.Core.SendEmail({
          to: user.email,
          subject: `✅ Subscrição VIP iniciada — ${plan.name}`,
          body: `Olá ${user?.full_name || ""},\n\nIniciaste a subscrição VIP:\n\n👑 Plano: ${plan.name}\n💶 Valor: €${plan.price_monthly?.toFixed(2)}/mês\n💳 Método: PayPal\n🎁 Bónus: +${xpReward} XP adicionados!\n\nO teu VIP será ativado em até 24h.\n\nObrigado!\nEquipa FlashStream`
        });
      }
      await db.integrations.Core.SendEmail({
        to: PAYPAL_EMAIL,
        subject: `👑 Novo VIP PayPal — ${plan.name}`,
        body: `Novo pedido VIP via PayPal:\n\n👤 ${user?.full_name || user?.email}\n🆔 ${user?.id}\n👑 Plano: ${plan.name}\n💶 €${plan.price_monthly?.toFixed(2)}/mês`
      });
      setConfirmed(true);
    } catch {
      setConfirmed(true); // still show success as PayPal opened
    }
  };

  const handleMBWayConfirm = async () => {
    if (!phone.trim()) { toast.error("Introduz o teu número de telemóvel!"); return; }
    setConfirming(true);
    try {
      await grantXPAndNotify();
      if (user?.email) {
        await db.integrations.Core.SendEmail({
          to: user.email,
          subject: `✅ Pedido VIP recebido — ${plan.name}`,
          body: `Olá ${user?.full_name || ""},\n\nRecebemos o teu pedido de subscrição VIP:\n\n👑 Plano: ${plan.name}\n💶 Valor: €${plan.price_monthly?.toFixed(2)}/mês\n💳 Método: MBWay\n📱 Teu nº: ${phone}\n🎁 Bónus: +${xpReward} XP adicionados!\n\nEnvia €${plan.price_monthly?.toFixed(2)} para ${MBWAY_NUMBER} via MBWay.\nO teu VIP será ativado em até 24h.\n\nObrigado!\nEquipa FlashStream`
        });
      }
      await db.integrations.Core.SendEmail({
        to: PAYPAL_EMAIL,
        subject: `👑 Novo VIP MBWay — ${plan.name}`,
        body: `Novo pedido VIP (MBWay):\n\n👤 ${user?.full_name || user?.email}\n🆔 ${user?.id}\n📱 Telemóvel: ${phone}\n👑 Plano: ${plan.name}\n💶 €${plan.price_monthly?.toFixed(2)}/mês`
      });
      setConfirmed(true);
      toast.success(`Pedido enviado! +${xpReward} XP adicionados!`);
    } catch (e) {
      toast.error("Erro ao enviar. Tenta novamente.");
    }
    setConfirming(false);
  };

  return (
    <Dialog open={!!plan} onOpenChange={() => { onClose(); setMethod(null); setConfirmed(false); setPhone(""); }}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            Subscrever {plan.name}
          </DialogTitle>
        </DialogHeader>

        {confirmed ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-green-400">Pedido Enviado!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Comprovativo enviado para <strong>{user?.email}</strong>.<br />
                O teu VIP será ativado em até 24h.
              </p>
              <div className="mt-3 bg-primary/10 border border-primary/20 rounded-xl p-3">
                <p className="text-sm text-primary font-bold">🎁 +{xpReward} XP adicionados ao teu perfil!</p>
                <p className="text-xs text-yellow-300 mt-1">👑 VIP {plan.name} ativo no teu perfil!</p>
              </div>
            </div>
            <Button className="w-full" onClick={() => { onClose(); setMethod(null); setConfirmed(false); }}>Fechar</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 text-center">
              <p className="text-xs text-yellow-300">🎁 Ao subscrever recebes <strong>+{xpReward} XP</strong> imediatamente!</p>
            </div>

            <div className="bg-secondary rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-bold">{plan.name}</p>
                <p className="text-xs text-muted-foreground">Plano mensal</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-display font-bold text-primary">€{plan.price_monthly?.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">/mês</p>
              </div>
            </div>

            <p className="text-sm text-center text-muted-foreground">Escolhe o método de pagamento:</p>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setMethod("paypal")}
                className={`p-3 rounded-xl border-2 transition-all text-center space-y-1 ${method === "paypal" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}>
                <CreditCard className="w-7 h-7 text-blue-400 mx-auto" />
                <p className="font-bold text-sm">PayPal</p>
                <p className="text-[10px] text-muted-foreground">Pagamento online</p>
              </button>
              <button onClick={() => setMethod("mbway")}
                className={`p-3 rounded-xl border-2 transition-all text-center space-y-1 ${method === "mbway" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}>
                <Smartphone className="w-7 h-7 text-green-400 mx-auto" />
                <p className="font-bold text-sm">MBWay</p>
                <p className="text-[10px] text-muted-foreground">Telemóvel</p>
              </button>
            </div>

            {method === "paypal" && (
              <div className="bg-blue-400/10 border border-blue-400/20 rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium text-blue-300">Como pagar via PayPal:</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal ml-4">
                  <li>Clica em "Pagar com PayPal"</li>
                  <li>Paga <strong>€{plan.price_monthly?.toFixed(2)}</strong> e indica o teu username</li>
                  <li>Email de confirmação e +1000 XP automáticos</li>
                </ol>
                <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-mono flex-1">{PAYPAL_EMAIL}</span>
                  <button onClick={() => handleCopy(PAYPAL_EMAIL, "email")}>
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                </div>
                <Button className="w-full gap-2 bg-blue-500 hover:bg-blue-600" onClick={handlePayPal}>
                  <ExternalLink className="w-4 h-4" /> Pagar com PayPal
                </Button>
              </div>
            )}

            {method === "mbway" && (
              <div className="bg-green-400/10 border border-green-400/20 rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium text-green-300">Como pagar via MBWay:</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary rounded-lg px-3 py-2 font-mono text-sm font-bold text-center">
                    <Phone className="w-3.5 h-3.5 inline mr-1 text-green-400" />
                    {MBWAY_NUMBER}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleCopy(MBWAY_NUMBER, "phone")}>
                    {copiedPhone ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Envia <strong>€{plan.price_monthly?.toFixed(2)}</strong> e indica <strong>{plan.name}</strong> + username na nota.</p>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="O teu nº de telemóvel" className="text-sm" />
                <Button className="w-full gap-2 bg-green-600 hover:bg-green-700" onClick={handleMBWayConfirm} disabled={confirming || !phone.trim()}>
                  {confirming ? "Enviando..." : "Pagar com MBWay"}
                </Button>
              </div>
            )}

            {!method && <p className="text-xs text-muted-foreground text-center">Seleciona um método de pagamento acima</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}