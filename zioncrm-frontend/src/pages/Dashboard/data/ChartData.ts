
import { leadsDashAgentService } from '@/services/api';

// ========================================
// DADOS MOCKADOS (mantidos para fallback)
// ========================================
export const vendasMensaisData = [
  { month: 'Jan', vendas: 4000, meta: 3500 },
  { month: 'Fev', vendas: 3000, meta: 3500 },
  { month: 'Mar', vendas: 5000, meta: 4000 },
  { month: 'Abr', vendas: 4500, meta: 4000 },
  { month: 'Mai', vendas: 6000, meta: 5000 },
  { month: 'Jun', vendas: 5500, meta: 5000 },
];

export const receitaDespesasData = [
  { month: 'Jan', receita: 8000, despesas: 6000 },
  { month: 'Fev', receita: 7500, despesas: 5500 },
  { month: 'Mar', receita: 9000, despesas: 6500 },
  { month: 'Abr', receita: 8500, despesas: 6000 },
  { month: 'Mai', receita: 10000, despesas: 7000 },
  { month: 'Jun', receita: 9500, despesas: 6800 },
];

export const funilVendasData = [
  { name: 'Leads', value: 1001, fill: '#8884d8' },
  { name: 'Qualificados', value: 500, fill: '#82ca9d' },
  { name: 'Propostas', value: 200, fill: '#ffc658' },
  { name: 'Fechados', value: 50, fill: '#ff7300' },
];

export const distribuicaoClientesData = [
  { name: 'Novos', value: 300, fill: '#0088fe' },
  { name: 'Recorrentes', value: 450, fill: '#00c49f' },
  { name: 'Inativos', value: 150, fill: '#ffbb28' },
];

export const produtosVendidosData = [
  { produto: 'Produto A', vendas: 120 },
  { produto: 'Produto B', vendas: 80 },
  { produto: 'Produto C', vendas: 150 },
  { produto: 'Produto D', vendas: 90 },
];

export const performanceEquipeData = [
  { vendedor: 'João', vendas: 50 },
  { vendedor: 'Maria', vendas: 75 },
  { vendedor: 'Pedro', vendas: 65 },
  { vendedor: 'Ana', vendas: 85 },
];

export const trafegoCanalData = [
  { canal: 'Orgânico', visitantes: 2500, x: 2500, y: 125 },
  { canal: 'Pago', visitantes: 1800, x: 1800, y: 108 },
  { canal: 'Social', visitantes: 1200, x: 1200, y: 72 },
  { canal: 'Email', visitantes: 800, x: 800, y: 48 },
];

export const satisfacaoClienteData = [
  { mes: 'Jan', satisfacao: 4.2 },
  { mes: 'Fev', satisfacao: 4.5 },
  { mes: 'Mar', satisfacao: 4.1 },
  { mes: 'Abr', satisfacao: 4.7 },
  { mes: 'Mai', satisfacao: 4.8 },
  { mes: 'Jun', satisfacao: 4.6 },
];

export const crescimentoTrimestralData = [
  { trimestre: 'Q1', crescimento: 12 },
  { trimestre: 'Q2', crescimento: 18 },
  { trimestre: 'Q3', crescimento: 25 },
  { trimestre: 'Q4', crescimento: 22 },
];

export const tempoRespostaData = [
  { mes: 'Jan', tempo: 2.5 },
  { mes: 'Fev', tempo: 2.2 },
  { mes: 'Mar', tempo: 1.8 },
  { mes: 'Abr', tempo: 1.5 },
  { mes: 'Mai', tempo: 1.7 },
  { mes: 'Jun', tempo: 1.4 },
];

export const roiCampanhasData = [
  { campanha: 'Google Ads', roi: 320 },
  { campanha: 'Facebook', roi: 280 },
  { campanha: 'LinkedIn', roi: 195 },
  { campanha: 'Email', roi: 450 },
];

