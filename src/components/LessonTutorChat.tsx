import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuestionText from "@/components/QuestionText";
import { supabase } from "@/integrations/supabase/client";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  lessonTitle: string;
  lessonContent?: string;
  /** Questão que o aluno errou — o tutor já abre focado nela */
  missedQuestion?: string | null;
  suggestions?: string[];
}

/** Tutor de IA em tempo real, ancorado no conteúdo da etapa atual. */
export default function LessonTutorChat({ lessonTitle, lessonContent, missedQuestion, suggestions }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const ask = async (text: string) => {
    const question = text.trim();
    if (!question || sending) return;
    setInput("");
    setError(null);
    const history = messages.slice(-8);
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setSending(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("lesson-tutor", {
        body: {
          question,
          lessonTitle,
          lessonContent: lessonContent?.slice(0, 8000) ?? "",
          missedQuestion: missedQuestion ?? "",
          history,
        },
      });
      const answer = (data as any)?.answer as string | undefined;
      if (fnError || !answer) throw new Error((data as any)?.error ?? "Não consegui responder agora. Tente novamente.");
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao consultar o tutor.");
    } finally {
      setSending(false);
    }
  };

  const chips = suggestions ?? [
    "Explique este conteúdo com um exemplo prático",
    "Qual é o erro mais comum nesse tema?",
    "Me dê um resumo em 5 pontos",
  ];

  return (
    <section className="glass-card card-modern rounded-2xl p-5 space-y-3">
      <header className="flex items-center gap-2">
        <div className="gradient-primary rounded-xl p-2 shadow-glow">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-foreground">Tutor de IA em tempo real</h2>
          <p className="text-xs text-muted-foreground">Dúvidas sobre esta etapa, correções e explicações instantâneas.</p>
        </div>
      </header>

      {missedQuestion && (
        <p className="text-xs text-warning border-l-2 border-warning/50 pl-3">
          Detectei uma questão errada nesta etapa — pergunte "por que eu errei?" e explico o raciocínio.
        </p>
      )}

      <div ref={scrollRef} className="max-h-80 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            Pergunte qualquer coisa sobre <span className="text-foreground font-medium">{lessonTitle}</span>.
          </p>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={`${i}-${m.role}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : ""}`}
            >
              {m.role === "assistant" && <Bot className="h-4 w-4 text-primary mt-1 shrink-0" />}
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-sm max-w-[85%] ${
                  m.role === "user"
                    ? "gradient-primary text-primary-foreground"
                    : "bg-white/5 border border-border/40 text-foreground/90"
                }`}
              >
                {m.role === "assistant" ? <QuestionText>{m.content}</QuestionText> : m.content}
              </div>
              {m.role === "user" && <User className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />}
            </motion.div>
          ))}
        </AnimatePresence>
        {sending && (
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> o tutor está pensando...
          </p>
        )}
      </div>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => ask(c)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escreva sua dúvida..."
          aria-label="Pergunta para o tutor de IA"
          className="flex-1 bg-white/5 border border-border/40 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <Button type="submit" disabled={sending || !input.trim()} className="gradient-primary text-primary-foreground" aria-label="Enviar pergunta">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </section>
  );
}
