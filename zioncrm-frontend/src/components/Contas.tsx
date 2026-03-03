
import React, { useState, useEffect } from 'react';
import { Eye, Edit, Search, Plus } from 'lucide-react';
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
import { getAccountTypeDescription } from '@/lib/constantData';

const Contas = () => {
  const [isJuliaActive, setIsJuliaActive] = useState(false);
  const [accountList, setAccountList] = useState([]);
  const [originalList, setOriginalList] = useState([]);
  const [search, setSearch] = useState("");
  const [accountSelected, setAccountSelected] = useState(null);
  const [juliaMessage, setJuliaMessage] = useState('');
  const [juliaPosition, setJuliaPosition] = useState({ x: 0, y: 0 });
  const [showJuliaBubble, setShowJuliaBubble] = useState(false);
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    getAccounts();
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

  const getAccounts = async () => {
    try {
      const response = await financialService.getAccounts();
      setOriginalList(response.data.accounts);
    } catch (error) {
        console.error('Failed to get current user:', error);
        showErrorAlert('Erro ao carregar a lista de Fornecedores', formatAxiosError(error), null);
    }
  }

  const applyFilter = ()  => {
    let searchTMP = search?.trim() ?? "";
    if (searchTMP !== "") {
        const lowerSearch = searchTMP.toLowerCase();
        setAccountList(originalList.filter((item) => 
                item.name.toLowerCase().includes(lowerSearch) || 
                (item.description != null && item.description.toLowerCase().includes(lowerSearch)) ||
                (item.city != null && item.city.toLowerCase().includes(lowerSearch)) ||
                (item.user_id != null && item.user_id.toLowerCase().includes(lowerSearch))
              ));
      } else {
        setAccountList(originalList);
      }
  }

 const closeAccount = async () => {
    setEditMode(false);
    setShowNewAccount(false);
    setAccountSelected(null);
    await getAccounts();
    applyFilter();
  }

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div
            onClick={(e) => handleElementClick(e, "Esta é a seção de gerenciamento de contas financeiras!")}
            className={isJuliaActive ? 'cursor-help' : ''}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Contas
            </h1>
            <p className="text-gray-600 mt-1">Gerencie contas</p>
          </div>
          
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div 
                onClick={(e) => handleElementClick(e, "Use este campo para buscar Contas!")}
                className={`relative ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar contas na lista..."
                  className="pl-10 w-80"
                />
              </div>
            </div>
            
            <Button 
              onClick={(e) => {
                handleElementClick(e, "Clique aqui para cadastrar uma nova conta!");
                setShowNewAccount(true);
              }}
              className={`flex items-center space-x-2 ${isJuliaActive ? 'cursor-help' : ''}`}
            >
              <Plus size={20} />
              <span>Nova Conta</span>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Moeda</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountList?.length
                    ? accountList.map((account) => (
                  <TableRow 
                    key={account.id}
                    onClick={(e) => {
                      if (isJuliaActive) {
                        handleElementClick(e, `Conta: ${account.name}`)
                      }
                    }}
                    className={`hover:bg-gray-50 cursor-pointer ${isJuliaActive ? 'cursor-help' : ''}`}
                  >
                    <TableCell className="font-mono text-sm">{account.name}</TableCell>
                    <TableCell className="font-mono text-sm">{getAccountTypeDescription(account.account_type)}</TableCell>
                    <TableCell className="font-mono text-sm">{account.user_id}</TableCell>
                    <TableCell className="font-mono text-sm">{account.currency}</TableCell>
                    <TableCell className="font-mono text-sm">{FormateCurrency(account.balance)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          title="Visualizar detalhes"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isJuliaActive) {
                              handleElementClick(e, "Visualizar detalhes das contas!");
                            } else {
                              setAccountSelected(account);
                            }
                          }}
                          className={isJuliaActive ? 'cursor-help' : ''}
                        >
                          <Eye size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              :   <TableRow 
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <TableCell className="font-mono text-sm">
                      <div className="font-medium text-gray-900">Nenhuma conta encontrada</div>
                    </TableCell>
                    
                  </TableRow>
              }
              </TableBody>
            </Table>
          </div>

          {accountSelected && (
            <AccountDetails
              account={accountSelected}
              onClose={() => setAccountSelected(null)}
              onElementClick={handleElementClick}
              isJuliaActive={isJuliaActive}
            />
          )}

           {showNewAccount && (
              <NewAccount 
                onClose={() => closeAccount()} 
                onElementClick={handleElementClick}
                isJuliaActive={isJuliaActive}
              />
            )}

        </div>
      </div>
    </>
  );
};

export default Contas;
