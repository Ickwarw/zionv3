import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Eye, Edit, Trash2, TrendingUpDown } from 'lucide-react';
import { Transacao } from '../types/financeiro.types';
import FormateDate from '@/components/ui/FormateDate';
import FormateCurrency from '@/components/ui/FormateCurrency';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPage, PaginationPrevious } from '@/components/ui/pagination';
import { getPaymentMethodsDescription } from '@/lib/constantData';
import TransactionDetails from './TransactionDetails';
import { Button } from '@/components/ui/button';
import { financialService } from '@/services/api';
import { showWarningAlert } from '@/components/ui/alert-dialog-warning';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import { showQuestionAlert } from '@/components/ui/alert-dialog-question';

interface TransactionListProps {
  transationList: Transacao[];
  type: 'income' | 'expense';
  total: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page) => void;
  transactionUpdated: () => void;
}

const TransactionList = ({ transationList, type, total, currentPage, totalPages, setCurrentPage, transactionUpdated}: TransactionListProps) => {
  const [transactionSelected, setTransactionSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  
  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'recebido':
  //     case 'pago':
  //       return 'bg-green-100 text-green-800';
  //     case 'pendente':
  //       return 'bg-yellow-100 text-yellow-800';
  //     case 'atrasado':
  //       return 'bg-red-100 text-red-800';
  //     default:
  //       return 'bg-gray-100 text-gray-800';
  //   }
  // };

  const isIncome = type === 'income';
  const Icon = isIncome ? TrendingUp : TrendingDown;
  const colorClass = isIncome ? 'text-green-600' : 'text-red-600';
  const bgGradient = isIncome 
    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
    : 'bg-gradient-to-r from-red-500 to-pink-500';

  const editTransaction = (transaction) => {
    setEditMode(true);
    setTransactionSelected(transaction);
  }

  const closeTransaction = () => {
    setEditMode(false);
    setTransactionSelected(null);
    transactionUpdated();
  }

  const closeTrasactionDeleteYes = async (transactionId) => {
      console.log("closeTrasactionDeleteYes");
       try {
        const response = await financialService.deleteTransaction(transactionId);
        if (response.status == 200) {
          transactionUpdated();
        } else if (response.status == 400) {
          if ('message' in response.data) {
            showWarningAlert("Não foi possível Deletar a Transação", response.data.message,null);
          } else {
            showWarningAlert("Não foi possível Deletar a Transação", response.data,null);
          }
        }
      } catch (error) {
        console.error('Failed to get current user:', error);
        showErrorAlert('Erro ao carregar ao Deletar a Transação', formatAxiosError(error));
      }
    }
  
    const closeTrasactionDeleteNo = () => {
      console.log("closeTrasactionDeleteNo");
    }
  
    const deleteTrasaction = (transaction) => {
      showQuestionAlert('Deletar Transação?',
        `Deseja realmente deletar a Transação ${transaction.description}?`,
        transaction.id,
        closeTrasactionDeleteNo,
        closeTrasactionDeleteYes);
    }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {isIncome ? 'Receitas' : 'Despesas'} do Período
        </h3>
        <div className="text-right">
          <p className={`text-2xl font-bold ${colorClass}`}>{FormateCurrency(total)}</p>
          <p className="text-sm text-gray-600">Total do período</p>
        </div>
      </div>
      
      {transationList?.length ? 
        transationList.map((transation) => (
        <div key={transation.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${bgGradient} rounded-full flex items-center justify-center`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{transation.description}</h4>
                <p className="text-sm text-gray-600">Categoria: {transation.category_name}</p>
                <p className="text-sm text-gray-600">Data: {FormateDate(transation.date)}</p>
                <p className="text-sm text-gray-600">Responsável: {transation.user_id}</p>
              </div>
            </div>
            <div className="text-right flex items-center space-x-4">
               <div>
                <Button 
                  size="sm" 
                  title="Visualizar Detalhes"
                  onClick={(e) => {setTransactionSelected(transation)}}
                >
                  <Eye size={16} />
                </Button>
                <Button 
                  size="sm" 
                  title="Editar"
                  onClick={(e) => {editTransaction(transation)}}
                >
                  <Edit size={16} />
                </Button>
                <Button 
                  size="sm" 
                  title="Excluir"
                  onClick={(e) => {deleteTrasaction(transation)}}
                  className={'text-red-600 hover:text-red-800'}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <div>
                <p className={`text-xl font-bold ${colorClass}`}>{FormateCurrency(transation.amount)}</p>
                <p className="text-sm text-gray-600">{getPaymentMethodsDescription(transation.payment_method)}</p>
              </div>
            </div>
          </div>
        </div>
      ))
      : 
        <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h4 className="font-semibold text-gray-900">Não há Transações</h4>
            </div>
          </div>
        </div>
      }
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
      {transactionSelected && (
        <TransactionDetails
          transaction={transactionSelected}
          editMode={editMode}
          isJuliaActive={false}
          onClose={closeTransaction}
          onElementClick={null}
        />
      )}
    </div>
  );
};

export default TransactionList;