export const taxaConversaoData = [
  { mes: 'Jan', taxa: 2.3 },
  { mes: 'Fev', taxa: 2.8 },
  { mes: 'Mar', taxa: 3.1 },
  { mes: 'Abr', taxa: 2.9 },
  { mes: 'Mai', taxa: 3.5 },
  { mes: 'Jun', taxa: 3.2 },
];

// Novos dados adicionais para mais opções
export const visitasSiteData = [
  { mes: 'Jan', visitas: 15000, usuarios: 8500 },
  { mes: 'Fev', visitas: 18000, usuarios: 9200 },
  { mes: 'Mar', visitas: 22000, usuarios: 11000 },
  { mes: 'Abr', visitas: 19500, usuarios: 9800 },
  { mes: 'Mai', visitas: 25000, usuarios: 12500 },
  { mes: 'Jun', visitas: 28000, usuarios: 14000 },
];

export const custosAquisicaoData = [
  { canal: 'Google', custo: 45.50, conversoes: 120 },
  { canal: 'Facebook', custo: 32.20, conversoes: 95 },
  { canal: 'LinkedIn', custo: 78.90, conversoes: 45 },
  { canal: 'Instagram', custo: 28.75, conversoes: 110 },
];

export const engajamentoSocialData = [
  { plataforma: 'Instagram', likes: 15200, comentarios: 850, compartilhamentos: 320 },
  { plataforma: 'Facebook', likes: 8900, comentarios: 450, compartilhamentos: 180 },
  { plataforma: 'Twitter', likes: 5600, comentarios: 280, compartilhamentos: 95 },
  { plataforma: 'LinkedIn', likes: 3200, comentarios: 180, compartilhamentos: 75 },
];

export const inventarioData = [
  { produto: 'Smartphone', estoque: 150, vendido: 45 },
  { produto: 'Notebook', estoque: 80, vendido: 25 },
  { produto: 'Tablet', estoque: 120, vendido: 38 },
  { produto: 'Smartwatch', estoque: 200, vendido: 62 },
  { produto: 'Fone', estoque: 300, vendido: 95 },
];

export const chamadosSuporteData = [
  { mes: 'Jan', abertos: 180, fechados: 165, pendentes: 15 },
  { mes: 'Fev', abertos: 220, fechados: 210, pendentes: 10 },
  { mes: 'Mar', abertos: 195, fechados: 185, pendentes: 10 },
  { mes: 'Abr', abertos: 250, fechados: 240, pendentes: 10 },
  { mes: 'Mai', abertos: 280, fechados: 275, pendentes: 5 },
  { mes: 'Jun', abertos: 310, fechados: 305, pendentes: 5 },
];

export const npsData = [
  { mes: 'Jan', promotores: 45, neutros: 35, detratores: 20 },
  { mes: 'Fev', promotores: 50, neutros: 30, detratores: 20 },
  { mes: 'Mar', promotores: 55, neutros: 28, detratores: 17 },
  { mes: 'Abr', promotores: 60, neutros: 25, detratores: 15 },
  { mes: 'Mai', promotores: 65, neutros: 22, detratores: 13 },
  { mes: 'Jun', promotores: 70, neutros: 20, detratores: 10 },
];

export const fluxoCaixaData = [
  { mes: 'Jan', entrada: 85000, saida: 65000 },
  { mes: 'Fev', entrada: 92000, saida: 68000 },
  { mes: 'Mar', entrada: 78000, saida: 72000 },
  { mes: 'Abr', entrada: 105000, saida: 75000 },
  { mes: 'Mai', entrada: 115000, saida: 80000 },
  { mes: 'Jun', entrada: 125000, saida: 85000 },
];

export const marketingEmailData = [
  { campanha: 'Newsletter', enviados: 5000, abertos: 1250, cliques: 180 },
  { campanha: 'Promoção', enviados: 3200, abertos: 960, cliques: 145 },
  { campanha: 'Produto Novo', enviados: 2800, abertos: 840, cliques: 125 },
  { campanha: 'Black Friday', enviados: 8500, abertos: 3400, cliques: 680 },
];

