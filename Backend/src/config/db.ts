import { config } from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

config();

const supabaseUrl: string = process.env.VITE_SUPABASE_URL || "not working";
const supabaseKey: string = process.env.VITE_SUPABASE_ANON_KEY || "not working";

export const db = (token?: string): SupabaseClient => {
    if (token) {
        return createClient(supabaseUrl, supabaseKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        });
    }
    return createClient(supabaseUrl, supabaseKey);
};
