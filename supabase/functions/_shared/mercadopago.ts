import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

/** Ambiente de cobrança: teste (credenciais de teste) ou produção (cobrança real). */
export type MpEnv = "test" | "prod";

const API_BASE = "https://api.mercadopago.com";

export function getEnvVar(key: string): string {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`${key} não está configurado`);
  return value;
}

export function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

export function resolveEnv(raw: unknown): MpEnv {
  return raw === "prod" ? "prod" : "test";
}

export function accessToken(env: MpEnv): string {
  return env === "prod"
    ? getEnvVar("MERCADOPAGO_ACCESS_TOKEN_PROD")
    : getEnvVar("MERCADOPAGO_ACCESS_TOKEN_TEST");
}

export function publicKey(env: MpEnv): string {
  return env === "prod"
    ? getEnvVar("MERCADOPAGO_PUBLIC_KEY_PROD")
    : getEnvVar("MERCADOPAGO_PUBLIC_KEY_TEST");
}

/** Ambiente padrão do projeto: usa produção somente quando houver credenciais de produção. */
export function defaultEnv(): MpEnv {
  return Deno.env.get("MERCADOPAGO_ACCESS_TOKEN_PROD") ? "prod" : "test";
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
  idempotencyKey?: string;
}

/** Chamada REST ao Mercado Pago com token do ambiente escolhido. */
export async function mpFetch<T = any>(
  env: MpEnv,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${accessToken(env)}`,
      "Content-Type": "application/json",
      ...(options.idempotencyKey && { "X-Idempotency-Key": options.idempotencyKey }),
    },
    ...(options.body !== undefined && { body: JSON.stringify(options.body) }),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    console.error("Mercado Pago erro", path, response.status, text);
    const cause = data?.cause?.[0];
    const raw = cause?.description || data?.message || data?.error || `HTTP ${response.status}`;
    if (raw === "internal_error" && path.startsWith("/v1/payments")) {
      throw new Error(
        "A conta do Mercado Pago ainda não está liberada para receber pagamentos no site. Ative o Checkout Transparente (Checkout API) na sua aplicação do Mercado Pago e cadastre uma chave Pix."
      );
    }
    throw new Error(`Mercado Pago: ${raw}`);
  }
  return data as T;
}

/**
 * Confere a autenticidade do aviso automático.
 * Manifesto assinado: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`
 */
export async function verifyNotification(req: Request, dataId: string): Promise<boolean> {
  const secret = Deno.env.get("MERCADOPAGO_WEBHOOK_SECRET");
  if (!secret) {
    console.error("MERCADOPAGO_WEBHOOK_SECRET ausente: aviso recusado");
    return false;
  }

  const signature = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id") ?? "";
  if (!signature) return false;

  let ts = "";
  let v1 = "";
  for (const part of signature.split(",")) {
    const [rawKey, rawValue] = part.split("=", 2);
    const key = rawKey?.trim();
    if (key === "ts") ts = rawValue?.trim() ?? "";
    if (key === "v1") v1 = rawValue?.trim() ?? "";
  }
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest));
  const expected = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expected === v1.toLowerCase();
}

export interface PlanRow {
  id: string;
  name: string;
  description: string | null;
  amount_cents: number;
  currency: string;
  recurring_interval: string | null;
}

/** Carrega o plano do catálogo (o valor nunca vem do navegador). */
export async function loadPlan(supabase: SupabaseClient, planId: string): Promise<PlanRow> {
  const { data, error } = await supabase
    .from("plans")
    .select("id, name, description, amount_cents, currency, recurring_interval")
    .eq("id", planId)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) throw new Error("Plano indisponível.");
  return data as PlanRow;
}

/** Situação do pagamento no Mercado Pago traduzida para o histórico interno. */
export function mapPaymentStatus(status: string): "pending" | "paid" | "failed" | "expired" | "refunded" {
  switch (status) {
    case "approved":
      return "paid";
    case "authorized":
    case "pending":
    case "in_process":
    case "in_mediation":
      return "pending";
    case "refunded":
    case "charged_back":
      return "refunded";
    case "cancelled":
      return "expired";
    default:
      return "failed";
  }
}

export const jsonHeaders = { "Content-Type": "application/json" };
