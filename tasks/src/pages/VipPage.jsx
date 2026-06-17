const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Sparkles, Star, Zap, Shield, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import PaymentModal from "@/components/vip/PaymentModal";

const tierStyles = {
  bronze: { gradient: "from-orange-700 to-amber-800", glow: "shadow-orange-500/20", icon: "text-orange-400" },
  silver: { gradient: "from-slate-400 to-slate-500", glow: "shadow-slate-400/20", icon: "text-slate-300" },
  gold: { gradient: "from-yellow-400 to-amber-500", glow: "shadow-yellow-400/30", icon: "text-yellow-400" },
  platinum: { gradient: "from-cyan-400 to-blue-500", glow: "shadow-cyan-400/30", icon: "text-cyan-400" },
  diamond: { gradient: "from-violet-400 to-purple-600", glow: "shadow-violet-400/40", icon: "text-violet-400" },
};

export default function VipPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["vip-plans"],
    queryFn: () => db.entities.VipPlan.list("price_monthly", 10),
  });

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 border border-primary/20"
        >
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-primary">Planos VIP</span>
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          Eleva a tua <span className="text-primary">experiência</span>
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Desbloqueia funcionalidades exclusivas, badges únicos e muito mais com os nossos planos VIP.
        </p>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20">
          <Crown className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">Planos VIP em breve!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const style = tierStyles[plan.tier] || tierStyles.bronze;
            const isPopular = plan.tier === "gold";
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={isPopular ? "lg:-mt-4 lg:mb-4" : ""}
              >
                <Card className={`relative overflow-hidden border-border hover:border-primary/40 transition-all ${isPopular ? "ring-2 ring-primary glow-purple" : ""}`}>
                  {isPopular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                      POPULAR
                    </div>
                  )}
                  <CardContent className="p-6 space-y-6">
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center mx-auto mb-3 shadow-lg ${style.glow}`}>
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-display font-bold">{plan.name}</h3>
                      <Badge variant="outline" className={`${style.icon} border-current text-[10px] uppercase mt-1`}>
                        {plan.tier}
                      </Badge>
                    </div>

                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-display font-bold">€{plan.price_monthly?.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground">/mês</span>
                      </div>
                      {plan.price_yearly > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ou €{plan.price_yearly?.toFixed(2)}/ano
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      {plan.features?.map((feature, fi) => (
                        <div key={fi} className="flex items-start gap-2">
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.icon}`} />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                      {plan.ad_free && (
                        <div className="flex items-start gap-2">
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.icon}`} />
                          <span className="text-sm">Sem anúncios</span>
                        </div>
                      )}
                      {plan.priority_support && (
                        <div className="flex items-start gap-2">
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.icon}`} />
                          <span className="text-sm">Suporte prioritário</span>
                        </div>
                      )}
                      {plan.exclusive_chat && (
                        <div className="flex items-start gap-2">
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.icon}`} />
                          <span className="text-sm">Chat exclusivo</span>
                        </div>
                      )}
                    </div>

                    <Button
                      className={`w-full ${isPopular ? "glow-purple-sm" : ""}`}
                      variant={isPopular ? "default" : "secondary"}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      Subscrever
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
    </div>
  );
}