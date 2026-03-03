
export interface Contact {
  id: number;
  name: string;
  position: string;
  phone: string;
  email: string;
  new: boolean;
}

export interface FornecedorFormData {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  notes: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  website: string;
  contact_person: string;
  contacts?: Contact[];
}

export interface CadastroFornecedorProps {
  onClose: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

export interface DadosEmpresaProps {
  formData: FornecedorFormData;
  setFormData: (data: FornecedorFormData) => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

export interface DadosProprietarioProps {
  formData: FornecedorFormData;
  setFormData: (data: FornecedorFormData) => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

export interface ContatosGerenciamentoProps {
  contatos: Contact[];
  setContatos: (contatos: Contact[]) => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}