// Definindo tipos
export interface ChartModel {
  id: string;
  name: string;
  icon: string;
  description: string;
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  color: string;
  previewData: any[];
}

export interface StatisticOption {
  id: string;
  name: string;
  description: string;
  data: any[];
  color: string;
}

// Dados para seleção de modelos de gráfico
// Dados para seleção de modelos de gráfico - EXATAMENTE 12 OPÇÕES
export const chartModels: ChartModel[] = [
  {
    id: 'bar',
    name: 'Gráfico de Barras',
    icon: 'BarChart3',
    description: 'Ideal para comparar valores entre categorias',
    chartType: 'bar',
    color: 'from-blue-500 to-blue-600',
    previewData: [
      { name: 'A', value: 400 },
      { name: 'B', value: 300 },
      { name: 'C', value: 500 },
    ]
  },
  {
    id: 'line',
    name: 'Gráfico de Linha',
    icon: 'LineChart',
    description: 'Perfeito para mostrar tendências ao longo do tempo',
    chartType: 'line',
    color: 'from-green-500 to-green-600',
    previewData: [
      { name: 'Jan', value: 400 },
      { name: 'Fev', value: 600 },
      { name: 'Mar', value: 500 },
    ]
  },
  {
    id: 'pie',
    name: 'Gráfico de Pizza',
    icon: 'PieChart',
    description: 'Ótimo para mostrar proporções e distribuições',
    chartType: 'pie',
    color: 'from-purple-500 to-purple-600',
    previewData: [
      { name: 'A', value: 400, fill: '#8884d8' },
      { name: 'B', value: 300, fill: '#82ca9d' },
      { name: 'C', value: 300, fill: '#ffc658' },
    ]
  },
  {
    id: 'area',
    name: 'Gráfico de Área',
    icon: 'Activity',
    description: 'Visualiza mudanças cumulativas ao longo do tempo',
    chartType: 'area',
    color: 'from-orange-500 to-orange-600',
    previewData: [
      { name: 'Jan', value: 400 },
      { name: 'Fev', value: 600 },
      { name: 'Mar', value: 500 },
    ]
  },
  {
    id: 'scatter',
    name: 'Gráfico de Dispersão',
    icon: 'Target',
    description: 'Mostra correlações entre duas variáveis',
    chartType: 'scatter',
    color: 'from-red-500 to-red-600',
    previewData: [
      { x: 100, y: 200 },
      { x: 120, y: 100 },
      { x: 170, y: 300 },
    ]
  },
  {
    id: 'bar-horizontal',
    name: 'Barras Horizontais',
    icon: 'BarChart3',
    description: 'Barras na horizontal para melhor visualização',
    chartType: 'bar',
    color: 'from-cyan-500 to-cyan-600',
    previewData: [
      { name: 'A', value: 400 },
      { name: 'B', value: 300 },
      { name: 'C', value: 500 },
    ]
  },
  {
    id: 'line-smooth',
    name: 'Linha Suavizada',
    icon: 'LineChart',
    description: 'Linha com curvas suaves para tendências',
    chartType: 'line',
    color: 'from-emerald-500 to-emerald-600',
    previewData: [
      { name: 'Jan', value: 400 },
      { name: 'Fev', value: 600 },
      { name: 'Mar', value: 500 },
    ]
  },
  {
    id: 'pie-donut',
    name: 'Gráfico Donut',
    icon: 'PieChart',
    description: 'Pizza com centro vazio para informações extras',
    chartType: 'pie',
    color: 'from-violet-500 to-violet-600',
    previewData: [
      { name: 'A', value: 400, fill: '#8884d8' },
      { name: 'B', value: 300, fill: '#82ca9d' },
      { name: 'C', value: 300, fill: '#ffc658' },
    ]
  },
  {
    id: 'area-stacked',
    name: 'Área Empilhada',
    icon: 'Activity',
    description: 'Múltiplas áreas empilhadas para comparação',
    chartType: 'area',
    color: 'from-amber-500 to-amber-600',
    previewData: [
      { name: 'Jan', value: 400 },
      { name: 'Fev', value: 600 },
      { name: 'Mar', value: 500 },
    ]
  },
  {
    id: 'scatter-bubble',
    name: 'Gráfico de Bolhas',
    icon: 'Target',
    description: 'Dispersão com tamanhos variáveis das bolhas',
    chartType: 'scatter',
    color: 'from-rose-500 to-rose-600',
    previewData: [
      { x: 100, y: 200 },
      { x: 120, y: 100 },
      { x: 170, y: 300 },
    ]
  },
  {
    id: 'bar-grouped',
    name: 'Barras Agrupadas',
    icon: 'BarChart3',
    description: 'Múltiplas barras agrupadas por categoria',
    chartType: 'bar',
    color: 'from-indigo-500 to-indigo-600',
    previewData: [
      { name: 'A', value: 400 },
      { name: 'B', value: 300 },
      { name: 'C', value: 500 },
    ]
  },
  {
    id: 'line-multi',
    name: 'Múltiplas Linhas',
    icon: 'LineChart',
    description: 'Várias linhas para comparar séries de dados',
    chartType: 'line',
    color: 'from-teal-500 to-teal-600',
    previewData: [
      { name: 'Jan', value: 400 },
      { name: 'Fev', value: 600 },
      { name: 'Mar', value: 500 },
    ]
  }
];


