import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import JuliaAvatar from './JuliaAvatar';
import JuliaSpeechBubble from './JuliaSpeechBubble';
import NovaTransacaoModal from './financeiro/components/NovaTransacaoModal';
import FiltroFinanceiro from './financeiro/components/FiltroFinanceiro';
import FinancialStats from './financeiro/components/FinancialStats';
import FinanceiroTabs from './financeiro/components/FinanceiroTabs';
import TransactionList from './financeiro/components/TransactionList';
import ReportsSection from './financeiro/components/ReportsSection';
import { Transacao, FiltroFinanceiro as FiltroType } from './financeiro/types/financeiro.types';
import { financialService } from '@/services/api';
import { showErrorAlert } from './ui/alert-dialog-error';
import { formatAxiosError } from './ui/formatResponseError';
import { showWarningAlert } from './ui/alert-dialog-warning';

const Financeiro = () => {
  const [activeTab, setActiveTab] = useState('receitas');
  const [isJuliaActive, setIsJuliaActive] = useState(false);
  const [juliaMessage, setJuliaMessage] = useState('');
  const [juliaPosition, setJuliaPosition] = useState({ x: 0, y: 0 });
  const [showJuliaBubble, setShowJuliaBubble] = useState(false);
  const [showNovaTransacao, setShowNovaTransacao] = useState(false);
  const [incomeList, setIncomeList] = useState<Transacao[]>([]);
  const [expenseList, setExpenseList] = useState<Transacao[]>([]);
  const itemsPerPageIncome = 20
  const itemsPerPageExpense = 20
  const [totalExpensePages, setTotalExpensePages] =  useState(0)
  const [totalIncomePages, setTotalIncomePages] =  useState(0)
  const [totalIncome, setTotalIncome] =  useState(0)
  const [totalExpense, setTotalExpense] =  useState(0)
  
  const [profit, setProfit] =  useState(0)
  const [margemLucro, setMargemLucro] =  useState(0)
  
  let currentExpensePage = 1;
  let currentIncomePage = 1;
  


  useEffect(() => {
    getTransactions();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [ incomeList, expenseList]);

  const changeExpensePage = (page) => {
    if (currentExpensePage != page) {
      currentExpensePage = page;
      getExpenseTransactions();
    }
  }
  
  const changeIncomePage = (page) => {
    if (currentIncomePage != page) {
      currentIncomePage = page;
      getIncomeTransactions();
    }
  }

  const formatCustomDate = (date: Date): string =>  {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  const [filtro, setFiltro] = useState<FiltroType>({
    startDate: formatCustomDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0, 0)),
    endDate: formatCustomDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)),
    type: "all",
    category: null
  });

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

  const handleNovaTransacao = async (formData) => {
    try {
      let transaction = {
        amount: formData.amount,
        transaction_type: formData.transaction_type,
        date: formData.date,
        description: formData.description,
        category_id: Number(formData.category_id),
        account_id: Number(formData.account_id),
        payment_method: formData.payment_method,
        reference: formData.reference,
        notes: formData.notes,
      }
      const response = await financialService.createTransaction(transaction);
      if (response.status == 200 || response.status == 201) {
        getTransactions();
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível salvar a Transação", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível salvar a Transação", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get current Transaction:', error);
        showErrorAlert('Erro ao salvar a Transação', formatAxiosError(error));
    }
  };

  const transactionUpdated = async () => {
    getTransactions();
  };

  const getIncomeTransactions = async () => {
    try {
      if (filtro.type == "income" || filtro.type == "all") {
        let params = {
          page: currentIncomePage, 
          per_page: itemsPerPageIncome,
          start_date: filtro.startDate,
          end_date: filtro.endDate,
          type: "income",
          category_id: filtro.category,
        }
        const response = await financialService.getTransactions(params);
        setIncomeList(response.data.transactions);
        setTotalIncomePages(response.data.pages)
      } else {
        setIncomeList([]);
        setTotalIncomePages(0);
      }
      
    } catch (error) {
        console.error('Failed to get current user:', error);
        showErrorAlert('Erro ao carregar a lista de Receitas', formatAxiosError(error));
    }
  }

  const getExpenseTransactions = async () => {
    try {
      if (filtro.type == "expense" || filtro.type == "all") {
        let params = {
          page: currentIncomePage, 
          per_page: itemsPerPageExpense,
          start_date: filtro.startDate,
          end_date: filtro.endDate,
          type: "expense",
          category_id: filtro.category,
        }
        const response = await financialService.getTransactions(params);
        setExpenseList(response.data.transactions);
        setTotalExpensePages(response.data.pages)
      } else {
        setExpenseList([]);
        setTotalExpensePages(0);
      }
     
    } catch (error) {
        console.error('Failed to get current user:', error);
        showErrorAlert('Erro ao carregar a lista de Despesas', formatAxiosError(error));
    }
  }

  const getTransactions = async () => {
    await getExpenseTransactions();
    getIncomeTransactions();
  }

  const calculateTotal = () => {
    if (incomeList && incomeList.length > 0 && expenseList && expenseList.length > 0) {
      setTotalIncome(incomeList.reduce((sum, r) => sum + r.amount, 0));
      setTotalExpense(expenseList.reduce((sum, d) => sum + d.amount, 0));
      // console.log("calculateTotal. totalIncome: ", totalIncome, " totalExpense: ", totalExpense);
      setProfit(totalIncome - totalExpense);
      setMargemLucro(totalIncome > 0 ? (profit / totalIncome) * 100 : 0);
      console.log("calculateTotal: Profit ", profit, " margemLucro: ", margemLucro);
    }
  }

  const currentIncomePageChange = (page) => {
    console.log("setCurrentIncomePage: ", page);
    changeIncomePage(page);
  };

  const currentExpensePageChange = (page) => {
    console.log("setCurrentExpensePage: ", page);
    changeExpensePage(page);
  };

  const applyFilter = (e) => {
    currentExpensePage = 1;
    currentIncomePage = 1;
    getTransactions();
  }

  // const incomeList = filtrarTransacoes('income');
  // const expenseList = filtrarTransacoes('expense');
  // const totalIncome = incomeList.reduce((sum, r) => sum + r.amount, 0);
  // const totalExpense = expenseList.reduce((sum, d) => sum + d.amount, 0);
  // const profit = totalIncome - totalExpense;
  // const margemLucro = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

  

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

      {/* Header */}
      <div className="flex justify-between items-center">
        <div
          onClick={(e) => handleElementClick(e, "Esta é a seção Financeiro onde você pode controlar todas as receitas, despesas e ter uma visão completa da saúde financeira da empresa!")}
          className={isJuliaActive ? 'cursor-help' : ''}
        >
          <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600 mt-1">Controle financeiro completo</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowNovaTransacao(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
          >
            <Plus size={18} />
            <span>Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Filtro */}
      <FiltroFinanceiro
        filtro={filtro}
        onFiltroChange={setFiltro}
        applyFilter={applyFilter}
      />

      {/* Financial Stats */}
      <FinancialStats
        totalReceitas={totalIncome}
        totalDespesas={totalExpense}
        lucroLiquido={profit}
        margemLucro={margemLucro}
        onStatClick={setActiveTab}
        onElementClick={handleElementClick}
        isJuliaActive={isJuliaActive}
      />

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg">
        <FinanceiroTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          receitasCount={incomeList.length}
          despesasCount={expenseList.length}
        />

        {/* Content */}
        <div className="p-6">
          {activeTab === 'receitas' && (
            <TransactionList
              transationList={incomeList}
              type="income"
              total={totalIncome}
              setCurrentPage={currentIncomePageChange}
              currentPage={currentIncomePage}
              totalPages={totalIncomePages}
              transactionUpdated={transactionUpdated}
            />
          )}

          {activeTab === 'despesas' && (
            <TransactionList
              transationList={expenseList}
              type="expense"
              total={totalExpense}
              setCurrentPage={currentExpensePageChange}
              currentPage={currentExpensePage}
              totalPages={totalExpensePages}
              transactionUpdated={transactionUpdated}
            />
          )}

          {activeTab === 'relatorios' && (
            <ReportsSection
              filtro={filtro}
              totalReceitas={totalIncome}
              totalDespesas={totalExpense}
              lucroLiquido={profit}
              margemLucro={margemLucro}
            />
          )}
        </div>
      </div>

      {/* Modal Nova Transação */}
      <NovaTransacaoModal
        isOpen={showNovaTransacao}
        onClose={() => setShowNovaTransacao(false)}
        onSave={handleNovaTransacao}
      />
    </div>
  );
};

export default Financeiro;
