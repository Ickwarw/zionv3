import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import ReactDOM from "react-dom/client";

export interface FiltroFornecedorProps {
  onYes: (filter: any) => void;
  onNo: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const FiltroFornecedor = ({ onYes, onNo, onElementClick, isJuliaActive }: FiltroFornecedorProps) => {
  const [search, setSearch] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let filter = {
      search : search
    }
    onYes(filter);
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onYes}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Formulário de filtro de fornecedores!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              Filtro de Fornecedores
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">

            <div>
              <Label 
                onClick={(e) => onElementClick(e, "Use este campo para buscar fornecedores por nome, e-mail, telefone ou nome do contato!")}
                  className={`relative ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                Pesquisar
              </Label>
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar fornecedores..."
              />
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

export function showFiltroFornecedorDialog(
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

  root.render(<FiltroFornecedor
            isJuliaActive={isJuliaActive}
            onElementClick={onElementClick}
            onYes={(params) => handleYes(params)}
            onNo={() => handleNo()}
          />);
}


