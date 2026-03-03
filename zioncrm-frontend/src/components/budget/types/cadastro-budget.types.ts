export interface BudgetFormData {
  id?: number;
  name: string;
  user_id?: string;
  amount: number;
  period: string;
  category_id: number;
  category_name: string;
  color: string;
  current_spending?: number;
  percentage?: number;
  created_at?: Date;
  updated_at?: Date;
}


export interface NewBudgetProps {
  onClose: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}