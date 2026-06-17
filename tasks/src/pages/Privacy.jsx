import React from "react";
import { Shield, Lock, Eye, Database, UserCheck, Bell, Trash2, Mail } from "lucide-react";
import { motion } from "framer-motion";

const sections = [
  {
    icon: Database, color: "text-blue-400", bg: "bg-blue-400/10",
    title: "Dados que Recolhemos",
    content: [
      "Informações de registo: nome de utilizador, endereço de email e password (encriptada).",
      "Dados de utilização: mensagens enviadas, streams visualizados, compras realizadas e interações com a plataforma.",
      "Dados técnicos: endereço IP, tipo de browser, sistema operativo e cookies de sessão.",
      "Conteúdo gerado: publicações no feed, comentários, mensagens de chat e ficheiros enviados.",
    ]
  },
  {
    icon: Eye, color: "text-purple-400", bg: "bg-purple-400/10",
    title: "Como Usamos os Teus Dados",
    content: [
      "Fornecer e melhorar os serviços da plataforma FlashStream.",
      "Processar pagamentos e gerir a tua carteira virtual com segurança.",
      "Enviar notificações sobre atividade da conta, atualizações e ofertas relevantes.",
      "Detetar e prevenir fraudes, abusos e violações das nossas regras.",
      "Personalizar a tua experiência com base nas tuas preferências.",
    ]
  },
  {
    icon: Lock, color: "text-green-400", bg: "bg-green-400/10",
    title: "Segurança dos Dados",
    content: [
      "Todas as passwords são encriptadas com algoritmos bcrypt — nunca armazenamos passwords em texto claro.",
      "As comunicações são protegidas por SSL/TLS, garantindo conexões seguras.",
      "Os dados são armazenados em servidores com acesso restrito e monitorização 24/7.",
      "Realizamos auditorias de segurança regulares e testes de penetração.",
      "Em caso de violação de dados, notificaremos os utilizadores afetados no prazo de 72 horas.",
    ]
  },
  {
    icon: UserCheck, color: "text-yellow-400", bg: "bg-yellow-400/10",
    title: "Os Teus Direitos (RGPD)",
    content: [
      "Direito de Acesso: podes solicitar uma cópia de todos os dados que temos sobre ti.",
      "Direito de Retificação: podes corrigir dados incorretos ou incompletos.",
      "Direito ao Apagamento: podes solicitar a eliminação da tua conta e dados associados.",
      "Direito à Portabilidade: podes exportar os teus dados num formato legível.",
      "Direito de Oposição: podes opor-te ao tratamento dos teus dados para fins de marketing.",
    ]
  },
  {
    icon: Bell, color: "text-orange-400", bg: "bg-orange-400/10",
    title: "Cookies e Rastreamento",
    content: [
      "Cookies essenciais: necessários para o funcionamento da plataforma (sessão, autenticação).",
      "Cookies de preferências: guardam as tuas configurações e preferências de interface.",
      "Cookies analíticos: ajudam-nos a entender como a plataforma é utilizada (podem ser desativados).",
      "Não vendemos nem partilhamos dados com terceiros para fins publicitários.",
    ]
  },
  {
    icon: Trash2, color: "text-red-400", bg: "bg-red-400/10",
    title: "Retenção e Eliminação",
    content: [
      "Os dados da conta são mantidos enquanto esta estiver ativa.",
      "Após eliminação da conta, os dados são apagados definitivamente em até 30 dias.",
      "Alguns dados podem ser retidos por obrigações legais (ex: registos de transações por 5 anos).",
      "Mensagens de chat são automaticamente eliminadas após 6 meses.",
    ]
  },
];

export default function Privacy() {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 border border-primary/20">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">FlashStream</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          Segurança & <span className="text-primary">Privacidade</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          A tua privacidade é importante para nós. Este documento explica como recolhemos, usamos e protegemos os teus dados.
          Última atualização: Junho 2026.
        </p>
      </motion.div>

      <div className="space-y-5">
        {sections.map((section, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${section.bg} flex items-center justify-center`}>
                <section.icon className={`w-5 h-5 ${section.color}`} />
              </div>
              <h2 className="font-bold text-lg">{section.title}</h2>
            </div>
            <ul className="space-y-2">
              {section.content.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="bg-secondary rounded-xl p-4 flex items-start gap-3">
        <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">Contacto para Privacidade</p>
          <p className="text-sm text-muted-foreground mt-1">
            Para exercer os teus direitos ou para qualquer questão sobre privacidade, contacta-nos em{" "}
            <span className="text-primary">privacidade@flashstream.pt</span> ou através da secção de Suporte.
          </p>
        </div>
      </div>
    </div>
  );
}