// Estatísticas disponíveis para cada modelo (mais de 20 opções)
export const statisticOptions: StatisticOption[] = [
  { id: 'vendasMensais', name: 'Vendas Mensais', description: 'Vendas e metas por mês', data: vendasMensaisData, color: '#8B5CF6' },
  { id: 'receitaDespesas', name: 'Receita vs Despesas', description: 'Comparativo financeiro mensal', data: receitaDespesasData, color: '#10B981' },
  { id: 'funilVendas', name: 'Funil de Vendas', description: 'Etapas do processo de vendas', data: funilVendasData, color: '#F59E0B' },
  { id: 'distribuicaoClientes', name: 'Distribuição de Clientes', description: 'Categorias de clientes', data: distribuicaoClientesData, color: '#EF4444' },
  { id: 'produtosVendidos', name: 'Produtos Mais Vendidos', description: 'Top produtos por vendas', data: produtosVendidosData, color: '#3B82F6' },
  { id: 'performanceEquipe', name: 'Performance da Equipe', description: 'Desempenho dos vendedores', data: performanceEquipeData, color: '#8B5CF6' },
  { id: 'trafegoCanal', name: 'Tráfego por Canal', description: 'Visitantes por canal de marketing', data: trafegoCanalData, color: '#06B6D4' },
  { id: 'satisfacaoCliente', name: 'Satisfação do Cliente', description: 'Índice de satisfação mensal', data: satisfacaoClienteData, color: '#F59E0B' },
  { id: 'crescimentoTrimestral', name: 'Crescimento Trimestral', description: 'Taxa de crescimento por trimestre', data: crescimentoTrimestralData, color: '#10B981' },
  { id: 'tempoResposta', name: 'Tempo de Resposta', description: 'Tempo médio de resposta', data: tempoRespostaData, color: '#EF4444' },
  { id: 'roiCampanhas', name: 'ROI das Campanhas', description: 'Retorno sobre investimento', data: roiCampanhasData, color: '#8B5CF6' },
  { id: 'taxaConversao', name: 'Taxa de Conversão', description: 'Conversões mensais', data: taxaConversaoData, color: '#059669' },
  { id: 'visitasSite', name: 'Visitas do Site', description: 'Tráfego web e usuários únicos', data: visitasSiteData, color: '#3B82F6' },
  { id: 'custosAquisicao', name: 'Custos de Aquisição', description: 'CAC por canal de marketing', data: custosAquisicaoData, color: '#DC2626' },
  { id: 'engajamentoSocial', name: 'Engajamento Social', description: 'Métricas de redes sociais', data: engajamentoSocialData, color: '#EC4899' },
  { id: 'inventario', name: 'Controle de Inventário', description: 'Estoque e produtos vendidos', data: inventarioData, color: '#7C3AED' },
  { id: 'chamadosSuporte', name: 'Chamados de Suporte', description: 'Tickets abertos, fechados e pendentes', data: chamadosSuporteData, color: '#0891B2' },
  { id: 'nps', name: 'Net Promoter Score', description: 'Promotores, neutros e detratores', data: npsData, color: '#059669' },
  { id: 'fluxoCaixa', name: 'Fluxo de Caixa', description: 'Entradas e saídas financeiras', data: fluxoCaixaData, color: '#16A34A' },
  { id: 'marketingEmail', name: 'Marketing por Email', description: 'Performance de campanhas de email', data: marketingEmailData, color: '#EA580C' },
];


