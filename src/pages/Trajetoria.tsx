import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,

  CalendarClock,
  Brain,
  CheckCircle2,
  ChevronDown,
  FileText,
  Lock,
  MessageCircle,
  PlayCircle,
  Shield,
  Sparkles,
  Route,
  Target,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Seo from "@/components/Seo";
import ProgressBar from "@/components/ProgressBar";
import StudyDoc from "@/components/StudyDoc";
import LessonExtrasPanel from "@/components/LessonExtrasPanel";
import LessonExam from "@/components/LessonExam";
import AutomationDiagram from "@/components/AutomationDiagram";

import CodeSandbox from "@/components/CodeSandbox";
import CourseSidebar from "@/components/CourseSidebar";
import StepPager, { type PagerStep } from "@/components/StepPager";
import LessonVideoPlayer from "@/components/LessonVideoPlayer";
import LessonTutorChat from "@/components/LessonTutorChat";
import ProtectedPdfViewer from "@/components/ProtectedPdfViewer";
import EnvironmentSetup from "@/components/EnvironmentSetup";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { allLessons, COURSE_META, modules, type Lesson } from "@/data/automation-course";
import { useAutomationProgress, isLessonComplete } from "@/hooks/useAutomationProgress";
import { TRACK_THEMES } from "@/data/track-themes";
import { getLessonExtras, EXAM_PASS_SCORE } from "@/data/lesson-extras";
import { useDevMode } from "@/hooks/useDevMode";
import ModuleQuiz, { MAX_QUIZ_ATTEMPTS } from "@/components/ModuleQuiz";
import { toast } from "sonner";


