import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let deferred: BIPEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BIPEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    listeners.forEach((l) => l());
  });
}

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  (navigator as unknown as { standalone?: boolean }).standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

/** Botão "Instalar aplicativo": abre o instalador do sistema em 1 clique ou mostra o passo a passo no iPhone. */
export default function InstallAppButton() {
  const [, force] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);

  if (isStandalone()) return null;

  const onClick = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      deferred = null;
      force((n) => n + 1);
    } else {
      setShowHelp(true);
    }
  };

  return (
    <>
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-[11px] sm:text-xs font-medium text-primary hover:bg-primary/20 transition-colors min-h-9"
        aria-label="Instalar aplicativo"
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Instalar app</span>
      </button>

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="Como instalar o aplicativo">
          <div className="glass relative w-full max-w-sm rounded-2xl border border-border/50 p-6 space-y-3">
            <button onClick={() => setShowHelp(false)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" aria-label="Fechar">
              <X className="h-5 w-5" />
            </button>
            <h2 className="font-display text-lg font-bold">Instalar o Anderson Academy</h2>
            {isIOS() ? (
              <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1.5">
                <li>Abra este site no Safari.</li>
                <li>Toque em <Share className="inline h-4 w-4" /> Compartilhar.</li>
                <li>Escolha "Adicionar à Tela de Início".</li>
              </ol>
            ) : (
              <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1.5">
                <li>Use Chrome ou Edge, no site publicado.</li>
                <li>Clique no ícone de instalar na barra de endereço, ou no menu ⋮ → "Instalar app".</li>
              </ol>
            )}
          </div>
        </div>
      )}
    </>
  );
}
