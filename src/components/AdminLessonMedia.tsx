import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, FileText, Film, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { modules } from "@/data/automation-course";

type Kind = "video" | "pdf";
interface MediaRow {
  lesson_id: string;
  kind: string;
  storage_path: string | null;
  status: string;
  updated_at: string;
}

const ACCEPT: Record<Kind, string> = {
  video: "video/mp4,video/webm,video/quicktime",
  pdf: "application/pdf",
};

/** Upload direto pelo proprietário: vídeo original (sem recompressão) e PDF por aula. */
export default function AdminLessonMedia() {
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const target = useRef<{ lessonId: string; kind: Kind } | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("lesson_media")
      .select("lesson_id, kind, storage_path, status, updated_at");
    setRows((data as MediaRow[]) ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const find = (lessonId: string, kind: Kind) =>
    rows.find((r) => r.lesson_id === lessonId && r.kind === kind && r.status === "ready" && r.storage_path);

  const pick = (lessonId: string, kind: Kind) => {
    target.current = { lessonId, kind };
    if (inputRef.current) {
      inputRef.current.accept = ACCEPT[kind];
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const upload = async (file: File) => {
    const t = target.current;
    if (!t) return;
    if (t.kind === "pdf" && file.type !== "application/pdf") {
      toast.error("Escolha um arquivo PDF.");
      return;
    }
    if (t.kind === "video" && !file.type.startsWith("video/")) {
      toast.error("Escolha um arquivo de vídeo (MP4 recomendado).");
      return;
    }
    const key = `${t.lessonId}-${t.kind}`;
    setBusy(key);
    setProgress(5);
    const ext = file.name.split(".").pop()?.toLowerCase() || (t.kind === "pdf" ? "pdf" : "mp4");
    const path = `uploads/${t.lessonId}/${t.kind}-${Date.now()}.${ext}`;
    const previous = find(t.lessonId, t.kind)?.storage_path;
    const timer = window.setInterval(() => setProgress((p) => Math.min(90, p + 2)), 800);

    const { error: upErr } = await supabase.storage
      .from("lesson-media")
      .upload(path, file, { contentType: file.type, upsert: false, cacheControl: "3600" });
    window.clearInterval(timer);

    if (upErr) {
      setBusy(null);
      toast.error("Envio não concluído", {
        description: /size|large|exceed/i.test(upErr.message)
          ? "O arquivo passa do limite de 500 MB por arquivo."
          : upErr.message,
      });
      return;
    }

    const { error: dbErr } = await supabase.from("lesson_media").upsert(
      {
        lesson_id: t.lessonId,
        kind: t.kind,
        storage_path: path,
        status: "ready",
        generated_at: new Date().toISOString(),
        script: { source: "upload", fileName: file.name, size: file.size },
      },
      { onConflict: "lesson_id,kind" }
    );
    if (dbErr) {
      setBusy(null);
      toast.error("Arquivo enviado, mas não foi vinculado à aula.", { description: dbErr.message });
      return;
    }
    if (previous && previous !== path) await supabase.storage.from("lesson-media").remove([previous]);
    setProgress(100);
    setBusy(null);
    toast.success(t.kind === "video" ? "Vídeo publicado na aula" : "PDF publicado na aula");
    void load();
  };

  const remove = async (lessonId: string, kind: Kind) => {
    const row = find(lessonId, kind);
    if (!row || !window.confirm("Remover este arquivo da aula?")) return;
    setBusy(`${lessonId}-${kind}`);
    if (row.storage_path) await supabase.storage.from("lesson-media").remove([row.storage_path]);
    await supabase.from("lesson_media").delete().eq("lesson_id", lessonId).eq("kind", kind);
    setBusy(null);
    toast.success("Arquivo removido");
    void load();
  };

  const cell = (lessonId: string, kind: Kind) => {
    const key = `${lessonId}-${kind}`;
    const row = find(lessonId, kind);
    const Icon = kind === "video" ? Film : FileText;
    if (busy === key) {
      return (
        <div className="space-y-1 min-w-[160px]">
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Enviando…
          </span>
          <Progress value={progress} className="h-1.5" />
        </div>
      );
    }
    return (
      <div className="flex flex-wrap items-center gap-2">
        {row ? (
          <span className="text-xs text-primary inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Publicado
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Sem arquivo</span>
        )}
        <Button size="sm" variant="outline" className="min-h-9" disabled={!!busy} onClick={() => pick(lessonId, kind)}>
          {row ? <Icon className="h-3.5 w-3.5 mr-1.5" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
          {row ? "Trocar" : "Enviar"}
        </Button>
        {row && (
          <Button size="sm" variant="ghost" className="min-h-9" disabled={!!busy} onClick={() => void remove(lessonId, kind)} aria-label="Remover">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <section className="card-modern p-4 sm:p-5 space-y-3">
      <div>
        <h2 className="font-display text-lg font-semibold">Vídeo-aulas e materiais em PDF</h2>
        <p className="text-sm text-muted-foreground">
          O vídeo é guardado exatamente como você envia, sem perda de qualidade (MP4 recomendado, até 500 MB por arquivo). O PDF aparece para o aluno só para leitura.
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
        }}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="text-xs uppercase text-muted-foreground">
            <tr className="border-b border-border/50">
              <th className="text-left py-2 pr-3">Aula</th>
              <th className="text-left py-2 pr-3">Vídeo</th>
              <th className="text-left py-2">PDF</th>
            </tr>
          </thead>
          <tbody>
            {modules.flatMap((m) =>
              m.lessons.map((l) => (
                <tr key={l.id} className="border-b border-border/30">
                  <td className="py-2.5 pr-3">
                    <span className="block text-xs text-muted-foreground">{m.title}</span>
                    <span className="block font-medium">{l.title}</span>
                  </td>
                  <td className="py-2.5 pr-3">{cell(l.id, "video")}</td>
                  <td className="py-2.5">{cell(l.id, "pdf")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
