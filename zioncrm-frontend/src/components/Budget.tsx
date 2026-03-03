
import React, { useState, useEffect } from 'react';
import { Eye, Edit, Search, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import JuliaAvatar from './JuliaAvatar';
import JuliaSpeechBubble from './JuliaSpeechBubble';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { financialService } from '@/services/api';
import { showErrorAlert } from './ui/alert-dialog-error';
import { formatAxiosError } from './ui/formatResponseError';
import NewAccount from './contas/components/NewAccount';
import AccountDetails from './contas/components/AccountDetails';
import FormateCurrency from './ui/FormateCurrency';
import { budgetPeriod, getBudgetPeriodDescription } from '@/lib/constantData';
import NewBudget from './budget/components/NewBudget';
import BudgetDetails from './budget/components/BudgetDetails';
import { showQuestionAlert } from './ui/alert-dialog-question';
import { showWarningAlert } from './ui/alert-dialog-warning';

const Budget = () => {
  
  const [isJuliaActive, setIsJuliaActive] = useState(false);
  const [budgetList, setBudgetList] = useState([]);
  const [originalList, setOriginalList] = useState([]);
  const [search, setSearch] = useState("");
  const [budgetSelected, setBudgetSelected] = useState(null);
  const [juliaMessage, setJuliaMessage] = useState('');
  const [juliaPosition, setJuliaPosition] = useState({ x: 0, y: 0 });
  const [showJuliaBubble, setShowJuliaBubble] = useState(false);
  const [showNewBudget, setShowNewBudget] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    getBudgets();
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

  const getBudgets = async () => {
    try {
      const response = await financialService.getBudgets();
      setOriginalList(response.data.budgets);
    } catch (error) {
        console.error('Failed to get budgets :', error);
        showErrorAlert('Erro ao carregar a lista de Orçamentos', formatAxiosError(error), null);
    }
  }

  const applyFilter = ()  => {
    let searchTMP = search?.trim() ?? "";
    if (searchTMP !== "") {
        const lowerSearch = searchTMP.toLowerCase();
        setBudgetList(originalList.filter((item) => 
                item.name.toLowerCase().includes(lowerSearch) || 
                (item.category_name != null && item.category_name.toLowerCase().includes(lowerSearch))
              ));
      } else {
        setBudgetList(originalList);
      }
  }

  const closeBudget = async () => {
    setEditMode(false);
    setShowNewBudget(false);
    setBudgetSelected(null);
    await getBudgets();
    applyFilter();
  }

  const editBudget = (budget) => {
    setEditMode(true);
    setBudgetSelected(budget);
  }
  
  const deleteBudget = (budget) => {
    showQuestionAlert('Deletar Orçamento?',
      `Deseja realmente deletar o Orçamento ${budget.name}?`,
      budget.id,
      closeDeleteNo,
      closeDeleteYes);
  }

  const closeDeleteYes = async (budgetId) => {
    console.log("closeDeleteYes");
      try {
      const response = await financialService.deleteBudget(budgetId);
      if (response.status == 200) {
        await getBudgets();
        applyFilter();
        } else if (response.status == 400) {
          if ('message' in response.data) {
            showWarningAlert("Não foi possível deletar o Orçamento", response.data.message,null);
          } else {
            showWarningAlert("Não foi possível deletar o Orçamento", response.data,null);
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
            onClick={(e) => handleElementClick(e, "Esta é a seção de gerenciamento de Orçamentos!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Orçamentos
            </h1>
            <p className="text-gray-600 mt-1">Gerencie orçamentos</p>
          </div>
          
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div 
                onClick={(e) => handleElementClick(e, "Use este campo para buscar Orçamentos!")}
                className={`relative ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar orçamentos na lista..."
                  className="pl-10 w-80"
                />
              </div>
            </div>
            
            <Button 
              onClick={(e) => {
                handleElementClick(e, "Clique aqui para cadastrar um novo Orçamento!");
                setShowNewBudget(true);
              }}
              className={`flex items-center space-x-2 ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              <Plus size={20} />
              <span>Novo Orçamento</span>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Porcentagem</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetList?.length
                    ? budgetList.map((budget) => (
                  <TableRow 
                    key={budget.id}
                    onClick={(e) => {
                      if (isJuliaActive) {
                        handleElementClick(e, `Conta: ${budget.name}`)
                      }
                    }}
                    className={`hover:bg-gray-50 cursor-pointer ${isJuliaActive ? 'cursor-help' : ''}`}
                  >
                    <TableCell className="font-mono text-sm">{budget.name}</TableCell>
                    <TableCell className="font-mono text-sm">{budget.user_id}</TableCell>
                    <TableCell className="font-mono text-sm">{getBudgetPeriodDescription(budget.period)}</TableCell>
                    <TableCell className="font-mono text-sm">{FormateCurrency(budget.amount)}</TableCell>
                    <TableCell className="font-mono text-sm">{budget.category_name}</TableCell>
                    <TableCell className="font-mono text-sm">{budget.percentage}</TableCell>
                    
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          title="Visualizar detalhes"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isJuliaActive) {
                              handleElementClick(e, "Visualizar detalhes do Orçamento!");
                            } else {
                              setBudgetSelected(budget);
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
                              handleElementClick(e, "Editar informações do Orçamento!");
                            } else {
                              editBudget(budget);
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
                              handleElementClick(e, "Excluir este Orçamento permanentemente do sistema!");
                            } else {
                              deleteBudget(budget);
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
                      <div className="font-medium text-gray-900">Nenhum Orçamento encontrado</div>
                    </TableCell>
                    
                  </TableRow>
              }
              </TableBody>
            </Table>
          </div>

          {budgetSelected && (
            <BudgetDetails
              budget={budgetSelected}
              editMode={editMode}
              onClose={() => closeBudget()}
              onElementClick={handleElementClick}
              isJuliaActive={isJuliaActive}
            />
          )}

          {showNewBudget && (
            <NewBudget 
              onClose={() => closeBudget()} 
              onElementClick={handleElementClick}
              isJuliaActive={isJuliaActive}
            />
          )} 

        </div>
      </div>
    </>
  );
};

export default Budget;
