
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SummaryCards from './components/SummaryCards';
import ChartSelector from './components/ChartSelector';
import StatisticSelector from './components/StatisticSelector';
import ChartModelSelector from './components/ChartModelSelector';
import DashboardChart from './components/DashboardChart';
import { chartModels, statisticOptions, getAssuntosFromBackend, getDadosAssunto } from './data/ChartData';

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<'model' | 'statistics' | 'dashboard'>('model');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedStatistics, setSelectedStatistics] = useState<string[]>([]);
  const [charts, setCharts] = useState<Array<{
    id: string;
    modelType: string;
    statistics: any[];
  }>>([]);
  
  // Estado para assuntos carregados do backend
  const [availableStatistics, setAvailableStatistics] = useState(statisticOptions);
  const [loadingStatistics, setLoadingStatistics] = useState(false);

  // Carrega assuntos do backend ao montar o componente
  useEffect(() => {
    const loadStatisticsFromBackend = async () => {
      setLoadingStatistics(true);
      try {
        const backendStats = await getAssuntosFromBackend();
        if (backendStats && backendStats.length > 0) {
          setAvailableStatistics(backendStats);
          console.log(`✅ Carregados ${backendStats.length} assuntos do backend`);
        }
      } catch (error) {
        console.error('Erro ao carregar assuntos do backend:', error);
        // Mantém os dados mockados como fallback
      } finally {
        setLoadingStatistics(false);
      }
    };

    if (isAuthenticated) {
      loadStatisticsFromBackend();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600">Faça login para acessar o dashboard.</p>
        </div>
      </div>
    );
  }

  const handleModelSelect = (model: any) => {
    setSelectedModel(model.chartType);
    setCurrentStep('statistics');
  };

  const handleStatisticToggle = (statisticId: string) => {
    if (selectedStatistics.includes(statisticId)) {
      setSelectedStatistics(selectedStatistics.filter(id => id !== statisticId));
    } else if (selectedStatistics.length < 6) {
      setSelectedStatistics([...selectedStatistics, statisticId]);
    }
  };

  const handleAddChart = async () => {
    if (selectedStatistics.length > 0) {
      // Busca dados reais do backend para cada estatística selecionada
      const statsWithData = await Promise.all(
        selectedStatistics.map(async (statId) => {
          const stat = availableStatistics.find(s => s.id === statId);
          if (!stat) return null;
          
          // Se já tem dados (mockados), usa eles
          if (stat.data && stat.data.length > 0) {
            return stat;
          }
          
          // Senão, busca do backend
          try {
            const data = await getDadosAssunto(statId);
            return { ...stat, data };
          } catch (error) {
            console.error(`Erro ao buscar dados de ${statId}:`, error);
            return stat;
          }
        })
      );
      
      const validStats = statsWithData.filter(s => s !== null);
      
      const newChart = {
        id: Date.now().toString(),
        modelType: selectedModel,
        statistics: validStats
      };
      
      setCharts([...charts, newChart]);
      setSelectedStatistics([]);
      setCurrentStep('dashboard');
    }
  };

  const handleRemoveChart = (chartId: string) => {
    setCharts(charts.filter(chart => chart.id !== chartId));
  };

  const handleBack = () => {
    if (currentStep === 'statistics') {
      setCurrentStep('model');
      setSelectedStatistics([]);
    } else if (currentStep === 'dashboard') {
      setCurrentStep('model');
      setSelectedModel('');
    }
  };

  const handleCreateNewChart = () => {
    setCurrentStep('model');
    setSelectedModel('');
    setSelectedStatistics([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'model' && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Dashboard Analytics
              </h1>
              <p className="text-lg text-gray-600">
                Escolha um modelo de gráfico para começar
              </p>
            </div>
            <ChartModelSelector 
              chartModels={chartModels}
              onModelSelect={handleModelSelect}
            />
          </>
        )}

        {currentStep === 'statistics' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Dashboard Analytics
                </h1>
                <p className="text-lg text-gray-600">
                  Selecione de 1 até 6 estatísticas para o seu gráfico
                  {loadingStatistics && ' (Carregando assuntos do backend...)'}
                </p>
              </div>
              <button
                onClick={handleBack}
                className="px-4 py-2 text-purple-600 hover:text-purple-700 transition-colors"
              >
                Voltar
              </button>
            </div>
            <StatisticSelector
              statistics={availableStatistics}
              selectedStatistics={selectedStatistics}
              onStatisticToggle={handleStatisticToggle}
              onAddMore={handleAddChart}
            />
          </>
        )}

        {currentStep === 'dashboard' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Dashboard ZION CRM
                </h1>
                <p className="text-lg text-gray-600">
                  Sua central de controle empresarial com análises em tempo real
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleCreateNewChart}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  + Criar Gráfico
                </button>
              </div>
            </div>

            <SummaryCards />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {charts.map((chart) => (
                <DashboardChart
                  key={chart.id}
                  id={chart.id}
                  modelType={chart.modelType}
                  statistics={chart.statistics}
                  onRemove={handleRemoveChart}
                />
              ))}
            </div>

            {charts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Nenhum gráfico criado ainda</p>
                <button
                  onClick={handleCreateNewChart}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Criar Primeiro Gráfico
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
