// Helpers compartilhados pelas funções que geram material de aula com IA.

export const GATEWAY = "https://ai.gateway.lovable.dev/v1";
export const TEXT_MODEL = "google/gemini-3.7-flash";
export const TTS_MODEL = "openai/gpt-4o-mini-tts";

export interface GatewayFailure {
  status: number;
  message: string;
}

export class GatewayError extends Error {
  status: number;
  constructor(failure: GatewayFailure) {
    super(failure.message);
    this.status = failure.status;
  }
}

function friendly(status: number, raw: string) {
  if (status === 402) return "Créditos de IA esgotados. O responsável pela plataforma precisa recarregar para gerar novos materiais.";
  if (status === 403) return "A geração de conteúdo por IA está bloqueada nas configurações do espaço de trabalho.";
  if (status === 429) return "Muitas gerações ao mesmo tempo. Aguarde alguns segundos e tente novamente.";
  if (status >= 500) return "O serviço de IA está instável neste momento. Tente novamente em instantes.";
  return raw || "Não foi possível gerar o material agora.";
}

/** Chamada de texto com resposta JSON garantida por schema. */
export async function generateJson<T>(apiKey: string, system: string, user: string, schema: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "material", strict: true, schema },
      },
    }),
  });

  if (!res.ok) {
    const raw = await res.text();
    let message = raw;
    try {
      message = JSON.parse(raw)?.error?.message ?? raw;
    } catch { /* mantém o texto bruto */ }
    throw new GatewayError({ status: res.status, message: friendly(res.status, message) });
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(content) as T;
}

/** Narração em português gerada por IA (áudio MP3). */
export async function synthesizeSpeech(apiKey: string, text: string): Promise<Uint8Array> {
  const res = await fetch(`${GATEWAY}/audio/speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({ model: TTS_MODEL, voice: "alloy", input: text.slice(0, 3800) }),
  });
  if (!res.ok) {
    const raw = await res.text();
    throw new GatewayError({ status: res.status, message: friendly(res.status, raw) });
  }
  return new Uint8Array(await res.arrayBuffer());
}

export function errorResponse(err: unknown, corsHeaders: Record<string, string>) {
  const status = err instanceof GatewayError ? err.status : 500;
  const message = err instanceof Error ? err.message : "Erro inesperado.";
  return new Response(JSON.stringify({ error: message }), {
    status: status === 402 || status === 403 || status === 429 ? status : 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
