-- ============================================
-- SCRIPT DE CRIAÇÃO DE TABELA PARA DASHBOARD
-- Sistema de Gráficos Personalizáveis
-- ============================================

-- Tabela para armazenar gráficos personalizados criados pelo usuário
CREATE TABLE IF NOT EXISTS dashboard_graficos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    tipo_grafico VARCHAR(50) NOT NULL CHECK (tipo_grafico IN ('bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea')),
    assuntos JSONB NOT NULL,
    configuracoes JSONB,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP DEFAULT NOW(),
    ativo BOOLEAN DEFAULT TRUE
);

-- Comentários nas colunas
COMMENT ON TABLE dashboard_graficos IS 'Gráficos personalizados do dashboard';
COMMENT ON COLUMN dashboard_graficos.id IS 'Identificador único do gráfico';
COMMENT ON COLUMN dashboard_graficos.titulo IS 'Título do gráfico';
COMMENT ON COLUMN dashboard_graficos.descricao IS 'Descrição do gráfico';
COMMENT ON COLUMN dashboard_graficos.tipo_grafico IS 'Tipo de gráfico Chart.js: bar, line, pie, doughnut, radar, polarArea';
COMMENT ON COLUMN dashboard_graficos.assuntos IS 'Array JSON com assuntos selecionados (ex: ["perdas_clientes_fidelizados", "leads_recuperadas"])';
COMMENT ON COLUMN dashboard_graficos.configuracoes IS 'JSON com configurações extras (cores, espessura de linha, etc)';
COMMENT ON COLUMN dashboard_graficos.data_criacao IS 'Data de criação do gráfico';
COMMENT ON COLUMN dashboard_graficos.data_atualizacao IS 'Data da última atualização';
COMMENT ON COLUMN dashboard_graficos.ativo IS 'Se o gráfico está ativo (soft delete)';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_dashboard_graficos_ativo 
ON dashboard_graficos(ativo)
WHERE ativo = TRUE;

CREATE INDEX IF NOT EXISTS idx_dashboard_graficos_tipo 
ON dashboard_graficos(tipo_grafico);

CREATE INDEX IF NOT EXISTS idx_dashboard_graficos_data_criacao 
ON dashboard_graficos(data_criacao DESC);

-- Índice GIN para buscar por assuntos no JSONB
CREATE INDEX IF NOT EXISTS idx_dashboard_graficos_assuntos 
ON dashboard_graficos USING GIN (assuntos);

-- ============================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ============================================

-- Gráfico exemplo 1: Análise de Perdas vs Recuperações
INSERT INTO dashboard_graficos (titulo, descricao, tipo_grafico, assuntos, configuracoes)
VALUES (
    'Análise de Perdas vs Recuperações',
    'Comparação mensal de perdas de clientes fidelizados versus leads recuperadas',
    'line',
    '["perdas_clientes_fidelizados", "leads_recuperadas"]'::jsonb,
    '{"colors": ["#FF6384", "#36A2EB"], "borderWidth": 2}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Gráfico exemplo 2: Distribuição Geral de Leads
INSERT INTO dashboard_graficos (titulo, descricao, tipo_grafico, assuntos, configuracoes)
VALUES (
    'Distribuição Geral de Leads',
    'Visão completa da distribuição de leads por departamento e prioridade',
    'doughnut',
    '["distribuicao_departamento", "distribuicao_prioridade"]'::jsonb,
    '{"colors": ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"]}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Gráfico exemplo 3: Performance de Vendas
INSERT INTO dashboard_graficos (titulo, descricao, tipo_grafico, assuntos, configuracoes)
VALUES (
    'Performance de Vendas',
    'Análise consolidada de taxa de conversão e score médio ao longo do tempo',
    'bar',
    '["taxa_conversao_vendas", "score_medio_periodo"]'::jsonb,
    '{"colors": ["#06B6D4", "#6366F1"], "borderWidth": 1}'::jsonb
)
ON CONFLICT DO NOTHING;

-- ============================================
-- VALIDAÇÕES E TRIGGERS
-- ============================================

-- Trigger para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_dashboard_graficos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dashboard_graficos_timestamp
BEFORE UPDATE ON dashboard_graficos
FOR EACH ROW
EXECUTE FUNCTION update_dashboard_graficos_timestamp();

-- ============================================
-- CONSULTAS ÚTEIS PARA VERIFICAÇÃO
-- ============================================

-- Listar todos os gráficos ativos
-- SELECT * FROM dashboard_graficos WHERE ativo = TRUE ORDER BY data_criacao DESC;

-- Buscar gráficos que contenham um assunto específico
-- SELECT * FROM dashboard_graficos WHERE assuntos @> '["perdas_clientes_fidelizados"]'::jsonb;

-- Contar gráficos por tipo
-- SELECT tipo_grafico, COUNT(*) as total FROM dashboard_graficos WHERE ativo = TRUE GROUP BY tipo_grafico;

-- Ver configurações de um gráfico
-- SELECT id, titulo, assuntos, configuracoes FROM dashboard_graficos WHERE id = 1;

COMMIT;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
