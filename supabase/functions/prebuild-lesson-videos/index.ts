// Pré-gera as vídeo-aulas (slides + narração) e guarda tudo na base,
// para o aluno abrir a aula sem nenhum processamento na hora.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { errorResponse } from "../_shared/lesson-ai.ts";
import { ensureAudioPaths, generateSlides, isNewFormat, type Slide } from "../_shared/lecture.ts";

const BodySchema = z.object({
  force: z.boolean().optional().default(false),
  lessons: z
    .array(
      z.object({
        lessonId: z.string().min(1).max(120),
        title: z.string().min(1).max(300),
        summary: z.string().max(4000).optional().default(""),
        content: z.string().max(20000).optional().default(""),
        checkpoints: z.array(z.string().max(400)).max(20).optional().default([]),
      })
    )
    .min(1)
    .max(10),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const secret = Deno.env.get("LESSON_PREBUILD_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada.");

    const bearer = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
    let authorized = bearer === serviceKey || (secret !== "" && req.headers.get("x-prebuild-key") === secret);

    // Também aceita o administrador logado, para disparar a pré-geração pelo painel.
    if (!authorized && bearer) {
      const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
      const { data: userData } = await anon.auth.getUser(bearer);
      if (userData?.user) {
        const admin0 = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);
        const { data: isAdmin } = await admin0.rpc("is_master_admin", { _user_id: userData.user.id });
        authorized = Boolean(isAdmin);
      }
    }

    if (!authorized) {
      return new Response(JSON.stringify({ error: "Não autorizado." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const results: Record<string, string> = {};

    for (const lesson of parsed.data.lessons) {
      try {
        const { data: row } = await admin
          .from("lesson_media")
          .select("script, status")
          .eq("lesson_id", lesson.lessonId)
          .eq("kind", "video")
          .maybeSingle();

        const cached = (row?.script as any)?.slides;
        let slides: Slide[];
        let audioPaths: (string | null)[] = (row?.script as any)?.audioPaths ?? [];

        if (!parsed.data.force && row?.status === "ready" && isNewFormat(cached)) {
          slides = cached;
        } else {
          slides = await generateSlides(apiKey, lesson);
          audioPaths = slides.map(() => null);
          await admin.from("lesson_media").upsert(
            {
              lesson_id: lesson.lessonId,
              kind: "video",
              script: { slides, audioPaths },
              status: "ready",
              generated_at: new Date().toISOString(),
            },
            { onConflict: "lesson_id,kind" }
          );
        }

        const paths = await ensureAudioPaths(admin, apiKey, lesson.lessonId, slides, audioPaths);
        results[lesson.lessonId] = `ok (${slides.length} slides, ${paths.filter(Boolean).length} áudios)`;
      } catch (e) {
        results[lesson.lessonId] = `erro: ${e instanceof Error ? e.message : "desconhecido"}`;
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err, corsHeaders);
  }
});
