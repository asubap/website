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
  // id?: string; // If MemberDetail should also have an id from the DB, though email is often the unique key for users
  type?: "member"; // From legacy Member, if still needed
}

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

export type Event = {
  id: string;
  event_name: string;
  event_description: string;
  event_location: string;
  event_lat: number;
  event_long: number;
  event_date: string;
  event_time: string;
  event_rsvped: string[];
  event_attending: string[];
  event_hours: number;
  event_hours_type: string;
  sponsors_attending: string[];
  check_in_window: number;
};

export interface Sponsor {
  id?: string; // Standardizing to string for consistency, was string | number
  type?: "sponsor"; // Was required, making optional if not strictly used everywhere
  name: string;
  about: string;
  links?: string[] | null;
  photoUrl?: string | null;
  resources?: string[] | null;
  tier?: string;
  emails?: string[]; // Was required, making optional if not always present
}
