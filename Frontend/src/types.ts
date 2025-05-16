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
};

export interface Member {
  id: string;
  type: 'member';
  name: string;
  email: string;
  phone: string;
  major: string;
  graduationDate: string;
  status: string;
  about: string;
  internship: string;
  photoUrl: string;
  hours: string;
  links: string[];
  role: string;
}

export interface Sponsor {
  id?: string | number;  // Maps to API 'id' (can be string or number)
  type: 'sponsor';      // Internal type identifier
  name: string;         // Maps to API 'company_name'
  about: string;        // Maps to API 'about'
  links: string[] | null; // Maps to API 'links' (can be null)
  photoUrl: string | null; // Maps to API 'pfp_url' (can be null)
  resources: string[] | null; // Maps to API 'resources' (can be null)
  tier?: string;        // Add this line to include the tier property
}

export interface Announcement {
  id: number;
  title: string;
  description: string;
  date?: string;
  is_pinned?: boolean;
  created_at?: string;
  announcement_date?: string | null;
}
