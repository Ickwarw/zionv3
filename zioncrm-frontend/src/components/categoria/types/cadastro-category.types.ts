export interface CategoryFormData {
  id?: number;
  name: string;
  type: string;
  user_id?: string;
  color: string;
}


export interface NewCategoryProps {
  onClose: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}