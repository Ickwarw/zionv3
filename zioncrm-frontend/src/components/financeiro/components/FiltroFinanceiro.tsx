
import React, { useState, useEffect } from 'react';
import { Calendar, Filter, FilterIcon } from 'lucide-react';
import { FiltroFinanceiro as FiltroType } from '../types/financeiro.types';
import './Filtro.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { financialService } from '@/services/api';
import { showErrorAlert } from '@/components/ui/alert-dialog-error';
import { formatAxiosError } from '@/components/ui/formatResponseError';
import { Button } from '@/components/ui/button';
import Tag from '@/components/ui/tag';

interface FiltroFinanceiroProps {
  filtro: FiltroType;
  onFiltroChange: (novoFiltro: FiltroType) => void;
  applyFilter: (e) => void;
}

const FiltroFinanceiro = ({ filtro, onFiltroChange, applyFilter }: FiltroFinanceiroProps) => {
  const [showFiltros, setShowFiltros] = useState(false);
  const [ categoryList, setCategoryList ] = useState([]);

  const periodosPreDefinidos = [
    { label: 'Hoje', dias: 0 },
    { label: 'Última Semana', dias: 7 },
    { label: 'Último Mês', dias: 30 },
    { label: 'Últimos 3 Meses', dias: 90 },
    { label: 'Último Ano', dias: 365 }
  ];

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
      try {
        const response = await financialService.getCategories();
        setCategoryList(response.data.categories);
      } catch (error) {
        console.error('Failed to get current user:', error);
        showErrorAlert('Erro ao carregar a lista de Fornecedores', formatAxiosError(error));
      }
    }

  const aplicarPeriodo = (dias: number) => {
    const hoje = new Date();
    const dataInicio = new Date();
    dataInicio.setDate(hoje.getDate() - dias);
    
    onFiltroChange({
      ...filtro,
      startDate: dataInicio.toISOString().split('T')[0],
      endDate: hoje.toISOString().split('T')[0]
    });
  };

  const formatDateFilter = (value) => {
    let dateParts = value.split("-");
    let year = dateParts[0];
    let month = dateParts[1];
    let day = dateParts[2];
    return `${day}/${month}/${year}`;
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Filter size={20} />
          <span>Filtros</span>
        </h3>
        <button
          onClick={() => setShowFiltros(!showFiltros)}
          className="text-purple-600 hover:text-purple-800 text-sm"
        >
          {showFiltros ? 'Ocultar' : 'Mostrar'} Filtros
        </button>
      </div>

      {/* Período Atual */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <Calendar size={16} />
        <span>
          {formatDateFilter(filtro.startDate)} até{' '}{formatDateFilter(filtro.endDate)}
        </span>
      </div>

      {showFiltros && (
        <div className="space-y-4">
          {/* Períodos Pré-definidos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Períodos Rápidos</label>
            <div className="flex flex-wrap gap-2">
              {periodosPreDefinidos.map(periodo => (
                <button
                  key={periodo.label}
                  onClick={() => aplicarPeriodo(periodo.dias)}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  {periodo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Data Personalizada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Inicial</label>
              <input
                type="date"
                value={filtro.startDate}
                onChange={(e) => onFiltroChange({ ...filtro, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Final</label>
              <input
                type="date"
                value={filtro.endDate}
                onChange={(e) => onFiltroChange({ ...filtro, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Outros Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <Select
                value={filtro.type || 'all'}
                onValueChange={(value) => onFiltroChange({ 
                  ...filtro, 
                  type: value as 'income' | 'expense' | 'all'
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o Tipo" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">Todas</SelectItem>
                   <SelectItem value="income">Receita</SelectItem>
                   <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <Select
                value={filtro.category?.toString() || '0'}
                onValueChange={(value) => onFiltroChange({ 
                  ...filtro, 
                  category: value != '0' ? Number(value) : null
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a Categoria" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="0">Todas</SelectItem>
                  {categoryList.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <Tag
                        backgroundColor={category.color}
                        name={category.name}
                      />
                      {/* <span className="badge" style={{backgroundColor: `${category.color}`}}>{category.name}</span> */}
                    </SelectItem>
                  ))
                }
                </SelectContent>
              </Select>
            </div>
            
            <div className='content-end'>

              <Button
                  onClick={(e) => applyFilter(e)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  <FilterIcon size={18} />
                  <span>Aplicar Filtros</span>
              </Button>
            </div>


            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filtro.status || ''}
                onChange={(e) => onFiltroChange({ 
                  ...filtro, 
                  status: e.target.value || undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="recebido">Recebido</option>
                <option value="atrasado">Atrasado</option>
              </select>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltroFinanceiro;
