// Apaga todas as vídeo-aulas e PDFs guardados (linhas + arquivos no armazenamento),
// para o dono do curso subir os próprios vídeos depois.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const secret = Deno.env.get("LESSON_PREBUILD_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const bearer = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();

    let authorized = bearer === serviceKey || (secret !== "" && req.headers.get("x-prebuild-key") === secret);
    if (!authorized && bearer) {
      const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
      const { data: userData } = await anon.auth.getUser(bearer);
      if (userData?.user) {
        const admin0 = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);
        const { data: isAdmin } = await admin0.rpc("is_master_admin", { _user_id: userData.user.id });
        authorized = Boolean(isAdmin);
      }
    }
    if (!authorized) return json({ error: "Não autorizado." }, 401);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);

    // Varre o bucket recursivamente e remove todos os arquivos.
    const removed: string[] = [];
    const walk = async (prefix: string) => {
      const { data, error } = await admin.storage.from("lesson-media").list(prefix, { limit: 1000 });
      if (error) throw error;
      const files: string[] = [];
      for (const entry of data ?? []) {
        const path = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.id) files.push(path);
        else await walk(path);
      }
      if (files.length) {
        const { error: delErr } = await admin.storage.from("lesson-media").remove(files);
        if (delErr) throw delErr;
        removed.push(...files);
      }
    };
    await walk("");

    const { error: rowsErr } = await admin.from("lesson_media").delete().neq("lesson_id", "");
    if (rowsErr) throw rowsErr;

    return json({ removedFiles: removed.length });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Falha ao limpar as aulas." }, 500);
  }
});
