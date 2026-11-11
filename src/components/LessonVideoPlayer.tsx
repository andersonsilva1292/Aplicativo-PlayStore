import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useDevMode } from "@/hooks/useDevMode";

interface Props {
  lessonId: string;
  title: string;
  summary?: string;
  startAt?: number;
  watched?: boolean;
  onFinished: () => void;
  onPositionChange?: (seconds: number) => void;
}

type MediaState = "loading" | "ready" | "missing" | "error";

const SPEEDS = [1, 1.25, 1.5, 2];

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function LessonVideoPlayer({
  lessonId,
  title,
  summary,
  startAt = 0,
  watched,
  onFinished,
  onPositionChange,
}: Props) {
  const devMode = useDevMode();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastSavedSecond = useRef(Math.max(0, Math.round(startAt)));
  const finishedRef = useRef(Boolean(watched));
  const initialPositionRef = useRef(startAt);
  const initialWatchedRef = useRef(watched);
  const positionCallbackRef = useRef(onPositionChange);
  positionCallbackRef.current = onPositionChange;
  const [state, setState] = useState<MediaState>("loading");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(Math.max(0, startAt));
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  const persistPosition = useCallback(
    (seconds: number, force = false) => {
      const rounded = Math.max(0, Math.round(seconds));
      if (!force && Math.abs(rounded - lastSavedSecond.current) < 10) return;
      lastSavedSecond.current = rounded;
      positionCallbackRef.current?.(rounded);
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function loadVideo() {
      setState("loading");
      setError(null);
      setVideoUrl(null);
      setPlaying(false);
      setDuration(0);
      setCurrentTime(Math.max(0, initialPositionRef.current));
      lastSavedSecond.current = Math.max(0, Math.round(initialPositionRef.current));
      finishedRef.current = Boolean(initialWatchedRef.current);

      const { data: media, error: mediaError } = await supabase
        .from("lesson_media")
        .select("storage_path, status")
        .eq("lesson_id", lessonId)
        .eq("kind", "video")
        .eq("status", "ready")
        .maybeSingle();

      if (cancelled) return;
      if (mediaError) {
        setError("Não foi possível verificar esta vídeo-aula agora.");
        setState("error");
        return;
      }
      if (!media?.storage_path) {
        setState("missing");
        return;
      }

      const { data: signed, error: signedError } = await supabase.storage
        .from("lesson-media")
        .createSignedUrl(media.storage_path, 21600);

      if (cancelled) return;
      if (signedError || !signed?.signedUrl) {
        setError("Não foi possível abrir o arquivo desta vídeo-aula.");
        setState("error");
        return;
      }

      setVideoUrl(signed.signedUrl);
      setState("ready");
    }

    void loadVideo();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  useEffect(() => {
    const onFullscreenChange = () => setFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video) persistPosition(video.currentTime, true);
    };
  }, [persistPosition]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
      } catch {
        setPlaying(false);
      }
    } else {
      video.pause();
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await rootRef.current?.requestFullscreen();
    } catch {
      setError("O navegador não permitiu abrir a tela cheia.");
    }
  }, []);

  const seek = (next: number, commit = true) => {
    const video = videoRef.current;
    if (!video) return;
    const safe = Math.min(Math.max(0, next), duration || Number.MAX_SAFE_INTEGER);
    video.currentTime = safe;
    setCurrentTime(safe);
    if (commit) persistPosition(safe, true);
  };

  if (state !== "ready" || !videoUrl) {
    return (
      <section className="glass-card rounded-2xl overflow-hidden">
        <div className="relative aspect-video overflow-hidden bg-muted/30">
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div className="max-w-lg space-y-4">
              {state === "loading" ? (
                <Loader2 className="mx-auto h-9 w-9 animate-spin text-primary" />
              ) : (
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-primary/25 bg-primary/10">
                  <Play className="h-6 w-6 text-primary" />
                </div>
              )}
              <div className="space-y-2">
                <p className="font-display text-lg font-semibold text-foreground">{title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {state === "loading"
                    ? "Verificando a vídeo-aula..."
                    : state === "error"
                      ? error
                      : "Esta vídeo-aula será publicada em breve no novo formato."}
                </p>
                {state === "missing" && summary && <p className="text-xs text-muted-foreground/80">{summary}</p>}
              </div>
            </div>
          </div>
        </div>
        {state === "missing" && !watched && (
          <div className="border-t border-border/50 p-4">
            <Button variant="outline" size="sm" onClick={onFinished}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {devMode ? "Liberar etapas (modo desenvolvimento)" : "Continuar para o material e o questionário"}
            </Button>
          </div>
        )}
        {state === "error" && (
          <div className="flex items-start gap-2 border-t border-border/50 p-4 text-xs text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" /> Atualize a página e tente novamente.
          </div>
        )}
      </section>
    );
  }

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      ref={rootRef}
      className={`glass-card overflow-hidden rounded-2xl ${fullscreen ? "fixed inset-0 z-50 flex flex-col justify-center rounded-none bg-background" : ""}`}
    >
      <div className="relative aspect-video bg-muted">
        <video
          ref={videoRef}
          src={videoUrl}
          className="h-full w-full object-contain"
          playsInline
          preload="metadata"
          onClick={togglePlay}
          onLoadedMetadata={(event) => {
            const video = event.currentTarget;
            setDuration(video.duration || 0);
            const resumeAt = Math.min(Math.max(0, initialPositionRef.current), Math.max(0, video.duration - 1));
            if (resumeAt > 0 && !initialWatchedRef.current) video.currentTime = resumeAt;
          }}
          onPlay={() => setPlaying(true)}
          onPause={(event) => {
            setPlaying(false);
            persistPosition(event.currentTarget.currentTime, true);
          }}
          onTimeUpdate={(event) => {
            const seconds = event.currentTarget.currentTime;
            setCurrentTime(seconds);
            persistPosition(seconds);
          }}
          onEnded={() => {
            setPlaying(false);
            setCurrentTime(duration);
            persistPosition(duration, true);
            if (!finishedRef.current) {
              finishedRef.current = true;
              onFinished();
            }
          }}
          onError={() => {
            setError("O arquivo desta vídeo-aula não pôde ser reproduzido.");
            setState("error");
          }}
          aria-label={`Vídeo-aula: ${title}`}
        />
        {!playing && (
          <Button
            variant="ghost"
            onClick={togglePlay}
            className="absolute inset-0 h-full w-full rounded-none bg-background/15 hover:bg-background/20"
            aria-label="Reproduzir vídeo-aula"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full border border-primary/30 bg-background/85 shadow-glow">
              <Play className="ml-1 h-7 w-7 text-primary" />
            </span>
          </Button>
        )}
      </div>

      <div className="space-y-3 border-t border-border/50 p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <span className="w-10 font-mono text-[11px] text-muted-foreground">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={Math.max(duration, 1)}
            step={0.1}
            onValueChange={([value]) => seek(value, false)}
            onValueCommit={([value]) => persistPosition(value, true)}
            className="flex-1"
            aria-label="Progresso da vídeo-aula"
          />
          <span className="w-10 text-right font-mono text-[11px] text-muted-foreground">{formatTime(duration)}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={togglePlay} className="gradient-primary text-primary-foreground" aria-label={playing ? "Pausar" : "Reproduzir"}>
            {playing ? <Pause className="mr-1.5 h-4 w-4" /> : <Play className="mr-1.5 h-4 w-4" />}
            {playing ? "Pausar" : "Reproduzir"}
          </Button>
          <Button size="icon" variant="secondary" onClick={() => seek(currentTime - 10)} aria-label="Voltar 10 segundos">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-1.5 py-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => {
                const video = videoRef.current;
                if (!video) return;
                video.muted = !muted;
                setMuted(!muted);
              }}
              aria-label={muted ? "Ativar som" : "Desativar som"}
            >
              {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : volume < 0.5 ? <Volume1 className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[muted ? 0 : volume * 100]}
              max={100}
              step={1}
              onValueChange={([value]) => {
                const next = value / 100;
                const video = videoRef.current;
                if (video) {
                  video.volume = next;
                  video.muted = false;
                }
                setMuted(false);
                setVolume(next);
              }}
              className="w-20 sm:w-24"
              aria-label="Volume"
            />
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
              if (videoRef.current) videoRef.current.playbackRate = next;
              setSpeed(next);
            }}
            aria-label="Alterar velocidade"
          >
            <Gauge className="mr-1.5 h-4 w-4" /> {speed}x
          </Button>
          <Button size="sm" variant="ghost" onClick={toggleFullscreen} aria-label={fullscreen ? "Sair da tela cheia" : "Abrir em tela cheia"}>
            {fullscreen ? <Minimize2 className="mr-1.5 h-4 w-4" /> : <Maximize2 className="mr-1.5 h-4 w-4" />}
            {fullscreen ? "Sair" : "Tela cheia"}
          </Button>
          <span className="ml-auto text-xs text-muted-foreground">{Math.round(progress)}%</span>
          {watched && (
            <span className="flex items-center gap-1.5 text-xs text-success">
              <CheckCircle2 className="h-4 w-4" /> Vídeo concluído
            </span>
          )}
        </div>
      </div>
    </div>
  );
}