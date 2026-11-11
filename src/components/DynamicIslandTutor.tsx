import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import LessonTutorChat from "@/components/LessonTutorChat";

const spring = { type: "spring" as const, stiffness: 420, damping: 32, mass: 0.9 };

/**
 * Tutor de IA no topo, no estilo Dynamic Island: uma pílula com avatar
 * que se expande suavemente numa janela de conversa em tempo real.
 */
export default function DynamicIslandTutor() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div className="absolute top-1.5 sm:top-2 left-1/2 -translate-x-1/2 z-50 flex justify-center pointer-events-none">
        <motion.div
          layout
          transition={spring}
          className="pointer-events-auto glass shadow-elevated overflow-hidden"
          style={{ borderRadius: open ? 28 : 999 }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {!open ? (
              <motion.button
                key="pill"
                layout
                onClick={() => setOpen(true)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={spring}
                className="group flex items-center gap-2 pl-1.5 pr-3.5 py-1.5"
                aria-label="Abrir o Tutor de IA"
                title="Toque para conversar com o Tutor de IA"
              >
                <span className="ios-icon ios-icon-primary h-7 w-7">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </span>
                <span className="hidden md:inline text-xs font-semibold text-foreground">Tutor IA</span>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
              </motion.button>
            ) : (
              <motion.div
                key="panel"
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={spring}
                className="w-[min(94vw,440px)] max-h-[80dvh] overflow-y-auto p-3"
                role="dialog"
                aria-label="Tutor de IA"
              >
                <div className="flex justify-end">
                  <button
                    onClick={() => setOpen(false)}
                    className="ios-icon h-8 w-8"
                    aria-label="Fechar o Tutor de IA"
                  >
                    <X className="h-4 w-4 text-foreground" />
                  </button>
                </div>
                <LessonTutorChat
                  lessonTitle="Anderson Academy — dúvidas gerais (CTFL 4.0 e Automação de Testes)"
                  suggestions={[
                    "Explique os 7 princípios de teste",
                    "Como funciona uma espera explícita no Selenium?",
                    "Monte um plano de estudo para esta semana",
                  ]}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
