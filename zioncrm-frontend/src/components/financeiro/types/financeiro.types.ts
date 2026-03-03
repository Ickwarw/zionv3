
export interface Transacao {
  id?: number;
  user_id?: number;
  amount: number;
  transaction_type:string;
  date: Date;
  description: string;
  category_id?: number;
  category_name?: string;
  account_id?: number;
  account_name?: string;
  payment_method?: string;
  reference?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FiltroFinanceiro {
  startDate: string;
  endDate: string;
  type?: 'income' | 'expense' | 'all';
  category?: number;
}
