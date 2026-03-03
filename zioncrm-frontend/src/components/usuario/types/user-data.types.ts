
export interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  is_active: boolean;
  is_admin: boolean;
  groups: any[];
}