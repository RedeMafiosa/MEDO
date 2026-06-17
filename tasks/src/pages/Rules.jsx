import React from "react";
import { Shield, CheckCircle, XCircle, AlertTriangle, Gavel, Heart, Star } from "lucide-react";
import { motion } from "framer-motion";

const rules = [
  {
    icon: Heart, color: "text-pink-400", bg: "bg-pink-400/10",
    title: "1. Respeito Mútuo",
    content: "Trata todos os membros com respeito. Não serão tolerados insultos, discriminação, racismo, homofobia ou qualquer forma de discurso de ódio. A diversidade é bem-vinda e celebrada nesta comunidade."
  },
  {
    icon: Shield, color: "text-blue-400", bg: "bg-blue-400/10",
    title: "2. Sem Spam ou Flood",
    content: "Evita enviar mensagens repetidas, caracteres aleatórios ou links em excesso. O spam será removido e poderá resultar em silenciamento temporário. Cada mensagem deve ter valor para a conversa."
  },
  {
    icon: XCircle, color: "text-red-400", bg: "bg-red-400/10",
    title: "3. Conteúdo Proibido",
    content: "É estritamente proibido partilhar conteúdo adulto, ilegal, violento ou perturbador. Links de phishing, malware ou conteúdo pirata serão removidos e a conta banida permanentemente."
  },
  {
    icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-400/10",
    title: "4. Sem Assédio",
    content: "O assédio a outros membros, seja em canais públicos ou mensagens privadas, é totalmente proibido. Isto inclui perseguição, intimidação e ameaças. Reporta qualquer comportamento suspeito à equipa."
  },
  {
    icon: Star, color: "text-purple-400", bg: "bg-purple-400/10",
    title: "5. Publicidade e Self-Promo",
    content: "A promoção de outros serviços, redes sociais ou plataformas não é permitida sem autorização prévia da equipa. Links de referral e afiliados são proibidos. Canais designados podem ser usados para partilhas aprovadas."
  },
  {
    icon: Gavel, color: "text-orange-400", bg: "bg-orange-400/10",
    title: "6. Obedece aos Moderadores",
    content: "As decisões dos moderadores e administradores são finais. Se discordas, podes apelar através do canal de suporte de forma respeitosa. Ignorar ou desafiar avisos resultará em punições progressivas."
  },
  {
    icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10",
    title: "7. Nickname e Avatar Adequados",
    content: "O teu nome de utilizador e foto de perfil devem ser adequados para todas as idades. Nomes ofensivos, inapropriados ou que se façam passar por membros da equipa serão alterados pela moderação."
  },
  {
    icon: Shield, color: "text-cyan-400", bg: "bg-cyan-400/10",
    title: "8. Proteção de Dados Pessoais",
    content: "Não partilhes dados pessoais teus ou de outros membros (morada, telefone, localização real). Protege a tua privacidade e a dos outros. A equipa nunca te pedirá a tua password."
  },
  {
    icon: Heart, color: "text-emerald-400", bg: "bg-emerald-400/10",
    title: "9. Ambiente Gaming Positivo",
    content: "Esta é uma comunidade de gaming e entretenimento. Comportamentos tóxicos como gloating, flaming ou grief são proibidos. Partilha vitórias e derrotas com fair-play. Celebra o sucesso de todos!"
  },
  {
    icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10",
    title: "10. Consequências e Punições",
    content: "As infrações resultam em: 1º - Aviso. 2º - Mute temporário (1-24h). 3º - Kick do servidor. 4º - Ban temporário (1-30 dias). 5º - Ban permanente. Infrações graves podem resultar em ban imediato."
  },
];

export default function Rules() {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 border border-primary/20">
          <Gavel className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Comunidade FlashStream</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          Regras da <span className="text-primary">Comunidade</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Para manteres a comunidade segura e divertida para todos, por favor lê e respeita as seguintes regras.
          A ignorância das regras não é motivo de isenção.
        </p>
      </motion.div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl ${rule.bg} flex items-center justify-center flex-shrink-0`}>
              <rule.icon className={`w-5 h-5 ${rule.color}`} />
            </div>
            <div>
              <h3 className="font-bold mb-1">{rule.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{rule.content}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Ao participares na comunidade FlashStream, aceitas estas regras. A equipa reserva-se ao direito de as atualizar a qualquer momento.
          Dúvidas? Contacta a equipa através do <span className="text-primary font-medium">Suporte</span>.
        </p>
      </div>
    </div>
  );
}