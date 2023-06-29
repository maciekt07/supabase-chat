import { Database } from "./supabase";

export type Message = Database["public"]["Tables"]["Chat"]["Row"];