// ========================================
// INTEGRAÇÃO COM BACKEND - DADOS REAIS
// ========================================

/**
 * Busca assuntos disponíveis do backend
 * Retorna 162+ opções organizadas por categoria
 */
export const getAssuntosFromBackend = async (categoria?: string): Promise<StatisticOption[]> => {  
  try {
    const response = await leadsDashAgentService.getAssuntos(categoria);
    if (response.data.success) {
      const assuntos = response.data.data;
      
      // Converte para formato StatisticOption
      return Object.entries(assuntos).map(([key, value]: [string, any], index) => ({
        id: key,
        name: value.label,
        description: value.descricao,
        data: [], // Será preenchido quando o usuário selecionar
        color: getColorForCategory(value.categoria, index)
      }));
    }
    
    // Fallback para dados mockados
    return statisticOptions;
  } catch (error) {
    console.error('Erro ao buscar assuntos do backend:', error);
    return statisticOptions; // Fallback
  }
};

/**
 * Busca dados de um assunto específico
 */
export const getDadosAssunto = async (assuntoKey: string): Promise<any[]> => {
  try {
    const response = await leadsDashAgentService.getDadosAssunto(assuntoKey);
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error(`Erro ao buscar dados do assunto ${assuntoKey}:`, error);
    return [];
  }
};

/**
 * Busca estatísticas gerais do sistema
 */
export const getEstatisticasGerais = async () => {
  try {
    const response = await leadsDashAgentService.getEstatisticasGerais();
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar estatísticas gerais:', error);
    return null;
  }
};

/**
 * Retorna cor baseada na categoria e índice
 */
function getColorForCategory(categoria: string, index: number): string {
  const colorMap: Record<string, string> = {
    'Classificação': '#8B5CF6',  // Roxo
    'Status': '#10B981',          // Verde
    'Localização': '#3B82F6',     // Azul
    'Dados Pessoais': '#F59E0B',  // Laranja
    'Contato': '#06B6D4',         // Ciano
    'Financeiro': '#059669',      // Verde escuro
    'Comercial': '#EF4444',       // Vermelho
    'Profissional': '#EC4899',    // Rosa
    'Customizado': '#7C3AED',     // Violeta
    'Tempo': '#0891B2',           // Azul água
    'Qualidade': '#16A34A',       // Verde
    'Integrações': '#EA580C',     // Laranja escuro
  };
  
  return colorMap[categoria] || ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#06B6D4'][index % 6];
}


// ========================================
// NOMES DOS ASSUNTOS BASEADOS NAS COLUNAS DA TABELA LEAD
// ========================================

/**
 * Lista de assuntos do backend organizados por categoria
 * Cada assunto corresponde a uma ou mais colunas da tabela lead
 */
