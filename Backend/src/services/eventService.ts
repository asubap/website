import { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseClient } from "../config/db";
import extractEmail from "../utils/extractEmail";
import { getDistance } from "geolib";

export class EventService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createSupabaseClient();
  }

  setToken(token: string) {
    this.supabase = createSupabaseClient(token);
  }

  async getEvents() {
    console.log('EventService: Getting events from Supabase...');
    const { data, error } = await this.supabase.from("events").select("*");
    if (error) {
        console.error('EventService: Error fetching events:', error);
        throw error;
    }
    console.log('EventService: Events fetched successfully:', data);
    return data;
  }

  async getEventsByName(name: string) {
    const { data, error } = await this.supabase
      .from("events")
      .select("*")
      .ilike("name", `%${name}%`);
    if (error) throw error;
    return data;
  }

  async addEvent(
    user_id: string,
    name: string,
    date: string,
    location: string,
    description: string,
    lat: number,
    long: number,
    time: string
  ) {
    const { data, error } = await this.supabase.from("events").insert({
      time,
      name,
      date,
      location,
      location_lat: lat,
      location_long: long,
      description,
      created_by_id: user_id,
    });
    if (error) console.log(error);
    return data;
  }

  async editEvent(event_id: string, updateData: Record<string, any>) {
    const { data, error } = await this.supabase
      .from("events")
      .update(updateData)
      .eq("id", event_id);
    if (error) throw error;
    return data;
  }

  async deleteEvent(event_id: string) {
    const { data, error } = await this.supabase
      .from("events")
      .delete()
      .eq("id", event_id);
    if (error) throw error;
    return data;
  }

  async getEventID(event_name: string) {
    const { data, error } = await this.supabase
      .from("events")
      .select("id")
      .eq("name", event_name);
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error(`No event found with name: ${event_name}`);
    }
    return data[0].id;
  }

  async getEventsByDate(date: string) {
    const { data: beforeData, error: beforeError } = await this.supabase
      .from("events")
      .select("*")
      .lt("date", date)
      .order("date", { ascending: false });
    if (beforeError) throw beforeError;

    const { data: afterData, error: afterError } = await this.supabase
      .from("events")
      .select("*")
      .gt("date", date)
      .order("date", { ascending: true });
    if (afterError) throw afterError;

    return { before: beforeData, after: afterData };
  }

  async verifyLocationAttendance(
    eventId: string,
    userId: string,
    userLat: number,
    userLong: number
  ) {
    try {
      console.log('Looking up event:', eventId);
      const { data: event, error } = await this.supabase
        .from("events")
        .select("id, location, location_lat, location_long")
        .eq("id", eventId)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        throw new Error(`Failed to find event: ${error.message}`);
      }

      if (!event) {
        console.error('Event not found:', eventId);
        throw new Error("Event not found");
      }

      console.log('Event found:', event);
      let { location_lat, location_long } = event;

      // Lazy geocode if coordinates are missing
      if (!location_lat || !location_long) {
        console.log('Geocoding address:', event.location);
        try {
          const coords = await this.geocodeAddress(event.location);
          location_lat = coords.lat;
          location_long = coords.lon;

          // Update event with coordinates
          const { error: updateError } = await this.supabase
            .from("events")
            .update({ location_lat, location_long })
            .eq("id", eventId);

          if (updateError) {
            console.error('Error updating event coordinates:', updateError);
          }
        } catch (geocodeError) {
          console.error('Geocoding error:', geocodeError);
          throw new Error("Could not determine event location coordinates");
        }
      }

      console.log('Calculating distance between:', 
        { user: { lat: userLat, long: userLong }, 
          event: { lat: location_lat, long: location_long }
        }
      );

      const distance = getDistance(
        { latitude: userLat, longitude: userLong },
        { latitude: location_lat, longitude: location_long }
      );

      console.log('Distance to event:', distance, 'meters');

      if (distance > 5000) {
        throw new Error(`You are too far from the event location (${Math.round(distance/1000)}km away, maximum distance is 5 km)`);
      }

      console.log('Recording attendance for user:', userId);
      const { error: attendanceError } = await this.supabase
        .from("attendance")
        .insert({ user_id: userId, event_id: eventId });

      if (attendanceError) {
        console.error('Error recording attendance:', attendanceError);
        if (attendanceError.code === '23505') { // Unique violation
          throw new Error("You have already checked in to this event");
        }
        throw attendanceError;
      }

      return "Check-in confirmed!";
    } catch (error) {
      console.error('verifyLocationAttendance error:', error);
      throw error;
    }
  }

  private async geocodeAddress(address: string): Promise<{ lat: number; lon: number }> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json() as { status: string; results: { geometry: { location: { lat: number; lng: number } } }[] };

    if (data.status === "OK") {
      const loc = data.results[0].geometry.location;
      return { lat: loc.lat, lon: loc.lng };
    } else {
      throw new Error("Failed to geocode event address");
    }
  }
}
