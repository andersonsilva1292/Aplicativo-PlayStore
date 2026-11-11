import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { errorResponse, synthesizeSpeech } from "../_shared/lesson-ai.ts";

const BodySchema = z.object({
  lessonId: z.string().min(1).max(120),
  slideIndex: z.number().int().min(0).max(20),
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
    // Passa o token explicitamente: evita depender do header quando o gateway o reescreve
    const { data: userData, error: userErr } = await anon.auth.getUser(
      token && token !== anonKey ? token : undefined
    );
    const user = userData?.user ?? null;
    if (!user) {
      console.error("narration auth falhou", { hasToken: Boolean(token), reason: userErr?.message });
      return new Response(JSON.stringify({ error: "Sessão inválida." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Requisição de narração inválida." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { lessonId, slideIndex } = parsed.data;

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: row } = await admin
      .from("lesson_media")
      .select("script")
      .eq("lesson_id", lessonId)
      .eq("kind", "video")
      .maybeSingle();

    const script = (row?.script ?? null) as { slides?: any[]; audioPaths?: (string | null)[] } | null;
    const slide = script?.slides?.[slideIndex];
    if (!slide) {
      return new Response(JSON.stringify({ error: "Slide não encontrado. Recarregue a vídeo-aula." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const path = `lecture/${lessonId}/slide-${slideIndex}.mp3`;
    const audioPaths = script?.audioPaths ?? (script?.slides ?? []).map(() => null);

    if (audioPaths[slideIndex] !== path) {
      const audio = await synthesizeSpeech(apiKey, slide.narration ?? "");
      const { error: upErr } = await admin.storage.from("lesson-media").upload(path, audio, {
        contentType: "audio/mpeg",
        upsert: true,
      });
      if (upErr) throw new Error("Não foi possível salvar a narração.");
      audioPaths[slideIndex] = path;
      await admin
        .from("lesson_media")
        .update({ script: { ...script, audioPaths } })
        .eq("lesson_id", lessonId)
        .eq("kind", "video");
    }

    const { data: signed } = await admin.storage.from("lesson-media").createSignedUrl(path, 3600);

    return new Response(JSON.stringify({ audioUrl: signed?.signedUrl ?? null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err, corsHeaders);
  }
});
