export interface AccountFormData {
  id?: number;
  name: string;
  account_type: string;
  user_id?: string;
  balance: number;
  currency: string;
  description: string;
  created_at?: Date;
  updated_at?: Date;
}


export interface NewAccountProps {
  onClose: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}