import { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { isDemo } from "./config";
import { Item, ItemStatus, ItemType, Profile, ReportRecord, ReturnRecord } from "@/types";

const ADMIN_EMAIL = "admin@campustech.local";
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const categories: string[] = [
  "Electronics",
  "ID & Cards",
  "Keys",
  "Bags",
  "Books & Stationery",
  "Wallets",
  "Clothing",
  "Water Bottles",
  "Other",
];

const seed: Item[] = [
  { id: "demo-1", type: "lost", title: "Silver AirPods case", description: "Small silver case with a blue sticker inside the lid.", category: "Electronics", location: "Central Library", item_date: "2026-09-30", status: "open", created_at: "2026-10-02T07:10:00Z", image_url: "", user_id: "demo-user" },
  { id: "demo-2", type: "found", title: "Blue water bottle", description: "Matte blue bottle left beside the basketball court.", category: "Water Bottles", location: "Sports Complex", item_date: "2026-10-01", status: "open", created_at: "2026-10-02T06:30:00Z", image_url: "", user_id: "demo-user-2" },
  { id: "demo-3", type: "lost", title: "Student ID card", description: "Name starts with A. Found near the north gate last seen.", category: "ID & Cards", location: "North Gate", item_date: "2026-09-29", status: "open", created_at: "2026-10-01T15:40:00Z", image_url: "", user_id: "demo-user" },
  { id: "demo-4", type: "found", title: "Black canvas tote bag", description: "Contains two notebooks and a green highlighter.", category: "Bags", location: "Design Studio", item_date: "2026-09-30", status: "returned", created_at: "2026-10-01T12:20:00Z", image_url: "", user_id: "demo-user-3" },
  { id: "demo-5", type: "lost", title: "Brass keyring", description: "Three keys and a tiny orange tag.", category: "Keys", location: "Cafeteria", item_date: "2026-09-28", status: "open", created_at: "2026-09-30T09:00:00Z", image_url: "", user_id: "demo-user" },
  { id: "demo-6", type: "found", title: "Calculus notebook", description: "Blue graph-paper notebook with handwritten chapter 4 notes.", category: "Books & Stationery", location: "Engineering Block", item_date: "2026-09-27", status: "open", created_at: "2026-09-29T11:00:00Z", image_url: "", user_id: "demo-user-4" },
  { id: "demo-7", type: "lost", title: "Grey hoodie", description: "Size M, small stitched campus crest on the sleeve.", category: "Clothing", location: "Auditorium", item_date: "2026-09-26", status: "open", created_at: "2026-09-28T16:00:00Z", image_url: "", user_id: "demo-user" },
  { id: "demo-8", type: "found", title: "Wallet with cards", description: "Brown wallet handed in at the student office.", category: "Wallets", location: "Student Office", item_date: "2026-09-25", status: "returned", created_at: "2026-09-27T08:00:00Z", image_url: "", user_id: "demo-user-5" },
];

let demoItems: Item[] = structuredClone(seed);
let demoUser: User | null = null;
let blazefacePromise: Promise<unknown> | null = null;

export async function getSession() {
  if (isDemo || !supabase) return { data: { session: null }, error: null };
  return supabase.auth.getSession();
}

export function onAuthChange(cb: (event: AuthChangeEvent, session: Session | null) => void) {
  if (isDemo || !supabase) return { data: { subscription: { unsubscribe() {} } } };
  return supabase.auth.onAuthStateChange(cb);
}

export async function getProfile(userId: string): Promise<{ data: Profile | null; error: Error | null }> {
  if (isDemo || !supabase) return { data: { id: userId, email: "demo@campus.local", is_admin: false }, error: null };
  const { data, error } = await supabase.from("profiles").select("id, full_name, email, avatar_url, is_admin").eq("id", userId).maybeSingle();
  return { data, error: error ? new Error(error.message) : null };
}

export async function signIn(): Promise<{ data: { user?: User | null; provider?: string; url?: string | null } | null; error: Error | null }> {
  if (isDemo || !supabase) {
    demoUser = {
      id: "demo-user",
      email: "demo@campus.local",
      user_metadata: { full_name: "Demo Student" },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as User;
    return { data: { user: demoUser }, error: null };
  }
  const res = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}${window.location.pathname}` },
  });
  return { data: res.data, error: res.error ? new Error(res.error.message) : null };
}

export async function signInAdmin(password: string): Promise<{ data: { user: User | null }; error: Error | null }> {
  if (isDemo || !supabase) return { data: { user: null }, error: new Error("Wrong password") };
  const res = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
  return { data: { user: res.data.user }, error: res.error ? new Error(res.error.message) : null };
}

export async function signOut(): Promise<{ error: Error | null }> {
  if (isDemo || !supabase) {
    demoUser = null;
    return { error: null };
  }
  const res = await supabase.auth.signOut();
  return { error: res.error ? new Error(res.error.message) : null };
}

export async function listItems({ limit = 20, offset = 0 } = {}): Promise<{ data: Item[]; error: Error | null }> {
  if (isDemo || !supabase) return { data: demoItems.slice(offset, offset + limit), error: null };
  const { data, error } = await supabase
    .from("items")
    .select("id, user_id, type, title, description, category, location, item_date, image_url, status, created_at, returns(*)")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  return { data: (data as Item[]) || [], error: error ? new Error(error.message) : null };
}

export async function listUserItems(userId: string): Promise<{ data: Item[]; error: Error | null }> {
  if (isDemo || !supabase) return { data: demoItems.filter((x) => x.user_id === userId), error: null };
  const { data, error } = await supabase
    .from("items")
    .select("id, user_id, type, title, description, category, location, item_date, image_url, status, created_at, returns(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data: (data as Item[]) || [], error: error ? new Error(error.message) : null };
}

export async function getItem(id: string): Promise<{ data: Item | null; error: Error | null }> {
  if (isDemo || !supabase) {
    const found = demoItems.find((x) => x.id === id);
    return { data: found || null, error: null };
  }
  const { data, error } = await supabase
    .from("items")
    .select("id, user_id, type, title, description, category, location, item_date, image_url, status, created_at, returns(*)")
    .eq("id", id)
    .maybeSingle();
  return { data: data as Item | null, error: error ? new Error(error.message) : null };
}

export async function getItemContact(itemId: string): Promise<{ data: string | null; error: Error | null }> {
  if (isDemo || !supabase) {
    const found = demoItems.find((x) => x.id === itemId);
    return { data: found?.contact || "demo-contact@campus.local", error: null };
  }
  const { data, error } = await supabase
    .from("items")
    .select("contact, item_contacts(contact)")
    .eq("id", itemId)
    .maybeSingle();
  if (error) return { data: null, error: new Error(error.message) };
  const record = data as { contact?: string | null; item_contacts?: { contact: string }[] } | null;
  const contact = record?.contact || record?.item_contacts?.[0]?.contact || null;
  return { data: contact, error: null };
}

export async function createItem(
  item: {
    type: ItemType;
    title: string;
    description: string | null;
    category: string;
    location: string | null;
    item_date: string | null;
    contact: string;
  },
  file: File | null,
  userId: string
): Promise<{ data: Item | null; error: Error | null }> {
  if (isDemo || !supabase) {
    const next: Item = {
      ...item,
      id: `demo-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      status: "open",
      image_url: "",
    };
    demoItems = [next, ...demoItems];
    return { data: next, error: null };
  }

  let imageUrl = "";
  if (file) {
    const blob = await validateAndPrepareImage(file);
    const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.jpg`;
    const up = await supabase.storage.from("item-images").upload(path, blob, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (up.error) {
      console.error("Supabase Storage upload error:", up.error);
      throw up.error;
    }
    imageUrl = supabase.storage.from("item-images").getPublicUrl(path).data.publicUrl;
  }

  const { contact: contactValue, ...itemFields } = item;
  const { data, error } = await supabase
    .from("items")
    .insert({
      ...itemFields,
      user_id: userId,
      image_url: imageUrl,
      contact: contactValue,
    })
    .select()
    .single();

  return { data: data as Item | null, error: error ? new Error(error.message) : null };
}

export async function createReturn(record: ReturnRecord): Promise<{ error: Error | null }> {
  if (isDemo || !supabase) {
    demoItems = demoItems.map((x) =>
      x.id === record.item_id ? { ...x, status: "returned" as ItemStatus, returns: [record] } : x
    );
    return { error: null };
  }
  const res = await supabase.from("returns").insert(record);
  return { error: res.error ? new Error(res.error.message) : null };
}

export async function updateItem(id: string, fields: Partial<Item>): Promise<{ error: Error | null }> {
  if (isDemo || !supabase) {
    demoItems = demoItems.map((x) => (x.id === id ? { ...x, ...fields } : x));
    return { error: null };
  }
  const res = await supabase.from("items").update(fields).eq("id", id);
  return { error: res.error ? new Error(res.error.message) : null };
}

export async function deleteItem(id: string): Promise<{ error: Error | null }> {
  if (isDemo || !supabase) {
    demoItems = demoItems.filter((x) => x.id !== id);
    return { error: null };
  }
  const res = await supabase.from("items").delete().eq("id", id);
  return { error: res.error ? new Error(res.error.message) : null };
}

export async function reportImage(itemId: string, reason: string, reporterId: string): Promise<{ error: Error | null }> {
  if (isDemo || !supabase) return { error: null };
  const res = await supabase.from("reports").insert({ item_id: itemId, reason, reporter_id: reporterId });
  return { error: res.error ? new Error(res.error.message) : null };
}

export async function listReports(): Promise<{ data: ReportRecord[]; error: Error | null }> {
  if (isDemo || !supabase) return { data: [], error: null };
  const { data, error } = await supabase
    .from("reports")
    .select("id, item_id, reporter_id, reason, created_at, items(title, image_url), profiles:reporter_id(email)")
    .order("created_at", { ascending: false });
  return { data: (data as unknown as ReportRecord[]) || [], error: error ? new Error(error.message) : null };
}

export async function deleteReport(reportId: string): Promise<{ error: Error | null }> {
  if (isDemo || !supabase) return { error: null };
  const res = await supabase.from("reports").delete().eq("id", reportId);
  return { error: res.error ? new Error(res.error.message) : null };
}

async function loadBlazeface() {
  if (!blazefacePromise) {
    const importDynamic = new Function("url", "return import(url)");
    blazefacePromise = Promise.race([
      importDynamic("https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.7/+esm").then(
        (m: { load: () => Promise<unknown> }) => m.load()
      ),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Model load timeout")), 2500)),
    ]);
  }
  return blazefacePromise;
}

export async function validateAndPrepareImage(file: File): Promise<Blob> {
  if (!file || !ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Please choose a JPG, PNG, or WEBP image.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Images must be 5 MB or smaller.");
  }

  const blob = await compressImage(file);
  const url = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Unsupported image."));
      img.src = url;
    });

    try {
      const model = (await loadBlazeface()) as {
        estimateFaces: (img: HTMLImageElement, returnTensors: boolean) => Promise<unknown[]>;
      };
      const predictions = await Promise.race([
        model.estimateFaces(image, false),
        new Promise<unknown[]>((_, reject) => setTimeout(() => reject(new Error("Face estimate timeout")), 2500)),
      ]);
      if (predictions && predictions.length) {
        throw new Error("This image seems to contain a person. Please upload a photo of the item only.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("contain a person")) throw err;
      console.warn("BlazeFace face detection non-blocking failure:", err);
    }
  } finally {
    URL.revokeObjectURL(url);
  }
  return blob;
}

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Unsupported image."));
      img.onload = () => {
        const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.width * scale));
        c.height = Math.max(1, Math.round(img.height * scale));
        const ctx = c.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context unavailable."));
        ctx.drawImage(img, 0, 0, c.width, c.height);

        let q = 0.86;
        const done = () =>
          c.toBlob(
            (b) =>
              b && b.size <= MAX_IMAGE_BYTES
                ? resolve(b)
                : ((q -= 0.08), q > 0.25 ? done() : reject(new Error("Please choose a smaller photo."))),
            "image/jpeg",
            q
          );
        done();
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
