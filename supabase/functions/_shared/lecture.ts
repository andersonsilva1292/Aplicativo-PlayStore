// Geração e armazenamento do material de vídeo-aula (slides + narração).
// Usado pela função que entrega a aula e pela rotina de pré-geração em lote.
import { generateJson, synthesizeSpeech } from "./lesson-ai.ts";

export const SLIDE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["slides"],
  properties: {
    slides: {
      type: "array",
      minItems: 6,
      maxItems: 9,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["layout", "kicker", "title", "bullets", "takeaway", "narration", "code"],
        properties: {
          layout: { type: "string", enum: ["capa", "conceito", "passos", "codigo", "resumo"] },
          kicker: { type: "string" },
          title: { type: "string" },
          bullets: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
          takeaway: { type: "string" },
          narration: { type: "string" },
          code: { type: ["string", "null"] },
        },
      },
    },
  },
};

export interface Slide {
  layout: "capa" | "conceito" | "passos" | "codigo" | "resumo";
  kicker: string;
  title: string;
  bullets: string[];
  takeaway: string;
  narration: string;
  code: string | null;
}

export interface LessonInput {
  lessonId: string;
  title: string;
  summary: string;
  content: string;
  checkpoints: string[];
}

const SYSTEM = [
  "Você é o professor Anderson Santos, especialista em automação de testes, roteirizando uma vídeo-aula narrada em português do Brasil no estilo de uma apresentação profissional.",
  "Estruture a aula assim: 1º slide layout 'capa' (abertura, o que o aluno vai dominar), depois slides 'conceito' (teoria essencial), 'passos' (passo a passo prático numerado em ordem) e 'codigo' quando houver exemplo real, e o último slide layout 'resumo' (o que ficou aprendido e próximo passo).",
  "Regras de texto, porque cada slide é projetado na tela: kicker com 2 a 4 palavras em letras maiúsculas (ex: FUNDAMENTOS, MÃO NA MASSA); title curto e direto, no máximo 7 palavras, sem ponto final; de 2 a 4 bullets, cada um com no máximo 12 palavras, começando por verbo; takeaway como uma única frase de destaque com no máximo 14 palavras.",
  "narration: 45 a 70 palavras em linguagem falada e natural, explicando o slide com exemplo prático. Nunca leia os bullets em voz alta palavra por palavra.",
  "code: apenas em slides layout 'codigo', com no máximo 14 linhas de Java, Gherkin ou terminal, bem indentado e sem comentários longos. Nos outros layouts use null.",
].join("\n");

export function isNewFormat(slides: unknown): slides is Slide[] {
  return Array.isArray(slides) && typeof (slides[0] as any)?.layout === "string";
}

/** Cria o roteiro de slides da aula com IA. */
export async function generateSlides(apiKey: string, lesson: LessonInput): Promise<Slide[]> {
  const generated = await generateJson<{ slides: Slide[] }>(
    apiKey,
    SYSTEM,
    `Aula: ${lesson.title}\nResumo: ${lesson.summary}\nPontos de checagem: ${lesson.checkpoints.join(" | ")}\n\nConteúdo base:\n${lesson.content}`,
    SLIDE_SCHEMA
  );
  const slides = (generated.slides ?? []).slice(0, 9);
  if (slides.length === 0) throw new Error("A IA não retornou slides. Tente novamente.");
  return slides;
}

/**
 * Garante que a narração de todos os slides esteja gravada no storage e
 * registrada em lesson_media.script.audioPaths. Devolve os caminhos.
 */
export async function ensureAudioPaths(
  admin: any,
  apiKey: string,
  lessonId: string,
  slides: Slide[],
  current: (string | null)[] = []
): Promise<(string | null)[]> {
  const audioPaths = slides.map((_, i) => current[i] ?? null);
  let changed = false;

  for (let i = 0; i < slides.length; i++) {
    const path = `lecture/${lessonId}/slide-${i}.mp3`;
    if (audioPaths[i] === path) continue;
    const audio = await synthesizeSpeech(apiKey, slides[i]?.narration ?? "");
    const { error } = await admin.storage.from("lesson-media").upload(path, audio, {
      contentType: "audio/mpeg",
      upsert: true,
    });
    if (error) throw new Error("Não foi possível salvar a narração.");
    audioPaths[i] = path;
    changed = true;
  }

  if (changed) {
    await admin
      .from("lesson_media")
      .update({ script: { slides, audioPaths }, status: "ready", generated_at: new Date().toISOString() })
      .eq("lesson_id", lessonId)
      .eq("kind", "video");
  }

  return audioPaths;
}

/** Assina os áudios já gravados para o player tocar sem processar nada. */
export async function signAudioPaths(admin: any, audioPaths: (string | null)[]): Promise<(string | null)[]> {
  return await Promise.all(
    audioPaths.map(async (path) => {
      if (!path) return null;
      const { data } = await admin.storage.from("lesson-media").createSignedUrl(path, 21600);
      return data?.signedUrl ?? null;
    })
  );
}
