const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check } from "lucide-react";
import { motion } from "framer-motion";
import PaymentModal from "@/components/vip/PaymentModal";

const tierStyles = {
  bronze: { gradient: "from-orange-700 to-amber-800", glow: "shadow-orange-500/20", icon: "text-orange-400" },
  silver: { gradient: "from-slate-400 to-slate-500", glow: "shadow-slate-400/20", icon: "text-slate-300" },
  gold: { gradient: "from-yellow-400 to-amber-500", glow: "shadow-yellow-400/30", icon: "text-yellow-400" },
  platinum: { gradient: "from-cyan-400 to-blue-500", glow: "shadow-cyan-400/30", icon: "text-cyan-400" },
  diamond: { gradient: "from-violet-400 to-purple-600", glow: "shadow-violet-400/40", icon: "text-violet-400" }
};

export default function VipSection() {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["vip-plans"],
    queryFn: () => db.entities.VipPlan.list("price_monthly", 10)
  });

  if (isLoading) return (
    <div className="flex justify-center py-10">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>);

  if (plans.length === 0) return (
    <div className="text-center py-10 text-muted-foreground">
      <Crown className="w-12 h-12 mx-auto mb-3 opacity-20" />
      <p>Planos VIP em breve!</p>
    </div>);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan, i) => {
          const style = tierStyles[plan.tier] || tierStyles.bronze;
          const isPopular = plan.tier === "gold";
          return (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className={`relative overflow-hidden border-border hover:border-primary/40 transition-all ${isPopular ? "ring-2 ring-primary" : ""}`}>
                {isPopular &&
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                }
                <CardContent className="p-5 space-y-4">
                  <div className="text-center">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center mx-auto mb-2 shadow-lg ${style.glow}`}>
                      <Crown className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-display font-bold text-2xl">{plan.name}</h3>
                    <Badge variant="outline" className={`${style.icon} border-current text-[10px] uppercase mt-1`}>{plan.tier}</Badge>
                  </div>

                  <div className="text-center">
                    <span className="text-2xl font-display font-bold">€{plan.price_monthly?.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">/mês</span>
                    {plan.price_yearly > 0 &&
                    <p className="text-xs text-muted-foreground mt-1">ou €{plan.price_yearly?.toFixed(2)}/ano</p>
                    }
                  </div>

                  <div className="space-y-1.5">
                    {plan.features?.map((f, fi) =>
                    <div key={fi} className="flex items-start gap-2">
                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.icon}`} />
                        <span className="text-xs">{f}</span>
                      </div>
                    )}
                    {plan.ad_free && <div className="flex items-start gap-2"><Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.icon}`} /><span className="text-xs">Sem anúncios</span></div>}
                    {plan.priority_support && <div className="flex items-start gap-2"><Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.icon}`} /><span className="text-xs">Suporte prioritário</span></div>}
                    {plan.exclusive_chat && <div className="flex items-start gap-2"><Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.icon}`} /><span className="text-xs">Chat exclusivo</span></div>}
                  </div>

                  <Button className="w-full [font-family:'Noto_Sans',_sans-serif]" variant={isPopular ? "default" : "secondary"} onClick={() => setSelectedPlan(plan)}>
                    Subscrever
                  </Button>
                </CardContent>
              </Card>
            </motion.div>);

        })}
      </div>
      <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
    </>);

}