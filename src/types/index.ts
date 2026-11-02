export type ItemType = "lost" | "found";
export type ItemStatus = "open" | "returned";

export interface ReturnRecord {
  id?: string;
  item_id: string;
  recorded_by: string;
  returned_to_name: string;
  returned_to_contact?: string | null;
  returned_on: string;
  handover_location?: string | null;
  verification_notes?: string | null;
  created_at?: string;
}

export interface Item {
  id: string;
  user_id: string;
  type: ItemType;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  item_date: string | null;
  image_url: string | null;
  status: ItemStatus;
  contact?: string | null;
  created_at: string;
  returns?: ReturnRecord[];
}

export interface Profile {
  id: string;
  full_name?: string | null;
  email: string;
  avatar_url?: string | null;
  is_admin: boolean;
  created_at?: string;
}

export interface ReportRecord {
  id: string;
  item_id: string;
  reporter_id: string;
  reason: string;
  created_at: string;
  items?: {
    title: string;
    image_url: string | null;
  } | null;
  profiles?: {
    email: string;
  } | null;
}

export interface ItemFilters {
  query: string;
  type: "all" | ItemType;
  category: string;
  returned: boolean;
}

