import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { GATEWAY, TEXT_MODEL, GatewayError, errorResponse } from "../_shared/lesson-ai.ts";

const BodySchema = z.object({
  question: z.string().min(1).max(2000),
  lessonTitle: z.string().max(300).optional().default(""),
  lessonContent: z.string().max(8000).optional().default(""),
  /** Contexto de erro: questão do questionário que o aluno errou */
  missedQuestion: z.string().max(2000).optional().default(""),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(12)
    .optional()
    .default([]),
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
    if (!user) {
      return new Response(JSON.stringify({ error: "Sessão inválida." }), {
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
    const { question, lessonTitle, lessonContent, missedQuestion, history } = parsed.data;

    const system = [
      "Você é um tutor de testes de software em português do Brasil.",
      "Responda de forma curta e didática (até 180 palavras), com passos numerados ou bullets quando ajudar.",
      "Use Markdown simples e blocos de código quando o assunto for Java, Selenium, Cucumber, Maven ou JUnit.",
      "Se o aluno errou uma questão, explique o raciocínio correto sem humilhar e dê um exemplo prático.",
      lessonTitle ? `Etapa atual do aluno: ${lessonTitle}.` : "",
      lessonContent ? `Material da etapa (use como base):\n${lessonContent.slice(0, 6000)}` : "",
      missedQuestion ? `O aluno errou esta questão:\n${missedQuestion}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch(`${GATEWAY}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages: [{ role: "system", content: system }, ...history, { role: "user", content: question }],
      }),
    });

    if (!res.ok) {
      const raw = await res.text();
      let message = raw;
      try {
        message = JSON.parse(raw)?.error?.message ?? raw;
      } catch { /* texto bruto */ }
      throw new GatewayError({ status: res.status, message });
    }

    const data = await res.json();
    const answer = data?.choices?.[0]?.message?.content ?? "Não consegui formular a resposta agora.";

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err, corsHeaders);
  }
});
