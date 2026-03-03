import React, { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, Compass } from 'lucide-react';
import JuliaAvatar from './JuliaAvatar';
import JuliaSpeechBubble from './JuliaSpeechBubble';
import RelatorioAvancado from './relatorios/RelatorioAvancado';
import { reportService } from '@/services/api';
import { showWarningAlert } from './ui/alert-dialog-warning';
import { showErrorAlert } from './ui/alert-dialog-error';
import { formatAxiosError } from './ui/formatResponseError';
import ReportList from './relatorios/ReportResult';

const Relatorios = () => {
  const [ resultList, setResultList] = useState([]);
  const [isJuliaActive, setIsJuliaActive] = useState(false);
  const [juliaMessage, setJuliaMessage] = useState('');
  const [juliaPosition, setJuliaPosition] = useState({ x: 0, y: 0 });
  const [showJuliaBubble, setShowJuliaBubble] = useState(false);

  const relatorios = [
    { id: 1, nome: 'Relatório de Vendas', periodo: 'Mensal', ultimaGeracao: '15/12/2023', tipo: 'vendas' },
    { id: 2, nome: 'Performance de Leads', periodo: 'Semanal', ultimaGeracao: '18/12/2023', tipo: 'leads' },
    { id: 3, nome: 'Análise Financeira', periodo: 'Trimestral', ultimaGeracao: '01/12/2023', tipo: 'financeiro' },
    { id: 4, nome: 'Produtividade da Equipe', periodo: 'Mensal', ultimaGeracao: '10/12/2023', tipo: 'equipe' },
    { id: 5, nome: 'Satisfação do Cliente', periodo: 'Bimestral', ultimaGeracao: '05/12/2023', tipo: 'satisfacao' },
    { id: 6, nome: 'Controle de Estoque', periodo: 'Semanal', ultimaGeracao: '17/12/2023', tipo: 'estoque' },
  ];

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

  const cleanReport = () => {
    setResultList([]);
  }

  const generateReport = async (filter) => {
    try {
      let params = {
        modulo: filter.modulo,
        periodo: filter.periodo,
        data_inicio: filter.dataInicio,
        data_fim: filter.dataFim,
        formato: filter.formato
      }

      await reportService.generateReport(params);
    } catch (error) {
        console.error('Failed to generate report:', error);
        showErrorAlert('Erro ao gerar Relatório', formatAxiosError(error));
    }
  }

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
          onClick={(e) => handleElementClick(e, "Esta é a seção de Relatórios onde você pode gerar e visualizar relatórios detalhados sobre todos os aspectos do seu negócio!")}
          className={isJuliaActive ? 'cursor-help' : ''}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Relatórios
          </h1>
          <p className="text-gray-600 mt-1">Gere e visualize relatórios detalhados do seu negócio</p>
        </div>
      </div>

      {/* Relatório Avançado */}
      <RelatorioAvancado 
        onFilterChange={cleanReport}
        applyFilter={generateReport}
      />
      {/* <ReportList 
        resultList={resultList}
      /> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatorios.map((relatorio) => (
          <div 
            key={relatorio.id} 
            onClick={(e) => handleElementClick(e, `Este é o ${relatorio.nome} gerado ${relatorio.periodo.toLowerCase()}. Última geração: ${relatorio.ultimaGeracao}. Clique para visualizar ou gerar uma nova versão!`)}
            className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${
                relatorio.tipo === 'vendas' ? 'bg-green-100' :
                relatorio.tipo === 'leads' ? 'bg-blue-100' :
                relatorio.tipo === 'financeiro' ? 'bg-purple-100' :
                relatorio.tipo === 'equipe' ? 'bg-orange-100' :
                relatorio.tipo === 'satisfacao' ? 'bg-pink-100' :
                'bg-gray-100'
              }`}>
                <FileText size={24} className={
                  relatorio.tipo === 'vendas' ? 'text-green-600' :
                  relatorio.tipo === 'leads' ? 'text-blue-600' :
                  relatorio.tipo === 'financeiro' ? 'text-purple-600' :
                  relatorio.tipo === 'equipe' ? 'text-orange-600' :
                  relatorio.tipo === 'satisfacao' ? 'text-pink-600' :
                  'text-gray-600'
                } />
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleElementClick(e, "Clique aqui para fazer o download do relatório em formato PDF ou Excel!");
                }}
                className={`text-gray-400 hover:text-gray-600 ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                <Download size={20} />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">{relatorio.nome}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>Período: {relatorio.periodo}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <TrendingUp size={16} />
                <span>Última geração: {relatorio.ultimaGeracao}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleElementClick(e, "Visualize os dados do relatório de forma interativa com gráficos e tabelas!");
                }}
                className={`flex-1 bg-purple-100 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-200 transition-colors ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                Visualizar
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleElementClick(e, "Gere uma nova versão deste relatório com os dados mais atualizados!");
                }}
                className={`flex-1 bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors ${isJuliaActive ? 'cursor-help' : ''}`}
              >
                Gerar Novo
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Relatórios Personalizados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={(e) => handleElementClick(e, "Crie um relatório personalizado de vendas por região para analisar o desempenho geográfico do seu negócio!")}
            className={`border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors cursor-pointer ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <FileText size={32} className="text-gray-400 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Vendas por Região</h3>
            <p className="text-sm text-gray-600">Analise vendas por localização</p>
          </div>
          
          <div 
            onClick={(e) => handleElementClick(e, "Analise o retorno sobre investimento (ROI) das suas campanhas de marketing para otimizar seus gastos!")}
            className={`border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors cursor-pointer ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <FileText size={32} className="text-gray-400 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">ROI por Campanha</h3>
            <p className="text-sm text-gray-600">Retorno de campanhas de marketing</p>
          </div>
          
          <div 
            onClick={(e) => handleElementClick(e, "Monitore a taxa de cancelamento de clientes (churn) para identificar padrões e melhorar a retenção!")}
            className={`border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors cursor-pointer ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <FileText size={32} className="text-gray-400 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Análise de Churn</h3>
            <p className="text-sm text-gray-600">Taxa de cancelamento de clientes</p>
          </div>
          
          <div 
            onClick={(e) => handleElementClick(e, "Crie um relatório totalmente personalizado escolhendo exatamente as métricas e visualizações que você precisa!")}
            className={`border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors cursor-pointer ${isJuliaActive ? 'cursor-help' : ''}`}
          >
            <FileText size={32} className="text-gray-400 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Custom Report</h3>
            <p className="text-sm text-gray-600">Crie seu próprio relatório</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
