import { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseClient } from "../config/db";

export class announcementsService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createSupabaseClient();
    }

    setToken(token: string) {
        this.supabase = createSupabaseClient(token);
    }

    async getannouncements() {
        const { data, error } = await this.supabase
            .from('announcements')
            .select('*');

        if (error) throw error;
        return data;
    }

    async getannouncementsByName(name: string) {
        const { data, error } = await this.supabase
            .from('announcements')
            .select('*')
            .ilike('title', `%${name}%`);

        if (error) throw error;
        return data;
    }

    async addannouncements(user_id: string, title: string, description: string) {
        const { data, error } = await this.supabase
            .from('announcements')
            .insert(
                {
                    title: title,
                    body: description,
                    created_by_user: user_id
                });

        if (error) console.log(error);
        return "Added announcement";
    }

    async editannouncements(announcement_id: string, updateData: Record<string, string>) {
        const { data, error } = await this.supabase
            .from('announcements')
            .update(updateData)
            .eq('id', announcement_id);

        if (error) throw error;
        return "Updated announcement";
    }

    async getannouncementID(announcement_title: string) {
        const { data, error } = await this.supabase
            .from('announcements')
            .select('id')
            .eq('title', announcement_title);
            
        if (error) throw error;
        if (!data || data.length === 0) {
            throw new Error(`No announcements found with title: ${announcement_title}`);
        }
        return data[0].id;
    }

    async deleteannouncements(announcement_id: string) {
        const { data, error } = await this.supabase
            .from('announcements')
            .delete()
            .eq('id', announcement_id);

        if (error) throw error;
        return "Deleted announcement";
    }
}