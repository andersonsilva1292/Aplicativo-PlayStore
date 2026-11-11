import { Bot, GraduationCap, type LucideIcon } from "lucide-react";

export type TrackId = "ctfl" | "automacao";

export interface TrackTheme {
  id: TrackId;
  /** Classe que troca os tokens semânticos de cor da página */
  themeClass: string;
  icon: LucideIcon;
  badge: string;
  name: string;
  headlineTop: string;
  headlineBottom: string;
  tagline: string;
  description: string;
  bullets: string[];
  /** Destino do botão "Iniciar Trajetória" quando não há retomada específica */
  startPath: string;
  benefits: { title: string; text: string }[];
}

export const TRACK_THEMES: Record<TrackId, TrackTheme> = {
  ctfl: {
    id: "ctfl",
    themeClass: "track-ctfl",
    icon: GraduationCap,
    badge: "Syllabus v4.0 · ISTQB",
    name: "Estudo CTFL",
    headlineTop: "Certificação CTFL",
    headlineBottom: "do fundamento à aprovação",
    tagline: "Preparatório completo para o Foundation Level",
    description:
      "Simulados cronometrados, trilhas por capítulo, relatórios de desempenho e assistente de IA alinhados ao syllabus CTFL 4.0.",
    bullets: ["1.000+ questões comentadas", "Trilhas K1 · K2 · K3", "Probabilidade de aprovação"],
    startPath: "/trilhas",
    benefits: [
      { title: "Explicação em cada questão", text: "Feedback imediato com fundamentação do syllabus, tabelas e diagramas nas questões K2 e K3." },
      { title: "Desempenho em tempo real", text: "Radar por capítulo, evolução por nível cognitivo e cálculo da probabilidade de aprovação." },
      { title: "Simulado oficial simulado", text: "Modos rápido, médio, simulado e maratona com controle de tempo, pausa e revisão das respostas." },
      { title: "Revisão inteligente", text: "Veja quais questões do banco ainda não foram praticadas e treine só o que falta." },
      { title: "Assistente de estudo por IA", text: "Tire dúvidas do syllabus a qualquer hora, com linguagem adaptada ao seu nível." },
      { title: "Privacidade por padrão", text: "Dados isolados por usuário conforme a LGPD, com exclusão definitiva da conta quando você quiser." },
    ],
  },
  automacao: {
    id: "automacao",
    themeClass: "track-automacao",
    icon: Bot,
    badge: "6 meses · Anderson Santos",
    name: "Curso de Automação de Testes",
    headlineTop: "Automação de Testes",
    headlineBottom: "construa o framework Central Automation",
    tagline: "Engenharia de automação na prática, etapa por etapa",
    description:
      "Trajetória guiada com vídeo-aula narrada, material complementar em PDF, questionário de liberação e sandbox de código validado por casos de teste.",
    bullets: ["Vídeo-aulas com narração e slides", "Material em PDF exclusivo", "Liberação progressiva por etapa"],
    startPath: "/trajetoria",
    benefits: [
      { title: "Vídeo-aula narrada", text: "Slides sincronizados com narração passo a passo, com retomada do ponto onde você parou." },
      { title: "Material em PDF protegido", text: "Apostila da etapa gerada para você, com leitura exclusiva dentro da plataforma." },
      { title: "Correção automática de código", text: "Cada exercício roda uma bateria de casos de teste e mostra esperado x encontrado e a linha do erro." },
      { title: "Trajetória progressiva", text: "Uma etapa por vez: concluir a atual libera a próxima, e você pode revisar as anteriores livremente." },
      { title: "Rotina acompanhada", text: "Mapa de atividade diária, prazos semanais e progresso salvo automaticamente na sua conta." },
      { title: "Prática livre ilimitada", text: "Playground que executa código de verdade no navegador com asserções e relatório de testes." },
    ],
  },
};

export const TRACK_LIST = [TRACK_THEMES.ctfl, TRACK_THEMES.automacao];
