-- =====================================================
-- SCRIPT DE MIGRAÇÃO - Adicionar campos de classificação de leads
-- ====================================================
-- 
-- Este script adiciona campos para classificação avançada de leads:
-- - Prioridade (temperatura da lead)
-- - Status de vendas
-- - Status pós-venda
-- - Nível de contentamento
-- - Status de débito
-- - Canal de origem
--
-- IMPORTANTE: Execute este script no banco zioncrm antes de usar as novas funcionalidades
--

-- Adicionar coluna de prioridade (temperatura da lead)
ALTER TABLE lead ADD COLUMN IF NOT EXISTS prioridade VARCHAR(50) DEFAULT 'NovaLead';
COMMENT ON COLUMN lead.prioridade IS 'Temperatura da lead: NovaLead, Ruim, Fria, Morna, Quente, MuitoQuente, Queimando';

-- Adicionar coluna de status de vendas
ALTER TABLE lead ADD COLUMN IF NOT EXISTS status_vendas VARCHAR(50) DEFAULT 'NovaLeadVendas';
COMMENT ON COLUMN lead.status_vendas IS 'Status no processo de vendas: NovaLeadVendas, PerdasLeads*, Recuperadas, Recuperar, Fidelizado';

-- Adicionar coluna de status pós-venda
ALTER TABLE lead ADD COLUMN IF NOT EXISTS status_pos_venda VARCHAR(100);
COMMENT ON COLUMN lead.status_pos_venda IS 'Status no pós-venda: AcompanhamentoPersonalizado, TreinamentoSuporte, etc';

-- Adicionar coluna de nível de contentamento (satisfação)
ALTER TABLE lead ADD COLUMN IF NOT EXISTS nivel_contentamento VARCHAR(20);
COMMENT ON COLUMN lead.nivel_contentamento IS 'Satisfação do cliente: Excelente, Bom, Regular, Ruim, Pessimo';

-- Adicionar coluna de status de débito
ALTER TABLE lead ADD COLUMN IF NOT EXISTS status_debito VARCHAR(20) DEFAULT 'EmDia';
COMMENT ON COLUMN lead.status_debito IS 'Status financeiro: EmDia, EmAtraso';

-- Adicionar coluna de origem (canal de comunicação)
ALTER TABLE lead ADD COLUMN IF NOT EXISTS origem VARCHAR(50);
COMMENT ON COLUMN lead.origem IS 'Canal de origem: Panfleto, Telefone, Email, WhatsApp, Instagram, Facebook, Google, Twitter, Loja';

-- Adicionar coluna de departamento responsável
ALTER TABLE lead ADD COLUMN IF NOT EXISTS departamento VARCHAR(20) DEFAULT 'vendas';
COMMENT ON COLUMN lead.departamento IS 'Departamento responsável: vendas ou pos_venda';

-- Adicionar coluna de pontuação da lead (scoring)
ALTER TABLE lead ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
COMMENT ON COLUMN lead.score IS 'Pontuação da lead (0-100) calculada automaticamente';

-- Adicionar coluna de última classificação
ALTER TABLE lead ADD COLUMN IF NOT EXISTS data_ultima_classificacao TIMESTAMP;
COMMENT ON COLUMN lead.data_ultima_classificacao IS 'Data da última classificação automática';

-- Adicionar coluna de observações de classificação
ALTER TABLE lead ADD COLUMN IF NOT EXISTS obs_classificacao TEXT;
COMMENT ON COLUMN lead.obs_classificacao IS 'Motivo/Observações da classificação automática';

-- Criar índices para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_lead_prioridade ON lead(prioridade);
CREATE INDEX IF NOT EXISTS idx_lead_status_vendas ON lead(status_vendas);
CREATE INDEX IF NOT EXISTS idx_lead_status_pos_venda ON lead(status_pos_venda);
CREATE INDEX IF NOT EXISTS idx_lead_departamento ON lead(departamento);
CREATE INDEX IF NOT EXISTS idx_lead_origem ON lead(origem);
CREATE INDEX IF NOT EXISTS idx_lead_score ON lead(score);

-- Verificar colunas adicionadas
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'lead' 
    AND column_name IN (
        'prioridade', 'status_vendas', 'status_pos_venda', 
        'nivel_contentamento', 'status_debito', 'origem',
        'departamento', 'score', 'data_ultima_classificacao'
    )
ORDER BY column_name;

-- Script executado com sucesso!
-- Próximo passo: Reiniciar as APIs para reconhecer os novos campos
