
import React, { useState, useEffect } from 'react';
import { Eye, Edit, Search, Plus, Trash2, TrendingUp, TrendingDown, TrendingUpDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { financialService } from '@/services/api';
import { showErrorAlert } from './ui/alert-dialog-error';
import { formatAxiosError } from './ui/formatResponseError';
import './FinancialCategory.css';
import NewCategory from './categoria/components/NewCategory';
import CategoryDetails from './categoria/components/CategoryDetails';
import { showQuestionAlert } from './ui/alert-dialog-question';
import { showWarningAlert } from './ui/alert-dialog-warning';
import { getCategoryTypeDescription, mountCategoryTypeIcon } from '@/lib/constantData';
import Tag from './ui/tag';

const FinancialCategory = () => {
  const [isJuliaActive, setIsJuliaActive] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [originalList, setOriginalList] = useState([]);
  const [search, setSearch] = useState("");
  const [categorySelected, setCategorySelected] = useState(null);
  const [juliaMessage, setJuliaMessage] = useState('');
  const [juliaPosition, setJuliaPosition] = useState({ x: 0, y: 0 });
  const [showJuliaBubble, setShowJuliaBubble] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    if (originalList != null) {
      applyFilter();
    }
  }, [originalList, search]);
  
  const handleJuliaToggle = () => {
    setIsJuliaActive(!isJuliaActive);
    if (isJuliaActive) {
      setShowJuliaBubble(false);
    }
  };

  const handleElementClick = (event: React.MouseEvent, message: string) => {
    if (isJuliaActive) {
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      setJuliaPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
      setJuliaMessage(message);
      setShowJuliaBubble(true);
    }
  };

  const handleCloseBubble = () => {
    setShowJuliaBubble(false);
  };

  const getCategories = async () => {
    try {
      const response = await financialService.getCategories();
      setOriginalList(response.data.categories);
    } catch (error) {
        console.error('Failed to get current user:', error);
        showErrorAlert('Erro ao carregar a lista de Fornecedores', formatAxiosError(error), null);
    }
  }

  const applyFilter = ()  => {
    let searchTMP = search?.trim() ?? "";
    let auxList = null;
    if (searchTMP !== "") {
        const lowerSearch = searchTMP.toLowerCase();
        auxList = originalList.filter((item) => 
                item.name.toLowerCase().includes(lowerSearch)
              );
      } else {
        auxList = originalList;
      }
      auxList = mountCategoryTypeIcon(auxList);
      setCategoryList(auxList);
  }

  const editCategory = (category: any) => {
      setEditMode(true);
      setCategorySelected(category);
    }
  
  const closeCategory = async () => {
    setEditMode(false);
    setCategorySelected(null);
    setShowNewCategory(false);
    await getCategories();
    applyFilter();
    
  }

  const deleteCategory = (category) => {
    showQuestionAlert('Deletar Categoria?',
      `Deseja realmente deletar a Categoria ${category.name}?`,
      category.id,
      closeDeleteNo,
      closeDeleteYes);
  }
  
  const closeDeleteYes = async (categoryId) => {
    console.log("closeDeleteYes");
      try {
      const response = await financialService.deleteCategory(categoryId);
      if (response.status == 200) {
        await getCategories();
        applyFilter();
        } else if (response.status == 400) {
          if ('message' in response.data) {
            showWarningAlert("Não foi possível deletar a Categoria", response.data.message,null);
          } else {
            showWarningAlert("Não foi possível deletar a Categoria", response.data,null);
          }
        }
    } catch (error) {
      console.error('Failed to get delete Category:', error);
      showErrorAlert('Erro ao Deletara Categoria', formatAxiosError(error));
    }
  }
  
  const closeDeleteNo = () => {
    console.log("closeDeleteNo");
  }

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div
            onClick={(e) => handleElementClick(e, "Esta é a seção de gerenciamento de categoria financeira!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Categorias Financeiras
            </h1>
            <p className="text-gray-600 mt-1">Gerencie as categorias</p>
          </div>
          
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div 
                onClick={(e) => handleElementClick(e, "Use este campo para buscar categorias!")}
                className={`relative ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar categorias na lista..."
                  className="pl-10 w-80"
                />
              </div>
            </div>
            
            <Button 
              onClick={(e) => {
                handleElementClick(e, "Clique aqui para cadastrar uma nova categoria!");
                setShowNewCategory(true);
              }}
              className={`flex items-center space-x-2 ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              <Plus size={20} />
              <span>Nova Categoria</span>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryList?.length
                    ? categoryList.map((category) => (
                  <TableRow 
                    key={category.id}
                    onClick={(e) => {
                      if (isJuliaActive) {
                        handleElementClick(e, `Categoria: ${category.name}`)
                      }
                    }}
                    className={`hover:bg-gray-50 cursor-pointer ${isJuliaActive ? 'cursor-help' : ''}`}
                  >
                    <TableCell className="font-mono text-sm">
                      <Tag
                        backgroundColor={category.color}
                        name={category.name}
                      />
                      {/* <span className="badge" style={{backgroundColor: `${category.color}`}}>{category.name}</span> */}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className={`w-12 h-12 ${category.icon_class} rounded-full flex items-center justify-center`}>
                        <category.icon size={20} className="text-white" />
                      </div>{getCategoryTypeDescription(category.type)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          title="Visualizar detalhes"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isJuliaActive) {
                              handleElementClick(e, "Visualizar detalhes da Categoria!");
                            } else {
                              setEditMode(false);
                              setCategorySelected(category);
                            }
                          }}
                          className={isJuliaActive ? 'cursor-help' : ''}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button 
                          size="sm" 
                          title="Editar Categoria"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isJuliaActive) {
                              handleElementClick(e, "Editar informações da Categoria!");
                            } else {
                              editCategory(category);
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
                              handleElementClick(e, "Excluir esta Categoria permanentemente do sistema!");
                            } else {
                              deleteCategory(category);
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
                      <div className="font-medium text-gray-900">Nenhuma Categoria encontrada</div>
                    </TableCell>
                    
                  </TableRow>
              }
              </TableBody>
            </Table>
          </div>

          {categorySelected && (
            <CategoryDetails
              category={categorySelected}
              onClose={() => closeCategory()}
              editMode={editMode}
              onElementClick={handleElementClick}
              isJuliaActive={isJuliaActive}
            />
          )}

           {showNewCategory && (
              <NewCategory
                onClose={() => closeCategory()} 
                onElementClick={handleElementClick}
                isJuliaActive={isJuliaActive}
              />
            )}

        </div>
      </div>
    </>
  );
};

export default FinancialCategory;
