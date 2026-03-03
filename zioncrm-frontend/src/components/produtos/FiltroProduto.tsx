import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { productsService } from '@/services/api';
import { showErrorAlert } from '../ui/alert-dialog-error';
import { formatAxiosError } from '../ui/formatResponseError';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CheckedState } from '@radix-ui/react-checkbox';
import ReactDOM from "react-dom/client";

export interface FiltroProdutoProps {
  onYes: (filter: any) => void;
  onNo: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const FiltroProduto = ({ onYes, onNo, onElementClick, isJuliaActive }: FiltroProdutoProps) => {
  const [fornecedorList, setFornecedorList] = useState([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const [categoriaList, setCategoriaList] = useState([]);
  const [categoriaSelecionado, setCategoriaSelecionado] = useState(null);
  const [search, setSearch] = useState("");
  const [onlyLowStock, setOnlyLowStock] = useState<CheckedState>(false);

  const getFornecedores = async () => {
    try {
      const response = await productsService.getSuppliers();
      setFornecedorList(response.data.suppliers);
    } catch (error) {
      console.error('Failed to get current user:', error);
      showErrorAlert('Erro ao carregar a lista de Fornecedores', formatAxiosError(error));
    }
  }

  const getCategorias = async () => {
    try {
      const response = await productsService.getProductCategories();
      setCategoriaList(response.data.categories);
    } catch (error) {
      console.error('Failed to get current user:', error);
      showErrorAlert('Erro ao carregar a lista de Categorias', formatAxiosError(error));
    }
  }

  useEffect(() => {
    getFornecedores();
    getCategorias();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let filter = {
      category_id : categoriaSelecionado,
      supplier_id : fornecedorSelecionado,
      search : search,
      low_stock : onlyLowStock
    }
    onYes(filter);
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onYes}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Formulário de filtro de produtos!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              Filtro de Produtos
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <Label
                onClick={(e) => onElementClick(e, "Fornecedor do produto!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >
                Fornecedor
              </Label>
              <Select 
                value={fornecedorSelecionado}
                onValueChange={(value) => setFornecedorSelecionado(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {fornecedorList?.length
                    ? fornecedorList.map((fornecedor) => (
                    <SelectItem key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.name}
                    </SelectItem>
                  ))
                  : <SelectItem value="0">Nenhum</SelectItem>
                }
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label 
                onClick={(e) => onElementClick(e, "Categoria do produto!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >
                Categoria
              </Label>
              <Select 
                value={categoriaSelecionado}
                onValueChange={(value) => setCategoriaSelecionado(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoriaList?.length
                    ? categoriaList.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.name}
                    </SelectItem>
                  ))
                  : <SelectItem value="0">Nenhum</SelectItem>
                }
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label 
                onClick={(e) => onElementClick(e, "Use este campo para buscar produtos por nome, modelo ou código!")}
                  className={`relative ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                Pesquisar
              </Label>
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produtos..."
              />
            </div>

            <div>
             <Checkbox 
                className="ml-20"
                checked={onlyLowStock}
                onCheckedChange={(checked) => setOnlyLowStock(checked)}
              />
              <Label 
                onClick={(e) => onElementClick(e, "Mostrar somente produtos com estoque baixo!")}
                className={isJuliaActive ? 'cursor-help' : ''}
              >
                Apenas Produtos com Estoque Baixo
              </Label>
            </div>
             
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={onNo}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit}>
              Aplicar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
};

// export default FiltroProduto;

export function showFiltroProdutoDialog(
  isJuliaActive: boolean,
  onElementClick: (event: React.MouseEvent, message: string) => void,
  onClose: (filter: any) => void,
) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = ReactDOM.createRoot(container);

  const handleYes = (params) => {
    root.unmount();
    container.remove();
    if (onClose) {
      onClose(params);
    }
  };

  const handleNo = () => {
    root.unmount();
    container.remove();
    if (onClose) {
      onClose(null);
    }
  };

  root.render(<FiltroProduto
            isJuliaActive={isJuliaActive}
            onElementClick={onElementClick}
            onYes={(params) => handleYes(params)}
            onNo={() => handleNo()}
          />);
}


