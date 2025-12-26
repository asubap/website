export interface MemberDetail {
  id: string;
  email: string;
  name: string;
  phone: string;
  major: string;
  graduationDate: string;
  status: string; // e.g., "Looking for Internship", "Looking for Full-time", "Not Looking"
  about: string;
  internship: string;
  photoUrl: string;
  hours: string; // Total hours, consider if this is purely numeric or formatted string
  // Fields from legacy Member type that might be useful:
  developmentHours?: string;
  professionalHours?: string;
  serviceHours?: string;
  socialHours?: string;
  links?: string[]; // From legacy Member
  rank: string; // e.g., "Current", "Pledge", "Alumni"
  role: string; // e.g., "e-board", "general-member", "sponsor-admin"
  event_attendance?: any[]; // Array of attended events from API
  // id?: string; // If MemberDetail should also have an id from the DB, though email is often the unique key for users
  type?: "member"; // From legacy Member, if still needed
}

// Member rank type
export type MemberRank = 'pledge' | 'inducted' | 'alumni';

// Re-export other existing types from this file if any, or add them here.
// For example, if Announcement type is also used widely:
export interface Announcement {
  id: string; // Standardized to string
  title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  is_pinned?: boolean;
  target_audience?: "all" | "members" | "pledges";
  // Fields from legacy Announcement in types.ts:
  date?: string; // General date field, might overlap with created_at or be specific event date for announcement
  announcement_date?: string | null; // Similar to date, purpose might need clarification
}

export type BaseEvent = {
  id: string;
  event_name: string;
  event_description: string;
  event_location?: string;
  event_date: string;
  event_time?: string;
  event_hours?: number;
  event_hours_type?: string;
  sponsors_attending?: string[];
  event_limit?: number;
  rsvp_count: number;          // NEW: Aggregate RSVP count
  attending_count: number;     // NEW: Aggregate attendance count
};

// For general-member and sponsor roles
export type MemberEvent = BaseEvent & {
  event_lat?: number | null;   // Nullable if user hasn't RSVP'd
  event_long?: number | null;  // Nullable if user hasn't RSVP'd
  user_rsvped: boolean;        // NEW: Current user's RSVP status
  user_attended: boolean;      // NEW: Current user's attendance status
  can_check_in: boolean;       // NEW: Whether user can check in now
  check_in_window?: number;    // Only present if user RSVP'd
  check_in_radius?: number;    // Only present if user RSVP'd
};

// For e-board role
export type AdminEvent = BaseEvent & {
  event_lat: number;           // Always present for admin
  event_long: number;          // Always present for admin
  event_rsvped: string[];      // User IDs only (no email objects)
  event_attending: string[];   // User IDs only (no email objects)
  is_hidden: boolean;          // Hidden event flag
  check_in_window: number;     // Always present for admin
  check_in_radius: number;     // Always present for admin
  user_rsvped: boolean;        // Admin can also RSVP
  user_attended: boolean;      // Admin can also attend
};

// For new /events/:eventId/participants endpoint (e-board only)
export type EventParticipants = {
  event_id: string;
  event_name: string;
  rsvped_users: {
    user_id: string;
    name: string;
    user_email: string;
  }[];
  attending_users: {
    user_id: string;
    name: string;
    user_email: string;
    checked_in_at?: string;
  }[];
  rsvp_count: number;
  attending_count: number;
};

// Union type for components (use this as the primary Event type)
export type Event = MemberEvent | AdminEvent;

export interface Sponsor {
  id?: string; // Standardizing to string for consistency, was string | number
  type?: "sponsor"; // Was required, making optional if not strictly used everywhere
  name: string;
  about: string;
  links?: string[] | null;
  photoUrl?: string | null;
  resources?: { label: string; url: string }[] | null;
  tier?: string;
  emails?: string[]; // Was required, making optional if not always present
}

export type EboardFacultyEntry = {
  role: string;
  role_email: string;
  email: string;
  profile_photo_url?: string;
  name: string | null;
  major: string | null;
  rank?: number;
};
