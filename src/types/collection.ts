import { Database } from "./supabase";

export type Message = Database["public"]["Tables"]["Chat"]["Row"];
export type NewMessage = Omit<Message, "id" | "created_at" | "deleted">;
