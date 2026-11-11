import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Seo from "@/components/Seo";
import { getGreeting } from "@/data/ctfl-data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Me faça 5 questões de CTFL nível K2",
  "Explique o Paradoxo do Pesticida",
  "Quais são os 7 princípios de teste?",
  "O que é teste de regressão?",
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `${getGreeting()}! 👋 Sou seu assistente de estudos CTFL. Posso:\n\n- 📝 Gerar questões personalizadas\n- 💡 Explicar conceitos do syllabus\n- 📊 Sugerir temas para revisar\n- ✅ Corrigir suas respostas com feedback\n\nO que deseja estudar hoje?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const responses: Record<string, string> = {
        default: `Ótima pergunta! Vou te ajudar com isso.\n\nO CTFL (Certified Tester Foundation Level) abrange 6 capítulos fundamentais. Para uma resposta mais completa, recomendo explorar as **Trilhas de Estudo** onde organizamos todo o conteúdo.\n\n💡 *Dica: Foque no Capítulo 4 — é o mais difícil e mais cobrado no exame!*`,
      };

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: text.toLowerCase().includes("princípio")
          ? `Os **7 Princípios de Teste** são fundamentais para o CTFL:\n\n1. **O teste mostra a presença de defeitos**, não sua ausência\n2. **Teste exaustivo é impossível**\n3. **Teste antecipado** economiza tempo e dinheiro\n4. **Agrupamento de defeitos** — poucos módulos concentram a maioria\n5. **Paradoxo do pesticida** — testes repetidos não encontram novos defeitos\n6. **O teste depende do contexto**\n7. **Ausência de defeitos é uma falácia**\n\n📝 Quer que eu gere questões sobre esses princípios?`
          : text.toLowerCase().includes("pesticida")
          ? `O **Paradoxo do Pesticida** é o 5º princípio de teste:\n\n> Se os mesmos testes forem repetidos continuamente, eles eventualmente não encontrarão novos defeitos.\n\nAssim como pragas se tornam resistentes ao mesmo pesticida, o software "sobrevive" aos mesmos testes.\n\n**Solução:** Revisar e atualizar os testes regularmente, adicionar novos testes e usar técnicas diferentes.\n\n✅ Esse é um conceito **K2** — você precisa *entender*, não apenas memorizar!`
          : text.toLowerCase().includes("questões") || text.toLowerCase().includes("questoes")
          ? `Aqui estão 3 questões de CTFL:\n\n**Q1 (K2):** Qual princípio afirma que testar tudo é inviável?\na) Teste mostra a presença de defeitos\nb) Teste exaustivo é impossível ✅\nc) Paradoxo do pesticida\nd) Ausência de defeitos é falácia\n\n**Q2 (K1):** O que significa CTFL?\na) Certified Test First Level\nb) Certified Tester Foundation Level ✅\nc) Complete Testing Framework Level\nd) Certified Testing Foundation License\n\n**Q3 (K2):** Stubs e drivers são usados em qual nível de teste?\na) Teste de sistema\nb) Teste de aceite\nc) Teste de integração ✅\nd) Teste de regressão\n\n📊 Responda e eu corrijo com explicações detalhadas!`
          : responses.default,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <AppLayout>
      <Seo
        title="Chat de Estudos IA | Anderson Academy"
        description="Tire dúvidas, peça questões personalizadas e revise conceitos do syllabus CTFL com um assistente de IA dedicado à certificação ISTQB."
        path="/chat"
      />
      <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-3rem)]">
        <h1 className="sr-only">Chat de Estudos IA</h1>
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="gradient-primary rounded-full p-2 h-8 w-8 flex items-center justify-center shrink-0 mt-1 shadow-glow">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "gradient-primary text-primary-foreground rounded-br-sm shadow-glow"
                      : "glass-card text-foreground rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="bg-white/10 rounded-full p-2 h-8 w-8 flex items-center justify-center shrink-0 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="gradient-primary rounded-full p-2 h-8 w-8 flex items-center justify-center shrink-0 shadow-glow">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="glass-card rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 px-8">
              {suggestions.map((s) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-2 text-xs rounded-xl glass border border-primary/20 text-primary hover:border-primary/40 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="h-3 w-3" />
                  {s}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border/50 p-4 glass">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2 max-w-3xl mx-auto"
          >
            <label htmlFor="chat-input" className="sr-only">Pergunte sobre CTFL</label>
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre CTFL..."
              aria-label="Pergunte sobre CTFL"
              className="flex-1 bg-white/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 placeholder:text-muted-foreground transition-all"
            />
            <motion.button
              type="submit"
              disabled={!input.trim() || isTyping}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Enviar mensagem"
              className="gradient-primary text-primary-foreground px-4 rounded-xl shadow-glow disabled:opacity-40 disabled:shadow-none transition-all"
            >
              <Send className="h-4 w-4" />
            </motion.button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
