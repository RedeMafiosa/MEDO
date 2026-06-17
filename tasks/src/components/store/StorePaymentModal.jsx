const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useAuth } from "@/lib/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, ExternalLink, CreditCard, Smartphone, Copy, Check, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

const PAYPAL_EMAIL = "redemafiosa@hotmail.com";
const MBWAY_NUMBER = "+351 912 345 678";

export default function StorePaymentModal({ item, itemGif, onClose }) {
  const { user } = useAuth();
  const [method, setMethod] = useState(null);
  const [phone, setPhone] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!item) return null;

  const price = item.price_eur || item.price || 0;
  const itemName = item.name || "Item";

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "phone") { setCopiedPhone(true); setTimeout(() => setCopiedPhone(false), 2000); }
    else { setCopiedEmail(true); setTimeout(() => setCopiedEmail(false), 2000); }
    toast.success("Copiado!");
  };

  const handlePayPal = async () => {
    const note = encodeURIComponent(`${itemName} | User: ${user?.full_name || user?.email}`);
    const link = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(PAYPAL_EMAIL)}&amount=${price.toFixed(2)}&currency_code=EUR&item_name=${encodeURIComponent(itemName)}&custom=${note}`;
    window.open(link, "_blank");
    // Send emails after opening PayPal
    try {
      if (user?.email) {
        await db.integrations.Core.SendEmail({
          to: user.email,
          subject: `✅ Compra iniciada — ${itemName}`,
          body: `Olá ${user?.full_name || ""},\n\nIniciaste uma compra via PayPal:\n\n🛍️ Item: ${itemName}\n💶 Valor: €${price.toFixed(2)}\n💳 Método: PayPal\n\nApós o pagamento ser confirmado, o item será adicionado à tua conta.\n\nObrigado!\nEquipa FlashStream`
        });
      }
      await db.integrations.Core.SendEmail({
        to: PAYPAL_EMAIL,
        subject: `🛒 Compra PayPal — ${itemName}`,
        body: `Nova compra via PayPal:\n\n👤 Utilizador: ${user?.full_name || user?.email}\n🆔 ID: ${user?.id}\n🛍️ Item: ${itemName}\n💶 Valor: €${price.toFixed(2)}\n💳 Método: PayPal`
      });
      setConfirmed(true);
    } catch {
      // ignore email errors, payment still opened
    }
  };

  const handleMBWayConfirm = async () => {
    if (!phone.trim()) {
      toast.error("Introduz o teu número de telemóvel!");
      return;
    }
    setConfirming(true);
    try {
      if (user?.email) {
        await db.integrations.Core.SendEmail({
          to: user.email,
          subject: `✅ Compra recebida — ${itemName}`,
          body: `Olá ${user?.full_name || ""},\n\nRecebemos o teu pedido de compra:\n\n🛍️ Item: ${itemName}\n💶 Valor: €${price.toFixed(2)}\n💳 Método: MBWay\n📱 Teu nº: ${phone}\n\nEnvia €${price.toFixed(2)} para ${MBWAY_NUMBER} via MBWay.\nO teu item será adicionado em até 24h após confirmarmos o pagamento.\n\nObrigado!\nEquipa FlashStream`
        });
      }
      await db.integrations.Core.SendEmail({
        to: PAYPAL_EMAIL,
        subject: `📱 Nova compra MBWay — ${itemName}`,
        body: `Nova compra pendente (MBWay):\n\n👤 Utilizador: ${user?.full_name || user?.email}\n🆔 ID: ${user?.id}\n📱 Telemóvel: ${phone}\n🛍️ Item: ${itemName}\n💶 Valor: €${price.toFixed(2)}\n\nVerifica o MBWay e ativa o item manualmente.`
      });
      setConfirmed(true);
      toast.success("Pedido enviado! Receberás um email de confirmação.");
    } catch (e) {
      toast.error("Erro ao enviar. Tenta novamente.");
    }
    setConfirming(false);
  };

  const handleClose = () => {
    onClose();
    setMethod(null);
    setConfirmed(false);
    setPhone("");
  };

  return (
    <Dialog open={!!item} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Comprar {itemName}
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
                O teu item será ativado em até 24h.
              </p>
            </div>
            <Button className="w-full" onClick={handleClose}>Fechar</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Item summary */}
            <div className="bg-secondary rounded-xl p-4 flex items-center justify-between gap-3">
              {itemGif && <img src={itemGif} alt="" className="w-12 h-12 object-contain rounded-lg" />}
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{itemName}</p>
                {item.amount > 0 && <p className="text-xs text-muted-foreground">{item.amount?.toLocaleString()} unidades{item.bonus_amount > 0 ? ` +${item.bonus_amount} bónus` : ""}</p>}
              </div>
              <p className="text-2xl font-display font-bold text-primary whitespace-nowrap">€{price.toFixed(2)}</p>
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
                  <li>Paga <strong>€{price.toFixed(2)}</strong> e indica o teu username na nota</li>
                  <li>Email de confirmação será enviado automaticamente</li>
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
                <p className="text-xs text-muted-foreground">Envia <strong>€{price.toFixed(2)}</strong> para o número acima e indica <strong>{itemName}</strong> na nota.</p>
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