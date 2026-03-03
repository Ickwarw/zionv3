import React, { useState, useEffect } from 'react';
import { Package, Edit, Trash2, QrCode, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import VisualizarProduto from './VisualizarProduto';
import { productsService } from '@/services/api';
import FormateCurrency from '../ui/FormateCurrency';
import { showQuestionAlert } from '../ui/alert-dialog-question';
import QRCodeModal from './components/QRCodeModal';
import { showErrorAlert } from '../ui/alert-dialog-error';
import { formatAxiosError } from '../ui/formatResponseError';
import { showWarningAlert } from '../ui/alert-dialog-warning';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPage, PaginationPrevious } from '../ui/pagination';

interface ListaProdutosProps {
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
  newProdState: boolean;
  search: string;
  filterCategory: number;
  filterSupplier: number;
  filterOnlyLowStock: boolean;
  filterSearch: string;
}


const ListaProdutos = ({ onElementClick, isJuliaActive, search, newProdState, filterCategory, filterSupplier, filterOnlyLowStock, filterSearch}: ListaProdutosProps) => {
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [produtoQRCodeSelecionado, setProdutoQRCodeSelecionado] = useState<any>(null);
  const [produtoList, setProdutoList] = useState([]);
  const [originalList, setOriginalList] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const itemsPerPage = 20
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] =  useState(0)


  const getProdutos = async () => {
    try {
      let params = {
        page: currentPage, 
        per_page: itemsPerPage,
        category_id: null,
        supplier_id: null,
        search: filterSearch,
        low_stock: null
      }
      if (filterCategory) {
        params['category_id'] = filterCategory;
      }
      if (filterSupplier) {
        params['supplier_id'] = filterSupplier;
      }
      if (filterOnlyLowStock != null && filterOnlyLowStock == true) {
        params['low_stock'] = filterOnlyLowStock;
      }
      const response = await productsService.getProducts(params);
      setOriginalList(response.data.products);
      // setCurrentPage(response.data.current_page);
      setTotalPages(response.data.pages)
    } catch (error) {
        console.error('Failed to get current user:', error);
        showErrorAlert('Erro ao carregar a lista de Produtos', formatAxiosError(error));
    }
  }

  const applyFilter = ()  => {
    let searchTMP = search?.trim() ?? "";
    if (searchTMP !== "") {
        const lowerSearch = searchTMP.toLowerCase();
        setProdutoList(originalList.filter((item) => 
                item.name.toLowerCase().includes(lowerSearch) || 
                (item.description != null && item.description.toLowerCase().includes(lowerSearch)) ||
                (item.sku != null && item.sku.toLowerCase().includes(lowerSearch)) ||
                (item.serial != null && item.serial.toLowerCase().includes(lowerSearch)) ||
                (item.category != null && item.category.toLowerCase().includes(lowerSearch)) ||
                (item.supplier != null && item.supplier.toLowerCase().includes(lowerSearch))
              ));
      } else {
        setProdutoList(originalList);
      }
  }

  useEffect(() => {
    const run = async () => {
      await getProdutos();
      applyFilter();
    };

    run();
  }, [ filterCategory, filterSupplier, filterOnlyLowStock, filterSearch]);

  useEffect(() => {
    const run = async () => {
      await getProdutos();
      applyFilter();
    };

    run();
  }, [currentPage]);

  useEffect(() => {
    const run = async () => {
      if (!newProdState ) {
        await getProdutos();
      }
      applyFilter();
    };

    run();
  }, [newProdState]);


   useEffect(() => {
    const run = async () => {
      await getProdutos();
      setProdutoList(originalList);
    };

    run();
  }, []);

  useEffect(() => {
    const run = async () => {
      if (originalList == null) {
        await getProdutos();
      }
      applyFilter();
    };

    run();
  }, [search]);

  useEffect(() => {
    if (originalList != null) {
      applyFilter();
    }
  }, [originalList, search]);

  const editProduto = (produto: any) => {
    setEditMode(true);
    setProdutoSelecionado(produto);
  }

  const closeProduto = () => {
    setEditMode(false);
    setProdutoSelecionado(null);
    getProdutos();
  }

  const closeProdutoDeleteYes = async (productId) => {
    console.log("closeProdutoDeleteYes");
     try {
      const response = await productsService.deleteProduct(productId);
      if (response.status == 200) {
        getProdutos();
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível salvar o Produto", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível salvar o Produto", response.data,null);
        }
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
      showErrorAlert('Erro ao carregar a lista de Produtos', formatAxiosError(error));
    }
  }

  const closeProdutoDeleteNo = () => {
    console.log("closeProdutoDeleteNo");
  }

  const deleteProduto = (produto) => {
    showQuestionAlert('Deletar Produto?',
      `Deseja realmente deletar o produto ${produto.name}?`,
      produto.id,
      closeProdutoDeleteNo,
      closeProdutoDeleteYes);
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Valor Custo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produtoList?.length
                ? produtoList.map((produto) => (
              <TableRow 
                key={produto.id}
                onClick={(e) => {
                  if (isJuliaActive) {
                    onElementClick(e, `Produto: ${produto.name} - SKU: ${produto.sku} - Fornecedor: ${produto.supplier}`)
                  }
                }}
                className={`hover:bg-gray-50 cursor-pointer ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                <TableCell className="text-gray-600">{produto.name}</TableCell>
                <TableCell className="text-gray-600">{produto.category}</TableCell>
                <TableCell className="text-gray-600">{produto.supplier}</TableCell>
                <TableCell className="text-gray-600">{FormateCurrency(produto.cost_price)}</TableCell>
                <TableCell className="text-gray-600">{FormateCurrency(produto.price)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      title="Visualizar QR Code"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isJuliaActive) {
                          onElementClick(e, "Visualizar QR Code único deste produto para impressão ou compartilhamento!");
                        } else {
                          setProdutoQRCodeSelecionado(produto);
                        }
                      }}
                      className={isJuliaActive ? 'cursor-help' : ''}
                    >
                      <QrCode size={16} />
                    </Button>
                    <Button 
                      size="sm" 
                      title="Visualizar Detalhes"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isJuliaActive) {
                          onElementClick(e, "Visualizar detalhes completos do produto!");
                        } else {
                          setProdutoSelecionado(produto);
                        }
                      }}
                      className={isJuliaActive ? 'cursor-help' : ''}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button 
                      size="sm" 
                      title="Editar"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isJuliaActive) {
                          onElementClick(e, "Editar informações do produto como preços, status e dados!");
                        } else {
                          editProduto(produto);
                        }
                        
                      }}
                      className={isJuliaActive ? 'cursor-help' : ''}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      size="sm" 
                      title="Excluir"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isJuliaActive) {
                          onElementClick(e, "Excluir este produto permanentemente do sistema!");
                        } else {
                          // setProdutoDeleteSelecionado(produto);
                          deleteProduto(produto);
                        }
                      }}
                      className={`text-red-600 hover:text-red-800 ${isJuliaActive ? 'cursor-help' : ''}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
            : <TableRow 
                className="hover:bg-gray-50 cursor-pointer"
              >
                <TableCell className="font-mono text-sm">
                  <div className="font-medium text-gray-900">Nenhum Produto encontrado</div>
                </TableCell>
                
              </TableRow>
          }
          </TableBody>
        </Table>
        {/* Paginador */}
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationPage
                  number={i + 1}
                  isActive={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  />

              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Modal de Visualização */}
      {produtoSelecionado && (
        <VisualizarProduto
          produto={produtoSelecionado}
          editMode={editMode}
          onClose={() => closeProduto()}
          onElementClick={onElementClick}
          isJuliaActive={isJuliaActive}
        />
      )}

      {produtoQRCodeSelecionado && (
        <QRCodeModal
          isOpen={produtoQRCodeSelecionado}
          onClose={() => setProdutoQRCodeSelecionado(null)}
          formData={produtoQRCodeSelecionado}
        />
      )}
    </>
  );
};

export default ListaProdutos;
