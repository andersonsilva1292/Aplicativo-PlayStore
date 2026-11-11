import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, Loader2, AlertTriangle, ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { buildLessonPdf, isLessonMaterial } from "@/lib/lesson-pdf";

interface Props {
  lessonId: string;
  title: string;
  content?: string;
  onOpened?: () => void;
}

/**
 * Material complementar em PDF com leitura exclusiva na plataforma:
 * o arquivo é renderizado em canvas via pdf.js, sem link de download,
 * sem barra de ferramentas do navegador e com bloqueio de impressão.
 */
export default function ProtectedPdfViewer({ lessonId, title, content, onOpened }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const docRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [subtitle, setSubtitle] = useState<string | null>(null);

  const renderPage = useCallback(async (pageNumber: number) => {
    const pdf = docRef.current;
    const canvas = canvasRef.current;
    if (!pdf || !canvas) return;
    const pdfPage = await pdf.getPage(pageNumber);
    const parentWidth = canvas.parentElement?.clientWidth ?? 720;
    const base = pdfPage.getViewport({ scale: 1 });
    const scale = Math.min(2, parentWidth / base.width);
    const viewport = pdfPage.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    await pdfPage.render({ canvasContext: ctx, viewport }).promise;
  }, []);

  useEffect(() => {
    if (docRef.current) renderPage(page);
  }, [page, renderPage]);

  const open = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: uploaded } = await supabase
        .from("lesson_media")
        .select("storage_path")
        .eq("lesson_id", lessonId)
        .eq("kind", "pdf")
        .eq("status", "ready")
        .maybeSingle();
      if (uploaded?.storage_path) {
        const { data: file, error: dlErr } = await supabase.storage
          .from("lesson-media")
          .download(uploaded.storage_path);
        if (dlErr || !file) throw new Error("Não foi possível abrir o material agora.");
        const pdfjs = await import("pdfjs-dist");
        const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
        pdfjs.GlobalWorkerOptions.workerSrc = (worker as any).default;
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
        docRef.current = pdf;
        setSubtitle(null);
        setPages(pdf.numPages);
        setPage(1);
        await renderPage(1);
        onOpened?.();
        return;
      }
      const { data, error: fnError } = await supabase.functions.invoke("generate-lesson-pdf", {
        body: { lessonId, title, content: content ?? "" },
      });
      if (fnError) {
        let msg = "Não foi possível abrir o material agora.";
        try {
          const body = await (fnError as any).context?.json?.();
          if (body?.error) msg = body.error;
        } catch { /* mantém mensagem padrão */ }
        throw new Error(msg);
      }
      const payload = data as { material?: unknown; subtitle?: string; owner?: string; error?: string } | null;
      if (payload?.error) throw new Error(payload.error);
      if (!isLessonMaterial(payload?.material)) throw new Error("Material indisponível para esta etapa.");
      setSubtitle(payload?.subtitle ?? null);

      const pdfjs = await import("pdfjs-dist");
      const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
      pdfjs.GlobalWorkerOptions.workerSrc = (worker as any).default;

      const bytes = buildLessonPdf(title, payload.material, payload?.owner ?? "Aluno");

      const pdf = await pdfjs.getDocument({ data: bytes }).promise;
      docRef.current = pdf;
      setPages(pdf.numPages);
      setPage(1);
      await renderPage(1);
      onOpened?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível abrir o material agora.");
    } finally {
      setLoading(false);
    }
  };


  if (!docRef.current) {
    return (
      <section className="glass-card rounded-xl p-5 space-y-3">
        <div className="flex items-start gap-3">
          <FileText className="h-6 w-6 text-primary shrink-0" />
          <div className="flex-1">
            <h3 className="font-display font-semibold text-foreground">Material complementar</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Apostila desta etapa com marca d'água pessoal. Leitura exclusiva dentro da plataforma — sem download nem impressão.
            </p>
          </div>
        </div>
        <Button onClick={open} disabled={loading} variant="secondary" size="sm">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
          {loading ? "Preparando material..." : "Abrir material em PDF"}
        </Button>
        {error && (
          <p className="text-xs text-destructive flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="glass-card rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-display font-semibold text-foreground">Material complementar</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <span className="text-[11px] text-warning flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5" /> Conteúdo confidencial · uso pessoal
        </span>
      </div>

      <div
        className="rounded-xl bg-black/40 border border-white/10 p-3 select-none"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        <canvas ref={canvasRef} className="w-full rounded-lg" aria-label={`Material complementar: ${title}`} />
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button size="sm" variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Página anterior">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground">
          Página {page} de {pages}
        </span>
        <Button size="sm" variant="secondary" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} aria-label="Próxima página">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
