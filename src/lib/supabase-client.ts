import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);
