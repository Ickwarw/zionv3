
import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { QrCode } from 'lucide-react';
import { FormComponentProps } from '../types/cadastro-produto.types';
import { productsService } from '@/services/api';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import CurrencyInput from '@/components/ui/CurrencyInput';

const ManualForm = ({ formData, setFormData, onSubmit, onElementClick, isJuliaActive }: FormComponentProps) => {
  const [fornecedorList, setFornecedorList] = useState([]);
  const [categoriaList, setCategoriaList] = useState([]);

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

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label 
            onClick={(e) => onElementClick(e, "Nome do produto - campo obrigatório!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            Nome do Produto *
          </Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Ex: Smartphone Galaxy S23"
            required
          />
        </div>

        <div>
          <Label 
            onClick={(e) => onElementClick(e, "Descrição do produto!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            Descrição
          </Label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Ex: SM-S911B"
          />
        </div>

        <div>
          <Label 
            onClick={(e) => onElementClick(e, "SKU do produto!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            SKU
          </Label>
          <Input
            value={formData.sku}
            onChange={(e) => setFormData({...formData, sku: e.target.value})}
          />
        </div>

        <div>
          <Label 
            onClick={(e) => onElementClick(e, "Fornecedor do produto!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            Fornecedor
          </Label>
          <Select 
              value={formData.supplier_id?.toString() ?? ""}
              onValueChange={(value) => {
                const selectedFornecedor = fornecedorList.find(f => f.id.toString() === value);
                setFormData({
                  ...formData,
                  supplier_id: Number(value), // convert back to number
                  supplier: selectedFornecedor ? selectedFornecedor.name : ""
                });
              }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o fornecedor" />
            </SelectTrigger>
            <SelectContent>
              {fornecedorList?.length
                ? fornecedorList.map((fornecedor) => (
                <SelectItem key={fornecedor.id} value={fornecedor.id.toString()}>
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
              value={formData.category_id?.toString() ?? ""}
              onValueChange={(value) => {
                const selectedCategoria = categoriaList.find(c => c.id.toString() === value);
                setFormData({
                  ...formData,
                  category_id: Number(value), // convert back to number
                  category: selectedCategoria ? selectedCategoria.name : ""
                });
              }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categoriaList?.length
                ? categoriaList.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id.toString()}>
                  {categoria.name}
                </SelectItem>
              ))
              : <SelectItem value="0">Nenhum</SelectItem>
            }
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 
          onClick={(e) => onElementClick(e, "Seção com os dados sobre Valores!")}
          className={`text-lg font-semibold text-gray-900 ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          Valores
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label 
              onClick={(e) => onElementClick(e, "Valor pago na compra do produto!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              Valor da Custo
            </Label>
            {/* <Input
              value={formData.cost_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cost_price: Number(e.target.value) // convert string → number
                })
              }
              placeholder="Ex: 2299.00"
              type="number"
              step="0.01"
            /> */}
            <CurrencyInput
              value={formData.cost_price}
              onChange={(value) => 
                setFormData({
                  ...formData,
                  cost_price: Number(value.replace('R$', '').replace(".","").replace(",",".")) 
                })
              }
              placeholder="R$ 2299.00"
            />
          </div>
          

          <div>
            <Label 
              onClick={(e) => onElementClick(e, "Valor de revenda do produto!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              Valor de Revenda
            </Label>
            {/* <Input
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: Number(e.target.value) // convert string → number
                })
              }
              placeholder="Ex: 2899.00"
              type="number"
              step="0.01"
            /> */}
            <CurrencyInput
              value={formData.price}
              onChange={(value) => 
                setFormData({
                  ...formData,
                  price: Number(value.replace('R$', '').replace(".","").replace(",",".")) 
                })
              }
              placeholder="R$ 2299.00"
            />
          </div>
          

          <div>
            <Label 
              onClick={(e) => onElementClick(e, "Valor do Imposto do produto!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              Imposto
            </Label>
            {/* <Input
              value={formData.tax_rate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tax_rate: Number(e.target.value) // convert string → number
                })
              }
              placeholder="Ex: 2899.00"
              type="number"
              step="0.01"
            /> */}
            <CurrencyInput
              value={formData.tax_rate}
              onChange={(value) => 
                setFormData({
                  ...formData,
                  tax_rate: Number(value.replace('R$', '').replace(".","").replace(",",".")) 
                })
              }
              placeholder="R$ 2299.00"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 
          onClick={(e) => onElementClick(e, "Seção com os dados sobre Especificações Físicas!")}
          className={`text-lg font-semibold text-gray-900 ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          Especificações Físicas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label 
              onClick={(e) => onElementClick(e, "Peso do produto!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              Peso
            </Label>
            <Input
              value={formData.weight}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  weight: Number(e.target.value) // convert string → number
                })
              }
              placeholder="Ex: 3.00"
              type="number"
              step="0.1"
            />
          </div>

          <div>
            <Label 
              onClick={(e) => onElementClick(e, "Dimensões do produto!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              Dimensões
            </Label>
            <Input
              value={formData.dimensions}
              onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 
          onClick={(e) => onElementClick(e, "Seção com os dados sobre o Inventário (Estoque)!")}
          className={`text-lg font-semibold text-gray-900 ${isJuliaActive ? 'cursor-help' : ''}`}
        >
          Inventário
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label 
              onClick={(e) => onElementClick(e, "Quantidade em estoque!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              Quantidade em estoque
            </Label>
            <Input
              value={formData.quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: Number(e.target.value) // convert string → number
                })
              }
              placeholder="Ex: 3"
              type="number"
              step="1"
            />
          </div>

          <div>
            <Label 
              onClick={(e) => onElementClick(e, "Nível de Reposição!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              Nível de Reposição
            </Label>
            <Input
              value={formData.reorder_level}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reorder_level: Number(e.target.value) // convert string → number
                })
              }
              placeholder="Ex: 3"
              type="number"
              step="1"
            />
          </div>

          <div>
            <Label 
              onClick={(e) => onElementClick(e, "Quantidade de Reposição!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              Quantidade de Reposição
            </Label>
            <Input
              value={formData.reorder_quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reorder_quantity: Number(e.target.value) // convert string → number
                })
              }
              placeholder="Ex: 3"
              type="number"
              step="1"
            />
          </div>

          <div>
            <Label 
              onClick={(e) => onElementClick(e, "Localização do estoque!")}
              className={isJuliaActive ? 'cursor-help' : ''}
            >
              Localização
            </Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
        </div>
       
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="submit">
          <QrCode size={20} className="mr-2" />
          Cadastrar e Gerar QR Code
        </Button>
      </div>
    </form>
  );
};

export default ManualForm;
