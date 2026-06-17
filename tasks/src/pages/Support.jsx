import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Send, MessageCircle, FileText, Shield, Coins } from "lucide-react";
import { toast } from "sonner";

const faqs = [
  { q: "Como compro tokens?", a: "Vai à Loja e escolhe o pacote de tokens que desejas. Aceita todos os métodos de pagamento." },
  { q: "Como funciona o sistema VIP?", a: "Os planos VIP dão acesso a funcionalidades exclusivas como badges, emotes especiais e suporte prioritário." },
  { q: "Posso fazer stream?", a: "Sim! Contacta a equipa de suporte para ativar a funcionalidade de streaming na tua conta." },
  { q: "Como reporto um utilizador?", a: "Na stream, clica no ícone de bandeira. Podes também usar este formulário de suporte." },
  { q: "Como funciona o sistema de diamantes?", a: "Diamantes são uma moeda premium que podes usar para enviar presentes especiais durante streams." },
];

export default function Support() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Mensagem enviada com sucesso! Responderemos em breve.");
    setSubject("");
    setCategory("");
    setMessage("");
  };

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2 justify-center">
          <HelpCircle className="w-7 h-7 text-primary" />
          Suporte
        </h1>
        <p className="text-sm text-muted-foreground">Como podemos ajudar?</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: MessageCircle, label: "Chat", desc: "Fala connosco" },
          { icon: FileText, label: "FAQ", desc: "Perguntas frequentes" },
          { icon: Shield, label: "Segurança", desc: "Conta e privacidade" },
          { icon: Coins, label: "Pagamentos", desc: "Compras e reembolsos" },
        ].map(item => (
          <Card key={item.label} className="border-border hover:border-primary/40 transition-all cursor-pointer group">
            <CardContent className="p-4 text-center">
              <item.icon className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-sm text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Contactar Suporte</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">Conta</SelectItem>
                  <SelectItem value="payment">Pagamento</SelectItem>
                  <SelectItem value="stream">Streaming</SelectItem>
                  <SelectItem value="report">Denúncia</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Assunto"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
              <Textarea
                placeholder="Descreve o teu problema..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="min-h-[120px]"
              />
              <Button type="submit" className="w-full gap-2">
                <Send className="w-4 h-4" />
                Enviar Mensagem
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}