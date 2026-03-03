
import React, { useState, useEffect } from 'react';
import { Package, Save, X, QrCode, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { FormData } from './types/cadastro-produto.types';
import { productsService } from '@/services/api';
import FormateCurrency from '../ui/FormateCurrency';
import QRCodeModal from './components/QRCodeModal';
import { showWarningAlert } from '../ui/alert-dialog-warning';
import { showErrorAlert } from '../ui/alert-dialog-error';
import { formatAxiosError } from '../ui/formatResponseError';
import CurrencyInput from '../ui/CurrencyInput';


interface VisualizarProdutoProps {
  produto: FormData;
  editMode: boolean;
  onClose: () => void;
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
}

const VisualizarProduto = ({ produto, onClose, onElementClick, isJuliaActive, editMode }: VisualizarProdutoProps) => {
  const [localProduto, setLocalProduto] = useState(produto);
  const [isEditing, setIsEditing] = useState(editMode);
  const [produtoQRCodeSelecionado, setProdutoQRCodeSelecionado] = useState<any>(null);
  const [fornecedorList, setFornecedorList] = useState([]);
  const [categoriaList, setCategoriaList] = useState([]);
  const [formData, setFormData] = useState({
    id: localProduto.id,
    name: localProduto.name,
    description: localProduto.description,
    sku: localProduto.sku,
    cost_price: localProduto.cost_price,
    price: localProduto.price,
    category_id: localProduto.category_id,
    category: localProduto.category,
    supplier_id: localProduto.supplier_id,
    supplier: localProduto.supplier,
    tax_rate: localProduto.tax_rate,
    weight: localProduto.weight,
    dimensions: localProduto.dimensions,
    barcode: localProduto.barcode,
    qr_code: localProduto.qr_code,
    created_by: localProduto.created_by,
    created_at: localProduto.created_at,
    updated_at: localProduto.updated_at,
    quantity: localProduto.inventory.quantity,
    reorder_level: localProduto.inventory.reorder_level,
    reorder_quantity: localProduto.inventory.reorder_quantity,
    location: localProduto.inventory.location,
  });


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
    if (isEditing) {
      getFornecedores();
      getCategorias();
    } else {
      setCategoriaList([]);
      setFornecedorList([]);
    }
  }, [isEditing]);

  const handleSave = async () => {
    try {
      const response = await productsService.updateProduct(formData.id, formData);
      if (response.status == 200) {
        setFormData({
          id: response.data.product.id,
          name: response.data.product.name,
          description: response.data.product.description,
          sku: response.data.product.sku,
          cost_price: response.data.product.cost_price,
          price: response.data.product.price,
          category_id: response.data.product.category_id,
          category: response.data.product.category,
          supplier_id: response.data.product.supplier_id,
          supplier: response.data.product.supplier,
          tax_rate: response.data.product.tax_rate,
          weight: response.data.product.weight,
          dimensions: response.data.product.dimensions,
          barcode: response.data.product.barcode,
          qr_code: response.data.product.qr_code,
          created_by: response.data.product.created_by,
          created_at: response.data.product.created_at,
          updated_at: response.data.product.updated_at,
          quantity: response.data.product.inventory.quantity,
          reorder_level: response.data.product.inventory.reorder_level,
          reorder_quantity: response.data.product.inventory.reorder_quantity,
          location: response.data.product.inventory.location,
        });
        setLocalProduto({
          ...response.data.product,
          quantity: response.data.product.inventory.quantity,
          reorder_level: response.data.product.inventory.reorder_level,
          reorder_quantity: response.data.product.inventory.reorder_quantity,
          location: response.data.product.inventory.location
        });
        setIsEditing(false);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível salvar o Produto", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível salvar o Produto", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to create Product:', error);
        showErrorAlert('Erro ao Salvar o Produto', formatAxiosError(error));
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle 
              onClick={(e) => onElementClick(e, "Visualização e edição detalhada do produto!")}
              className={`flex items-center ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              <Package size={24} className="mr-2" />
              {isEditing ? 'Editar Produto' : 'Visualizar Produto'}
            </DialogTitle>
            <div className="flex space-x-2">
              {!isEditing && (
                <Button 
                  onClick={() => setIsEditing(true)}
                  size="sm"
                >
                  Editar
                </Button>
              )}
              {!isEditing && (
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isJuliaActive) {
                      onElementClick(e, "Visualizar QR Code do produto!");
                    } else {
                      setProdutoQRCodeSelecionado(produto);
                    }
                  }}
                  size="sm"
                  className={isJuliaActive ? 'cursor-help' : ''}
                >
                  <QrCode size={16} />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informações do Produto</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome do Produto</Label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{localProduto.name}</p>
                )}
              </div>

              <div>
                <Label>Descrição</Label>
                {isEditing ? (
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{localProduto.description}</p>
                )}
              </div>

              <div>
                <Label>SKU</Label>
                {isEditing ? (
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{localProduto.sku}</p>
                )}
              </div>

              <div>
                <Label>Categoria</Label>
                {isEditing ? (
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
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{localProduto.category}</p>
                )}
              </div>

              <div>
                <Label>Fornecedor</Label>
                {isEditing ? (
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
                ) : (
                  <p className="p-2 bg-gray-50 rounded min-height-40">{localProduto.supplier}</p>
                )}
              </div>

            </div>
          </div>

          {/* Valores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Valores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Valor de Custo</Label>
                {isEditing ? (
                  // <Input
                  //   value={formData.cost_price}
                  //   onChange={(e) =>
                  //     setFormData({
                  //       ...formData,
                  //       cost_price: Number(e.target.value) // convert string → number
                  //     })
                  //   }
                  //   placeholder="Ex: 2299.00"
                  //   type="number"
                  //   step="0.01"
                  // />
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
                ) : (
                  <p className="p-2 bg-red-50 rounded text-red-600 font-medium min-height-40">{FormateCurrency(localProduto.cost_price)}</p>
                )}
              </div>

              <div>
                <Label>Valor de Revenda</Label>
                {isEditing ? (
                  // <Input
                  //   value={formData.price}
                  //   onChange={(e) =>
                  //     setFormData({
                  //       ...formData,
                  //       price: Number(e.target.value) // convert string → number
                  //     })
                  //   }
                  //   placeholder="Ex: 2899.00"
                  //   type="number"
                  //   step="0.01"
                  // />
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
                ) : (
                  <p className="p-2 bg-green-50 rounded text-green-600 font-medium min-height-40">{FormateCurrency(localProduto.price)}</p>
                )}
              </div>

              <div>
                <Label>Imposto</Label>
                {isEditing ? (
                  // <Input
                  //   value={formData.tax_rate}
                  //   onChange={(e) =>
                  //     setFormData({
                  //       ...formData,
                  //       tax_rate: Number(e.target.value) // convert string → number
                  //     })
                  //   }
                  //   placeholder="Ex: 2899.00"
                  //   type="number"
                  //   step="0.01"
                  // />
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
                ) : (
                  <p className="p-2 bg-red-50 rounded text-red-600 font-medium min-height-40">{FormateCurrency(localProduto.tax_rate)}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Especificações Físicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label 
                  onClick={(e) => onElementClick(e, "Peso do produto!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >
                  Peso
                </Label>
                {isEditing ? (
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
                  ) : (
                    <p className="p-2 bg-gray-50 rounded min-height-40">{localProduto.weight}</p>
                  )
                }
              </div>

              <div>
                <Label 
                  onClick={(e) => onElementClick(e, "Dimensões do produto!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >
                  Dimensões
                </Label>
                {isEditing ? (
                    <Input
                      value={formData.dimensions}
                      onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded min-height-40">{localProduto.dimensions}</p>
                  )
                }
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Inventário</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label 
                  onClick={(e) => onElementClick(e, "Quantidade em estoque!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >
                  Quantidade em estoque
                </Label>
                {isEditing ? (
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
                  ) : (
                    <p className="p-2 bg-gray-50 rounded min-height-40">{localProduto.inventory.quantity}</p>
                  )
                }
              </div>

              <div>
                <Label 
                  onClick={(e) => onElementClick(e, "Nível de Reposição!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >
                  Nível de Reposição
                </Label>
                {isEditing ? (
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
                  ) : (
                    <p className="p-2 bg-gray-50 rounded min-height-40">{localProduto.inventory.reorder_level}</p>
                  )
                }
              </div>

              <div>
                <Label 
                  onClick={(e) => onElementClick(e, "Quantidade de Reposição!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >
                  Quantidade de Reposição
                </Label>
                {isEditing ? (
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
                  ) : (
                    <p className="p-2 bg-gray-50 rounded min-height-40">{localProduto.inventory.reorder_quantity}</p>
                  )
                }
              </div>

              <div>
                <Label 
                  onClick={(e) => onElementClick(e, "Localização do estoque!")}
                  className={isJuliaActive ? 'cursor-help' : ''}
                >
                  Localização
                </Label>
                {isEditing ? (
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded min-height-40">{localProduto.inventory.location}</p>
                  )
                }
              </div>
            </div>
          </div>


          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3 pt-4">
            {isEditing ? (
              <>
                <Button onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save size={16} className="mr-2" />
                  Salvar Alterações
                </Button>
              </>
            ) : (
              <Button onClick={onClose}>
                Fechar
              </Button>
            )}
          </div>
        </div>

        {produtoQRCodeSelecionado && (
          <QRCodeModal
            isOpen={produtoQRCodeSelecionado}
            onClose={() => setProdutoQRCodeSelecionado(null)}
            formData={produtoQRCodeSelecionado}
          />
        )}

      </DialogContent>
    </Dialog>
  );
};

export default VisualizarProduto;
