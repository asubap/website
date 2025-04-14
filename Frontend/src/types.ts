export type Event = {
  attending_users: string[];
  created_at: string;
  created_by_id: string;
  date: string;
  description: string;
  id: number;
  location: string;
  location_lat: number;
  location_long: number;
  name: string;
  rsvp_users: string[];
  sponsors: string[];
  time: string;
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
}
