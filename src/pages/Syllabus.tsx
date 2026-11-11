import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Route,
  FileText,
  BarChart3,
  Shield,
  Users,
  Settings,
  ChevronRight,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Seo from "@/components/Seo";

const syllabusChapters = [
  {
    id: 1,
    title: "Fundamentos de Teste",
    icon: GraduationCap,
    summary:
      "Conceitos essenciais sobre o que é teste de software, por que os testes são necessários, os sete princípios de teste e o processo de teste. Inclui papéis, atividades, testware e rastreabilidade.",
    k1: [
      "Objetivos típicos do teste",
      "Garantia da Qualidade (QA) e Teste",
      "Competências genéricas do testador",
    ],
    k2: [
      "Teste vs Depuração",
      "Contribuição do teste para o sucesso",
      "Erros, defeitos, falhas e causas-raiz",
      "Os 7 princípios de teste",
      "Atividades e tarefas de teste",
      "Processo de teste no contexto",
      "Testware e rastreabilidade",
      "Papéis no teste (Gerente vs Testador)",
      "Abordagem de equipe completa (Whole-Team)",
    ],
    k3: [],
  },
  {
    id: 2,
    title: "Teste no Ciclo de Vida de Desenvolvimento de Software",
    icon: Route,
    summary:
      "Como o teste se integra aos diferentes modelos de ciclo de vida, níveis de teste (componente, integração, sistema, aceite), tipos de teste e teste de manutenção. Aborda DevOps, shift-left e TDD.",
    k1: [
      "SDLC e boas práticas de teste",
      "Teste como direcionador do desenvolvimento (TDD, ATDD, BDD)",
    ],
    k2: [
      "Impacto do ciclo de vida no teste",
      "DevOps e teste",
      "Abordagem shift-left",
      "Retrospectivas e melhoria de processo",
      "Níveis de teste (componente, integração, sistema, aceite)",
      "Tipos de teste (funcional, não funcional, caixa-preta, caixa-branca)",
      "Teste de confirmação e regressão",
      "Teste de manutenção",
    ],
    k3: [],
  },
  {
    id: 3,
    title: "Teste Estático",
    icon: FileText,
    summary:
      "Técnicas de teste realizadas sem executar o código: revisões e análise estática. Inclui tipos de revisão, papéis, fatores de sucesso e o valor do feedback antecipado.",
    k1: [
      "Produtos de trabalho examinados",
      "Benefícios do feedback antecipado",
      "Papéis e responsabilidades nas revisões",
      "Fatores de sucesso para revisões",
    ],
    k2: [
      "Valor do teste estático",
      "Diferenças entre teste estático e dinâmico",
      "Processo de revisão",
      "Tipos de revisão (informal, walkthrough, técnica, inspeção)",
    ],
    k3: [],
  },
  {
    id: 4,
    title: "Análise e Modelagem de Teste",
    icon: BarChart3,
    summary:
      "Técnicas de teste caixa-preta (partição de equivalência, valor-limite, tabela de decisão, transição de estados), caixa-branca (cobertura de instrução e decisão) e baseadas na experiência (teste exploratório, suposição de erro, checklist).",
    k1: [],
    k2: [
      "Visão geral das técnicas de teste",
      "Teste de instrução e cobertura",
      "Teste de decisão e cobertura",
      "Valor do teste caixa-branca",
      "Suposição de erro",
      "Teste exploratório",
      "Teste baseado em checklist",
    ],
    k3: [
      "Partição de equivalência",
      "Análise de valor-limite",
      "Tabela de decisão",
      "Transição de estados",
    ],
  },
  {
    id: 5,
    title: "Gerenciamento das Atividades de Teste",
    icon: Settings,
    summary:
      "Planejamento, estimativa, monitoramento e controle dos testes. Inclui critérios de entrada e saída, priorização, pirâmide de teste, quadrantes, gerenciamento de riscos, métricas, relatórios, configuração e defeitos.",
    k1: [
      "Definição de risco e atributos",
      "Métricas de teste",
      "Priorização de casos de teste",
    ],
    k2: [
      "Objetivo e conteúdo do plano de teste",
      "Contribuição do testador para o planejamento",
      "Critérios de entrada e saída",
      "Técnicas de estimativa",
      "Pirâmide de teste",
      "Quadrantes de teste",
      "Riscos de projeto e riscos de produto",
      "Teste baseado em riscos",
      "Relatórios de teste",
      "Comunicação do status dos testes",
      "Gerenciamento de configuração",
      "Gerenciamento de defeitos",
    ],
    k3: [],
  },
  {
    id: 6,
    title: "Ferramentas de Teste",
    icon: Shield,
    summary:
      "Suporte que as ferramentas oferecem para as atividades de teste, benefícios e riscos da automação de testes, e critérios para seleção de ferramentas.",
    k1: [
      "Benefícios e riscos da automação",
    ],
    k2: [
      "Suporte de ferramentas para o teste",
    ],
    k3: [],
  },
];

