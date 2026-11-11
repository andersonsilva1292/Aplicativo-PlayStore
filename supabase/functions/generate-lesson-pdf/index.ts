import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { errorResponse, generateJson } from "../_shared/lesson-ai.ts";

const BodySchema = z.object({
  lessonId: z.string().min(1).max(120),
  title: z.string().min(1).max(300),
  content: z.string().max(12000).optional().default(""),
  /** Curso de origem, usado no cabeçalho da apostila. */
  course: z.enum(["automacao", "ctfl"]).optional().default("automacao"),
});

/** Versão do formato da apostila — material em cache com versão antiga é regenerado. */
const MATERIAL_VERSION = 2;

const PDF_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["subtitle", "summary", "keyTakeaways", "sections", "checklist", "exercises", "glossary"],
  properties: {
    subtitle: { type: "string" },
    summary: { type: "string" },
    keyTakeaways: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
    sections: {
      type: "array",
      minItems: 4,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["heading", "paragraphs", "bullets"],
        properties: {
          heading: { type: "string" },
          paragraphs: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
          bullets: { type: "array", items: { type: "string" }, maxItems: 6 },
        },
      },
    },
    checklist: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 8 },
    exercises: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["statement", "solution"],
        properties: {
          statement: { type: "string" },
          solution: { type: "string" },
        },
      },
    },
    glossary: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["term", "definition"],
        properties: { term: { type: "string" }, definition: { type: "string" } },
      },
    },
  },
};

interface Material {
  version?: number;
  subtitle: string;
  summary: string;
  keyTakeaways: string[];
  sections: { heading: string; paragraphs: string[]; bullets: string[] }[];
  checklist: string[];
  exercises: { statement: string; solution: string }[];
  glossary: { term: string; definition: string }[];
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada.");

    const authHeader = req.headers.get("Authorization") ?? "";
    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await anon.auth.getUser();
    if (!user) return json({ error: "Sessão inválida." }, 401);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Dados inválidos para gerar o material." }, 400);
    const { lessonId, title, content, course } = parsed.data;

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: cached } = await admin
      .from("lesson_media")
      .select("script, status")
      .eq("lesson_id", lessonId)
      .eq("kind", "pdf")
      .maybeSingle();

    const cachedScript = cached?.script as Material | undefined;
    let material: Material;
    if (cached?.status === "ready" && cachedScript?.sections && cachedScript.version === MATERIAL_VERSION) {
      material = cachedScript;
    } else {
      const system =
        course === "ctfl"
          ? "Você é um instrutor certificado CTFL (ISTQB Foundation Level, Syllabus v4.0). Escreva uma apostila de estudo em português do Brasil: teoria objetiva, definições oficiais do syllabus, exemplos aplicados, pegadinhas de prova, checklist de revisão, exercícios com resolução comentada e glossário. Seja técnico e didático."
          : "Você é o professor Anderson Santos, especialista em automação de testes com Java, Selenium e Cucumber. Escreva uma apostila de estudo em português do Brasil: teoria resumida, passo a passo prático, erros comuns, boas práticas, checklist, exercícios com resolução comentada e glossário. Seja direto e técnico.";
      material = {
        ...(await generateJson<Material>(apiKey, system, `Aula: ${title}\n\nConteúdo base:\n${content}`, PDF_SCHEMA)),
        version: MATERIAL_VERSION,
      };
      await admin.from("lesson_media").upsert(
        {
          lesson_id: lessonId,
          kind: "pdf",
          script: material as any,
          status: "ready",
          generated_at: new Date().toISOString(),
        },
        { onConflict: "lesson_id,kind" }
      );
    }

    // Nome do aluno para a marca d'água (material é individual e não pode circular).
    const { data: profile } = await admin
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();
    const owner = `${profile?.display_name ?? "Aluno"} · ${user.email ?? user.id}`;

    // O PDF é montado no navegador (mais rápido e sem limite de payload da função).
    return json({ material, subtitle: material.subtitle, owner, course });
  } catch (err) {
    // Falta de créditos/limite é um estado esperado: responde 200 com a mensagem
    // para o app exibir o aviso sem tratar como falha.
    const status = (err as { status?: number })?.status;
    if (status === 402 || status === 403 || status === 429) {
      return json({ error: err instanceof Error ? err.message : "Material indisponível no momento.", unavailable: true });
    }
    return errorResponse(err, corsHeaders);
  }
});
