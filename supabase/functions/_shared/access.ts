import { type SupabaseClient } from "npm:@supabase/supabase-js@2";

/** Compra única: 12 meses de acesso liberado. */
export const ACCESS_DAYS = 365;

export function accessExpiryFromNow(days = ACCESS_DAYS): string {
  return new Date(Date.now() + days * 86400_000).toISOString();
}

export async function grantAccess(
  supabase: SupabaseClient,
  userId: string,
  source: string,
  expiresAt: string | null
): Promise<void> {
  await supabase.from("course_access").upsert(
    {
      user_id: userId,
      source,
      active: true,
      granted_at: new Date().toISOString(),
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}

export async function revokeAccess(supabase: SupabaseClient, userId: string): Promise<void> {
  await supabase
    .from("course_access")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
}
