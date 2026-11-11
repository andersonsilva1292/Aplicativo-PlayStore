import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { errorResponse } from "../_shared/lesson-ai.ts";
import { ensureAudioPaths, generateSlides, isNewFormat, signAudioPaths, type Slide } from "../_shared/lecture.ts";

const BodySchema = z.object({
  lessonId: z.string().min(1).max(120),
  title: z.string().min(1).max(300),
  summary: z.string().max(2000).optional().default(""),
  content: z.string().max(12000).optional().default(""),
  checkpoints: z.array(z.string().max(400)).max(20).optional().default([]),
  onlyCached: z.boolean().optional().default(false),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada.");

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const anon = createClient(Deno.env.get("SUPABASE_URL")!, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await anon.auth.getUser(token && token !== anonKey ? token : undefined);
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Sessão inválida." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Dados da aula inválidos." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { lessonId, title, summary, content, checkpoints, onlyCached } = parsed.data;

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // A aula fica pronta na base (slides + narração gravada). Aqui só entregamos
    // o material e as URLs assinadas dos áudios — sem processar nada na hora.
    const { data: cached } = await admin
      .from("lesson_media")
      .select("script, status")
      .eq("lesson_id", lessonId)
      .eq("kind", "video")
      .maybeSingle();

    const cachedSlides = (cached?.script as any)?.slides;
    let slides: Slide[] = [];
    let audioPaths: (string | null)[] = (cached?.script as any)?.audioPaths ?? [];

    if (cached?.status === "ready" && isNewFormat(cachedSlides)) {
      slides = cachedSlides;
    } else if (onlyCached) {
      return new Response(JSON.stringify({ slides: [], cached: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      slides = await generateSlides(apiKey, { lessonId, title, summary, content, checkpoints });
      audioPaths = slides.map(() => null);
      await admin.from("lesson_media").upsert(
        {
          lesson_id: lessonId,
          kind: "video",
          script: { slides, audioPaths },
          status: "ready",
          generated_at: new Date().toISOString(),
        },
        { onConflict: "lesson_id,kind" }
      );
      // A narração é gravada em segundo plano: o aluno já recebe os slides agora e o
      // player pede o áudio de cada slide sob demanda enquanto isso.
      void ensureAudioPaths(admin, apiKey, lessonId, slides, audioPaths).catch(() => {});
    }

    const audioUrls = await signAudioPaths(admin, slides.map((_, i) => audioPaths[i] ?? null));

    return new Response(
      JSON.stringify({
        slides: slides.map((s, i) => ({ ...s, audioUrl: audioUrls[i] ?? null })),
        cached: true,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return errorResponse(err, corsHeaders);
  }
});
