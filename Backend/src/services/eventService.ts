import { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseClient } from "../config/db";
import extractEmail from "../utils/extractEmail";

export class EventService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createSupabaseClient();
    }

    setToken(token: string) {
        this.supabase = createSupabaseClient(token);
    }

    async getEvents() {
        const { data, error } = await this.supabase
            .from('events')
            .select('*');

        if (error) throw error;
        return data;
    }

    async getEventByID(event_id: string) {
        const { data, error } = await this.supabase
            .from('events')
            .select('*')
            .eq('id', event_id);

        if (error) throw error;
        return data;
    }

    async addEvent(user_id: string, name: string, date: string, location: string, description: string, lat: number, long: number, time: string, sponsors: string[]) {
        const { data, error } = await this.supabase
            .from('events')
            .insert(
                {
                    time: time,
                    name: name,
                    date: date,
                    location: location,
                    location_lat: lat,
                    location_long: long,
                    description: description,
                    created_by_id: user_id,
                    sponsors: sponsors
                });

        if (error) console.log(error);
        return data;
    }

    async editEvent(event_id: string, updateData: Record<string, any>) {
        const { data, error } = await this.supabase
            .from('events')
            .update(updateData)
            .eq('id', event_id);

        if (error) throw error;
        return data;
    }

    async deleteEvent(event_id: string) {
        const { data, error } = await this.supabase
            .from('events')
            .delete()
            .eq('id', event_id);

        if (error) throw error;
        return data;
    }
      
}