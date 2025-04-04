import { SupabaseClient } from "@supabase/supabase-js";
import { db } from "../config/db";
import extractEmail from "../utils/extractEmail";
import { getDistance } from "geolib";

export class EventService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = db();
  }

  setToken(token: string) {
    this.supabase = db(token);
  }

  async getEvents() {
    const { data, error } = await this.supabase.from("events").select("*");
    if (error) throw error;
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
    const { data: event, error } = await this.supabase
      .from("events")
      .select("id, location, location_lat, location_long")
      .eq("id", eventId)
      .single();

    if (error || !event) throw new Error("Event not found");

    let { location_lat, location_long } = event;

    // Lazy geocode if coordinates are missing
    if (!location_lat || !location_long) {
      const coords = await this.geocodeAddress(event.location);
      location_lat = coords.lat;
      location_long = coords.lon;

      await this.supabase
        .from("events")
        .update({ location_lat, location_long })
        .eq("id", eventId);
    }

    const distance = getDistance(
      { latitude: userLat, longitude: userLong },
      { latitude: location_lat, longitude: location_long }
    );

    if (distance > 1000) throw new Error("You are too far from the event location");

    const { error: attendanceError } = await this.supabase
      .from("attendance")
      .insert({ user_id: userId, event_id: eventId });

    if (attendanceError) throw attendanceError;

    return "Check-in confirmed!";
  }

  private async geocodeAddress(address: string): Promise<{ lat: number; lon: number }> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "OK") {
      const loc = data.results[0].geometry.location;
      return { lat: loc.lat, lon: loc.lng };
    } else {
      throw new Error("Failed to geocode event address");
    }
  }
}
