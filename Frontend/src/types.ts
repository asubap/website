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

export type Member = {
  id: string;
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
};