export const CATEGORIAS_ASSUNTOS = {
  'Classificação': [
    'perdas_clientes_fidelizados',
    'perdas_leads_ruins',
    'leads_recuperadas',
    'leads_queimando_perdidas',
    'distribuicao_prioridade',
    'distribuicao_departamento',
  ],
  'Status': [
    'distribuicao_status_ativo',
    'distribuicao_status_internet',
    'cadastros_por_mes',
    'atualizacoes_por_mes',
    'leads_bloqueio_automatico',
    'leads_aviso_atraso',
    'status_prospeccao',
    'substatus_prospeccao',
  ],
  'Localização': [
    'distribuicao_por_cidade',
    'distribuicao_por_uf',
    'distribuicao_por_bairro',
    'leads_por_cep',
    'leads_com_endereco_completo',
    'leads_com_coordenadas',
  ],
  'Dados Pessoais': [
    'distribuicao_tipo_pessoa',
    'distribuicao_por_sexo',
    'distribuicao_estado_civil',
    'faixa_etaria',
    'distribuicao_nacionalidade',
  ],
  'Contato': [
    'leads_com_email',
    'leads_com_telefone',
    'leads_com_celular',
    'leads_com_whatsapp',
    'distribuicao_operadora_celular',
  ],
  'Financeiro': [
    'satisfacao_cliente',
    'origem_leads',
    'status_financeiro',
    'score_medio_periodo',
    'distribuicao_tabela_preco',
  ],
  'Comercial': [
    'taxa_conversao_vendas',
    'distribuicao_tipo_cliente',
    'distribuicao_por_vendedor',
    'distribuicao_canal_venda',
    'distribuicao_filial',
  ],
};

// Exporta lista completa de IDs de assuntos
export const ALL_ASSUNTO_IDS = Object.values(CATEGORIAS_ASSUNTOS).flat();


// Estatísticas disponíveis para seleção (LEGADO - mantido para compatibilidade)
// export const statisticOptions: StatisticOption[] = [
//   {
//     id: 'vendas-receita',
//     name: 'Receita de Vendas',
//     description: 'Receita mensal de vendas',
//     data: chartData.vendas.receita,
//     color: '#8B5CF6'
//   },
//   {
//     id: 'vendas-quantidade',
//     name: 'Quantidade de Vendas',
//     description: 'Número de vendas por mês',
//     data: chartData.vendas.quantidade,
//     color: '#10B981'
//   },
//   {
//     id: 'vendas-conversao',
//     name: 'Taxa de Conversão',
//     description: 'Taxa de conversão mensal',
//     data: chartData.vendas.conversao,
//     color: '#F59E0B'
//   },
//   {
//     id: 'leads-receita',
//     name: 'Receita por Leads',
//     description: 'Receita gerada por fonte de leads',
//     data: chartData.leads.receita,
//     color: '#EF4444'
//   },
//   {
//     id: 'leads-quantidade',
//     name: 'Quantidade de Leads',
//     description: 'Número de leads por fonte',
//     data: chartData.leads.quantidade,
//     color: '#3B82F6'
//   },
//   {
//     id: 'financeiro-receita',
//     name: 'Receitas vs Despesas',
//     description: 'Comparativo financeiro',
//     data: chartData.financeiro.receita,
//     color: '#06B6D4'
//   },
//   {
//     id: 'produtos-receita',
//     name: 'Receita por Produto',
//     description: 'Receita gerada por produto',
//     data: chartData.produtos.receita,
//     color: '#8B5CF6'
//   },
//   {
//     id: 'produtos-quantidade',
//     name: 'Vendas por Produto',
//     description: 'Quantidade vendida por produto',
//     data: chartData.produtos.quantidade,
//     color: '#059669'
//   }
// ];


//     description: 'Número de leads por fonte',
//     data: chartData.leads.quantidade,
//     color: '#3B82F6'
//   },
//   {
//     id: 'financeiro-receita',
//     name: 'Receitas vs Despesas',
//     description: 'Comparativo financeiro',
//     data: chartData.financeiro.receita,
//     color: '#06B6D4'
//   },
//   {
//     id: 'produtos-receita',
//     name: 'Receita por Produto',
//     description: 'Receita gerada por produto',
//     data: chartData.produtos.receita,
//     color: '#8B5CF6'
//   },
//   {
//     id: 'produtos-quantidade',
//     name: 'Vendas por Produto',
//     description: 'Quantidade vendida por produto',
//     data: chartData.produtos.quantidade,
//     color: '#059669'
//   }
// ];
