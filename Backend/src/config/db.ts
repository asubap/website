import { config } from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

config();

const supabaseUrl: string = process.env.VITE_SUPABASE_URL || "not working";
const supabaseKey: string = process.env.VITE_SUPABASE_ANON_KEY || "not working";

export const db: SupabaseClient = createClient(supabaseUrl, supabaseKey);