export default function Trajetoria() {
  const theme = TRACK_THEMES.automacao;
  const devMode = useDevMode();
  const [params, setParams] = useSearchParams();
  const {
    progress,
    logActivity,
    upsert,
    saveDraft,
    markVideoWatched,
    saveVideoPosition,
    markPdfOpened,
    saveExamResult,

    nextPendingLesson,
    isUnlocked,
    completedCount,
    total,
    percent,
    loading,
  } = useAutomationProgress();

  const [currentId, setCurrentId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [missedQuestion, setMissedQuestion] = useState<string | null>(null);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  // Retomada: abre a aula/página da URL ou a próxima pendente
  useEffect(() => {
    if (loading || currentId) return;
    const requested = params.get("lesson");
    const lesson = (requested && allLessons.find((l) => l.id === requested)) || nextPendingLesson();
    if (!lesson) return;
    const requestedStep = Number(params.get("step") ?? 1);
    selectLesson(lesson, false, Number.isFinite(requestedStep) ? Math.max(1, requestedStep) - 1 : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const current = useMemo(() => allLessons.find((l) => l.id === currentId) ?? null, [currentId]);
  const row = current ? progress[current.id] : undefined;

  const selectLesson = (lesson: Lesson, log = true, initialStep = 0) => {
    setCurrentId(lesson.id);
    setStep(initialStep);
    setParams({ lesson: lesson.id, step: String(initialStep + 1) }, { replace: true });
    setAnswers((progress[lesson.id]?.quiz_draft as Record<number, number>) ?? {});
    setQuizResult(null);
    setMissedQuestion(null);
    setTutorOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (log) logActivity("aula_aberta", lesson.id);
  };

  const goToStep = (index: number) => {
    setStep(index);
    if (currentId) setParams({ lesson: currentId, step: String(index + 1) }, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitQuiz = async () => {
    if (!current) return;
    const wrong = current.quiz.filter((q, i) => answers[i] !== q.answer);
    const correct = current.quiz.length - wrong.length;
    const score = Math.round((correct / current.quiz.length) * 100);
    const passed = score >= 70;
    setQuizResult({ score, passed });
    setMissedQuestion(
      wrong.length
        ? `${wrong[0].question}\nAlternativas: ${wrong[0].options.join(" | ")}\nResposta correta: ${wrong[0].options[wrong[0].answer]}`
        : null
    );
    if (wrong.length) setTutorOpen(true);
    await upsert(current.id, { quiz_passed: passed, quiz_score: score });
    await logActivity(passed ? "quiz_aprovado" : "quiz_reprovado", current.id);
  };

  const seo = (
    <>
      <Seo
        title="Trajetória guiada de Automação de Testes"
        description="Jornada paginada: vídeo-aula, material complementar, questionário de liberação, exercício avaliado e tutor de IA em tempo real."
        path="/trajetoria"
      />
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
    </>
  );

  if (!current) {
    return (
      <AppLayout>
        {seo}
        <div className="p-6 text-sm text-muted-foreground">Carregando sua trajetória...</div>
      </AppLayout>
    );
  }

  const done = isLessonComplete(current, row);
  const videoDone = !!row?.video_watched_at;
  const quizDone = !!row?.quiz_passed;
  const exerciseDone = !current.exercise || !!row?.code_submitted;
  const idx = allLessons.findIndex((l) => l.id === current.id);
  const moduleIndex = Math.max(0, Number(current.id.match(/^m(\d+)/)?.[1] ?? 1) - 1);
  const currentModule = modules[moduleIndex];
  const nextLesson = allLessons[idx + 1];
  const prevLesson = allLessons[idx - 1];

  const extras = getLessonExtras(current.id);
  const examDone = !!row?.exam_passed;

  const quizMeta = (row?.quiz_draft ?? {}) as Record<string, number>;
  const quizAttempts = quizMeta.__attempts ?? 0;
  const quizLocked = !devMode && quizMeta.__locked === 1;

  // Acesso livre: todas as etapas abertas para navegação.
  const steps: PagerStep[] = [
    { key: "video", label: "Vídeo-aula", short: "Vídeo", done: videoDone, unlocked: true },
    { key: "material", label: "Material complementar", short: "Material", done: !!row?.pdf_opened_at, unlocked: true },
    { key: "quiz", label: "Questionário adaptativo", short: "Questionário", done: quizDone, unlocked: true },
  ];
  if (current.exercise) {
    steps.push({ key: "exercise", label: "Exercício avaliado", short: "Exercício", done: !!row?.code_submitted, unlocked: true });
  }
  if (extras?.exam?.length) {
    steps.push({ key: "exam", label: "Prova final da aula", short: "Prova final", done: examDone, unlocked: true });
  }

  const clearQuizLock = async () => {
    if (!current || quizMeta.__locked !== 1) return;
    await upsert(current.id, { quiz_draft: { __attempts: 0 } as Record<string, number> });
    toast.success("Questionário liberado novamente", { description: "Bom reestudo! Você tem 3 novas tentativas." });
  };

  const finishModuleQuiz = async (score: number, passed: boolean) => {
    if (!current) return;
    if (passed) {
      await upsert(current.id, { quiz_passed: true, quiz_score: score, quiz_draft: { __attempts: 0 } as Record<string, number> });
      await logActivity("quiz_aprovado", current.id);
      return;
    }
    const attempts = quizAttempts + 1;
    await logActivity("quiz_reprovado", current.id);
    if (attempts < MAX_QUIZ_ATTEMPTS) {
      await upsert(current.id, { quiz_score: score, quiz_draft: { __attempts: attempts } as Record<string, number> });
      return;
    }
    // 3ª reprovação: zera o progresso de todas as aulas do módulo e bloqueia o questionário para reestudo.
    const prefix = current.id.match(/^m\d+/)?.[0] ?? "";
    const moduleLessons = allLessons.filter((l) => l.id.startsWith(`${prefix}-`));
    for (const l of moduleLessons) {
      await upsert(l.id, {
        quiz_passed: false,
        quiz_score: 0,
        quiz_draft: (l.id === current.id ? { __attempts: attempts, __locked: 1 } : {}) as Record<string, number>,
        video_watched_at: null,
        video_position_seconds: 0,
        pdf_opened_at: null,
        code_submitted: null,
        exam_passed: false,
        exam_score: 0,
        completed_at: null,
      });
    }
    await logActivity("modulo_reiniciado", current.id);
    toast.warning("Tentativas esgotadas", { description: "O progresso do módulo foi reiniciado. Revise o conteúdo para tentar de novo." });
  };



  const activeStep = Math.min(step, steps.length - 1);
  const activeKey = steps[activeStep].key;

  const goPrevLesson =
    prevLesson
      ? () => selectLesson(prevLesson, true, 0)
      : undefined;
  const goNextLesson =
    nextLesson ? () => selectLesson(nextLesson, true, 0) : undefined;

  return (
    <AppLayout>
      {seo}
      <div className={`${theme.themeClass} min-h-screen bg-background font-body text-foreground`}>
        <div className="mx-auto max-w-[1440px] px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-7 flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-end md:justify-between"
        >
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <Route className="h-4 w-4" /> Módulo {moduleIndex + 1} · {currentModule?.title ?? COURSE_META.title}
            </div>
            <h1 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
              {current.title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1 text-primary">Aula {idx + 1} de {total}</span>
              <span className="rounded-lg border border-border bg-card/60 px-2.5 py-1 text-muted-foreground">{current.duration}</span>
              <span className="flex items-center gap-1 rounded-lg border border-warning/25 bg-warning/10 px-2.5 py-1 text-warning">
                <CalendarClock className="h-3.5 w-3.5" /> Semana {current.deadlineWeek}
              </span>
              {done && <span className="rounded-lg border border-success/25 bg-success/10 px-2.5 py-1 text-success">Concluída</span>}
            </div>
          </div>
          <div className="glass-card w-full rounded-3xl p-4 md:w-[440px] flex items-stretch gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso do curso</span>
                <span className="font-display font-bold text-success">{percent}%</span>
              </div>
              <ProgressBar value={percent} variant="success" />
              <p className="text-[11px] text-muted-foreground">{completedCount} de {total} aulas concluídas</p>
            </div>
            <div className="w-px bg-border" aria-hidden="true" />
            <div className="w-32 shrink-0 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Conclusão da etapa</span>
              </div>
              {(() => {
                const reqs = [videoDone, quizDone, ...(current.exercise ? [exerciseDone] : []), ...(extras?.exam?.length ? [examDone] : [])];
                const ok = reqs.filter(Boolean).length;
                return (
                  <>
                    <ProgressBar value={(ok / reqs.length) * 100} variant="success" />
                    <p className="text-[11px] text-muted-foreground">{done ? "Etapa concluída" : `${ok} de ${reqs.length} itens`}</p>
                  </>
                );
              })()}
            </div>
          </div>
        </motion.header>

        <motion.nav
          aria-label="Simuladores da aula"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="mb-6 grid gap-3 sm:grid-cols-3"
        >
          {[
            { to: `/pratica-digitacao?lesson=${current.id}`, icon: PlayCircle, title: "Digitar junto com a aula", desc: "Vídeo de um lado, código do outro" },
            { to: `/laboratorio-java?exercise=${current.id}`, icon: Sparkles, title: "Laboratório Java", desc: "Execute e valide o exercício desta aula" },
            { to: "/simulados", icon: Target, title: "Simulador CTFL", desc: "Provas no estilo da certificação" },
          ].map((s) => (
            <Link
              key={s.title}
              to={s.to}
              className="group flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary/15"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary transition-transform group-hover:scale-110">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </motion.nav>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-8">
        <main className="min-w-0 space-y-6">
        <section aria-label="Objetivos da aula" className="grid gap-3 sm:grid-cols-3">
          {current.video.checkpoints.slice(0, 3).map((checkpoint, checkpointIndex) => (
            <motion.div
              key={checkpoint}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: checkpointIndex * 0.06 }}
              className="rounded-xl border border-border bg-card/45 p-4 transition-colors duration-300 hover:border-primary/45"
            >
              <div className="mb-3 grid h-8 w-8 place-items-center rounded-lg bg-primary/15 font-display text-xs font-bold text-primary">
                K{Math.min(checkpointIndex + 1, 3)}
              </div>
              <p className="mb-1 font-display text-xs font-semibold text-foreground">
                {checkpointIndex === 0 ? "Conhecimento" : checkpointIndex === 1 ? "Compreensão" : "Aplicação"}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">{checkpoint}</p>
            </motion.div>
          ))}
        </section>

        {extras?.keyPoints[0] && (
          <section className="rounded-r-2xl border border-l-4 border-success/30 border-l-success bg-success/[0.07] p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-success/15 text-success">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xs font-bold uppercase tracking-widest text-success">Ponto para memorizar</h2>
                <p className="mt-1 text-sm leading-relaxed text-foreground/85">{extras.keyPoints[0]}</p>
              </div>
            </div>
          </section>
        )}

        <StepPager
          steps={steps}
          current={activeStep}
          onChange={goToStep}
          onPrevLesson={goPrevLesson}
          onNextLesson={goNextLesson}
          nextLessonLabel={nextLesson ? "Ir para a próxima aula" : undefined}
        />

        <motion.div key={`${current.id}-${activeKey}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.34, ease: "easeOut" }} className="space-y-5">
          {activeKey === "video" && (
            <>
              <StepHeading n={1} icon={PlayCircle} label="Vídeo-aula" hint="Assista em tela cheia para melhor foco." done={videoDone} />
              <button
                onClick={() => setVideoOpen(true)}
                className="group w-full rounded-2xl border border-border bg-card/55 p-8 shadow-card flex flex-col items-center gap-3 hover:border-primary/60 transition-colors"
              >
                <PlayCircle className="h-14 w-14 text-primary transition-transform group-hover:scale-110" />
                <span className="font-display font-semibold text-foreground">{current.video.title}</span>
                <span className="text-xs text-muted-foreground">Abrir reprodutor dedicado</span>
              </button>
              <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
                <DialogContent className="max-w-5xl w-[96vw] p-3 sm:p-4">
                  <DialogTitle className="sr-only">{current.video.title}</DialogTitle>
              <LessonVideoPlayer
                    lessonId={current.id}
                    title={current.video.title}
                    summary={current.video.summary}
                    startAt={row?.video_position_seconds ?? 0}
                    watched={videoDone}
                    onFinished={async () => {
                      await clearQuizLock();
                      await markVideoWatched(current.id);
                      await logActivity("video_assistido", current.id);
                    }}
                    onPositionChange={(seconds) => saveVideoPosition(current.id, seconds)}
                  />
                </DialogContent>
              </Dialog>
            </>
          )}

          {activeKey === "material" && (
            <>
              <StepHeading n={2} icon={FileText} label="Material complementar" hint="Leitura de apoio e arquivos do módulo." done={!!row?.pdf_opened_at} />
              {true ? (
                <>
                  <ProtectedPdfViewer
                    lessonId={current.id}
                    title={current.title}
                    content={current.content}
                    onOpened={() => {
                      clearQuizLock();
                      markPdfOpened(current.id);
                      logActivity("material_aberto", current.id);
                    }}
                  />
                  <section className="rounded-2xl border border-border bg-card/55 p-4 shadow-card sm:p-6">
                    <AutomationDiagram diagram={current.diagram} />
                    <StudyDoc>{current.content}</StudyDoc>
                  </section>
                  {extras && <LessonExtrasPanel extras={extras} />}

                  <EnvironmentSetup />
                  <p className="text-xs text-muted-foreground">
                    Quer estudar offline? Baixe as apostilas na{" "}
                    <Link to="/materiais" className="text-primary hover:underline">
                      área de materiais
                    </Link>
                    .
                  </p>
                </>
              ) : (
                <LockedStep label="Material complementar" hint="Assista à vídeo-aula para liberar a apostila e a leitura de apoio." />
              )}
            </>
          )}

          {activeKey === "quiz" && (
            <>
              <StepHeading n={3} icon={Shield} label="Questionário adaptativo" hint="Escolha o nível · aprovação mínima de 75% · até 3 tentativas." done={quizDone} />
              <ModuleQuiz passed={quizDone} lastScore={row?.quiz_score ?? 0} attempts={quizAttempts} locked={quizLocked} onFinish={finishModuleQuiz} />
            </>
          )}

          {activeKey === "exercise" && current.exercise && (
            <>
              <StepHeading n={4} icon={Sparkles} label="Exercício avaliado" hint="Valide seu código com os casos de teste antes de enviar." done={!!row?.code_submitted} />
              {true ? (
                <CodeSandbox
                  exercise={current.exercise}
                  initialCode={row?.code_submitted}
                  draft={row?.code_draft}
                  draftSavedAt={row?.code_draft_updated_at}
                  submitted={!!row?.code_submitted}
                  onSubmit={async (code) => {
                    await upsert(current.id, { code_submitted: code, submitted_at: new Date().toISOString() });
                    await logActivity("codigo_enviado", current.id);
                  }}
                  onSaveDraft={(code) => saveDraft(current.id, { code_draft: code })}
                />
              ) : (
                <LockedStep label="Exercício avaliado" hint="Aprove o questionário com 70% ou mais para liberar o exercício." />
              )}
            </>
          )}

          {activeKey === "exam" && extras?.exam?.length && (
            <>
              <StepHeading
                n={steps.length}
                icon={Award}
                label="Prova final da aula"
                hint={`Aproveitamento mínimo de ${EXAM_PASS_SCORE}% para avançar para a próxima etapa.`}
                done={examDone}
              />
              {true ? (
                <>
                  {extras && <LessonExtrasPanel extras={extras} />}
                  <LessonExam
                    exam={extras.exam}
                    passed={examDone}
                    lastScore={row?.exam_score ?? 0}
                    attempts={row?.exam_attempts ?? 0}
                    onWrongAnswer={(info) => {
                      setMissedQuestion(info);
                      setTutorOpen(true);
                    }}
                    onFinish={async (score, passed) => {
                      await saveExamResult(current.id, score, passed);
                      await logActivity(passed ? "prova_aprovada" : "prova_reprovada", current.id);
                    }}
                  />
                </>
              ) : (
                <LockedStep
                  label="Prova final da aula"
                  hint={
                    current.exercise
                      ? "Aprove o questionário e envie o exercício avaliado para liberar a prova final."
                      : "Aprove o questionário para liberar a prova final."
                  }
                />
              )}
            </>
          )}

        </motion.div>

        {/* Navegação inferior */}
        <StepPager
          steps={steps}
          current={activeStep}
          onChange={goToStep}
          onPrevLesson={goPrevLesson}
          onNextLesson={goNextLesson}
          nextLessonLabel={nextLesson ? "Ir para a próxima aula" : undefined}
        />

        {/* Tutor de IA — disponível em todas as páginas */}
        <section className="rounded-2xl border border-border bg-card/45 overflow-hidden backdrop-blur-xl">
          <button
            onClick={() => setTutorOpen((v) => !v)}
            aria-expanded={tutorOpen}
            className="w-full min-h-[48px] flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MessageCircle className="h-4 w-4 text-primary" /> Tutor de IA em tempo real
            </span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${tutorOpen ? "rotate-180" : ""}`} />
          </button>
          {tutorOpen && (
            <div className="border-t border-border/40 p-3 sm:p-4">
              <LessonTutorChat
                lessonTitle={current.title}
                lessonContent={current.content}
                missedQuestion={missedQuestion}
                suggestions={
                  missedQuestion
                    ? ["Por que eu errei essa questão?", "Explique o conceito com um exemplo prático", "Como memorizar isso?"]
                    : undefined
                }
              />
            </div>
          )}
        </section>

        {/* Conclusão da etapa */}
        <section className="rounded-2xl border border-border bg-card/45 p-4 sm:p-5 space-y-3">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Conclusão da etapa</h2>
          <ul className="space-y-1.5 text-sm">
            <Requirement ok={videoDone} label="Vídeo-aula assistida" />
            <Requirement ok={quizDone} label="Questionário aprovado (mínimo 75%)" />
            {current.exercise && <Requirement ok={exerciseDone} label="Exercício enviado e validado" />}
            {!!extras?.exam?.length && <Requirement ok={examDone} label={`Prova final aprovada (mínimo ${EXAM_PASS_SCORE}%)`} />}

          </ul>
          {done ? (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-sm text-success flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" /> Etapa concluída
              </span>
              {nextLesson ? (
                <Button onClick={() => selectLesson(nextLesson, true, 0)} className="min-h-[44px] gradient-primary text-primary-foreground shadow-glow">
                  Avançar para a próxima etapa <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              ) : (
                <Link to="/automacao" className="text-sm text-primary hover:underline">
                  Ver acompanhamento completo do curso
                </Link>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Complete os itens acima para liberar a próxima etapa. Etapas já concluídas continuam disponíveis para revisão.
            </p>
          )}
        </section>
        </main>
        <aside className="order-last">
          <CourseSidebar
            currentId={current.id}
            isComplete={(lesson) => isLessonComplete(lesson, progress[lesson.id])}
            isUnlocked={() => true}
            onSelect={(lesson) => selectLesson(lesson)}
            percent={percent}
          />
        </aside>
        </div>
        </div>
      </div>

    </AppLayout>
  );
}

function StepHeading({
  n,
  icon: Icon,
  label,
  hint,
  done,
}: {
  n: number;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  done: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`h-8 w-8 rounded-full grid place-items-center text-xs font-semibold shrink-0 ${
          done ? "bg-success text-success-foreground" : "gradient-primary text-primary-foreground"
        }`}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : n}
      </span>
      <div className="min-w-0">
        <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" /> Etapa {n} — {label}
        </h2>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

function Requirement({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-2 ${ok ? "text-success" : "text-muted-foreground"}`}>
      {ok ? <CheckCircle2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />} {label}
    </li>
  );
}

function LockedStep({ label, hint }: { label: string; hint: string }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/35 p-5 flex items-start gap-3">
      <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
      <div>
        <h3 className="font-display font-semibold text-muted-foreground">{label}</h3>
        <p className="text-xs text-muted-foreground/80 mt-0.5">{hint}</p>
      </div>
    </section>
  );
}
