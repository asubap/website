export type UserRole = 'student' | 'admin' | 'alumni';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}