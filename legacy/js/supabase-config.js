/* Developed by Pughal Jeyaprakash */
// These are safe to use in a browser. RLS policies protect the database.
export const supabaseUrl = "https://fcubaxsmyfaokfdvcxsj.supabase.co";
export const supabasePublishableKey = "sb_publishable_LcCHuv7Zj-_VH9lnBsVDAQ_aw3yCSaI";
export const isDemo = !supabaseUrl || supabaseUrl.includes("YOUR_") || !supabasePublishableKey || supabasePublishableKey.includes("YOUR_");
