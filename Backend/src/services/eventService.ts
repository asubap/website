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

    async getEventsByName(name: string) {
        const { data, error } = await this.supabase
            .from('events')
            .select('*')
            .ilike('name', `%${name}%`);

        if (error) throw error;
        return data;
    }

    async addEvent(user_id: string, name: string, date: string, location: string, description: string, lat: number, long: number, time: string) {
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
                    created_by_id: user_id  
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

    async getEventID(event_name: string) {
        const { data, error } = await this.supabase
            .from('events')
            .select('id')
            .eq('name', event_name);
            
        if (error) throw error;
        if (!data || data.length === 0) {
            throw new Error(`No event found with name: ${event_name}`);
        }
        return data[0].id;
    }

    async deleteEvent(event_id: string) {
        const { data, error } = await this.supabase
            .from('events')
            .delete()
            .eq('id', event_id);

        if (error) throw error;
        return data;
    }

    // get events before the given date and after the given date and then
    // order them as before and after the given date
    async getEventsByDate(date: string) {
        // Get events before the given date
        const { data: beforeData, error: beforeError } = await this.supabase
          .from('events')
          .select('*')
          .lt('date', date)
          .order('date', { ascending: false });
      
        if (beforeError) throw beforeError;
      
        // Get events after the given date
        const { data: afterData, error: afterError } = await this.supabase
          .from('events')
          .select('*')
          .gt('date', date)
          .order('date', { ascending: true });
      
        if (afterError) throw afterError;
      
        // Return an object with both sets of events
        return { before: beforeData, after: afterData };
      }
      
}