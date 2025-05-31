
export interface Horse {
  id: string;
  name: string;
  breed: string;
  age: number;
  color: string;
  description: string;
  image_url?: string;
  owner_id: number; // This matches the database schema (integer)
  location: string;
  personality: string[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number; // This matches the database schema (integer)
  username: string;
  email?: string;
  full_name?: string;
  location?: string;
  bio?: string;
  profile_image?: string;
  password: string;
  created_at?: string;
  updated_at?: string;
}

export interface Match {
  id: string;
  horse1_id: string;
  horse2_id: string;
  status: 'pending' | 'matched' | 'rejected';
  created_at: string;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: number; // This matches the database schema (integer)
  content: string;
  created_at: string;
}

export interface SwipeAction {
  id: string;
  swiper_horse_id: string;
  swiped_horse_id: string;
  action: 'like' | 'pass';
  created_at: string;
}