const faqs = [
  {
    question: "O que é o Syllabus CTFL 4.0?",
    answer:
      "O Syllabus CTFL 4.0 é o documento oficial do ISTQB (International Software Testing Qualifications Board) que define o conteúdo programático para a certificação Certified Tester Foundation Level na versão 4.0. Ele organiza o conhecimento em 6 capítulos com objetivos de aprendizagem classificados nos níveis cognitivos K1 (lembrar), K2 (entender) e K3 (aplicar).",
  },
  {
    question: "Quais são os 6 capítulos do CTFL 4.0?",
    answer:
      "Os 6 capítulos do CTFL 4.0 são: 1) Fundamentos de Teste, 2) Teste no Ciclo de Vida de Desenvolvimento de Software, 3) Teste Estático, 4) Análise e Modelagem de Teste, 5) Gerenciamento das Atividades de Teste, e 6) Ferramentas de Teste.",
  },
  {
    question: "O que significam K1, K2 e K3 no CTFL?",
    answer:
      "K1, K2 e K3 são níveis cognitivos de aprendizagem definidos pelo ISTQB. K1 (Lembrar) exige reconhecimento e recordação de termos. K2 (Entender) exige explicação e comparação de conceitos. K3 (Aplicar) exige uso de técnicas para resolver problemas, como aplicar partição de equivalência ou análise de valor-limite.",
  },
  {
    question: "Onde posso estudar o conteúdo do CTFL 4.0?",
    answer:
      "Você pode estudar o conteúdo do CTFL 4.0 através das trilhas de estudo, simulados e chat com IA disponíveis nesta plataforma. As trilhas organizam o syllabus por capítulos e níveis cognitivos, permitindo estudo estruturado e acompanhamento de progresso.",
  },
];

export default function Syllabus() {
  return (
    <AppLayout>
      <Seo
        title="Syllabus CTFL 4.0 | Guia Estruturado de Estudo ISTQB"
        description="Guia do Syllabus CTFL 4.0 ISTQB: os 6 capítulos, objetivos K1/K2/K3 e técnicas de teste para estudar com foco na certificação."
        path="/syllabus"
      />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
          })),
        })}
      </script>

      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">
              Syllabus CTFL 4.0 — Guia de Estudo
            </h1>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            O <strong>Syllabus CTFL 4.0</strong> é o documento oficial do ISTQB que define o
            conteúdo da certificação <em>Certified Tester Foundation Level</em>. Abaixo você
            encontra um resumo estruturado dos 6 capítulos, com os objetivos de aprendizagem
            classificados por nível cognitivo{" "}
            <span className="text-primary font-medium">K1</span>,{" "}
            <span className="text-accent font-medium">K2</span> e{" "}
            <span className="text-warning font-medium">K3</span>.
          </p>
        </motion.div>

        {/* K-level legend */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 text-xs"
        >
          <span className="px-3 py-1.5 rounded-lg bg-primary/15 text-primary font-medium border border-primary/20">
            K1 — Lembrar
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent font-medium border border-accent/20">
            K2 — Entender
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-warning/15 text-warning font-medium border border-warning/20">
            K3 — Aplicar
          </span>
        </motion.div>

        {/* Chapters */}
        <div className="space-y-4">
          {syllabusChapters.map((chapter, i) => (
            <motion.section
              key={chapter.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="glass-card rounded-xl shadow-card overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <chapter.icon className="h-5 w-5 text-primary shrink-0" />
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Capítulo {chapter.id}: {chapter.title}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {chapter.summary}
                </p>

                <div className="space-y-3">
                  {chapter.k1.length > 0 && (
                    <div>
                      <h2 className="text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">
                        K1 — Lembrar
                      </h2>
                      <ul className="space-y-1">
                        {chapter.k1.map((item) => (
                          <li
                            key={item}
                            className="text-sm text-foreground/80 flex items-start gap-2"
                          >
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {chapter.k2.length > 0 && (
                    <div>
                      <h2 className="text-xs font-semibold text-accent mb-1.5 uppercase tracking-wide">
                        K2 — Entender
                      </h2>
                      <ul className="space-y-1">
                        {chapter.k2.map((item) => (
                          <li
                            key={item}
                            className="text-sm text-foreground/80 flex items-start gap-2"
                          >
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-accent shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {chapter.k3.length > 0 && (
                    <div>
                      <h2 className="text-xs font-semibold text-warning mb-1.5 uppercase tracking-wide">
                        K3 — Aplicar
                      </h2>
                      <ul className="space-y-1">
                        {chapter.k3.map((item) => (
                          <li
                            key={item}
                            className="text-sm text-foreground/80 flex items-start gap-2"
                          >
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-warning shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Link
                  to="/trilhas"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  Ir para trilha de estudo deste capítulo
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.section>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-xl p-6 text-center space-y-3"
        >
          <h2 className="font-display text-lg font-semibold text-foreground">
            Comece a estudar agora
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Acesse as trilhas de estudo com questões práticas, simulados completos e suporte
            da IA para tirar dúvidas sobre qualquer tópico do syllabus.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/trilhas"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition-opacity"
            >
              <Route className="h-4 w-4" />
              Trilhas de Estudo
            </Link>
            <Link
              to="/simulados"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-border/50 text-foreground text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Simulados
            </Link>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="space-y-4"
        >
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Perguntas Frequentes sobre o CTFL 4.0
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-4 border border-border/30"
              >
                <h3 className="font-medium text-foreground text-sm mb-1">
                  {faq.question}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
