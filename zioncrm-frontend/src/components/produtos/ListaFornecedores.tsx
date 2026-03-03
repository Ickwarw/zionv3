
import React, { useState, useEffect } from 'react';
import { Building2, Edit, Trash2, Eye, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import VisualizarFornecedor from './VisualizarFornecedor';
import { productsService } from '@/services/api';
import { showQuestionAlert } from '../ui/alert-dialog-question';
import { showErrorAlert } from '../ui/alert-dialog-error';
import { formatAxiosError } from '../ui/formatResponseError';
import { showWarningAlert } from '../ui/alert-dialog-warning';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPage, PaginationPrevious } from '../ui/pagination';

interface ListaFornecedoresProps {
  onElementClick: (event: React.MouseEvent, message: string) => void;
  isJuliaActive: boolean;
  newSupplierState: boolean;
  search: string;
  filterSearch: string;
}

const ListaFornecedores = ({ onElementClick, isJuliaActive, search, newSupplierState, filterSearch }: ListaFornecedoresProps) => {
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<any>(null);
  const [fornecedorList, setFornecedorList] = useState([]);
  const [originalList, setOriginalList] = useState([]);
  const [editMode, setEditMode] = useState(false);
  //Paginação
  const itemsPerPage = 20
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] =  useState(0)


  const getFornecedores = async () => {
    try {
      let params = {
        page: currentPage, 
        per_page: itemsPerPage,
        search: filterSearch,
      }
      const response = await productsService.getSuppliers(params);
      setOriginalList(response.data.suppliers);
      setTotalPages(response.data.pages)
    } catch (error) {
        console.error('Failed to get current user:', error);
        showErrorAlert('Erro ao carregar a lista de Fornecedores', formatAxiosError(error), null);
    }
  }

  const applyFilter = ()  => {
    let searchTMP = search?.trim() ?? "";
    if (searchTMP !== "") {
        const lowerSearch = searchTMP.toLowerCase();
        setFornecedorList(originalList.filter((item) => 
                item.name.toLowerCase().includes(lowerSearch) || 
                (item.email != null && item.email.toLowerCase().includes(lowerSearch)) ||
                (item.city != null && item.city.toLowerCase().includes(lowerSearch)) ||
                (item.state != null && item.state.toLowerCase().includes(lowerSearch)) ||
                (item.country != null && item.country.toLowerCase().includes(lowerSearch)) ||
                (item.contact_person != null && item.contact_person.toLowerCase().includes(lowerSearch)) ||
                (item.website != null && item.website.toLowerCase().includes(lowerSearch))
              ));
      } else {
        setFornecedorList(originalList);
      }
  }

  useEffect(() => {
    const run = async () => {
      await getFornecedores();
      setFornecedorList(originalList);
    };

    run();
  }, [ filterSearch]);

  useEffect(() => {
    const run = async () => {
      await getFornecedores();
      setFornecedorList(originalList);
    };

    run();
  }, [currentPage]);

  useEffect(() => {
    const run = async () => {
      await getFornecedores();
      setFornecedorList(originalList);
    };

    run();
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!newSupplierState ) {
        await getFornecedores();
        setFornecedorList(originalList);
        applyFilter();
      }
    };

    run();
  }, [newSupplierState]);

  useEffect(() => {
    const run = async () => {
      if (originalList == null) {
        await getFornecedores();
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

  const editFornecedor = (fornecedor: any) => {
    setEditMode(true);
    setFornecedorSelecionado(fornecedor);
  }

  const closeFornecedor = () => {
    setEditMode(false);
    setFornecedorSelecionado(null);
    getFornecedores();
  }

  const deleteFornecedor = (fornecedor) => {
    showQuestionAlert('Deletar Fornecedor?',
      `Deseja realmente deletar o Fornecedor ${fornecedor.name}?`,
      fornecedor.id,
      closeDeleteNo,
      closeDeleteYes);
  }

  const closeDeleteYes = async (supplierId) => {
    console.log("closeDeleteYes");
      try {
      const response = await productsService.deleteSupplier(supplierId);
      if (response.status == 200) {
        getFornecedores();
        } else if (response.status == 400) {
          if ('message' in response.data) {
            showWarningAlert("Não foi possível deletar o Fornecedor", response.data.message,null);
          } else {
            showWarningAlert("Não foi possível deletar o Fornecedor", response.data,null);
          }
        }
    } catch (error) {
      console.error('Failed to get delete supplier:', error);
      showErrorAlert('Erro ao Deletar o Fornecedor', formatAxiosError(error));
    }
  }
  
  const closeDeleteNo = () => {
    console.log("closeDeleteNo");
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fornecedorList?.length
                ? fornecedorList.map((fornecedor) => (
              <TableRow 
                key={fornecedor.id}
                onClick={(e) => {
                  if (isJuliaActive) {
                    onElementClick(e, `Fornecedor: ${fornecedor.name}`)
                  }
                }}
                className={`hover:bg-gray-50 cursor-pointer ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                <TableCell className="font-mono text-sm">{fornecedor.name}</TableCell>
                <TableCell className="font-mono text-sm">{fornecedor.contact_person}</TableCell>
                <TableCell className="font-mono text-sm">{fornecedor.phone}</TableCell>
                <TableCell className="font-mono text-sm">{fornecedor.email}</TableCell>
                <TableCell className="font-mono text-sm">{fornecedor.city}/{fornecedor.state}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      title="Visualizar detalhes"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isJuliaActive) {
                          onElementClick(e, "Visualizar detalhes completos do fornecedor e histórico de compras!");
                        } else {
                          setFornecedorSelecionado(fornecedor);
                        }
                      }}
                      className={isJuliaActive ? 'cursor-help' : ''}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button 
                      size="sm" 
                      title="Editar fornecedor"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isJuliaActive) {
                          onElementClick(e, "Editar informações do fornecedor como contatos e endereço!");
                        } else {
                          editFornecedor(fornecedor);
                        }
                      }}
                      className={isJuliaActive ? 'cursor-help' : ''}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isJuliaActive) {
                          onElementClick(e, "Excluir este fornecedor permanentemente do sistema!");
                        } else {
                          deleteFornecedor(fornecedor);
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
          :   <TableRow 
                className="hover:bg-gray-50 cursor-pointer"
              >
                <TableCell className="font-mono text-sm">
                  <div className="font-medium text-gray-900">Nenhum fornecedor encontrado</div>
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
      {fornecedorSelecionado && (
        <VisualizarFornecedor
          fornecedor={fornecedorSelecionado}
          editMode={editMode}
          onClose={() => closeFornecedor()}
          onElementClick={onElementClick}
          isJuliaActive={isJuliaActive}
        />
      )}
    </>
  );
};

export default ListaFornecedores;
