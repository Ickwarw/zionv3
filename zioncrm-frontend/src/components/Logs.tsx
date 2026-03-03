import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, Download, Eye, FilterIcon, Brush } from 'lucide-react';
import JuliaAvatar from './JuliaAvatar';
import JuliaSpeechBubble from './JuliaSpeechBubble';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import FormateDateTime from './ui/FormateDateTime';
import { Button } from './ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPage, PaginationPrevious } from './ui/pagination';
import { logsService } from '@/services/api';
import { showErrorAlert } from './ui/alert-dialog-error';
import { formatAxiosError } from './ui/formatResponseError';
import { Select } from '@radix-ui/react-select';
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import CleanLogsDialog from './logs/CleanLogsDialog';
import LogStats from './logs/LogStats';
import { convertToCSV } from '@/lib/utils';
import { showWarningAlert } from './ui/alert-dialog-warning';
import { Input } from './ui/input';

const Logs = () => {
  const [logList, setLogList] = useState([]);
  const [dateFilter, setDateFilter] = useState('today');
  const [originalList, setOriginalList] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isJuliaActive, setIsJuliaActive] = useState(false);
  const [juliaMessage, setJuliaMessage] = useState('');
  const [juliaPosition, setJuliaPosition] = useState({ x: 0, y: 0 });
  const [showJuliaBubble, setShowJuliaBubble] = useState(false);
  const [search, setSearch] = useState('');
  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] =  useState(0);
  const [totalLogs, setTotalLogs] =  useState(0);
  const [totalLogsSuccess, setTotalLogsSuccess] =  useState(0);
  const [totalLogsWarning, setTotalLogsWarning] =  useState(0);
  const [totalLogsError, setTotalLogsError] =  useState(0);
  const [totalLogsInfo, setTotalLogsInfo] =  useState(0);
  const [showDeleteLogs, setShowDeleteLogs] = useState(false);

  
  // const dateFilters = [
  //   { label: 'Hoje', days: 0 },
  //   { label: 'Ontem', days: 1 },
  //   { label: 'Última Semana', days: 7 },
  //   { label: 'Último Mês', days: 30 },
  //   // { label: 'Personalizados', days: -1 }
  // ];
  const dateFilters = [
    { label: 'Hoje', id: 'today', days: 0 },
    { label: 'Ontem', id: 'yesterday', days: 1 },
    { label: 'Última Semana', id: 'last-week', days: 7 },
    { label: 'Último Mês', id: 'last-month', days: 30 },
    { label: 'Personalizado', id: 'custom', days: -1 }
  ];

  const formatCustomDate = (date: Date): string =>  {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  // const [filter, setFilter] = useState({
  //   startDate: formatCustomDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0, 0)),
  //   endDate: formatCustomDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)),
  //   type: "all",
  //   search: null,
  //   user_id: null,
  // });

  const [filterStartDate, setFilterStartDate] = useState(formatCustomDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0, 0)));
  const [filterEndDate, setFilterEndDate] = useState(formatCustomDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)));
  

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

  const getFilteredLogs = () => {
    if (activeTab === 'all') return logList;
    return logList.filter(log => log.log_type === activeTab);
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✗';
      default: return 'ℹ';
    }
  };

  const getLogs = async (startDate?: any, endDate?: any) => {
    try {
      let params = {
        page: currentPage, 
        per_page: itemsPerPage,
        // type: null,
        // user_id: null,
        // search: '',
        start_date: startDate ? startDate : filterStartDate,
        end_date: endDate ? endDate : filterEndDate
      }
      const response = await logsService.getLogs(params);
      setOriginalList(response.data.logs);
      applyFilter(response.data.logs);
      let total = 0;
      let warning = 0;
      let info = 0;
      let error = 0;
      let success = 0;
      response.data.logs.forEach(log => {
        total++;
        if (log.log_type == 'info') {
          info++
        } else if (log.log_type == 'warning') {
          warning++;
        } else if (log.log_type == 'error') {
          error++;
        } else if (log.log_type == 'success') {
          success++;
        }
      });
      setTotalLogs(total);
      setTotalLogsWarning(warning);
      setTotalLogsError(error);
      setTotalLogsInfo(info);
      setTotalLogsSuccess(success);
      setTotalPages(response.data.pages)
    } catch (error) {
        console.error('Failed to get current user:', error);
        showErrorAlert('Erro ao carregar a lista de Logs', formatAxiosError(error));
    }
  }

  const updateDateFilter = async (value) => {
    let days = 0;
    for (let index = 0; index < dateFilters.length; index++) {
      const element = dateFilters[index];
      if (element['id'] == value) {
        days = element['days'];
        break;
      }
    }

    let today = new Date();
    let startDate = new Date();
    startDate.setDate(today.getDate() - days);
    
    setFilterStartDate(startDate.toISOString().split('T')[0]);
    setFilterEndDate(today.toISOString().split('T')[0]);
    await getLogs(startDate.toISOString().split('T')[0], today.toISOString().split('T')[0]);
  }

  const applyCustomDateFilter = async () => {
    // setFilterStartDate(date1.toISOString().split('T')[0]);
    // setFilterEndDate(date2.toISOString().split('T')[0]);
    await getLogs();
  }

  const applyFilter = (list?)  => {
    if (list == null) {
      list = originalList;
    }
    let searchTMP = search?.trim() ?? "";
    if (searchTMP !== "") {
        const lowerSearch = searchTMP.toLowerCase();
        setLogList(list.filter((item) => 
                (item.type != null && item.type.toLowerCase().includes(lowerSearch)) ||
                (item.message != null && item.message.toLowerCase().includes(lowerSearch))
              ));
      } else {
        setLogList(list);
      }
  }

  // const cleanLogsNo = () => {
  //   console.log("cleanLogsNo");
  //   setShowDeleteLogs(false);
  // }

  //  const cleanLogsYes = () => {
  //   console.log("cleanLogsYes");
  //   setShowDeleteLogs(false);
  //   applyCustomDateFilter();
  // }

  useEffect(() => {
    const run = async () => {
      await getLogs();
      applyFilter();
    };
    run();
  }, [currentPage]);

  const handleDownload = async () => {
    let data = [];
    try {
      let params = {
        // type: null,
        // user_id: null,
        // search: '',
        start_date: filterStartDate,
        end_date: filterEndDate
      }
      const response = await logsService.exportLogs(params);
      if (response.status == 200) {
        data = response.data.logs;
        console.log("handleDownload --> Count: ", response.data.count, " Data Geração: ", response.data.export_date);
        const csvString = convertToCSV(data); // Use the conversion function from above
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `logs-export-${new Date().getTime()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível salvar o Produto", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível salvar o Produto", response.data,null);
        }
        return;
      }
    } catch (error) {
        console.error('Failed to get current user:', error);
        showErrorAlert('Erro ao carregar a lista de Logs', formatAxiosError(error));
        return;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Julia Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleJuliaToggle}
          className="p-3 rounded-full shadow-lg transition-all duration-300"
        >
          <JuliaAvatar isActive={isJuliaActive} isVisible={false} />
        </button>
      </div>

      {/* Julia Speech Bubble */}
      <JuliaSpeechBubble
        isVisible={showJuliaBubble}
        message={juliaMessage}
        onClose={handleCloseBubble}
        position={juliaPosition}
      />

      <div className="flex justify-between items-center">
        <div
          onClick={(e) => handleElementClick(e, "Esta é a seção de Logs do Sistema onde você pode monitorar todas as atividades e eventos que acontecem no sistema!")}
          className={isJuliaActive ? 'cursor-help' : ''}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Logs do Sistema
          </h1>
          <p className="text-gray-600 mt-1">Monitore todas as atividades do sistema</p>
        </div>
        <div className="flex space-x-3">
          {/* <Button 
            onClick={(e) => {
              if (isJuliaActive) {
                handleElementClick(e, "Apagar logs!")
              } else {
                setShowDeleteLogs(true);
              }
            }}
            className={`flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <Brush size={20} />
            <span>Apagar</span>
          </Button> */}
          <button 
            onClick={(e) => {
              if (isJuliaActive) {
                handleElementClick(e, "Use este botão para exportar os logs do sistema!");
              } else {
                handleDownload();
              }
            }}
            className={`flex items-center space-x-2 px-4 py-2 border border-blue-300 bg-blue-500 rounded-lg text-white hover:text-black hover:bg-blue-100 ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <Download size={20} />
            <span>Exportar</span>
          </button>
          {/* <button 
            onClick={(e) => handleElementClick(e, "Configure filtros avançados para os logs!")}
            className={`flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <Filter size={20} />
            <span>Filtros</span>
          </button> */}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav 
            onClick={(e) => handleElementClick(e, "Use estas abas para filtrar os logs por tipo: todos, informações, sucessos, avisos ou erros!")}
            className={`flex space-x-8 px-6 ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Todos ({totalLogs})
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Info ({totalLogsInfo})
            </button>
            <button
              onClick={() => setActiveTab('success')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'success'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sucesso ({totalLogsSuccess})
            </button>
            <button
              onClick={() => setActiveTab('warning')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'warning'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Avisos ({totalLogsWarning})
            </button>
            <button
              onClick={() => setActiveTab('error')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'error'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Erros ({totalLogsError})
            </button>
          </nav>
        </div>

        <div className="p-6">
          <div 
            onClick={(e) => handleElementClick(e, "Use estes controles para buscar logs específicos e selecionar o período de análise!")}
            className={`flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6 ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar logs..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <Select
                value={dateFilter}
                onValueChange={(value) => {
                  setDateFilter(value);
                  updateDateFilter(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {dateFilters.map((date) => (
                    <SelectItem key={date.id} value={date.id}>
                      {date.label}
                    </SelectItem>
                  ))
                }
                </SelectContent>
              </Select>
              
              {/* Data Personalizada */}
              {dateFilter &&
                  dateFilter == 'custom' && (
                <div>
                  {/* <label className="block text-sm font-medium text-gray-700 mb-2">Data Inicial</label> */}
                  <input
                    type="date"
                    title="Data Inicial"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {dateFilter &&
                  dateFilter == 'custom' && (
                <div>
                  {/* <label className="block text-sm font-medium text-gray-700 mb-2">Data Final</label> */}
                  <input
                    type="date"
                    title="Data Final"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {dateFilter &&
                  dateFilter == 'custom' && (
                <div className='content-end'>
                  <Button
                      onClick={(e) => applyCustomDateFilter()}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      <FilterIcon size={18} />
                      <span>Aplicar Filtros</span>
                  </Button>
                </div>
              )}
             
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Tipo</TableHead>
                  {/* <TableHead>Ações</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredLogs()?.length
                    ? getFilteredLogs().map((log) => (
                  <TableRow 
                    key={log.id}
                    onClick={(e) => {
                      if (isJuliaActive) {
                        handleElementClick(e, `Log: ${log.user_id} - Tipo: ${log.log_type}`)
                      }
                    }}
                    className={`hover:bg-gray-50 cursor-pointer ${isJuliaActive ? 'cursor-help' : ''}`}
                  >
                    <TableCell className="text-gray-600">{FormateDateTime(log.created_at)}</TableCell>
                    <TableCell className="text-gray-600">{log.user_id}</TableCell>
                    <TableCell className="text-gray-600">{log.ip_address}</TableCell>
                    <TableCell className="text-gray-600">{log.message}</TableCell>
                    <TableCell className="text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center space-x-1 ${getTypeColor(log.log_type)}`}>
                        <span>{getTypeIcon(log.log_type)}</span>
                        <span className="capitalize">{log.log_type}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600">{log.price}</TableCell>
                    {/* <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          title="Visualizar Detalhes"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isJuliaActive) {
                              handleElementClick(e, "Visualizar detalhes completos do Log!");
                            // } else {
                            //   setProdutoSelecionado(produto);
                            }
                          }}
                          className={isJuliaActive ? 'cursor-help' : ''}
                        >
                          <Eye size={16} />
                        </Button>
                      </div>
                    </TableCell> */}
                  </TableRow>
                ))
                : <TableRow 
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <TableCell className="font-mono text-sm">
                      <div className="font-medium text-gray-900">Nenhum Log encontrado</div>
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
        </div>
      </div>
      <LogStats
         handleElementClick={handleElementClick}
         isJuliaActive={isJuliaActive}
      />

      {/* { showDeleteLogs && (
        <CleanLogsDialog
          isJuliaActive={isJuliaActive}
          onElementClick={handleElementClick}
          onNo={cleanLogsNo}
          onYes={cleanLogsYes}
          showDeleteLogs={showDeleteLogs}
        />
      )} */}
    </div>
  );
};

export default Logs;
