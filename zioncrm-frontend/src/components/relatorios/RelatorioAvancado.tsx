
import React, { useEffect, useState } from 'react';
import { FileText, Download, Filter, Calendar, TrendingUp, BarChart3, Users, DollarSign } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Button } from '../ui/button';
import { reportService } from '@/services/api';
import { showWarningAlert } from '../ui/alert-dialog-warning';
import { formatAxiosError } from '../ui/formatResponseError';
import { showErrorAlert } from '../ui/alert-dialog-error';

interface FiltroRelatorio {
  modulo: string;
  periodo: string;
  formato: string;
  dataInicio: string;
  dataFim: string;
}

interface ReportFilterProps {
  onFilterChange: () => void;
  applyFilter: (filter) => void;
}

const RelatorioAvancado = ({ onFilterChange, applyFilter }: ReportFilterProps) => {
  const [modules, setModules] = useState([]);
  const [formats, setFormats] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [filtros, setFiltros] = useState<FiltroRelatorio>({
    modulo: '',
    periodo: 'mensal',
    formato: 'pdf',
    dataInicio: '',
    dataFim: ''
  });

  // const modulos = [
  //   { value: 'visitas', label: 'Visitas ao Site', icon: TrendingUp },
  //   { value: 'leads', label: 'Análise de Leads', icon: Users },
  //   { value: 'vendas', label: 'Análise de Vendas', icon: DollarSign },
  //   { value: 'financeiro', label: 'Análise Financeira', icon: BarChart3 },
  //   { value: 'tarefas', label: 'Relatório de Tarefas', icon: FileText },
  //   { value: 'chat', label: 'Chat e VoIP', icon: TrendingUp },
  //   { value: 'logs', label: 'Logs do Sistema', icon: FileText },
  //   { value: 'canais', label: 'Canais de Contato', icon: Users }
  // ];

  // const periodo = [
  //   { value: 'mensal', label: 'Mensal', icon: TrendingUp },
  //   { value: 'semanal', label: 'Semanal', icon: Users },
  //   { value: 'trimestral', label: 'Trimestral', icon: DollarSign },
  //   { value: 'anual', label: 'Anual', icon: BarChart3 },
  //   { value: 'personalizado', label: 'Personalizado', icon: FileText }
  // ];

  // const formatos = [
  //   { value: 'pdf', label: 'PDF', icon: TrendingUp },
  //   { value: 'excel', label: 'Excel', icon: Users },
  //   { value: 'csv', label: 'CSV', icon: DollarSign }
  // ];


  const geModules = async () => {
    try {
      const response = await reportService.getModules();
      if (response.status == 200) {
          setModules(response.data);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar os Módulos", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar os Módulos", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Modules:', error);
        showErrorAlert('Erro ao carregar os Módulos', formatAxiosError(error));
    }
  }

  const getFormat = async () => {
    try {
      const response = await reportService.getFormat();
      if (response.status == 200) {
          setFormats(response.data);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar os Formatos", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar os Formatos", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Format:', error);
        showErrorAlert('Erro ao carregar os Formatos', formatAxiosError(error));
    }
  }

  const getPeriods = async () => {
    try {
      const response = await reportService.getPeriods();
      if (response.status == 200) {
          setPeriods(response.data);
      } else if (response.status == 400) {
        if ('message' in response.data) {
          showWarningAlert("Não foi possível carregar os Formatos", response.data.message,null);
        } else {
          showWarningAlert("Não foi possível carregar os Formatos", response.data,null);
        }
      }
    } catch (error) {
        console.error('Failed to get Format:', error);
        showErrorAlert('Erro ao carregar os Formatos', formatAxiosError(error));
    }
  }

  const handleGerarRelatorio = () => {
    // console.log('Gerando relatório com filtros:', filterData);
    // // Aqui seria implementada a lógica de geração do PDF
    // alert(`Relatório de ${filterData.modulo} sendo gerado em ${filterData.formato.toUpperCase()}!`);
    applyFilter(filtros);
  };

  useEffect(() => {
      geModules();
      getFormat();
      getPeriods();
    }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center space-x-3 mb-6">
        <Filter className="text-purple-600" size={24} />
        <h2 className="text-xl font-bold text-gray-900">Relatório Personalizado</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <Label>
            Módulo do Sistema
          </Label>
          <Select
            value={filtros.modulo}
            onValueChange={(value) => {
                setFiltros({...filtros, modulo: value});
                onFilterChange();
              }
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um módulo" />
            </SelectTrigger>
            <SelectContent>
              {modules?.length
                ? modules.map((module) => (
                <SelectItem key={module.value} value={module.value}>
                  {module.label}
                </SelectItem>
                ))
                : <SelectItem value="0">Nenhum</SelectItem>
              }
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>
            Período
          </Label>
          <Select
            value={filtros.periodo}
            onValueChange={(value) => {
                setFiltros({...filtros, periodo: value});
                onFilterChange();
            }
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um período" />
            </SelectTrigger>
            <SelectContent>
              {periods?.length
                ? periods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
                ))
                : <SelectItem value="0">Nenhum</SelectItem>
              }
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtros.periodo === 'personalizado' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label>
              Data Início
            </Label>
            <Input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => {
                  setFiltros({...filtros, dataInicio: e.target.value})
                  onFilterChange();
              }
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <Label>
              Data Fim
            </Label>
            <Input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => {
                  setFiltros({...filtros, dataFim: e.target.value})
                  onFilterChange();
                }
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      <div className="mb-6">
        <Label>
          Formato de Exportação
        </Label>
        <Select
          value={filtros.formato}
          onValueChange={(value) => {
              setFiltros({...filtros, formato: value});
              onFilterChange();
            }
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um formato" />
          </SelectTrigger>
          <SelectContent>
            {formats?.length
              ? formats.map((format) => (
              <SelectItem key={format.value} value={format.value}>
                {format.label}
              </SelectItem>
              ))
              : <SelectItem value="0">Nenhum</SelectItem>
            }
          </SelectContent>
        </Select>
      </div>

     <Button
        onClick={handleGerarRelatorio}
        disabled={!filtros.modulo || !filtros.formato || !filtros.periodo}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FileText size={20} />
        <span>Gerar Relatório</span>
      </Button>

      {/* <Button
        onClick={handleGerarRelatorio}
        disabled={!filtros.modulo || !filtros.formato || !filtros.periodo}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download size={20} />
        <span>Gerar Relatório</span>
      </Button> */}
    </div>
  );
};

export default RelatorioAvancado;
