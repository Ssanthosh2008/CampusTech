import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { isDemo, supabasePublishableKey, supabaseUrl } from "./config";

export const supabase: SupabaseClient | null = isDemo
  ? null
  : createClient(supabaseUrl, supabasePublishableKey);
