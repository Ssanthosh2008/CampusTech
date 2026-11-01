// CampusTech environment configuration with safe fallbacks.
// Publishable key is safe to expose in the frontend; RLS policies protect backend data.

export const supabaseUrl: string =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  "https://fcubaxsmyfaokfdvcxsj.supabase.co";

export const supabasePublishableKey: string =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  "sb_publishable_LcCHuv7Zj-_VH9lnBsVDAQ_aw3yCSaI";

export const isDemo: boolean =
  !supabaseUrl ||
  supabaseUrl.includes("YOUR_") ||
  !supabasePublishableKey ||
  supabasePublishableKey.includes("YOUR_");
