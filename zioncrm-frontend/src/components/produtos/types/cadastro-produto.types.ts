export interface Inventory {
  id: number;
  product_id: number;
  quantity: number;
  reorder_level: number;
  reorder_quantity: number;
  location: string;
  created_at: Date;
  updated_at: Date;
}

export interface FormData {
  id: number;
  name: string;
  description: string;
  sku: string;
  cost_price: number;
  price: number;
  category_id: number;
  category: string;
  supplier_id: number;
  supplier: string;
  tax_rate: number;
  weight: number;
  dimensions: string;
  barcode: string;
  qr_code: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  inventory: Inventory;
}

export interface FormDataCRUD {
  id: number;
  name: string;
  description: string;
  sku: string;
  cost_price: number;
  price: number;
  category_id: number;
  category: string;
  supplier_id: number;
  supplier: string;
  tax_rate: number;
  weight: number;
  dimensions: string;
  barcode: string;
  qr_code: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  quantity: number;
  reorder_level: number;
  reorder_quantity: number;
  location: string;
}
   

export interface CadastroProdutoProps {
  onClose: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

export interface FormComponentProps {
  formData: FormDataCRUD;
  setFormData: (data: FormDataCRUD) => void;
  onSubmit: (e: React.FormEvent) => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

export interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormDataCRUD;
}
