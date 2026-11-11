import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Timer, Route, BarChart3, Code2, MessageSquare, ChevronRight, CheckCircle2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";

const tools = [
  { icon: BookOpen, title: "Conteúdo do Syllabus CTFL 4.0", text: "Os 6 capítulos do Syllabus ISTQB organizados com objetivos de aprendizagem nos níveis K1, K2 e K3." },
  { icon: Timer, title: "Simulados com tempo", text: "Modos Rápido, Médio, Simulado e Maratona, com filtros por capítulo, cronômetro e histórico de tentativas." },
  { icon: Route, title: "Trilhas de estudo por capítulo", text: "Percurso guiado capítulo a capítulo, com acompanhamento do seu progresso." },
  { icon: BarChart3, title: "Painel de desempenho", text: "Gráficos e radar por capítulo para mostrar onde você acerta mais e o que precisa revisar." },
  { icon: MessageSquare, title: "Assistente de estudo com IA", text: "Tire dúvidas sobre os conceitos do Syllabus enquanto estuda." },
  { icon: Code2, title: "Curso de Automação de Testes", text: "Videoaulas, questionários por nível e laboratório Java com Selenium, Cucumber e JUnit 5." },
];

const steps = [
  "Crie sua conta gratuita na página de entrada.",
  "Comece pelo Syllabus e pelas trilhas de cada capítulo.",
  "Treine com simulados e acompanhe sua evolução no painel.",
];

export default function PreparacaoCtfl() {
  return (
    <AppLayout>
      <Seo
        title="Preparação para a certificação CTFL 4.0 | Simulados e trilhas ISTQB"
        description="Estude para a certificação ISTQB CTFL 4.0 com conteúdo dos 6 capítulos do Syllabus, simulados com tempo, trilhas guiadas e painel de desempenho."
        path="/preparacao-ctfl"
      />
      <div className="p-6 max-w-4xl mx-auto space-y-10">
        <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Preparação para a certificação ISTQB CTFL 4.0
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            A <strong>Anderson Academy</strong> é uma plataforma de estudos para quem vai prestar o exame
            <em> Certified Tester Foundation Level</em> (CTFL), versão 4.0 do Syllabus ISTQB. Você estuda o
            conteúdo oficial por capítulo, pratica com simulados e acompanha sua evolução até se sentir pronto.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/">Criar conta grátis</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/syllabus">Ver o guia do Syllabus</Link></Button>
          </div>
        </motion.header>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">O que você encontra na plataforma</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {tools.map(({ icon: Icon, title, text }, i) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="glass-card rounded-xl border border-border p-5 space-y-2"
              >
                <Icon className="h-6 w-6 text-primary" aria-hidden />
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">Como começar</h2>
          <ol className="space-y-3">
            {steps.map((s) => (
              <li key={s} className="flex gap-3 text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <Link to="/" className="inline-flex items-center gap-1 text-primary font-medium hover:underline">
            Entrar ou criar conta <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>
      </div>
    </AppLayout>
  );
}
