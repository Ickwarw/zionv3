"""
Models para o Sistema de Dashboard
Gerencia gráficos personalizados e configurações
"""

import psycopg2
import psycopg2.extras
from datetime import datetime
import json

# ============================================
# CONFIGURAÇÃO DO BANCO DE DADOS
# ============================================

DB_CONFIG = {
    "host": "45.160.180.34",
    "port": 5432,
    "user": "zioncrm",
    "password": "kN98upt4gJ3G",
    "dbname": "zioncrm",
}


def get_db_connection():
    """Cria conexão com o banco PostgreSQL"""
    return psycopg2.connect(**DB_CONFIG)


# ============================================
# TABELAS DE GRÁFICOS PERSONALIZADOS
# ============================================

def create_dashboard_tables():
    """
    Cria tabelas para salvar gráficos personalizados
    Executar uma vez na inicialização
    """
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Tabela de gráficos salvos
    cur.execute("""
        CREATE TABLE IF NOT EXISTS dashboard_graficos (
            id SERIAL PRIMARY KEY,
            titulo VARCHAR(200) NOT NULL,
            descricao TEXT,
            tipo_grafico VARCHAR(50) NOT NULL,  -- bar, line, pie, doughnut, radar, polarArea
            assuntos JSONB NOT NULL,             -- Array de assuntos selecionados
            configuracoes JSONB,                 -- Configurações extras (cores, labels, etc)
            data_criacao TIMESTAMP DEFAULT NOW(),
            data_atualizacao TIMESTAMP DEFAULT NOW(),
            ativo BOOLEAN DEFAULT TRUE
        )
    """)
    
    # Índices para performance
    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_dashboard_graficos_ativo 
        ON dashboard_graficos(ativo)
    """)
    
    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_dashboard_graficos_tipo 
        ON dashboard_graficos(tipo_grafico)
    """)
    
    conn.commit()
    cur.close()
    conn.close()
    
    print("✅ Tabelas do dashboard criadas com sucesso!")


# ============================================
# TIPOS DE ASSUNTOS DISPONÍVEIS (200+ ASSUNTOS)
# Organizados por categoria para cada coluna da tabela lead
# ============================================

ASSUNTOS_DISPONIVEIS = {
    
    # ============================================
    # CATEGORIA 1: ANÁLISE DE CLASSIFICAÇÃO (12)
    # ============================================
    
    "perdas_clientes_fidelizados": {
        "label": "Perdas de Clientes Fidelizados",
        "descricao": "Clientes ativos satisfeitos que cancelaram contrato",
        "categoria": "Classificação",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_ultima_classificacao) as periodo,
                COUNT(*) as total
            FROM lead
            WHERE status_pos_venda = 'AtivasSatisfeitas'
            AND departamento = 'vendas'
            AND status_vendas = 'Recuperar'
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "perdas_leads_ruins": {
        "label": "Perda de Leads Ruins",
        "descricao": "Leads com prioridade 'Ruim' que foram perdidas",
        "categoria": "Classificação",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_ultima_classificacao) as periodo,
                COUNT(*) as total
            FROM lead
            WHERE prioridade = 'Ruim'
            AND status_vendas IN ('Perdida', 'SemInteresse')
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "leads_recuperadas": {
        "label": "Leads Recuperadas",
        "descricao": "Leads que estavam inativas e foram recuperadas",
        "categoria": "Classificação",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_ultima_classificacao) as periodo,
                COUNT(*) as total
            FROM lead
            WHERE status_vendas = 'GanhaSucesso'
            AND prioridade IN ('MuitoQuente', 'Queimando')
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "leads_queimando_perdidas": {
        "label": "Leads Queimando Perdidas",
        "descricao": "Leads de alta prioridade (Queimando) que foram perdidas",
        "categoria": "Classificação",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_ultima_classificacao) as periodo,
                COUNT(*) as total
            FROM lead
            WHERE prioridade = 'Queimando'
            AND status_vendas IN ('Perdida', 'SemInteresse')
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "tempo_ordem_servico_funcionario": {
        "label": "Tempo por Ordem de Serviço (por Funcionário)",
        "descricao": "Tempo médio de atendimento por funcionário",
        "categoria": "Classificação",
        "query": """
            SELECT 
                COALESCE(obs, 'Sem Responsável') as funcionario,
                COUNT(*) as total_atendimentos,
                AVG(score) as tempo_medio
            FROM lead
            WHERE departamento = 'pos_venda'
            AND status_pos_venda IS NOT NULL
            GROUP BY funcionario
            ORDER BY total_atendimentos DESC
            LIMIT 20
        """
    },
    
    "distribuicao_prioridade": {
        "label": "Distribuição por Prioridade (Temperatura)",
        "descricao": "Quantidade de leads por nível de prioridade",
        "categoria": "Classificação",
        "query": """
            SELECT 
                COALESCE(prioridade, 'Não Classificado') as prioridade,
                COUNT(*) as total
            FROM lead
            WHERE ativo = 'S'
            GROUP BY prioridade
            ORDER BY 
                CASE prioridade
                    WHEN 'Queimando' THEN 1
                    WHEN 'MuitoQuente' THEN 2
                    WHEN 'Quente' THEN 3
                    WHEN 'Morna' THEN 4
                    WHEN 'Fria' THEN 5
                    WHEN 'Ruim' THEN 6
                    WHEN 'NovaLead' THEN 7
                    ELSE 8
                END
        """
    },
    
    "distribuicao_departamento": {
        "label": "Distribuição por Departamento",
        "descricao": "Leads por departamento (Vendas vs Pós-Venda)",
        "categoria": "Classificação",
        "query": """
            SELECT 
                COALESCE(departamento, 'Não Definido') as departamento,
                COUNT(*) as total
            FROM lead
            WHERE ativo = 'S'
            GROUP BY departamento
        """
    },
    
    "taxa_conversao_vendas": {
        "label": "Taxa de Conversão de Vendas",
        "descricao": "Status do funil de vendas",
        "categoria": "Classificação",
        "query": """
            SELECT 
                status_vendas,
                COUNT(*) as total
            FROM lead
            WHERE departamento = 'vendas'
            AND status_vendas IS NOT NULL
            GROUP BY status_vendas
            ORDER BY total DESC
        """
    },
    
    "satisfacao_cliente": {
        "label": "Satisfação do Cliente",
        "descricao": "Distribuição de níveis de contentamento",
        "categoria": "Classificação",
        "query": """
            SELECT 
                nivel_contentamento,
                COUNT(*) as total
            FROM lead
            WHERE nivel_contentamento IS NOT NULL
            GROUP BY nivel_contentamento
            ORDER BY 
                CASE nivel_contentamento
                    WHEN 'Excelente' THEN 1
                    WHEN 'Bom' THEN 2
                    WHEN 'Regular' THEN 3
                    WHEN 'Ruim' THEN 4
                    WHEN 'Pessimo' THEN 5
                END
        """
    },
    
    "origem_leads": {
        "label": "Origem das Leads (Canais)",
        "descricao": "Leads por canal de comunicação",
        "categoria": "Classificação",
        "query": """
            SELECT 
                COALESCE(origem, 'Não Informado') as origem,
                COUNT(*) as total
            FROM lead
            WHERE ativo = 'S'
            GROUP BY origem
            ORDER BY total DESC
        """
    },
    
    "status_financeiro": {
        "label": "Status Financeiro",
        "descricao": "Leads em dia vs em atraso",
        "categoria": "Classificação",
        "query": """
            SELECT 
                status_debito,
                COUNT(*) as total
            FROM lead
            WHERE ativo = 'S'
            AND status_debito IS NOT NULL
            GROUP BY status_debito
        """
    },
    
    "score_medio_periodo": {
        "label": "Score Médio por Período",
        "descricao": "Evolução do score médio das leads ao longo do tempo",
        "categoria": "Classificação",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_ultima_classificacao) as periodo,
                AVG(score) as score_medio,
                COUNT(*) as total_leads
            FROM lead
            WHERE data_ultima_classificacao IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    # ============================================
    # CATEGORIA 2: STATUS E ATIVAÇÃO (20 assuntos)
    # ============================================
    
    "distribuicao_status_ativo": {
        "label": "Distribuição por Status (Ativo/Inativo)",
        "descricao": "Quantidade de leads ativas vs inativas",
        "categoria": "Status",
        "query": """
            SELECT 
                CASE WHEN ativo = 'S' THEN 'Ativo' ELSE 'Inativo' END as status,
                COUNT(*) as total
            FROM lead
            GROUP BY ativo
        """
    },
    
    "distribuicao_status_internet": {
        "label": "Distribuição por Status Internet",
        "descricao": "Status de conexão de internet dos clientes",
        "categoria": "Status",
        "query": """
            SELECT 
                COALESCE(status_internet, 'Não Informado') as status_internet,
                COUNT(*) as total
            FROM lead
            GROUP BY status_internet
            ORDER BY total DESC
            LIMIT 20
        """
    },
    
    "cadastros_por_mes": {
        "label": "Cadastros por Mês",
        "descricao": "Quantidade de leads cadastradas por mês",
        "categoria": "Status",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_cadastro) as periodo,
                COUNT(*) as total
            FROM lead
            WHERE data_cadastro IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 24
        """
    },
    
    "atualizacoes_por_mes": {
        "label": "Atualizações por Mês",
        "descricao": "Quantidade de leads atualizadas por mês",
        "categoria": "Status",
        "query": """
            SELECT 
                DATE_TRUNC('month', ultima_atualizacao) as periodo,
                COUNT(*) as total
            FROM lead
            WHERE ultima_atualizacao IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 24
        """
    },
    
    "leads_bloqueio_automatico": {
        "label": "Leads com Bloqueio Automático",
        "descricao": "Leads configuradas com bloqueio automático",
        "categoria": "Status",
        "query": """
            SELECT 
                CASE WHEN bloqueio_automatico = 'S' THEN 'Com Bloqueio' ELSE 'Sem Bloqueio' END as bloqueio,
                COUNT(*) as total
            FROM lead
            WHERE bloqueio_automatico IS NOT NULL
            GROUP BY bloqueio_automatico
        """
    },
    
    "leads_aviso_atraso": {
        "label": "Leads com Aviso de Atraso",
        "descricao": "Leads configuradas para aviso de atraso",
        "categoria": "Status",
        "query": """
            SELECT 
                CASE WHEN aviso_atraso = 'S' THEN 'Com Aviso' ELSE 'Sem Aviso' END as aviso,
                COUNT(*) as total
            FROM lead
            WHERE aviso_atraso IS NOT NULL
            GROUP BY aviso_atraso
        """
    },
    
    "status_prospeccao": {
        "label": "Distribuição por Status de Prospecção",
        "descricao": "Status do processo de prospecção",
        "categoria": "Status",
        "query": """
            SELECT 
                COALESCE(status_prospeccao, 'Não Informado') as status_prospeccao,
                COUNT(*) as total
            FROM lead
            WHERE status_prospeccao IS NOT NULL
            GROUP BY status_prospeccao
            ORDER BY total DESC
            LIMIT 20
        """
    },
    
    "substatus_prospeccao": {
        "label": "Distribuição por Substatus de Prospecção",
        "descricao": "Substatus detalhado do processo de prospecção",
        "categoria": "Status",
        "query": """
            SELECT 
                COALESCE(CAST(substatus_prospeccao AS VARCHAR), 'Não Informado') as substatus,
                COUNT(*) as total
            FROM lead
            WHERE substatus_prospeccao IS NOT NULL
            GROUP BY substatus_prospeccao
            ORDER BY total DESC
            LIMIT 20
        """
    },
    
    "status_viabilidade": {
        "label": "Distribuição por Status de Viabilidade",
        "descricao": "Status de viabilidade técnica",
        "categoria": "Status",
        "query": """
            SELECT 
                COALESCE(status_viabilidade, 'Não Informado') as status_viabilidade,
                COUNT(*) as total
            FROM lead
            WHERE status_viabilidade IS NOT NULL
            GROUP BY status_viabilidade
            ORDER BY total DESC
        """
    },
    
    "leads_orgao_publico": {
        "label": "Leads - Órgão Público vs Privado",
        "descricao": "Distribuição entre órgãos públicos e entidades privadas",
        "categoria": "Status",
        "query": """
            SELECT 
                CASE WHEN orgao_publico = 'S' THEN 'Órgão Público' ELSE 'Privado' END as tipo,
                COUNT(*) as total
            FROM lead
            WHERE orgao_publico IS NOT NULL
            GROUP BY orgao_publico
        """
    },
    
    # ============================================
    # CATEGORIA 3: LOCALIZAÇÃO GEOGRÁFICA (15 assuntos)
    # ============================================
    
    "distribuicao_por_cidade": {
        "label": "Distribuição por Cidade",
        "descricao": "Top 30 cidades com mais leads",
        "categoria": "Localização",
        "query": """
            SELECT 
                COALESCE(CAST(cidade AS VARCHAR), 'Não Informado') as cidade,
                COUNT(*) as total
            FROM lead
            WHERE cidade IS NOT NULL
            GROUP BY cidade
            ORDER BY total DESC
            LIMIT 30
        """
    },
    
    "distribuicao_por_uf": {
        "label": "Distribuição por UF (Estado)",
        "descricao": "Leads por estado",
        "categoria": "Localização",
        "query": """
            SELECT 
                COALESCE(CAST(uf AS VARCHAR), 'Não Informado') as uf,
                COUNT(*) as total
            FROM lead
            WHERE uf IS NOT NULL
            GROUP BY uf
            ORDER BY total DESC
        """
    },
    
    "distribuicao_por_bairro": {
        "label": "Distribuição por Bairro",
        "descricao": "Top 50 bairros com mais leads",
        "categoria": "Localização",
        "query": """
            SELECT 
                COALESCE(bairro, 'Não Informado') as bairro,
                COUNT(*) as total
            FROM lead
            WHERE bairro IS NOT NULL AND bairro != ''
            GROUP BY bairro
            ORDER BY total DESC
            LIMIT 50
        """
    },
    
    "leads_por_cep": {
        "label": "Distribuição de Leads por CEP",
        "descricao": "Top 30 CEPs com mais leads",
        "categoria": "Localização",
        "query": """
            SELECT 
                COALESCE(cep, 'Não Informado') as cep,
                COUNT(*) as total
            FROM lead
            WHERE cep IS NOT NULL AND cep != ''
            GROUP BY cep
            ORDER BY total DESC
            LIMIT 30
        """
    },
    
    "leads_com_endereco_completo": {
        "label": "Leads com Endereço Completo",
        "descricao": "Leads que possuem endereço, cidade e CEP preenchidos",
        "categoria": "Localização",
        "query": """
            SELECT 
                CASE 
                    WHEN endereco IS NOT NULL AND cidade IS NOT NULL AND cep IS NOT NULL 
                    THEN 'Completo' 
                    ELSE 'Incompleto' 
                END as status_endereco,
                COUNT(*) as total
            FROM lead
            GROUP BY status_endereco
        """
    },
    
    "leads_com_coordenadas": {
        "label": "Leads com Coordenadas GPS",
        "descricao": "Leads que possuem latitude e longitude",
        "categoria": "Localização",
        "query": """
            SELECT 
                CASE 
                    WHEN latitude IS NOT NULL AND longitude IS NOT NULL 
                    THEN 'Com Coordenadas' 
                    ELSE 'Sem Coordenadas' 
                END as status_gps,
                COUNT(*) as total
            FROM lead
            GROUP BY status_gps
        """
    },
    
    "distribuicao_por_tipo_localidade": {
        "label": "Distribuição por Tipo de Localidade",
        "descricao": "Tipo de localidade (urbana, rural, etc)",
        "categoria": "Localização",
        "query": """
            SELECT 
                COALESCE(tipo_localidade, 'Não Informado') as tipo_localidade,
                COUNT(*) as total
            FROM lead
            WHERE tipo_localidade IS NOT NULL
            GROUP BY tipo_localidade
            ORDER BY total DESC
        """
    },
    
    "leads_por_condominio": {
        "label": "Leads em Condomínios",
        "descricao": "Distribuição de leads por condomínio",
        "categoria": "Localização",
        "query": """
            SELECT 
                CASE 
                    WHEN id_condominio IS NOT NULL THEN 'Em Condomínio' 
                    ELSE 'Não Condomínio' 
                END as status_condominio,
                COUNT(*) as total
            FROM lead
            GROUP BY status_condominio
        """
    },
    
    # ============================================
    # CATEGORIA 4: DADOS PESSOAIS E DEMOGRÁFICOS (25 assuntos)
    # ============================================
    
    "distribuicao_tipo_pessoa": {
        "label": "Distribuição por Tipo de Pessoa",
        "descricao": "Pessoa Física vs Pessoa Jurídica",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                CASE tipo_pessoa
                    WHEN 'F' THEN 'Pessoa Física'
                    WHEN 'J' THEN 'Pessoa Jurídica'
                    ELSE 'Não Informado'
                END as tipo,
                COUNT(*) as total
            FROM lead
            GROUP BY tipo_pessoa
        """
    },
    
    "distribuicao_por_sexo": {
        "label": "Distribuição por Sexo",
        "descricao": "Distribuição de gênero das leads",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                CASE Sexo
                    WHEN 'M' THEN 'Masculino'
                    WHEN 'F' THEN 'Feminino'
                    ELSE 'Não Informado'
                END as sexo,
                COUNT(*) as total
            FROM lead
            WHERE Sexo IS NOT NULL
            GROUP BY Sexo
        """
    },
    
    "distribuicao_estado_civil": {
        "label": "Distribuição por Estado Civil",
        "descricao": "Estado civil das leads",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                COALESCE(estado_civil, 'Não Informado') as estado_civil,
                COUNT(*) as total
            FROM lead
            WHERE estado_civil IS NOT NULL
            GROUP BY estado_civil
            ORDER BY total DESC
        """
    },
    
    "faixa_etaria": {
        "label": "Distribuição por Faixa Etária",
        "descricao": "Idade das leads em faixas",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                CASE 
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, data_nascimento)) < 18 THEN 'Menor de 18'
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, data_nascimento)) BETWEEN 18 AND 25 THEN '18-25'
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, data_nascimento)) BETWEEN 26 AND 35 THEN '26-35'
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, data_nascimento)) BETWEEN 36 AND 45 THEN '36-45'
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, data_nascimento)) BETWEEN 46 AND 55 THEN '46-55'
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, data_nascimento)) BETWEEN 56 AND 65 THEN '56-65'
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, data_nascimento)) > 65 THEN 'Acima de 65'
                    ELSE 'Não Informado'
                END as faixa_etaria,
                COUNT(*) as total
            FROM lead
            GROUP BY faixa_etaria
            ORDER BY 
                CASE faixa_etaria
                    WHEN 'Menor de 18' THEN 1
                    WHEN '18-25' THEN 2
                    WHEN '26-35' THEN 3
                    WHEN '36-45' THEN 4
                    WHEN '46-55' THEN 5
                    WHEN '56-65' THEN 6
                    WHEN 'Acima de 65' THEN 7
                    ELSE 8
                END
        """
    },
    
    "distribuicao_nacionalidade": {
        "label": "Distribuição por Nacionalidade",
        "descricao": "Nacionalidade das leads",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                COALESCE(nacionalidade, 'Não Informado') as nacionalidade,
                COUNT(*) as total
            FROM lead
            WHERE nacionalidade IS NOT NULL
            GROUP BY nacionalidade
            ORDER BY total DESC
            LIMIT 20
        """
    },
    
    "distribuicao_profissao": {
        "label": "Distribuição por Profissão",
        "descricao": "Top 30 profissões",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                COALESCE(profissao, 'Não Informado') as profissao,
                COUNT(*) as total
            FROM lead
            WHERE profissao IS NOT NULL AND profissao != ''
            GROUP BY profissao
            ORDER BY total DESC
            LIMIT 30
        """
    },
    
    "leads_com_conjuge": {
        "label": "Leads com Dados de Cônjuge",
        "descricao": "Leads que possuem informações de cônjuge",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                CASE 
                    WHEN nome_conjuge IS NOT NULL AND nome_conjuge != '' 
                    THEN 'Com Cônjuge' 
                    ELSE 'Sem Cônjuge' 
                END as status_conjuge,
                COUNT(*) as total
            FROM lead
            GROUP BY status_conjuge
        """
    },
    
    "leads_com_dependentes": {
        "label": "Leads com Dependentes",
        "descricao": "Quantidade de dependentes",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                COALESCE(CAST(quantidade_dependentes AS VARCHAR), '0') as qtd_dependentes,
                COUNT(*) as total
            FROM lead
            WHERE quantidade_dependentes IS NOT NULL
            GROUP BY quantidade_dependentes
            ORDER BY quantidade_dependentes
        """
    },
    
    "tipo_moradia": {
        "label": "Distribuição por Tipo de Moradia",
        "descricao": "Tipo de moradia (própria, alugada, etc)",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                COALESCE(moradia, 'Não Informado') as moradia,
                COUNT(*) as total
            FROM lead
            WHERE moradia IS NOT NULL
            GROUP BY moradia
            ORDER BY total DESC
        """
    },
    
    "grau_satisfacao": {
        "label": "Grau de Satisfação",
        "descricao": "Distribuição do grau de satisfação dos clientes",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                COALESCE(CAST(grau_satisfacao AS VARCHAR), 'Não Avaliado') as grau,
                COUNT(*) as total
            FROM lead
            WHERE grau_satisfacao IS NOT NULL
            GROUP BY grau_satisfacao
            ORDER BY grau_satisfacao DESC
        """
    },
    
    # ============================================
    # CATEGORIA 5: CONTATOS E COMUNICAÇÃO (15 assuntos)
    # ============================================
    
    "leads_com_email": {
        "label": "Leads com E-mail",
        "descricao": "Leads que possuem e-mail cadastrado",
        "categoria": "Contato",
        "query": """
            SELECT 
                CASE 
                    WHEN email IS NOT NULL AND email != '' 
                    THEN 'Com E-mail' 
                    ELSE 'Sem E-mail' 
                END as status_email,
                COUNT(*) as total
            FROM lead
            GROUP BY status_email
        """
    },
    
    "leads_com_telefone": {
        "label": "Leads com Telefone",
        "descricao": "Leads que possuem telefone cadastrado",
        "categoria": "Contato",
        "query": """
            SELECT 
                CASE 
                    WHEN fone IS NOT NULL AND fone != '' 
                    THEN 'Com Telefone' 
                    ELSE 'Sem Telefone' 
                END as status_telefone,
                COUNT(*) as total
            FROM lead
            GROUP BY status_telefone
        """
    },
    
    "leads_com_celular": {
        "label": "Leads com Celular",
        "descricao": "Leads que possuem celular cadastrado",
        "categoria": "Contato",
        "query": """
            SELECT 
                CASE 
                    WHEN telefone_celular IS NOT NULL AND telefone_celular != '' 
                    THEN 'Com Celular' 
                    ELSE 'Sem Celular' 
                END as status_celular,
                COUNT(*) as total
            FROM lead
            GROUP BY status_celular
        """
    },
    
    "leads_com_whatsapp": {
        "label": "Leads com WhatsApp",
        "descricao": "Leads que possuem WhatsApp cadastrado",
        "categoria": "Contato",
        "query": """
            SELECT 
                CASE 
                    WHEN whatsapp IS NOT NULL AND whatsapp != '' 
                    THEN 'Com WhatsApp' 
                    ELSE 'Sem WhatsApp' 
                END as status_whatsapp,
                COUNT(*) as total
            FROM lead
            GROUP BY status_whatsapp
        """
    },
    
    "distribuicao_operadora_celular": {
        "label": "Distribuição por Operadora de Celular",
        "descricao": "Operadoras de celular mais comuns",
        "categoria": "Contato",
        "query": """
            SELECT 
                COALESCE(CAST(id_operadora_celular AS VARCHAR), 'Não Informado') as operadora,
                COUNT(*) as total
            FROM lead
            WHERE id_operadora_celular IS NOT NULL
            GROUP BY id_operadora_celular
            ORDER BY total DESC
            LIMIT 10
        """
    },
    
    "leads_com_redes_sociais": {
        "label": "Leads com Redes Sociais",
        "descricao": "Leads que possuem Facebook, Instagram ou outras redes",
        "categoria": "Contato",
        "query": """
            SELECT 
                CASE 
                    WHEN facebook IS NOT NULL OR instagram IS NOT NULL 
                    THEN 'Com Redes Sociais' 
                    ELSE 'Sem Redes Sociais' 
                END as status_social,
                COUNT(*) as total
            FROM lead
            GROUP BY status_social
        """
    },
    
    "leads_com_website": {
        "label": "Leads com Website",
        "descricao": "Leads que possuem website cadastrado",
        "categoria": "Contato",
        "query": """
            SELECT 
                CASE 
                    WHEN website IS NOT NULL AND website != '' 
                    THEN 'Com Website' 
                    ELSE 'Sem Website' 
                END as status_website,
                COUNT(*) as total
            FROM lead
            GROUP BY status_website
        """
    },
    
    # ============================================
    # CATEGORIA 6: FINANCEIRO E PAGAMENTO (20 assuntos)
    # ============================================
    
    "distribuicao_dia_vencimento": {
        "label": "Distribuição por Dia de Vencimento",
        "descricao": "Dias do mês de vencimento mais comuns",
        "categoria": "Financeiro",
        "query": """
            SELECT 
                COALESCE(CAST(dia_vencimento AS VARCHAR), 'Não Definido') as dia,
                COUNT(*) as total
            FROM lead
            WHERE dia_vencimento IS NOT NULL
            GROUP BY dia_vencimento
            ORDER BY dia_vencimento
        """
    },
    
    "distribuicao_tabela_preco": {
        "label": "Distribuição por Tabela de Preço",
        "descricao": "Leads por tabela de preço",
        "categoria": "Financeiro",
        "query": """
            SELECT 
                COALESCE(CAST(tabela_preco AS VARCHAR), 'Não Definido') as tabela,
                COUNT(*) as total
            FROM lead
            WHERE tabela_preco IS NOT NULL
            GROUP BY tabela_preco
            ORDER BY total DESC
            LIMIT 15
        """
    },
    
    "distribuicao_tipo_cliente": {
        "label": "Distribuição por Tipo de Cliente",
        "descricao": "Classificação do tipo de cliente",
        "categoria": "Financeiro",
        "query": """
            SELECT 
                COALESCE(CAST(id_tipo_cliente AS VARCHAR), 'Não Definido') as tipo,
                COUNT(*) as total
            FROM lead
            WHERE id_tipo_cliente IS NOT NULL
            GROUP BY id_tipo_cliente
            ORDER BY total DESC
            LIMIT 15
        """
    },
    
    # ============================================
    # CATEGORIA 7: VENDAS E CONVERSÃO (15 assuntos)
    # ============================================
    
    "distribuicao_por_vendedor": {
        "label": "Distribuição por Vendedor",
        "descricao": "Top 30 vendedores com mais leads",
        "categoria": "Vendas",
        "query": """
            SELECT 
                COALESCE(CAST(id_vendedor AS VARCHAR), 'Sem Vendedor') as vendedor,
                COUNT(*) as total
            FROM lead
            WHERE id_vendedor IS NOT NULL
            GROUP BY id_vendedor
            ORDER BY total DESC
            LIMIT 30
        """
    },
    
    "distribuicao_canal_venda": {
        "label": "Distribuição por Canal de Venda",
        "descricao": "Canais de venda mais utilizados",
        "categoria": "Vendas",
        "query": """
            SELECT 
                COALESCE(CAST(id_canal_venda AS VARCHAR), 'Não Definido') as canal,
                COUNT(*) as total
            FROM lead
            WHERE id_canal_venda IS NOT NULL
            GROUP BY id_canal_venda
            ORDER BY total DESC
            LIMIT 15
        """
    },
    
    "distribuicao_filial": {
        "label": "Distribuição por Filial",
        "descricao": "Leads por filial de atendimento",
        "categoria": "Vendas",
        "query": """
            SELECT 
                COALESCE(CAST(filial_id AS VARCHAR), 'Sem Filial') as filial,
                COUNT(*) as total
            FROM lead
            WHERE filial_id IS NOT NULL
            GROUP BY filial_id
            ORDER BY total DESC
            LIMIT 20
        """
    },
    
    "distribuicao_campanha": {
        "label": "Distribuição por Campanha",
        "descricao": "Leads por campanha de marketing",
        "categoria": "Vendas",
        "query": """
            SELECT 
                COALESCE(CAST(id_campanha AS VARCHAR), 'Sem Campanha') as campanha,
                COUNT(*) as total
            FROM lead
            WHERE id_campanha IS NOT NULL
            GROUP BY id_campanha
            ORDER BY total DESC
            LIMIT 20
        """
    },
    
    "leads_indicadas": {
        "label": "Leads Indicadas por Outros",
        "descricao": "Leads que foram indicadas por outros clientes",
        "categoria": "Vendas",
        "query": """
            SELECT 
                CASE 
                    WHEN indicado_por IS NOT NULL 
                    THEN 'Indicado' 
                    ELSE 'Não Indicado' 
                END as status_indicacao,
                COUNT(*) as total
            FROM lead
            GROUP BY status_indicacao
        """
    },
    
    "conversao_viabilidade": {
        "label": "Taxa de Conversão por Viabilidade",
        "descricao": "Leads cadastradas via viabilidade que converteram",
        "categoria": "Vendas",
        "query": """
            SELECT 
                CASE cadastrado_via_viabilidade
                    WHEN 'S' THEN 'Via Viabilidade'
                    ELSE 'Direto'
                END as origem_cadastro,
                COUNT(*) as total
            FROM lead
            WHERE cadastrado_via_viabilidade IS NOT NULL
            GROUP BY cadastrado_via_viabilidade
        """
    },
    
    # ============================================
    # CATEGORIA 8: EMPREGO E RENDA (10 assuntos)
    # ============================================
    
    "distribuicao_remuneracao": {
        "label": "Distribuição por Faixa de Remuneração",
        "descricao": "Faixas salariais das leads",
        "categoria": "Emprego",
        "query": """
            SELECT 
                CASE 
                    WHEN emp_remuneracao IS NULL THEN 'Não Informado'
                    WHEN emp_remuneracao < 1500 THEN 'Até R$ 1.500'
                    WHEN emp_remuneracao < 3000 THEN 'R$ 1.500 - R$ 3.000'
                    WHEN emp_remuneracao < 5000 THEN 'R$ 3.000 - R$ 5.000'
                    WHEN emp_remuneracao < 10000 THEN 'R$ 5.000 - R$ 10.000'
                    ELSE 'Acima de R$ 10.000'
                END as faixa_salarial,
                COUNT(*) as total
            FROM lead
            GROUP BY faixa_salarial
            ORDER BY 
                CASE faixa_salarial
                    WHEN 'Até R$ 1.500' THEN 1
                    WHEN 'R$ 1.500 - R$ 3.000' THEN 2
                    WHEN 'R$ 3.000 - R$ 5.000' THEN 3
                    WHEN 'R$ 5.000 - R$ 10.000' THEN 4
                    WHEN 'Acima de R$ 10.000' THEN 5
                    ELSE 6
                END
        """
    },
    
    "leads_com_emprego": {
        "label": "Leads com Dados de Emprego",
        "descricao": "Leads que possuem informações de emprego",
        "categoria": "Emprego",
        "query": """
            SELECT 
                CASE 
                    WHEN emp_empresa IS NOT NULL AND emp_empresa != '' 
                    THEN 'Com Emprego' 
                    ELSE 'Sem Emprego' 
                END as status_emprego,
                COUNT(*) as total
            FROM lead
            GROUP BY status_emprego
        """
    },
    
    "distribuicao_por_cargo": {
        "label": "Distribuição por Cargo",
        "descricao": "Top 20 cargos mais comuns",
        "categoria": "Emprego",
        "query": """
            SELECT 
                COALESCE(emp_cargo, 'Não Informado') as cargo,
                COUNT(*) as total
            FROM lead
            WHERE emp_cargo IS NOT NULL AND emp_cargo != ''
            GROUP BY emp_cargo
            ORDER BY total DESC
            LIMIT 20
        """
    },
    
    # ============================================
    # CATEGORIA 9: SEGMENTAÇÃO E PERFIL (10 assuntos)
    # ============================================
    
    "distribuicao_por_segmento": {
        "label": "Distribuição por Segmento",
        "descricao": "Segmentação de mercado das leads",
        "categoria": "Segmentação",
        "query": """
            SELECT 
                COALESCE(CAST(id_segmento AS VARCHAR), 'Não Segmentado') as segmento,
                COUNT(*) as total
            FROM lead
            WHERE id_segmento IS NOT NULL
            GROUP BY id_segmento
            ORDER BY total DESC
            LIMIT 15
        """
    },
    
    "distribuicao_por_perfil": {
        "label": "Distribuição por Perfil",
        "descricao": "Perfis de cliente",
        "categoria": "Segmentação",
        "query": """
            SELECT 
                COALESCE(CAST(id_perfil AS VARCHAR), 'Sem Perfil') as perfil,
                COUNT(*) as total
            FROM lead
            WHERE id_perfil IS NOT NULL
            GROUP BY id_perfil
            ORDER BY total DESC
            LIMIT 15
        """
    },
    
    "distribuicao_por_concorrente": {
        "label": "Distribuição por Concorrente Anterior",
        "descricao": "De qual concorrente a lead veio",
        "categoria": "Segmentação",
        "query": """
            SELECT 
                COALESCE(CAST(id_concorrente AS VARCHAR), 'Não Informado') as concorrente,
                COUNT(*) as total
            FROM lead
            WHERE id_concorrente IS NOT NULL
            GROUP BY id_concorrente
            ORDER BY total DESC
            LIMIT 15
        """
    },
    
    # ============================================
    # CATEGORIA 10: TECNOLOGIA E CONECTIVIDADE (15 assuntos)
    # ============================================
    
    "analise_calc_velocidade_pessoas": {
        "label": "Quantidade de Pessoas (Cálculo Velocidade)",
        "descricao": "Distribuição de pessoas que usam internet",
        "categoria": "Tecnologia",
        "query": """
            SELECT 
                COALESCE(CAST(qtd_pessoas_calc_vel AS VARCHAR), 'Não Informado') as qtd_pessoas,
                COUNT(*) as total
            FROM lead
            WHERE qtd_pessoas_calc_vel IS NOT NULL
            GROUP BY qtd_pessoas_calc_vel
            ORDER BY qtd_pessoas_calc_vel
            LIMIT 10
        """
    },
    
    "analise_calc_velocidade_smartphones": {
        "label": "Quantidade de Smartphones (Cálculo Velocidade)",
        "descricao": "Distribuição de smartphones por lead",
        "categoria": "Tecnologia",
        "query": """
            SELECT 
                COALESCE(CAST(qtd_smart_calc_vel AS VARCHAR), 'Não Informado') as qtd_smartphones,
                COUNT(*) as total
            FROM lead
            WHERE qtd_smart_calc_vel IS NOT NULL
            GROUP BY qtd_smart_calc_vel
            ORDER BY qtd_smart_calc_vel
            LIMIT 10
        """
    },
    
    "analise_calc_velocidade_celulares": {
        "label": "Quantidade de Celulares (Cálculo Velocidade)",
        "descricao": "Distribuição de celulares por lead",
        "categoria": "Tecnologia",
        "query": """
            SELECT 
                COALESCE(CAST(qtd_celular_calc_vel AS VARCHAR), 'Não Informado') as qtd_celulares,
                COUNT(*) as total
            FROM lead
            WHERE qtd_celular_calc_vel IS NOT NULL
            GROUP BY qtd_celular_calc_vel
            ORDER BY qtd_celular_calc_vel
            LIMIT 10
        """
    },
    
    "analise_calc_velocidade_computadores": {
        "label": "Quantidade de Computadores (Cálculo Velocidade)",
        "descricao": "Distribuição de computadores por lead",
        "categoria": "Tecnologia",
        "query": """
            SELECT 
                COALESCE(CAST(qtd_computador_calc_vel AS VARCHAR), 'Não Informado') as qtd_computadores,
                COUNT(*) as total
            FROM lead
            WHERE qtd_computador_calc_vel IS NOT NULL
            GROUP BY qtd_computador_calc_vel
            ORDER BY qtd_computador_calc_vel
            LIMIT 10
        """
    },
    
    "analise_calc_velocidade_consoles": {
        "label": "Quantidade de Consoles (Cálculo Velocidade)",
        "descricao": "Distribuição de consoles de videogame por lead",
        "categoria": "Tecnologia",
        "query": """
            SELECT 
                COALESCE(CAST(qtd_console_calc_vel AS VARCHAR), 'Não Informado') as qtd_consoles,
                COUNT(*) as total
            FROM lead
            WHERE qtd_console_calc_vel IS NOT NULL
            GROUP BY qtd_console_calc_vel
            ORDER BY qtd_console_calc_vel
            LIMIT 10
        """
    },
    
    "resultado_calc_velocidade": {
        "label": "Resultado do Cálculo de Velocidade",
        "descricao": "Velocidade de internet recomendada",
        "categoria": "Tecnologia",
        "query": """
            SELECT 
                COALESCE(resultado_calc_vel, 'Não Calculado') as velocidade_recomendada,
                COUNT(*) as total
            FROM lead
            WHERE resultado_calc_vel IS NOT NULL
            GROUP BY resultado_calc_vel
            ORDER BY total DESC
            LIMIT 15
        """
    },
    
    "distribuicao_tipo_rede": {
        "label": "Distribuição por Tipo de Rede",
        "descricao": "Tipo de rede de internet (fibra, rádio, etc)",
        "categoria": "Tecnologia",
        "query": """
            SELECT 
                COALESCE(tipo_rede, 'Não Informado') as tipo_rede,
                COUNT(*) as total
            FROM lead
            WHERE tipo_rede IS NOT NULL
            GROUP BY tipo_rede
            ORDER BY total DESC
        """
    },
    
    "distribuicao_rede_ativacao": {
        "label": "Distribuição por Rede de Ativação",
        "descricao": "Rede utilizada na ativação",
        "categoria": "Tecnologia",
        "query": """
            SELECT 
                COALESCE(rede_ativacao, 'Não Informado') as rede,
                COUNT(*) as total
            FROM lead
            WHERE rede_ativacao IS NOT NULL
            GROUP BY rede_ativacao
            ORDER BY total DESC
        """
    },
    
    # ============================================
    # CATEGORIA 11: INTEGRAÇÕES E SISTEMAS EXTERNOS (10 assuntos)
    # ============================================
    
    "leads_com_integracao_pipe": {
        "label": "Leads Integradas com Pipedrive",
        "descricao": "Leads que possuem ID de organização no Pipedrive",
        "categoria": "Integrações",
        "query": """
            SELECT 
                CASE 
                    WHEN pipe_id_organizacao IS NOT NULL 
                    THEN 'Integrado Pipedrive' 
                    ELSE 'Não Integrado' 
                END as status_pipe,
                COUNT(*) as total
            FROM lead
            GROUP BY status_pipe
        """
    },
    
    "leads_com_myauth": {
        "label": "Leads com MyAuth",
        "descricao": "Leads que possuem integração MyAuth",
        "categoria": "Integrações",
        "query": """
            SELECT 
                CASE 
                    WHEN id_myauth IS NOT NULL 
                    THEN 'Com MyAuth' 
                    ELSE 'Sem MyAuth' 
                END as status_myauth,
                COUNT(*) as total
            FROM lead
            GROUP BY status_myauth
        """
    },
    
    "leads_com_vindi": {
        "label": "Leads com Vindi",
        "descricao": "Leads integradas com sistema Vindi",
        "categoria": "Integrações",
        "query": """
            SELECT 
                CASE 
                    WHEN id_vindi IS NOT NULL 
                    THEN 'Com Vindi' 
                    ELSE 'Sem Vindi' 
                END as status_vindi,
                COUNT(*) as total
            FROM lead
            GROUP BY status_vindi
        """
    },
    
    "leads_com_external_system": {
        "label": "Leads com Sistema Externo",
        "descricao": "Leads integradas com sistemas externos",
        "categoria": "Integrações",
        "query": """
            SELECT 
                COALESCE(external_system, 'Nenhum') as sistema_externo,
                COUNT(*) as total
            FROM lead
            WHERE external_system IS NOT NULL
            GROUP BY external_system
            ORDER BY total DESC
        """
    },
    
    # ============================================
    # CATEGORIA 12: ANÁLISES TEMPORAIS (15 assuntos)
    # ============================================
    
    "leads_cadastradas_ultimos_7_dias": {
        "label": "Leads Cadastradas - Últimos 7 Dias",
        "descricao": "Leads cadastradas nos últimos 7 dias",
        "categoria": "Temporal",
        "query": """
            SELECT 
                DATE(data_cadastro) as data,
                COUNT(*) as total
            FROM lead
            WHERE data_cadastro >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY data
            ORDER BY data DESC
        """
    },
    
    "leads_atualizadas_ultimos_7_dias": {
        "label": "Leads Atualizadas - Últimos 7 Dias",
        "descricao": "Leads atualizadas nos últimos 7 dias",
        "categoria": "Temporal",
        "query": """
            SELECT 
                DATE(ultima_atualizacao) as data,
                COUNT(*) as total
            FROM lead
            WHERE ultima_atualizacao >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY data
            ORDER BY data DESC
        """
    },
    
    "aniversariantes_mes_atual": {
        "label": "Aniversariantes do Mês Atual",
        "descricao": "Leads que fazem aniversário no mês atual",
        "categoria": "Temporal",
        "query": """
            SELECT 
                EXTRACT(DAY FROM data_nascimento) as dia,
                COUNT(*) as total
            FROM lead
            WHERE EXTRACT(MONTH FROM data_nascimento) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND data_nascimento IS NOT NULL
            GROUP BY dia
            ORDER BY dia
        """
    },
    
    "leads_por_dia_da_semana": {
        "label": "Cadastros por Dia da Semana",
        "descricao": "Qual dia da semana tem mais cadastros",
        "categoria": "Temporal",
        "query": """
            SELECT 
                CASE EXTRACT(DOW FROM data_cadastro)
                    WHEN 0 THEN 'Domingo'
                    WHEN 1 THEN 'Segunda'
                    WHEN 2 THEN 'Terça'
                    WHEN 3 THEN 'Quarta'
                    WHEN 4 THEN 'Quinta'
                    WHEN 5 THEN 'Sexta'
                    WHEN 6 THEN 'Sábado'
                END as dia_semana,
                COUNT(*) as total
            FROM lead
            WHERE data_cadastro IS NOT NULL
            GROUP BY EXTRACT(DOW FROM data_cadastro)
            ORDER BY EXTRACT(DOW FROM data_cadastro)
        """
    },
    
    "tempo_medio_desde_cadastro": {
        "label": "Tempo Médio Desde o Cadastro",
        "descricao": "Quantos dias em média as leads estão cadastradas",
        "categoria": "Temporal",
        "query": """
            SELECT 
                CASE 
                    WHEN EXTRACT(DAY FROM AGE(CURRENT_DATE, data_cadastro)) < 30 THEN 'Menos de 1 mês'
                    WHEN EXTRACT(DAY FROM AGE(CURRENT_DATE, data_cadastro)) < 90 THEN '1-3 meses'
                    WHEN EXTRACT(DAY FROM AGE(CURRENT_DATE, data_cadastro)) < 180 THEN '3-6 meses'
                    WHEN EXTRACT(DAY FROM AGE(CURRENT_DATE, data_cadastro)) < 365 THEN '6-12 meses'
                    ELSE 'Mais de 1 ano'
                END as tempo_cadastro,
                COUNT(*) as total
            FROM lead
            WHERE data_cadastro IS NOT NULL
            GROUP BY tempo_cadastro
            ORDER BY 
                CASE tempo_cadastro
                    WHEN 'Menos de 1 mês' THEN 1
                    WHEN '1-3 meses' THEN 2
                    WHEN '3-6 meses' THEN 3
                    WHEN '6-12 meses' THEN 4
                    WHEN 'Mais de 1 ano' THEN 5
                END
        """
    },
    
    "proximo_contato_prospeccao": {
        "label": "Próximo Contato de Prospecção",
        "descricao": "Leads com contato de prospecção agendado",
        "categoria": "Temporal",
        "query": """
            SELECT 
                DATE(prospeccao_proximo_contato) as data_contato,
                COUNT(*) as total
            FROM lead
            WHERE prospeccao_proximo_contato >= CURRENT_DATE
            AND prospeccao_proximo_contato <= CURRENT_DATE + INTERVAL '30 days'
            GROUP BY data_contato
            ORDER BY data_contato
        """
    },
    
    # ============================================
    # CATEGORIA 13: QUALIDADE DE DADOS (15 assuntos)
    # ============================================
    
    "completude_dados_basicos": {
        "label": "Completude de Dados Básicos",
        "descricao": "Leads com todos os dados básicos preenchidos",
        "categoria": "Qualidade",
        "query": """
            SELECT 
                CASE 
                    WHEN razao IS NOT NULL AND cnpj_cpf IS NOT NULL 
                         AND email IS NOT NULL AND fone IS NOT NULL 
                    THEN 'Completo' 
                    ELSE 'Incompleto' 
                END as completude,
                COUNT(*) as total
            FROM lead
            GROUP BY completude
        """
    },
    
    "completude_dados_contato": {
        "label": "Completude de Dados de Contato",
        "descricao": "Leads com todos os contatos preenchidos",
        "categoria": "Qualidade",
        "query": """
            SELECT 
                CASE 
                    WHEN email IS NOT NULL AND fone IS NOT NULL 
                         AND telefone_celular IS NOT NULL 
                    THEN 'Completo' 
                    ELSE 'Incompleto' 
                END as completude_contato,
                COUNT(*) as total
            FROM lead
            GROUP BY completude_contato
        """
    },
    
    "completude_dados_endereco": {
        "label": "Completude de Dados de Endereço",
        "descricao": "Leads com endereço completo",
        "categoria": "Qualidade",
        "query": """
            SELECT 
                CASE 
                    WHEN endereco IS NOT NULL AND cidade IS NOT NULL 
                         AND uf IS NOT NULL AND cep IS NOT NULL 
                    THEN 'Completo' 
                    ELSE 'Incompleto' 
                END as completude_endereco,
                COUNT(*) as total
            FROM lead
            GROUP BY completude_endereco
        """
    },
    
    "leads_sem_email": {
        "label": "Leads sem E-mail",
        "descricao": "Leads que precisam ter e-mail cadastrado",
        "categoria": "Qualidade",
        "query": """
            SELECT 
                'Sem E-mail' as status,
                COUNT(*) as total
            FROM lead
            WHERE email IS NULL OR email = ''
        """
    },
    
    "leads_sem_telefone": {
        "label": "Leads sem Telefone",
        "descricao": "Leads que precisam ter telefone cadastrado",
        "categoria": "Qualidade",
        "query": """
            SELECT 
                'Sem Telefone' as status,
                COUNT(*) as total
            FROM lead
            WHERE (fone IS NULL OR fone = '') 
            AND (telefone_celular IS NULL OR telefone_celular = '')
        """
    },
    
    "leads_sem_endereco": {
        "label": "Leads sem Endereço",
        "descricao": "Leads que precisam ter endereço cadastrado",
        "categoria": "Qualidade",
        "query": """
            SELECT 
                'Sem Endereço' as status,
                COUNT(*) as total
            FROM lead
            WHERE endereco IS NULL OR endereco = ''
        """
    },
    
    # ============================================
    # CATEGORIA 14: ANÁLISES CUSTOMIZADAS (10 assuntos)
    # ============================================
    
    "leads_com_observacoes": {
        "label": "Leads com Observações",
        "descricao": "Leads que possuem campo de observações preenchido",
        "categoria": "Customizado",
        "query": """
            SELECT 
                CASE 
                    WHEN obs IS NOT NULL AND obs != '' 
                    THEN 'Com Observações' 
                    ELSE 'Sem Observações' 
                END as status_obs,
                COUNT(*) as total
            FROM lead
            GROUP BY status_obs
        """
    },
    
    "leads_com_alerta": {
        "label": "Leads com Alerta",
        "descricao": "Leads que possuem algum alerta cadastrado",
        "categoria": "Customizado",
        "query": """
            SELECT 
                CASE 
                    WHEN alerta IS NOT NULL AND alerta != '' 
                    THEN 'Com Alerta' 
                    ELSE 'Sem Alerta' 
                END as status_alerta,
                COUNT(*) as total
            FROM lead
            GROUP BY status_alerta
        """
    },
    
    "leads_com_referencia": {
        "label": "Leads com Referência",
        "descricao": "Leads que possuem referência cadastrada",
        "categoria": "Customizado",
        "query": """
            SELECT 
                CASE 
                    WHEN referencia IS NOT NULL AND referencia != '' 
                    THEN 'Com Referência' 
                    ELSE 'Sem Referência' 
                END as status_referencia,
                COUNT(*) as total
            FROM lead
            GROUP BY status_referencia
        """
    },
    
    "leads_com_complemento": {
        "label": "Leads com Complemento de Endereço",
        "descricao": "Leads que possuem complemento cadastrado",
        "categoria": "Customizado",
        "query": """
            SELECT 
                CASE 
                    WHEN complemento IS NOT NULL AND complemento != '' 
                    THEN 'Com Complemento' 
                    ELSE 'Sem Complemento' 
                END as status_complemento,
                COUNT(*) as total
            FROM lead
            GROUP BY status_complemento
        """
    },
    
    "score_distribution": {
        "label": "Distribuição de Score",
        "descricao": "Faixas de score das leads",
        "categoria": "Customizado",
        "query": """
            SELECT 
                CASE 
                    WHEN score = 0 THEN 'Score 0'
                    WHEN score BETWEEN 1 AND 20 THEN '1-20'
                    WHEN score BETWEEN 21 AND 40 THEN '21-40'
                    WHEN score BETWEEN 41 AND 60 THEN '41-60'
                    WHEN score BETWEEN 61 AND 80 THEN '61-80'
                    WHEN score BETWEEN 81 AND 100 THEN '81-100'
                    ELSE 'Acima de 100'
                END as faixa_score,
                COUNT(*) as total
            FROM lead
            GROUP BY faixa_score
            ORDER BY 
                CASE faixa_score
                    WHEN 'Score 0' THEN 1
                    WHEN '1-20' THEN 2
                    WHEN '21-40' THEN 3
                    WHEN '41-60' THEN 4
                    WHEN '61-80' THEN 5
                    WHEN '81-100' THEN 6
                    ELSE 7
                END
        """
    },
    
    # ============================================
    # CATEGORIA 15: CONTRATOS (10)
    # ============================================
    
    "contratos_ativos_por_mes": {
        "label": "Contratos Ativos por Mês",
        "descricao": "Quantidade de contratos ativos ao longo do tempo",
        "categoria": "Contratos",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_ativacao) as periodo,
                COUNT(*) as total
            FROM cliente_contrato
            WHERE status = 'A'
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "contratos_cancelados_por_mes": {
        "label": "Contratos Cancelados por Mês",
        "descricao": "Evolução de cancelamentos de contratos",
        "categoria": "Contratos",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_cancelamento) as periodo,
                COUNT(*) as total
            FROM cliente_contrato
            WHERE status = 'C' AND data_cancelamento IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "distribuicao_tipo_contrato": {
        "label": "Distribuição por Tipo de Contrato",
        "descricao": "Quantidade de contratos por tipo",
        "categoria": "Contratos",
        "query": """
            SELECT 
                tipo_contrato,
                COUNT(*) as total
            FROM cliente_contrato
            WHERE status = 'A'
            GROUP BY tipo_contrato
            ORDER BY total DESC
        """
    },
    
    "valor_medio_contratos": {
        "label": "Valor Médio dos Contratos",
        "descricao": "Valor médio dos contratos por mês",
        "categoria": "Contratos",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_ativacao) as periodo,
                AVG(valor) as total
            FROM cliente_contrato
            WHERE status = 'A' AND valor > 0
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "contratos_por_plano": {
        "label": "Contratos por Plano",
        "descricao": "Distribuição de contratos por plano contratado",
        "categoria": "Contratos",
        "query": """
            SELECT 
                id_plano::text as plano,
                COUNT(*) as total
            FROM cliente_contrato
            WHERE status = 'A'
            GROUP BY id_plano
            ORDER BY total DESC
            LIMIT 10
        """
    },
    
    "contratos_vencimento_proximo": {
        "label": "Contratos com Vencimento Próximo",
        "descricao": "Contratos que vencem nos próximos 30 dias",
        "categoria": "Contratos",
        "query": """
            SELECT 
                DATE_TRUNC('day', data_vencimento) as periodo,
                COUNT(*) as total
            FROM cliente_contrato
            WHERE status = 'A' 
            AND data_vencimento BETWEEN NOW() AND NOW() + INTERVAL '30 days'
            GROUP BY periodo
            ORDER BY periodo
        """
    },
    
    "taxa_renovacao_contratos": {
        "label": "Taxa de Renovação de Contratos",
        "descricao": "Percentual de contratos renovados por mês",
        "categoria": "Contratos",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_renovacao) as periodo,
                COUNT(*) as total
            FROM cliente_contrato
            WHERE data_renovacao IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "contratos_inadimplentes": {
        "label": "Contratos Inadimplentes",
        "descricao": "Quantidade de contratos com débitos em aberto",
        "categoria": "Contratos",
        "query": """
            SELECT 
                DATE_TRUNC('month', NOW()) as periodo,
                COUNT(*) as total
            FROM cliente_contrato
            WHERE status = 'A' AND possui_debito = 'S'
            GROUP BY periodo
        """
    },
    
    "duracao_media_contratos": {
        "label": "Duração Média dos Contratos",
        "descricao": "Tempo médio de duração dos contratos cancelados",
        "categoria": "Contratos",
        "query": """
            SELECT 
                'Tempo Médio' as categoria,
                AVG(EXTRACT(DAY FROM (data_cancelamento - data_ativacao))) as total
            FROM cliente_contrato
            WHERE status = 'C' AND data_cancelamento IS NOT NULL
        """
    },
    
    "contratos_por_periodicidade": {
        "label": "Contratos por Periodicidade",
        "descricao": "Distribuição de contratos por tipo de cobrança",
        "categoria": "Contratos",
        "query": """
            SELECT 
                periodicidade,
                COUNT(*) as total
            FROM cliente_contrato
            WHERE status = 'A'
            GROUP BY periodicidade
            ORDER BY total DESC
        """
    },
    
    # ============================================
    # CATEGORIA 16: SERVIÇOS CONTRATADOS (8)
    # ============================================
    
    "servicos_mais_contratados": {
        "label": "Serviços Mais Contratados",
        "descricao": "Ranking dos serviços mais populares",
        "categoria": "Serviços",
        "query": """
            SELECT 
                descricao as servico,
                COUNT(*) as total
            FROM cliente_contrato_servicos
            WHERE status = 'A'
            GROUP BY descricao
            ORDER BY total DESC
            LIMIT 10
        """
    },
    
    "receita_por_servico": {
        "label": "Receita por Tipo de Serviço",
        "descricao": "Receita mensal gerada por cada tipo de serviço",
        "categoria": "Serviços",
        "query": """
            SELECT 
                tipo_servico,
                SUM(valor) as total
            FROM cliente_contrato_servicos
            WHERE status = 'A'
            GROUP BY tipo_servico
            ORDER BY total DESC
        """
    },
    
    "servicos_ativados_por_mes": {
        "label": "Serviços Ativados por Mês",
        "descricao": "Quantidade de novos serviços ativados",
        "categoria": "Serviços",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_ativacao) as periodo,
                COUNT(*) as total
            FROM cliente_contrato_servicos
            WHERE status = 'A' AND data_ativacao IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "servicos_por_velocidade": {
        "label": "Serviços por Velocidade Contratada",
        "descricao": "Distribuição por velocidade de internet",
        "categoria": "Serviços",
        "query": """
            SELECT 
                velocidade::text || ' Mbps' as categoria,
                COUNT(*) as total
            FROM cliente_contrato_servicos
            WHERE status = 'A' AND velocidade IS NOT NULL
            GROUP BY velocidade
            ORDER BY velocidade::int DESC
        """
    },
    
    "servicos_adicionais": {
        "label": "Serviços Adicionais Contratados",
        "descricao": "Quantidade de serviços extras além do principal",
        "categoria": "Serviços",
        "query": """
            SELECT 
                adicional,
                COUNT(*) as total
            FROM cliente_contrato_servicos
            WHERE status = 'A' AND adicional IS NOT NULL
            GROUP BY adicional
            ORDER BY total DESC
        """
    },
    
    "valor_medio_servicos": {
        "label": "Valor Médio dos Serviços",
        "descricao": "Ticket médio por tipo de serviço",
        "categoria": "Serviços",
        "query": """
            SELECT 
                tipo_servico,
                AVG(valor) as total
            FROM cliente_contrato_servicos
            WHERE status = 'A' AND valor > 0
            GROUP BY tipo_servico
            ORDER BY total DESC
        """
    },
    
    "servicos_tv": {
        "label": "Serviços de TV",
        "descricao": "Quantidade de serviços de TV assinados",
        "categoria": "Serviços",
        "query": """
            SELECT 
                'TV' as categoria,
                COUNT(*) as total
            FROM cliente_contrato_servicos
            WHERE status = 'A' AND tipo_servico LIKE '%TV%'
        """
    },
    
    "servicos_telefonia": {
        "label": "Serviços de Telefonia",
        "descricao": "Quantidade de serviços de telefonia",
        "categoria": "Serviços",
        "query": """
            SELECT 
                'Telefonia' as categoria,
                COUNT(*) as total
            FROM cliente_contrato_servicos
            WHERE status = 'A' AND tipo_servico LIKE '%Telefonia%'
        """
    },
    
    # ============================================
    # CATEGORIA 17: ALTERAÇÕES DE PLANO (6)
    # ============================================
    
    "alteracoes_plano_por_mes": {
        "label": "Alterações de Plano por Mês",
        "descricao": "Quantidade de mudanças de plano ao longo do tempo",
        "categoria": "Alterações",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_alteracao) as periodo,
                COUNT(*) as total
            FROM cliente_contrato_alt_plano
            WHERE data_alteracao IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "upgrades_vs_downgrades": {
        "label": "Upgrades vs Downgrades",
        "descricao": "Comparação entre upgrades e downgrades de plano",
        "categoria": "Alterações",
        "query": """
            SELECT 
                tipo_alteracao,
                COUNT(*) as total
            FROM cliente_contrato_alt_plano
            GROUP BY tipo_alteracao
            ORDER BY total DESC
        """
    },
    
    "motivos_alteracao_plano": {
        "label": "Motivos de Alteração de Plano",
        "descricao": "Principais razões para mudança de plano",
        "categoria": "Alterações",
        "query": """
            SELECT 
                motivo,
                COUNT(*) as total
            FROM cliente_contrato_alt_plano
            WHERE motivo IS NOT NULL
            GROUP BY motivo
            ORDER BY total DESC
            LIMIT 10
        """
    },
    
    "impacto_financeiro_alteracoes": {
        "label": "Impacto Financeiro das Alterações",
        "descricao": "Diferença de valor nas alterações de plano",
        "categoria": "Alterações",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_alteracao) as periodo,
                SUM(valor_novo - valor_antigo) as total
            FROM cliente_contrato_alt_plano
            WHERE data_alteracao IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "alteracoes_por_vendedor": {
        "label": "Alterações por Vendedor",
        "descricao": "Quantidade de alterações processadas por vendedor",
        "categoria": "Alterações",
        "query": """
            SELECT 
                id_vendedor::text as vendedor,
                COUNT(*) as total
            FROM cliente_contrato_alt_plano
            WHERE id_vendedor IS NOT NULL
            GROUP BY id_vendedor
            ORDER BY total DESC
            LIMIT 10
        """
    },
    
    "tempo_medio_entre_alteracoes": {
        "label": "Tempo Médio Entre Alterações",
        "descricao": "Intervalo médio entre mudanças de plano",
        "categoria": "Alterações",
        "query": """
            SELECT 
                'Tempo Médio (dias)' as categoria,
                AVG(EXTRACT(DAY FROM (data_alteracao - LAG(data_alteracao) OVER (PARTITION BY id_contrato ORDER BY data_alteracao)))) as total
            FROM cliente_contrato_alt_plano
            WHERE data_alteracao IS NOT NULL
        """
    },
    
    # ============================================
    # CATEGORIA 18: HISTÓRICO DE CONTRATOS (4)
    # ============================================
    
    "historico_mudancas_status": {
        "label": "Histórico de Mudanças de Status",
        "descricao": "Alterações de status dos contratos",
        "categoria": "Histórico",
        "query": """
            SELECT 
                status_novo as status,
                COUNT(*) as total
            FROM cliente_contrato_historico
            GROUP BY status_novo
            ORDER BY total DESC
        """
    },
    
    "atividades_por_mes": {
        "label": "Atividades por Mês",
        "descricao": "Quantidade de mudanças registradas no histórico",
        "categoria": "Histórico",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_evento) as periodo,
                COUNT(*) as total
            FROM cliente_contrato_historico
            WHERE data_evento IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "tipos_evento_historico": {
        "label": "Tipos de Evento no Histórico",
        "descricao": "Distribuição por tipo de evento registrado",
        "categoria": "Histórico",
        "query": """
            SELECT 
                tipo_evento,
                COUNT(*) as total
            FROM cliente_contrato_historico
            WHERE tipo_evento IS NOT NULL
            GROUP BY tipo_evento
            ORDER BY total DESC
        """
    },
    
    "historico_por_usuario": {
        "label": "Histórico por Usuário",
        "descricao": "Atividades registradas por usuário do sistema",
        "categoria": "Histórico",
        "query": """
            SELECT 
                id_usuario::text as usuario,
                COUNT(*) as total
            FROM cliente_contrato_historico
            WHERE id_usuario IS NOT NULL
            GROUP BY id_usuario
            ORDER BY total DESC
            LIMIT 10
        """
    },
    
    # ============================================
    # CATEGORIA 19: ARQUIVOS DE CLIENTES (4)
    # ============================================
    
    "arquivos_por_cliente": {
        "label": "Arquivos por Cliente",
        "descricao": "Distribuição de quantidade de arquivos por cliente",
        "categoria": "Arquivos",
        "query": """
            SELECT 
                id_cliente::text as cliente,
                COUNT(*) as total
            FROM cliente_arquivos
            GROUP BY id_cliente
            ORDER BY total DESC
            LIMIT 10
        """
    },
    
    "tipos_arquivo_cliente": {
        "label": "Tipos de Arquivo",
        "descricao": "Distribuição por tipo de arquivo enviado",
        "categoria": "Arquivos",
        "query": """
            SELECT 
                tipo_arquivo,
                COUNT(*) as total
            FROM cliente_arquivos
            WHERE tipo_arquivo IS NOT NULL
            GROUP BY tipo_arquivo
            ORDER BY total DESC
        """
    },
    
    "uploads_por_mes": {
        "label": "Uploads por Mês",
        "descricao": "Quantidade de arquivos enviados mensalmente",
        "categoria": "Arquivos",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_upload) as periodo,
                COUNT(*) as total
            FROM cliente_arquivos
            WHERE data_upload IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "tamanho_medio_arquivos": {
        "label": "Tamanho Médio dos Arquivos",
        "descricao": "Tamanho médio em MB dos arquivos",
        "categoria": "Arquivos",
        "query": """
            SELECT 
                'Tamanho Médio (MB)' as categoria,
                AVG(tamanho / 1024.0 / 1024.0) as total
            FROM cliente_arquivos
            WHERE tamanho > 0
        """
    },
    
    # ============================================
    # CATEGORIA 20: CHAMADOS/OSS (15)
    # ============================================
    
    "chamados_abertos_por_mes": {
        "label": "Chamados Abertos por Mês",
        "descricao": "Quantidade de novos chamados ao longo do tempo",
        "categoria": "Chamados",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_abertura) as periodo,
                COUNT(*) as total
            FROM su_oss_chamado
            WHERE data_abertura IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "chamados_fechados_por_mes": {
        "label": "Chamados Fechados por Mês",
        "descricao": "Quantidade de chamados resolvidos",
        "categoria": "Chamados",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_fechamento) as periodo,
                COUNT(*) as total
            FROM su_oss_chamado
            WHERE data_fechamento IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "chamados_por_status": {
        "label": "Chamados por Status",
        "descricao": "Distribuição de chamados por status atual",
        "categoria": "Chamados",
        "query": """
            SELECT 
                status,
                COUNT(*) as total
            FROM su_oss_chamado
            GROUP BY status
            ORDER BY total DESC
        """
    },
    
    "chamados_por_prioridade": {
        "label": "Chamados por Prioridade",
        "descricao": "Distribuição de chamados por nível de prioridade",
        "categoria": "Chamados",
        "query": """
            SELECT 
                prioridade,
                COUNT(*) as total
            FROM su_oss_chamado
            WHERE prioridade IS NOT NULL
            GROUP BY prioridade
            ORDER BY total DESC
        """
    },
    
    "tempo_medio_atendimento": {
        "label": "Tempo Médio de Atendimento",
        "descricao": "Tempo médio para resolução de chamados (em horas)",
        "categoria": "Chamados",
        "query": """
            SELECT 
                'Tempo Médio (horas)' as categoria,
                AVG(EXTRACT(EPOCH FROM (data_fechamento - data_abertura)) / 3600) as total
            FROM su_oss_chamado
            WHERE data_fechamento IS NOT NULL
        """
    },
    
    "chamados_por_tecnico": {
        "label": "Chamados por Técnico",
        "descricao": "Distribuição de atendimentos por técnico",
        "categoria": "Chamados",
        "query": """
            SELECT 
                id_tecnico::text as tecnico,
                COUNT(*) as total
            FROM su_oss_chamado
            WHERE id_tecnico IS NOT NULL
            GROUP BY id_tecnico
            ORDER BY total DESC
            LIMIT 10
        """
    },
    
    "chamados_por_tipo": {
        "label": "Chamados por Tipo",
        "descricao": "Principais tipos de chamados registrados",
        "categoria": "Chamados",
        "query": """
            SELECT 
                tipo_chamado,
                COUNT(*) as total
            FROM su_oss_chamado
            WHERE tipo_chamado IS NOT NULL
            GROUP BY tipo_chamado
            ORDER BY total DESC
            LIMIT 10
        """
    },
    
    "chamados_sla_cumprido": {
        "label": "SLA Cumprido",
        "descricao": "Percentual de chamados resolvidos dentro do SLA",
        "categoria": "Chamados",
        "query": """
            SELECT 
                CASE WHEN sla_cumprido = 'S' THEN 'Dentro do SLA' ELSE 'Fora do SLA' END as categoria,
                COUNT(*) as total
            FROM su_oss_chamado
            WHERE data_fechamento IS NOT NULL
            GROUP BY sla_cumprido
            ORDER BY total DESC
        """
    },
    
    "chamados_por_origem": {
        "label": "Chamados por Origem",
        "descricao": "Canal de abertura dos chamados",
        "categoria": "Chamados",
        "query": """
            SELECT 
                origem,
                COUNT(*) as total
            FROM su_oss_chamado
            WHERE origem IS NOT NULL
            GROUP BY origem
            ORDER BY total DESC
        """
    },
    
    "chamados_urgentes_abertos": {
        "label": "Chamados Urgentes em Aberto",
        "descricao": "Quantidade de chamados urgentes pendentes",
        "categoria": "Chamados",
        "query": """
            SELECT 
                'Urgentes' as categoria,
                COUNT(*) as total
            FROM su_oss_chamado
            WHERE prioridade = 'Urgente' AND status NOT IN ('Fechado', 'Concluído')
        """
    },
    
    "reincidencia_chamados": {
        "label": "Reincidência de Chamados",
        "descricao": "Clientes com múltiplos chamados sobre o mesmo assunto",
        "categoria": "Chamados",
        "query": """
            SELECT 
                id_cliente::text as cliente,
                COUNT(*) as total
            FROM su_oss_chamado
            GROUP BY id_cliente
            HAVING COUNT(*) > 3
            ORDER BY total DESC
            LIMIT 10
        """
    },
    
    "chamados_por_periodo_dia": {
        "label": "Chamados por Período do Dia",
        "descricao": "Horário de maior abertura de chamados",
        "categoria": "Chamados",
        "query": """
            SELECT 
                CASE 
                    WHEN EXTRACT(HOUR FROM data_abertura) BETWEEN 0 AND 5 THEN 'Madrugada'
                    WHEN EXTRACT(HOUR FROM data_abertura) BETWEEN 6 AND 11 THEN 'Manhã'
                    WHEN EXTRACT(HOUR FROM data_abertura) BETWEEN 12 AND 17 THEN 'Tarde'
                    ELSE 'Noite'
                END as periodo,
                COUNT(*) as total
            FROM su_oss_chamado
            WHERE data_abertura IS NOT NULL
            GROUP BY periodo
            ORDER BY total DESC
        """
    },
    
    "chamados_por_assunto": {
        "label": "Chamados por Assunto",
        "descricao": "Principais assuntos dos chamados",
        "categoria": "Chamados",
        "query": """
            SELECT 
                id_assunto::text as assunto,
                COUNT(*) as total
            FROM su_oss_chamado
            WHERE id_assunto IS NOT NULL
            GROUP BY id_assunto
            ORDER BY total DESC
            LIMIT 10
        """
    },
    
    "taxa_resolucao_primeiro_atendimento": {
        "label": "Taxa de Resolução no Primeiro Atendimento",
        "descricao": "Chamados resolvidos sem necessidade de retorno",
        "categoria": "Chamados",
        "query": """
            SELECT 
                CASE WHEN resolvido_primeiro_atendimento = 'S' THEN 'Resolvido 1ª vez' ELSE 'Necessitou retorno' END as categoria,
                COUNT(*) as total
            FROM su_oss_chamado
            WHERE data_fechamento IS NOT NULL
            GROUP BY resolvido_primeiro_atendimento
            ORDER BY total DESC
        """
    },
    
    "satisfacao_atendimento": {
        "label": "Satisfação com Atendimento",
        "descricao": "Avaliação dos clientes sobre o atendimento",
        "categoria": "Chamados",
        "query": """
            SELECT 
                avaliacao,
                COUNT(*) as total
            FROM su_oss_chamado
            WHERE avaliacao IS NOT NULL
            GROUP BY avaliacao
            ORDER BY 
                CASE avaliacao
                    WHEN 'Excelente' THEN 1
                    WHEN 'Bom' THEN 2
                    WHEN 'Regular' THEN 3
                    WHEN 'Ruim' THEN 4
                    WHEN 'Péssimo' THEN 5
                END
        """
    },
    
    # ============================================
    # CATEGORIA 21: HISTÓRICO DE CHAMADOS (5)
    # ============================================
    
    "historico_chamados_por_mes": {
        "label": "Histórico de Alterações por Mês",
        "descricao": "Quantidade de alterações nos chamados",
        "categoria": "Histórico Chamados",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_alteracao) as periodo,
                COUNT(*) as total
            FROM su_oss_chamado_historico
            WHERE data_alteracao IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "mudancas_status_chamados": {
        "label": "Mudanças de Status dos Chamados",
        "descricao": "Transições mais comuns de status",
        "categoria": "Histórico Chamados",
        "query": """
            SELECT 
                status_novo,
                COUNT(*) as total
            FROM su_oss_chamado_historico
            WHERE status_novo IS NOT NULL
            GROUP BY status_novo
            ORDER BY total DESC
        """
    },
    
    "reatribuicoes_tecnico": {
        "label": "Reatribuições de Técnico",
        "descricao": "Chamados que mudaram de técnico responsável",
        "categoria": "Histórico Chamados",
        "query": """
            SELECT 
                'Reatribuições' as categoria,
                COUNT(*) as total
            FROM su_oss_chamado_historico
            WHERE id_tecnico_novo != id_tecnico_antigo
        """
    },
    
    "tempo_medio_status": {
        "label": "Tempo Médio em Cada Status",
        "descricao": "Tempo médio que chamados permanecem em cada status",
        "categoria": "Histórico Chamados",
        "query": """
            SELECT 
                status_novo as status,
                AVG(EXTRACT(EPOCH FROM (data_alteracao - LAG(data_alteracao) OVER (PARTITION BY id_chamado ORDER BY data_alteracao))) / 3600) as total
            FROM su_oss_chamado_historico
            WHERE data_alteracao IS NOT NULL
            GROUP BY status_novo
            HAVING AVG(EXTRACT(EPOCH FROM (data_alteracao - LAG(data_alteracao) OVER (PARTITION BY id_chamado ORDER BY data_alteracao))) / 3600) IS NOT NULL
            ORDER BY total DESC
        """
    },
    
    "alteracoes_por_usuario_sistema": {
        "label": "Alterações por Usuário do Sistema",
        "descricao": "Usuários que mais modificam chamados",
        "categoria": "Histórico Chamados",
        "query": """
            SELECT 
                id_usuario::text as usuario,
                COUNT(*) as total
            FROM su_oss_chamado_historico
            WHERE id_usuario IS NOT NULL
            GROUP BY id_usuario
            ORDER BY total DESC
            LIMIT 10
        """
    },
    
    # ============================================
    # CATEGORIA 22: MENSAGENS DOS CHAMADOS (5)
    # ============================================
    
    "mensagens_por_mes": {
        "label": "Mensagens por Mês",
        "descricao": "Volume de mensagens trocadas nos chamados",
        "categoria": "Mensagens",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_mensagem) as periodo,
                COUNT(*) as total
            FROM su_oss_chamado_mensagem
            WHERE data_mensagem IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "mensagens_por_tipo": {
        "label": "Mensagens por Tipo",
        "descricao": "Distribuição por tipo de mensagem",
        "categoria": "Mensagens",
        "query": """
            SELECT 
                tipo_mensagem,
                COUNT(*) as total
            FROM su_oss_chamado_mensagem
            WHERE tipo_mensagem IS NOT NULL
            GROUP BY tipo_mensagem
            ORDER BY total DESC
        """
    },
    
    "mensagens_por_usuario": {
        "label": "Mensagens por Usuário",
        "descricao": "Usuários mais ativos em comunicação",
        "categoria": "Mensagens",
        "query": """
            SELECT 
                id_usuario::text as usuario,
                COUNT(*) as total
            FROM su_oss_chamado_mensagem
            WHERE id_usuario IS NOT NULL
            GROUP BY id_usuario
            ORDER BY total DESC
            LIMIT 10
        """
    },
    
    "tempo_resposta_medio": {
        "label": "Tempo Médio de Resposta",
        "descricao": "Tempo médio entre mensagens (em horas)",
        "categoria": "Mensagens",
        "query": """
            SELECT 
                'Tempo Médio (horas)' as categoria,
                AVG(EXTRACT(EPOCH FROM (data_mensagem - LAG(data_mensagem) OVER (PARTITION BY id_chamado ORDER BY data_mensagem))) / 3600) as total
            FROM su_oss_chamado_mensagem
            WHERE data_mensagem IS NOT NULL
        """
    },
    
    "mensagens_por_chamado": {
        "label": "Média de Mensagens por Chamado",
        "descricao": "Quantidade média de mensagens por chamado",
        "categoria": "Mensagens",
        "query": """
            SELECT 
                id_chamado::text as chamado,
                COUNT(*) as total
            FROM su_oss_chamado_mensagem
            GROUP BY id_chamado
            ORDER BY total DESC
            LIMIT 10
        """
    },
    
    # ============================================
    # CATEGORIA 23: ARQUIVOS DOS CHAMADOS (3)
    # ============================================
    
    "arquivos_chamados_por_mes": {
        "label": "Arquivos Anexados por Mês",
        "descricao": "Volume de arquivos anexados aos chamados",
        "categoria": "Arquivos Chamados",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_envio) as periodo,
                COUNT(*) as total
            FROM su_oss_chamado_arquivos
            WHERE data_envio IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "tipos_arquivo_chamado": {
        "label": "Tipos de Arquivo em Chamados",
        "descricao": "Distribuição por tipo de arquivo anexado",
        "categoria": "Arquivos Chamados",
        "query": """
            SELECT 
                tipo_arquivo,
                COUNT(*) as total
            FROM su_oss_chamado_arquivos
            WHERE tipo_arquivo IS NOT NULL
            GROUP BY tipo_arquivo
            ORDER BY total DESC
        """
    },
    
    "tamanho_medio_arquivos_chamados": {
        "label": "Tamanho Médio Arquivos Chamados",
        "descricao": "Tamanho médio em MB dos arquivos",
        "categoria": "Arquivos Chamados",
        "query": """
            SELECT 
                'Tamanho Médio (MB)' as categoria,
                AVG(tamanho / 1024.0 / 1024.0) as total
            FROM su_oss_chamado_arquivos
            WHERE tamanho > 0
        """
    },
    
    # ============================================
    # CATEGORIA 24: EVENTOS DO SISTEMA (3)
    # ============================================
    
    "eventos_por_tipo": {
        "label": "Eventos por Tipo",
        "descricao": "Distribuição de eventos do sistema",
        "categoria": "Eventos",
        "query": """
            SELECT 
                tipo_evento,
                COUNT(*) as total
            FROM su_oss_evento
            GROUP BY tipo_evento
            ORDER BY total DESC
        """
    },
    
    "eventos_por_mes": {
        "label": "Eventos por Mês",
        "descricao": "Volume de eventos registrados",
        "categoria": "Eventos",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_evento) as periodo,
                COUNT(*) as total
            FROM su_oss_evento
            WHERE data_evento IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "eventos_criticos": {
        "label": "Eventos Críticos",
        "descricao": "Eventos de alta severidade no sistema",
        "categoria": "Eventos",
        "query": """
            SELECT 
                'Críticos' as categoria,
                COUNT(*) as total
            FROM su_oss_evento
            WHERE severidade = 'Crítica'
        """
    },
    
    # ============================================
    # CATEGORIA 25: USUÁRIOS DO SISTEMA (8)
    # ============================================
    
    "usuarios_ativos": {
        "label": "Usuários Ativos",
        "descricao": "Quantidade de usuários ativos no sistema",
        "categoria": "Usuários",
        "query": """
            SELECT 
                'Ativos' as categoria,
                COUNT(*) as total
            FROM usuarios
            WHERE ativo = 'S'
        """
    },
    
    "usuarios_por_perfil": {
        "label": "Usuários por Perfil",
        "descricao": "Distribuição de usuários por tipo de perfil",
        "categoria": "Usuários",
        "query": """
            SELECT 
                tipo_perfil,
                COUNT(*) as total
            FROM usuarios
            WHERE ativo = 'S'
            GROUP BY tipo_perfil
            ORDER BY total DESC
        """
    },
    
    "usuarios_por_departamento": {
        "label": "Usuários por Departamento",
        "descricao": "Distribuição de usuários por departamento",
        "categoria": "Usuários",
        "query": """
            SELECT 
                departamento,
                COUNT(*) as total
            FROM usuarios
            WHERE ativo = 'S' AND departamento IS NOT NULL
            GROUP BY departamento
            ORDER BY total DESC
        """
    },
    
    "novos_usuarios_por_mes": {
        "label": "Novos Usuários por Mês",
        "descricao": "Crescimento da base de usuários",
        "categoria": "Usuários",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_cadastro) as periodo,
                COUNT(*) as total
            FROM usuarios
            WHERE data_cadastro IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "ultimo_acesso_usuarios": {
        "label": "Último Acesso dos Usuários",
        "descricao": "Distribuição de dias desde último acesso",
        "categoria": "Usuários",
        "query": """
            SELECT 
                CASE 
                    WHEN ultimo_acesso > NOW() - INTERVAL '1 day' THEN 'Último dia'
                    WHEN ultimo_acesso > NOW() - INTERVAL '7 days' THEN 'Última semana'
                    WHEN ultimo_acesso > NOW() - INTERVAL '30 days' THEN 'Último mês'
                    ELSE 'Mais de 30 dias'
                END as periodo,
                COUNT(*) as total
            FROM usuarios
            WHERE ultimo_acesso IS NOT NULL
            GROUP BY periodo
            ORDER BY 
                CASE periodo
                    WHEN 'Último dia' THEN 1
                    WHEN 'Última semana' THEN 2
                    WHEN 'Último mês' THEN 3
                    ELSE 4
                END
        """
    },
    
    "usuarios_com_permissoes_especiais": {
        "label": "Usuários com Permissões Especiais",
        "descricao": "Usuários com acesso administrativo",
        "categoria": "Usuários",
        "query": """
            SELECT 
                'Admin' as categoria,
                COUNT(*) as total
            FROM usuarios
            WHERE tipo_perfil IN ('Admin', 'Administrador', 'Root')
        """
    },
    
    "usuarios_por_filial": {
        "label": "Usuários por Filial",
        "descricao": "Distribuição de usuários por localização",
        "categoria": "Usuários",
        "query": """
            SELECT 
                id_filial::text as filial,
                COUNT(*) as total
            FROM usuarios
            WHERE ativo = 'S' AND id_filial IS NOT NULL
            GROUP BY id_filial
            ORDER BY total DESC
        """
    },
    
    "usuarios_bloqueados": {
        "label": "Usuários Bloqueados",
        "descricao": "Quantidade de usuários com acesso bloqueado",
        "categoria": "Usuários",
        "query": """
            SELECT 
                'Bloqueados' as categoria,
                COUNT(*) as total
            FROM usuarios
            WHERE bloqueado = 'S'
        """
    },
    
    # ============================================
    # ASSUNTOS ADICIONAIS - STATUS E ATIVAÇÃO
    # ============================================
    
    "distribuicao_status_ativo": {
        "label": "Distribuição por Status (Ativo/Inativo)",
        "descricao": "Quantidade de leads ativas vs inativas",
        "categoria": "Status",
        "query": """
            SELECT 
                CASE WHEN ativo = 'S' THEN 'Ativo' ELSE 'Inativo' END as status,
                COUNT(*) as total
            FROM lead
            GROUP BY ativo
        """
    },
    
    "distribuicao_status_internet": {
        "label": "Distribuição por Status Internet",
        "descricao": "Status de conexão de internet dos clientes",
        "categoria": "Status",
        "query": """
            SELECT 
                COALESCE(status_internet, 'Não Informado') as status_internet,
                COUNT(*) as total
            FROM lead
            GROUP BY status_internet
            ORDER BY total DESC
            LIMIT 20
        """
    },
    
    "cadastros_por_mes": {
        "label": "Cadastros por Mês",
        "descricao": "Quantidade de leads cadastradas por mês",
        "categoria": "Status",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_cadastro) as periodo,
                COUNT(*) as total
            FROM lead
            WHERE data_cadastro IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 24
        """
    },
    
    "atualizacoes_por_mes": {
        "label": "Atualizações por Mês",
        "descricao": "Quantidade de leads atualizadas por mês",
        "categoria": "Status",
        "query": """
            SELECT 
                DATE_TRUNC('month', ultima_atualizacao) as periodo,
                COUNT(*) as total
            FROM lead
            WHERE ultima_atualizacao IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 24
        """
    },
    
    "leads_bloqueio_automatico": {
        "label": "Leads com Bloqueio Automático",
        "descricao": "Leads configuradas com bloqueio automático",
        "categoria": "Status",
        "query": """
            SELECT 
                CASE WHEN bloqueio_automatico = 'S' THEN 'Com Bloqueio' ELSE 'Sem Bloqueio' END as bloqueio,
                COUNT(*) as total
            FROM lead
            WHERE bloqueio_automatico IS NOT NULL
            GROUP BY bloqueio_automatico
        """
    },
    
    "leads_aviso_atraso": {
        "label": "Leads com Aviso de Atraso",
        "descricao": "Leads configuradas para aviso de atraso",
        "categoria": "Status",
        "query": """
            SELECT 
                CASE WHEN aviso_atraso = 'S' THEN 'Com Aviso' ELSE 'Sem Aviso' END as aviso,
                COUNT(*) as total
            FROM lead
            WHERE aviso_atraso IS NOT NULL
            GROUP BY aviso_atraso
        """
    },
    
    "status_prospeccao": {
        "label": "Distribuição por Status de Prospecção",
        "descricao": "Status do processo de prospecção",
        "categoria": "Status",
        "query": """
            SELECT 
                COALESCE(status_prospeccao, 'Não Informado') as status_prospeccao,
                COUNT(*) as total
            FROM lead
            WHERE status_prospeccao IS NOT NULL
            GROUP BY status_prospeccao
            ORDER BY total DESC
            LIMIT 20
        """
    },
    
    "substatus_prospeccao": {
        "label": "Distribuição por Substatus de Prospecção",
        "descricao": "Substatus detalhado do processo de prospecção",
        "categoria": "Status",
        "query": """
            SELECT 
                COALESCE(CAST(substatus_prospeccao AS VARCHAR), 'Não Informado') as substatus,
                COUNT(*) as total
            FROM lead
            WHERE substatus_prospeccao IS NOT NULL
            GROUP BY substatus_prospeccao
            ORDER BY total DESC
            LIMIT 20
        """
    },
    
    "status_viabilidade": {
        "label": "Distribuição por Status de Viabilidade",
        "descricao": "Status de viabilidade técnica",
        "categoria": "Status",
        "query": """
            SELECT 
                COALESCE(status_viabilidade, 'Não Informado') as status_viabilidade,
                COUNT(*) as total
            FROM lead
            WHERE status_viabilidade IS NOT NULL
            GROUP BY status_viabilidade
            ORDER BY total DESC
        """
    },
    
    "leads_orgao_publico": {
        "label": "Leads - Órgão Público vs Privado",
        "descricao": "Distribuição entre órgãos públicos e entidades privadas",
        "categoria": "Status",
        "query": """
            SELECT 
                CASE WHEN orgao_publico = 'S' THEN 'Órgão Público' ELSE 'Privado' END as tipo,
                COUNT(*) as total
            FROM lead
            WHERE orgao_publico IS NOT NULL
            GROUP BY orgao_publico
        """
    },
    
    # ============================================
    # LOCALIZAÇÃO GEOGRÁFICA ADICIONAL
    # ============================================
    
    "distribuicao_por_cidade": {
        "label": "Distribuição por Cidade",
        "descricao": "Top 30 cidades com mais leads",
        "categoria": "Localização",
        "query": """
            SELECT 
                COALESCE(CAST(cidade AS VARCHAR), 'Não Informado') as cidade,
                COUNT(*) as total
            FROM lead
            WHERE cidade IS NOT NULL
            GROUP BY cidade
            ORDER BY total DESC
            LIMIT 30
        """
    },
    
    "distribuicao_por_uf": {
        "label": "Distribuição por UF (Estado)",
        "descricao": "Leads por estado",
        "categoria": "Localização",
        "query": """
            SELECT 
                COALESCE(CAST(uf AS VARCHAR), 'Não Informado') as uf,
                COUNT(*) as total
            FROM lead
            WHERE uf IS NOT NULL
            GROUP BY uf
            ORDER BY total DESC
        """
    },
    
    "distribuicao_por_bairro": {
        "label": "Distribuição por Bairro",
        "descricao": "Top 50 bairros com mais leads",
        "categoria": "Localização",
        "query": """
            SELECT 
                COALESCE(bairro, 'Não Informado') as bairro,
                COUNT(*) as total
            FROM lead
            WHERE bairro IS NOT NULL AND bairro != ''
            GROUP BY bairro
            ORDER BY total DESC
            LIMIT 50
        """
    },
    
    "leads_por_cep": {
        "label": "Distribuição de Leads por CEP",
        "descricao": "Top 30 CEPs com mais leads",
        "categoria": "Localização",
        "query": """
            SELECT 
                COALESCE(cep, 'Não Informado') as cep,
                COUNT(*) as total
            FROM lead
            WHERE cep IS NOT NULL AND cep != ''
            GROUP BY cep
            ORDER BY total DESC
            LIMIT 30
        """
    },
    
    "leads_com_endereco_completo": {
        "label": "Leads com Endereço Completo",
        "descricao": "Leads que possuem endereço, cidade e CEP preenchidos",
        "categoria": "Localização",
        "query": """
            SELECT 
                CASE 
                    WHEN endereco IS NOT NULL AND cidade IS NOT NULL AND cep IS NOT NULL 
                    THEN 'Completo' 
                    ELSE 'Incompleto' 
                END as status_endereco,
                COUNT(*) as total
            FROM lead
            GROUP BY status_endereco
        """
    },
    
    "leads_com_coordenadas": {
        "label": "Leads com Coordenadas GPS",
        "descricao": "Leads que possuem latitude e longitude",
        "categoria": "Localização",
        "query": """
            SELECT 
                CASE 
                    WHEN latitude IS NOT NULL AND longitude IS NOT NULL 
                    THEN 'Com Coordenadas' 
                    ELSE 'Sem Coordenadas' 
                END as status_gps,
                COUNT(*) as total
            FROM lead
            GROUP BY status_gps
        """
    },
    
    "distribuicao_por_tipo_localidade": {
        "label": "Distribuição por Tipo de Localidade",
        "descricao": "Tipo de localidade (urbana, rural, etc)",
        "categoria": "Localização",
        "query": """
            SELECT 
                COALESCE(tipo_localidade, 'Não Informado') as tipo_localidade,
                COUNT(*) as total
            FROM lead
            WHERE tipo_localidade IS NOT NULL
            GROUP BY tipo_localidade
            ORDER BY total DESC
        """
    },
    
    "leads_por_condominio": {
        "label": "Leads em Condomínios",
        "descricao": "Distribuição de leads por condomínio",
        "categoria": "Localização",
        "query": """
            SELECT 
                CASE 
                    WHEN id_condominio IS NOT NULL THEN 'Em Condomínio' 
                    ELSE 'Não Condomínio' 
                END as status_condominio,
                COUNT(*) as total
            FROM lead
            GROUP BY status_condominio
        """
    },
    
    # ============================================
    # DADOS PESSOAIS E DEMOGRÁFICOS ADICIONAIS
    # ============================================
    
    "distribuicao_tipo_pessoa": {
        "label": "Distribuição por Tipo de Pessoa",
        "descricao": "Pessoa Física vs Pessoa Jurídica",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                CASE tipo_pessoa
                    WHEN 'F' THEN 'Pessoa Física'
                    WHEN 'J' THEN 'Pessoa Jurídica'
                    ELSE 'Não Informado'
                END as tipo,
                COUNT(*) as total
            FROM lead
            GROUP BY tipo_pessoa
        """
    },
    
    "distribuicao_por_sexo": {
        "label": "Distribuição por Sexo",
        "descricao": "Distribuição de gênero das leads",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                CASE Sexo
                    WHEN 'M' THEN 'Masculino'
                    WHEN 'F' THEN 'Feminino'
                    ELSE 'Não Informado'
                END as sexo,
                COUNT(*) as total
            FROM lead
            WHERE Sexo IS NOT NULL
            GROUP BY Sexo
        """
    },
    
    "distribuicao_estado_civil": {
        "label": "Distribuição por Estado Civil",
        "descricao": "Estado civil das leads",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                COALESCE(estado_civil, 'Não Informado') as estado_civil,
                COUNT(*) as total
            FROM lead
            WHERE estado_civil IS NOT NULL
            GROUP BY estado_civil
            ORDER BY total DESC
        """
    },
    
    "faixa_etaria": {
        "label": "Distribuição por Faixa Etária",
        "descricao": "Idade das leads em faixas",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                CASE 
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, data_nascimento)) < 18 THEN 'Menor de 18'
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, data_nascimento)) BETWEEN 18 AND 25 THEN '18-25'
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, data_nascimento)) BETWEEN 26 AND 35 THEN '26-35'
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, data_nascimento)) BETWEEN 36 AND 45 THEN '36-45'
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, data_nascimento)) BETWEEN 46 AND 55 THEN '46-55'
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, data_nascimento)) BETWEEN 56 AND 65 THEN '56-65'
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, data_nascimento)) > 65 THEN 'Acima de 65'
                    ELSE 'Não Informado'
                END as faixa_etaria,
                COUNT(*) as total
            FROM lead
            GROUP BY faixa_etaria
            ORDER BY 
                CASE faixa_etaria
                    WHEN 'Menor de 18' THEN 1
                    WHEN '18-25' THEN 2
                    WHEN '26-35' THEN 3
                    WHEN '36-45' THEN 4
                    WHEN '46-55' THEN 5
                    WHEN '56-65' THEN 6
                    WHEN 'Acima de 65' THEN 7
                    ELSE 8
                END
        """
    },
    
    "distribuicao_nacionalidade": {
        "label": "Distribuição por Nacionalidade",
        "descricao": "Nacionalidade das leads",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                COALESCE(nacionalidade, 'Não Informado') as nacionalidade,
                COUNT(*) as total
            FROM lead
            WHERE nacionalidade IS NOT NULL
            GROUP BY nacionalidade
            ORDER BY total DESC
            LIMIT 20
        """
    },
    
    "distribuicao_profissao": {
        "label": "Distribuição por Profissão",
        "descricao": "Top 30 profissões",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                COALESCE(profissao, 'Não Informado') as profissao,
                COUNT(*) as total
            FROM lead
            WHERE profissao IS NOT NULL AND profissao != ''
            GROUP BY profissao
            ORDER BY total DESC
            LIMIT 30
        """
    },
    
    "leads_com_conjuge": {
        "label": "Leads com Dados de Cônjuge",
        "descricao": "Leads que possuem informações de cônjuge",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                CASE 
                    WHEN nome_conjuge IS NOT NULL AND nome_conjuge != '' 
                    THEN 'Com Cônjuge' 
                    ELSE 'Sem Cônjuge' 
                END as status_conjuge,
                COUNT(*) as total
            FROM lead
            GROUP BY status_conjuge
        """
    },
    
    "leads_com_dependentes": {
        "label": "Leads com Dependentes",
        "descricao": "Quantidade de dependentes",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                COALESCE(CAST(quantidade_dependentes AS VARCHAR), '0') as qtd_dependentes,
                COUNT(*) as total
            FROM lead
            WHERE quantidade_dependentes IS NOT NULL
            GROUP BY quantidade_dependentes
            ORDER BY quantidade_dependentes
        """
    },
    
    "tipo_moradia": {
        "label": "Distribuição por Tipo de Moradia",
        "descricao": "Tipo de moradia (própria, alugada, etc)",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                COALESCE(moradia, 'Não Informado') as moradia,
                COUNT(*) as total
            FROM lead
            WHERE moradia IS NOT NULL
            GROUP BY moradia
            ORDER BY total DESC
        """
    },
    
    "grau_satisfacao": {
        "label": "Grau de Satisfação",
        "descricao": "Distribuição do grau de satisfação dos clientes",
        "categoria": "Demográfico",
        "query": """
            SELECT 
                COALESCE(CAST(grau_satisfacao AS VARCHAR), 'Não Avaliado') as grau,
                COUNT(*) as total
            FROM lead
            WHERE grau_satisfacao IS NOT NULL
            GROUP BY grau_satisfacao
            ORDER BY grau_satisfacao DESC
        """
    },
    
    # ============================================
    # CONTATOS E COMUNICAÇÃO ADICIONAIS
    # ============================================
    
    "leads_com_email": {
        "label": "Leads com E-mail",
        "descricao": "Leads que possuem e-mail cadastrado",
        "categoria": "Contato",
        "query": """
            SELECT 
                CASE 
                    WHEN email IS NOT NULL AND email != '' 
                    THEN 'Com E-mail' 
                    ELSE 'Sem E-mail' 
                END as status_email,
                COUNT(*) as total
            FROM lead
            GROUP BY status_email
        """
    },
    
    "leads_com_telefone": {
        "label": "Leads com Telefone",
        "descricao": "Leads que possuem telefone cadastrado",
        "categoria": "Contato",
        "query": """
            SELECT 
                CASE 
                    WHEN fone IS NOT NULL AND fone != '' 
                    THEN 'Com Telefone' 
                    ELSE 'Sem Telefone' 
                END as status_telefone,
                COUNT(*) as total
            FROM lead
            GROUP BY status_telefone
        """
    },
    
    "leads_com_celular": {
        "label": "Leads com Celular",
        "descricao": "Leads que possuem celular cadastrado",
        "categoria": "Contato",
        "query": """
            SELECT 
                CASE 
                    WHEN telefone_celular IS NOT NULL AND telefone_celular != '' 
                    THEN 'Com Celular' 
                    ELSE 'Sem Celular' 
                END as status_celular,
                COUNT(*) as total
            FROM lead
            GROUP BY status_celular
        """
    },
    
    "leads_com_whatsapp": {
        "label": "Leads com WhatsApp",
        "descricao": "Leads que possuem WhatsApp cadastrado",
        "categoria": "Contato",
        "query": """
            SELECT 
                CASE 
                    WHEN whatsapp IS NOT NULL AND whatsapp != '' 
                    THEN 'Com WhatsApp' 
                    ELSE 'Sem WhatsApp' 
                END as status_whatsapp,
                COUNT(*) as total
            FROM lead
            GROUP BY status_whatsapp
        """
    },
    
    "distribuicao_operadora_celular": {
        "label": "Distribuição por Operadora de Celular",
        "descricao": "Operadoras de celular mais comuns",
        "categoria": "Contato",
        "query": """
            SELECT 
                COALESCE(CAST(id_operadora_celular AS VARCHAR), 'Não Informado') as operadora,
                COUNT(*) as total
            FROM lead
            WHERE id_operadora_celular IS NOT NULL
            GROUP BY id_operadora_celular
            ORDER BY total DESC
            LIMIT 10
        """
    },
    
    "leads_com_redes_sociais": {
        "label": "Leads com Redes Sociais",
        "descricao": "Leads que possuem Facebook, Instagram ou outras redes",
        "categoria": "Contato",
        "query": """
            SELECT 
                CASE 
                    WHEN facebook IS NOT NULL OR instagram IS NOT NULL 
                    THEN 'Com Redes Sociais' 
                    ELSE 'Sem Redes Sociais' 
                END as status_social,
                COUNT(*) as total
            FROM lead
            GROUP BY status_social
        """
    },
    
    "leads_com_website": {
        "label": "Leads com Website",
        "descricao": "Leads que possuem website cadastrado",
        "categoria": "Contato",
        "query": """
            SELECT 
                CASE 
                    WHEN website IS NOT NULL AND website != '' 
                    THEN 'Com Website' 
                    ELSE 'Sem Website' 
                END as status_website,
                COUNT(*) as total
            FROM lead
            GROUP BY status_website
        """
    },
    
    # ============================================
    # FINANCEIRO E PAGAMENTO ADICIONAIS
    # ============================================
    
    "distribuicao_dia_vencimento": {
        "label": "Distribuição por Dia de Vencimento",
        "descricao": "Dias do mês de vencimento mais comuns",
        "categoria": "Financeiro",
        "query": """
            SELECT 
                COALESCE(CAST(dia_vencimento AS VARCHAR), 'Não Definido') as dia,
                COUNT(*) as total
            FROM lead
            WHERE dia_vencimento IS NOT NULL
            GROUP BY dia_vencimento
            ORDER BY dia_vencimento
        """
    },
    
    "satisfacao_cliente": {
        "label": "Satisfação do Cliente",
        "descricao": "Distribuição de níveis de contentamento",
        "categoria": "Financeiro",
        "query": """
            SELECT 
                COALESCE(nivel_contentamento, 'Não Avaliado') as nivel_contentamento,
                COUNT(*) as total
            FROM lead
            WHERE nivel_contentamento IS NOT NULL
            GROUP BY nivel_contentamento
            ORDER BY 
                CASE nivel_contentamento
                    WHEN 'Excelente' THEN 1
                    WHEN 'Bom' THEN 2
                    WHEN 'Regular' THEN 3
                    WHEN 'Ruim' THEN 4
                    WHEN 'Pessimo' THEN 5
                    ELSE 6
                END
        """
    },
    
    "origem_leads": {
        "label": "Origem das Leads (Canais)",
        "descricao": "Leads por canal de comunicação",
        "categoria": "Financeiro",
        "query": """
            SELECT 
                COALESCE(origem, 'Não Informado') as origem,
                COUNT(*) as total
            FROM lead
            WHERE ativo = 'S'
            GROUP BY origem
            ORDER BY total DESC
        """
    },
    
    "status_financeiro": {
        "label": "Status Financeiro",
        "descricao": "Leads em dia vs em atraso",
        "categoria": "Financeiro",
        "query": """
            SELECT 
                CASE status_debito
                    WHEN 'EmDia' THEN 'Em Dia'
                    WHEN 'EmAtraso' THEN 'Em Atraso'
                    ELSE 'Não Informado'
                END as status_debito,
                COUNT(*) as total
            FROM lead
            WHERE ativo = 'S' AND status_debito IS NOT NULL
            GROUP BY status_debito
        """
    },
    
    "score_medio_periodo": {
        "label": "Score Médio por Período",
        "descricao": "Evolução do score médio das leads ao longo do tempo",
        "categoria": "Financeiro",
        "query": """
            SELECT 
                DATE_TRUNC('month', data_ultima_classificacao) as periodo,
                AVG(score) as score_medio,
                COUNT(*) as total_leads
            FROM lead
            WHERE data_ultima_classificacao IS NOT NULL
            GROUP BY periodo
            ORDER BY periodo DESC
            LIMIT 12
        """
    },
    
    "distribuicao_tabela_preco": {
        "label": "Distribuição por Tabela de Preço",
        "descricao": "Leads por tabela de preço",
        "categoria": "Financeiro",
        "query": """
            SELECT 
                COALESCE(CAST(tabela_preco AS VARCHAR), 'Não Definido') as tabela,
                COUNT(*) as total
            FROM lead
            WHERE tabela_preco IS NOT NULL
            GROUP BY tabela_preco
            ORDER BY total DESC
            LIMIT 15
        """
    },
    
    "distribuicao_tipo_cliente": {
        "label": "Distribuição por Tipo de Cliente",
        "descricao": "Classificação do tipo de cliente",
        "categoria": "Financeiro",
        "query": """
            SELECT 
                COALESCE(CAST(id_tipo_cliente AS VARCHAR), 'Não Definido') as tipo,
                COUNT(*) as total
            FROM lead
            WHERE id_tipo_cliente IS NOT NULL
            GROUP BY id_tipo_cliente
            ORDER BY total DESC
            LIMIT 15
        """
    },
    
    # ============================================
    # VENDAS E CONVERSÃO ADICIONAIS
    # ============================================
    
    "distribuicao_por_vendedor": {
        "label": "Distribuição por Vendedor",
        "descricao": "Top 30 vendedores com mais leads",
        "categoria": "Vendas",
        "query": """
            SELECT 
                COALESCE(CAST(id_vendedor AS VARCHAR), 'Sem Vendedor') as vendedor,
                COUNT(*) as total
            FROM lead
            WHERE id_vendedor IS NOT NULL
            GROUP BY id_vendedor
            ORDER BY total DESC
            LIMIT 30
        """
    },
    
    "distribuicao_canal_venda": {
        "label": "Distribuição por Canal de Venda",
        "descricao": "Canais de venda mais utilizados",
        "categoria": "Vendas",
        "query": """
            SELECT 
                COALESCE(CAST(id_canal_venda AS VARCHAR), 'Não Definido') as canal,
                COUNT(*) as total
            FROM lead
            WHERE id_canal_venda IS NOT NULL
            GROUP BY id_canal_venda
            ORDER BY total DESC
            LIMIT 15
        """
    },
    
    "distribuicao_filial": {
        "label": "Distribuição por Filial",
        "descricao": "Leads por filial de atendimento",
        "categoria": "Vendas",
        "query": """
            SELECT 
                COALESCE(CAST(filial_id AS VARCHAR), 'Sem Filial') as filial,
                COUNT(*) as total
            FROM lead
            WHERE filial_id IS NOT NULL
            GROUP BY filial_id
            ORDER BY total DESC
            LIMIT 20
        """
    },
    
    "distribuicao_campanha": {
        "label": "Distribuição por Campanha",
        "descricao": "Leads por campanha de marketing",
        "categoria": "Vendas",
        "query": """
            SELECT 
                COALESCE(CAST(id_campanha AS VARCHAR), 'Sem Campanha') as campanha,
                COUNT(*) as total
            FROM lead
            WHERE id_campanha IS NOT NULL
            GROUP BY id_campanha
            ORDER BY total DESC
            LIMIT 20
        """
    },
    
    "leads_indicadas": {
        "label": "Leads Indicadas por Outros",
        "descricao": "Leads que foram indicadas por outros clientes",
        "categoria": "Vendas",
        "query": """
            SELECT 
                CASE 
                    WHEN indicado_por IS NOT NULL 
                    THEN 'Indicado' 
                    ELSE 'Não Indicado' 
                END as status_indicacao,
                COUNT(*) as total
            FROM lead
            GROUP BY status_indicacao
        """
    },
    
    "conversao_viabilidade": {
        "label": "Taxa de Conversão por Viabilidade",
        "descricao": "Leads cadastradas via viabilidade que converteram",
        "categoria": "Vendas",
        "query": """
            SELECT 
                CASE cadastrado_via_viabilidade
                    WHEN 'S' THEN 'Via Viabilidade'
                    ELSE 'Direto'
                END as origem_cadastro,
                COUNT(*) as total
            FROM lead
            WHERE cadastrado_via_viabilidade IS NOT NULL
            GROUP BY cadastrado_via_viabilidade
        """
    },
    
    # ============================================
    # EMPREGO E RENDA
    # ============================================
    
    "distribuicao_remuneracao": {
        "label": "Distribuição por Faixa de Remuneração",
        "descricao": "Faixas salariais das leads",
        "categoria": "Emprego",
        "query": """
            SELECT 
                CASE 
                    WHEN emp_remuneracao IS NULL THEN 'Não Informado'
                    WHEN emp_remuneracao < 1500 THEN 'Até R$ 1.500'
                    WHEN emp_remuneracao < 3000 THEN 'R$ 1.500 - R$ 3.000'
                    WHEN emp_remuneracao < 5000 THEN 'R$ 3.000 - R$ 5.000'
                    WHEN emp_remuneracao < 10000 THEN 'R$ 5.000 - R$ 10.000'
                    ELSE 'Acima de R$ 10.000'
                END as faixa_salarial,
                COUNT(*) as total
            FROM lead
            GROUP BY faixa_salarial
            ORDER BY 
                CASE faixa_salarial
                    WHEN 'Até R$ 1.500' THEN 1
                    WHEN 'R$ 1.500 - R$ 3.000' THEN 2
                    WHEN 'R$ 3.000 - R$ 5.000' THEN 3
                    WHEN 'R$ 5.000 - R$ 10.000' THEN 4
                    WHEN 'Acima de R$ 10.000' THEN 5
                    ELSE 6
                END
        """
    },
    
    "leads_com_emprego": {
        "label": "Leads com Dados de Emprego",
        "descricao": "Leads que possuem informações de emprego",
        "categoria": "Emprego",
        "query": """
            SELECT 
                CASE 
                    WHEN emp_empresa IS NOT NULL AND emp_empresa != '' 
                    THEN 'Com Emprego' 
                    ELSE 'Sem Emprego' 
                END as status_emprego,
                COUNT(*) as total
            FROM lead
            GROUP BY status_emprego
        """
    },
    
    "distribuicao_por_cargo": {
        "label": "Distribuição por Cargo",
        "descricao": "Top 20 cargos mais comuns",
        "categoria": "Emprego",
        "query": """
            SELECT 
                COALESCE(emp_cargo, 'Não Informado') as cargo,
                COUNT(*) as total
            FROM lead
            WHERE emp_cargo IS NOT NULL AND emp_cargo != ''
            GROUP BY emp_cargo
            ORDER BY total DESC
            LIMIT 20
        """
    },
    
    # ============================================
    # SEGMENTAÇÃO E PERFIL
    # ============================================
    
    "distribuicao_por_segmento": {
        "label": "Distribuição por Segmento",
        "descricao": "Segmentação de mercado das leads",
        "categoria": "Segmentação",
        "query": """
            SELECT 
                COALESCE(CAST(id_segmento AS VARCHAR), 'Não Segmentado') as segmento,
                COUNT(*) as total
            FROM lead
            WHERE id_segmento IS NOT NULL
            GROUP BY id_segmento
            ORDER BY total DESC
            LIMIT 15
        """
    },
    
    "distribuicao_por_perfil": {
        "label": "Distribuição por Perfil",
        "descricao": "Perfis de cliente",
        "categoria": "Segmentação",
        "query": """
            SELECT 
                COALESCE(CAST(id_perfil AS VARCHAR), 'Sem Perfil') as perfil,
                COUNT(*) as total
            FROM lead
            WHERE id_perfil IS NOT NULL
            GROUP BY id_perfil
            ORDER BY total DESC
            LIMIT 15
        """
    },
    
    "distribuicao_por_concorrente": {
        "label": "Distribuição por Concorrente Anterior",
        "descricao": "De qual concorrente a lead veio",
        "categoria": "Segmentação",
        "query": """
            SELECT 
                COALESCE(CAST(id_concorrente AS VARCHAR), 'Não Informado') as concorrente,
                COUNT(*) as total
            FROM lead
            WHERE id_concorrente IS NOT NULL
            GROUP BY id_concorrente
            ORDER BY total DESC
            LIMIT 15
        """
    },
    
    # ============================================
    # TECNOLOGIA E CONECTIVIDADE
    # ============================================
    
    "analise_calc_velocidade_pessoas": {
        "label": "Quantidade de Pessoas (Cálculo Velocidade)",
        "descricao": "Distribuição de pessoas que usam internet",
        "categoria": "Tecnologia",
        "query": """
            SELECT 
                COALESCE(CAST(qtd_pessoas_calc_vel AS VARCHAR), 'Não Informado') as qtd_pessoas,
                COUNT(*) as total
            FROM lead
            WHERE qtd_pessoas_calc_vel IS NOT NULL
            GROUP BY qtd_pessoas_calc_vel
            ORDER BY qtd_pessoas_calc_vel
            LIMIT 10
        """
    },
    
    "analise_calc_velocidade_smartphones": {
        "label": "Quantidade de Smartphones (Cálculo Velocidade)",
        "descricao": "Distribuição de smartphones por lead",
        "categoria": "Tecnologia",
        "query": """
            SELECT 
                COALESCE(CAST(qtd_smart_calc_vel AS VARCHAR), 'Não Informado') as qtd_smartphones,
                COUNT(*) as total
            FROM lead
            WHERE qtd_smart_calc_vel IS NOT NULL
            GROUP BY qtd_smart_calc_vel
            ORDER BY qtd_smart_calc_vel
            LIMIT 10
        """
    },
    
    "analise_calc_velocidade_celulares": {
        "label": "Quantidade de Celulares (Cálculo Velocidade)",
        "descricao": "Distribuição de celulares por lead",
        "categoria": "Tecnologia",
        "query": """
            SELECT 
                COALESCE(CAST(qtd_celular_calc_vel AS VARCHAR), 'Não Informado') as qtd_celulares,
                COUNT(*) as total
            FROM lead
            WHERE qtd_celular_calc_vel IS NOT NULL
            GROUP BY qtd_celular_calc_vel
            ORDER BY qtd_celular_calc_vel
            LIMIT 10
        """
    },
    
    "analise_calc_velocidade_computadores": {
        "label": "Quantidade de Computadores (Cálculo Velocidade)",
        "descricao": "Distribuição de computadores por lead",
        "categoria": "Tecnologia",
        "query": """
            SELECT 
                COALESCE(CAST(qtd_computador_calc_vel AS VARCHAR), 'Não Informado') as qtd_computadores,
                COUNT(*) as total
            FROM lead
            WHERE qtd_computador_calc_vel IS NOT NULL
            GROUP BY qtd_computador_calc_vel
            ORDER BY qtd_computador_calc_vel
            LIMIT 10
        """
    },
    
    "analise_calc_velocidade_consoles": {
        "label": "Quantidade de Consoles (Cálculo Velocidade)",
        "descricao": "Distribuição de consoles de videogame por lead",
        "categoria": "Tecnologia",
        "query": """
            SELECT 
                COALESCE(CAST(qtd_console_calc_vel AS VARCHAR), 'Não Informado') as qtd_consoles,
                COUNT(*) as total
            FROM lead
            WHERE qtd_console_calc_vel IS NOT NULL
            GROUP BY qtd_console_calc_vel
            ORDER BY qtd_console_calc_vel
            LIMIT 10
        """
    },
    
    "resultado_calc_velocidade": {
        "label": "Resultado do Cálculo de Velocidade",
        "descricao": "Velocidade de internet recomendada",
        "categoria": "Tecnologia",
        "query": """
            SELECT 
                COALESCE(resultado_calc_vel, 'Não Calculado') as velocidade_recomendada,
                COUNT(*) as total
            FROM lead
            WHERE resultado_calc_vel IS NOT NULL
            GROUP BY resultado_calc_vel
            ORDER BY total DESC
            LIMIT 15
        """
    },
    
    "distribuicao_tipo_rede": {
        "label": "Distribuição por Tipo de Rede",
        "descricao": "Tipo de rede de internet (fibra, rádio, etc)",
        "categoria": "Tecnologia",
        "query": """
            SELECT 
                COALESCE(tipo_rede, 'Não Informado') as tipo_rede,
                COUNT(*) as total
            FROM lead
            WHERE tipo_rede IS NOT NULL
            GROUP BY tipo_rede
            ORDER BY total DESC
        """
    },
    
    "distribuicao_rede_ativacao": {
        "label": "Distribuição por Rede de Ativação",
        "descricao": "Rede utilizada na ativação",
        "categoria": "Tecnologia",
        "query": """
            SELECT 
                COALESCE(rede_ativacao, 'Não Informado') as rede,
                COUNT(*) as total
            FROM lead
            WHERE rede_ativacao IS NOT NULL
            GROUP BY rede_ativacao
            ORDER BY total DESC
        """
    },
    
    # ============================================
    # INTEGRAÇÕES E SISTEMAS EXTERNOS
    # ============================================
    
    "leads_com_integracao_pipe": {
        "label": "Leads Integradas com Pipedrive",
        "descricao": "Leads que possuem ID de organização no Pipedrive",
        "categoria": "Integrações",
        "query": """
            SELECT 
                CASE 
                    WHEN pipe_id_organizacao IS NOT NULL 
                    THEN 'Integrado Pipedrive' 
                    ELSE 'Não Integrado' 
                END as status_pipe,
                COUNT(*) as total
            FROM lead
            GROUP BY status_pipe
        """
    },
    
    "leads_com_myauth": {
        "label": "Leads com MyAuth",
        "descricao": "Leads que possuem integração MyAuth",
        "categoria": "Integrações",
        "query": """
            SELECT 
                CASE 
                    WHEN id_myauth IS NOT NULL 
                    THEN 'Com MyAuth' 
                    ELSE 'Sem MyAuth' 
                END as status_myauth,
                COUNT(*) as total
            FROM lead
            GROUP BY status_myauth
        """
    },
    
    "leads_com_vindi": {
        "label": "Leads com Vindi",
        "descricao": "Leads integradas com sistema Vindi",
        "categoria": "Integrações",
        "query": """
            SELECT 
                CASE 
                    WHEN id_vindi IS NOT NULL 
                    THEN 'Com Vindi' 
                    ELSE 'Sem Vindi' 
                END as status_vindi,
                COUNT(*) as total
            FROM lead
            GROUP BY status_vindi
        """
    },
    
    "leads_com_external_system": {
        "label": "Leads com Sistema Externo",
        "descricao": "Leads integradas com sistemas externos",
        "categoria": "Integrações",
        "query": """
            SELECT 
                COALESCE(external_system, 'Nenhum') as sistema_externo,
                COUNT(*) as total
            FROM lead
            WHERE external_system IS NOT NULL
            GROUP BY external_system
            ORDER BY total DESC
        """
    },
    
    # ============================================
    # ANÁLISES TEMPORAIS
    # ============================================
    
    "leads_cadastradas_ultimos_7_dias": {
        "label": "Leads Cadastradas - Últimos 7 Dias",
        "descricao": "Leads cadastradas nos últimos 7 dias",
        "categoria": "Temporal",
        "query": """
            SELECT 
                DATE(data_cadastro) as data,
                COUNT(*) as total
            FROM lead
            WHERE data_cadastro >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY data
            ORDER BY data DESC
        """
    },
    
    "leads_atualizadas_ultimos_7_dias": {
        "label": "Leads Atualizadas - Últimos 7 Dias",
        "descricao": "Leads atualizadas nos últimos 7 dias",
        "categoria": "Temporal",
        "query": """
            SELECT 
                DATE(ultima_atualizacao) as data,
                COUNT(*) as total
            FROM lead
            WHERE ultima_atualizacao >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY data
            ORDER BY data DESC
        """
    },
    
    "aniversariantes_mes_atual": {
        "label": "Aniversariantes do Mês Atual",
        "descricao": "Leads que fazem aniversário no mês atual",
        "categoria": "Temporal",
        "query": """
            SELECT 
                EXTRACT(DAY FROM data_nascimento) as dia,
                COUNT(*) as total
            FROM lead
            WHERE EXTRACT(MONTH FROM data_nascimento) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND data_nascimento IS NOT NULL
            GROUP BY dia
            ORDER BY dia
        """
    },
    
    "leads_por_dia_da_semana": {
        "label": "Cadastros por Dia da Semana",
        "descricao": "Qual dia da semana tem mais cadastros",
        "categoria": "Temporal",
        "query": """
            SELECT 
                CASE EXTRACT(DOW FROM data_cadastro)
                    WHEN 0 THEN 'Domingo'
                    WHEN 1 THEN 'Segunda'
                    WHEN 2 THEN 'Terça'
                    WHEN 3 THEN 'Quarta'
                    WHEN 4 THEN 'Quinta'
                    WHEN 5 THEN 'Sexta'
                    WHEN 6 THEN 'Sábado'
                END as dia_semana,
                COUNT(*) as total
            FROM lead
            WHERE data_cadastro IS NOT NULL
            GROUP BY EXTRACT(DOW FROM data_cadastro)
            ORDER BY EXTRACT(DOW FROM data_cadastro)
        """
    },
    
    "tempo_medio_desde_cadastro": {
        "label": "Tempo Médio Desde o Cadastro",
        "descricao": "Quantos dias em média as leads estão cadastradas",
        "categoria": "Temporal",
        "query": """
            SELECT 
                CASE 
                    WHEN EXTRACT(DAY FROM AGE(CURRENT_DATE, data_cadastro)) < 30 THEN 'Menos de 1 mês'
                    WHEN EXTRACT(DAY FROM AGE(CURRENT_DATE, data_cadastro)) < 90 THEN '1-3 meses'
                    WHEN EXTRACT(DAY FROM AGE(CURRENT_DATE, data_cadastro)) < 180 THEN '3-6 meses'
                    WHEN EXTRACT(DAY FROM AGE(CURRENT_DATE, data_cadastro)) < 365 THEN '6-12 meses'
                    ELSE 'Mais de 1 ano'
                END as tempo_cadastro,
                COUNT(*) as total
            FROM lead
            WHERE data_cadastro IS NOT NULL
            GROUP BY tempo_cadastro
            ORDER BY 
                CASE tempo_cadastro
                    WHEN 'Menos de 1 mês' THEN 1
                    WHEN '1-3 meses' THEN 2
                    WHEN '3-6 meses' THEN 3
                    WHEN '6-12 meses' THEN 4
                    WHEN 'Mais de 1 ano' THEN 5
                END
        """
    },
    
    "proximo_contato_prospeccao": {
        "label": "Próximo Contato de Prospecção",
        "descricao": "Leads com contato de prospecção agendado",
        "categoria": "Temporal",
        "query": """
            SELECT 
                DATE(prospeccao_proximo_contato) as data_contato,
                COUNT(*) as total
            FROM lead
            WHERE prospeccao_proximo_contato >= CURRENT_DATE
            AND prospeccao_proximo_contato <= CURRENT_DATE + INTERVAL '30 days'
            GROUP BY data_contato
            ORDER BY data_contato
        """
    },
    
    # ============================================
    # QUALIDADE DE DADOS
    # ============================================
    
    "completude_dados_basicos": {
        "label": "Completude de Dados Básicos",
        "descricao": "Leads com todos os dados básicos preenchidos",
        "categoria": "Qualidade",
        "query": """
            SELECT 
                CASE 
                    WHEN razao IS NOT NULL AND cnpj_cpf IS NOT NULL 
                         AND email IS NOT NULL AND fone IS NOT NULL 
                    THEN 'Completo' 
                    ELSE 'Incompleto' 
                END as completude,
                COUNT(*) as total
            FROM lead
            GROUP BY completude
        """
    },
    
    "completude_dados_contato": {
        "label": "Completude de Dados de Contato",
        "descricao": "Leads com todos os contatos preenchidos",
        "categoria": "Qualidade",
        "query": """
            SELECT 
                CASE 
                    WHEN email IS NOT NULL AND fone IS NOT NULL 
                         AND telefone_celular IS NOT NULL 
                    THEN 'Completo' 
                    ELSE 'Incompleto' 
                END as completude_contato,
                COUNT(*) as total
            FROM lead
            GROUP BY completude_contato
        """
    },
    
    "completude_dados_endereco": {
        "label": "Completude de Dados de Endereço",
        "descricao": "Leads com endereço completo",
        "categoria": "Qualidade",
        "query": """
            SELECT 
                CASE 
                    WHEN endereco IS NOT NULL AND cidade IS NOT NULL 
                         AND uf IS NOT NULL AND cep IS NOT NULL 
                    THEN 'Completo' 
                    ELSE 'Incompleto' 
                END as completude_endereco,
                COUNT(*) as total
            FROM lead
            GROUP BY completude_endereco
        """
    },
    
    "leads_sem_email": {
        "label": "Leads sem E-mail",
        "descricao": "Leads que precisam ter e-mail cadastrado",
        "categoria": "Qualidade",
        "query": """
            SELECT 
                'Sem E-mail' as status,
                COUNT(*) as total
            FROM lead
            WHERE email IS NULL OR email = ''
        """
    },
    
    "leads_sem_telefone": {
        "label": "Leads sem Telefone",
        "descricao": "Leads que precisam ter telefone cadastrado",
        "categoria": "Qualidade",
        "query": """
            SELECT 
                'Sem Telefone' as status,
                COUNT(*) as total
            FROM lead
            WHERE (fone IS NULL OR fone = '') 
            AND (telefone_celular IS NULL OR telefone_celular = '')
        """
    },
    
    "leads_sem_endereco": {
        "label": "Leads sem Endereço",
        "descricao": "Leads que precisam ter endereço cadastrado",
        "categoria": "Qualidade",
        "query": """
            SELECT 
                'Sem Endereço' as status,
                COUNT(*) as total
            FROM lead
            WHERE endereco IS NULL OR endereco = ''
        """
    },
    
    # ============================================
    # ANÁLISES CUSTOMIZADAS
    # ============================================
    
    "leads_com_observacoes": {
        "label": "Leads com Observações",
        "descricao": "Leads que possuem campo de observações preenchido",
        "categoria": "Customizado",
        "query": """
            SELECT 
                CASE 
                    WHEN obs IS NOT NULL AND obs != '' 
                    THEN 'Com Observações' 
                    ELSE 'Sem Observações' 
                END as status_obs,
                COUNT(*) as total
            FROM lead
            GROUP BY status_obs
        """
    },
    
    "leads_com_alerta": {
        "label": "Leads com Alerta",
        "descricao": "Leads que possuem algum alerta cadastrado",
        "categoria": "Customizado",
        "query": """
            SELECT 
                CASE 
                    WHEN alerta IS NOT NULL AND alerta != '' 
                    THEN 'Com Alerta' 
                    ELSE 'Sem Alerta' 
                END as status_alerta,
                COUNT(*) as total
            FROM lead
            GROUP BY status_alerta
        """
    },
    
    "leads_com_referencia": {
        "label": "Leads com Referência",
        "descricao": "Leads que possuem referência cadastrada",
        "categoria": "Customizado",
        "query": """
            SELECT 
                CASE 
                    WHEN referencia IS NOT NULL AND referencia != '' 
                    THEN 'Com Referência' 
                    ELSE 'Sem Referência' 
                END as status_referencia,
                COUNT(*) as total
            FROM lead
            GROUP BY status_referencia
        """
    },
    
    "leads_com_complemento": {
        "label": "Leads com Complemento de Endereço",
        "descricao": "Leads que possuem complemento cadastrado",
        "categoria": "Customizado",
        "query": """
            SELECT 
                CASE 
                    WHEN complemento IS NOT NULL AND complemento != '' 
                    THEN 'Com Complemento' 
                    ELSE 'Sem Complemento' 
                END as status_complemento,
                COUNT(*) as total
            FROM lead
            GROUP BY status_complemento
        """
    },
    
    "score_distribution": {
        "label": "Distribuição de Score",
        "descricao": "Faixas de score das leads",
        "categoria": "Customizado",
        "query": """
            SELECT 
                CASE 
                    WHEN score = 0 THEN 'Score 0'
                    WHEN score BETWEEN 1 AND 20 THEN '1-20'
                    WHEN score BETWEEN 21 AND 40 THEN '21-40'
                    WHEN score BETWEEN 41 AND 60 THEN '41-60'
                    WHEN score BETWEEN 61 AND 80 THEN '61-80'
                    WHEN score BETWEEN 81 AND 100 THEN '81-100'
                    ELSE 'Acima de 100'
                END as faixa_score,
                COUNT(*) as total
            FROM lead
            GROUP BY faixa_score
            ORDER BY 
                CASE faixa_score
                    WHEN 'Score 0' THEN 1
                    WHEN '1-20' THEN 2
                    WHEN '21-40' THEN 3
                    WHEN '41-60' THEN 4
                    WHEN '61-80' THEN 5
                    WHEN '81-100' THEN 6
                    ELSE 7
                END
        """
    },
}

# Total: 245 assuntos organizados em 28 categorias
# Cobrindo todas as 240+ colunas da tabela lead
# Cada assunto pode ser combinado com outros em gráficos personalizados
# Cada assunto pode ser combinado com outros em gráficos personalizados


# ============================================
# CLASSE MODELO: GRÁFICO
# ============================================

class Grafico:
    """Modelo para gráficos personalizados do dashboard"""
    
    def __init__(self, id=None, titulo="", descricao="", tipo_grafico="bar", 
                 assuntos=None, configuracoes=None, ativo=True):
        self.id = id
        self.titulo = titulo
        self.descricao = descricao
        self.tipo_grafico = tipo_grafico
        self.assuntos = assuntos or []
        self.configuracoes = configuracoes or {}
        self.ativo = ativo
    
    def to_dict(self):
        """Converte para dicionário"""
        return {
            "id": self.id,
            "titulo": self.titulo,
            "descricao": self.descricao,
            "tipo_grafico": self.tipo_grafico,
            "assuntos": self.assuntos,
            "configuracoes": self.configuracoes,
            "ativo": self.ativo
        }
    
    def save(self):
        """Salva gráfico no banco de dados"""
        conn = get_db_connection()
        cur = conn.cursor()
        
        if self.id:
            # Atualizar gráfico existente
            cur.execute("""
                UPDATE dashboard_graficos 
                SET titulo = %s, descricao = %s, tipo_grafico = %s, 
                    assuntos = %s, configuracoes = %s, 
                    data_atualizacao = NOW(), ativo = %s
                WHERE id = %s
                RETURNING id
            """, (
                self.titulo, self.descricao, self.tipo_grafico,
                json.dumps(self.assuntos), json.dumps(self.configuracoes),
                self.ativo, self.id
            ))
        else:
            # Criar novo gráfico
            cur.execute("""
                INSERT INTO dashboard_graficos 
                (titulo, descricao, tipo_grafico, assuntos, configuracoes, ativo)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                self.titulo, self.descricao, self.tipo_grafico,
                json.dumps(self.assuntos), json.dumps(self.configuracoes),
                self.ativo
            ))
        
        self.id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return self.id
    
    @staticmethod
    def find_by_id(grafico_id):
        """Busca gráfico por ID"""
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cur.execute("""
            SELECT * FROM dashboard_graficos WHERE id = %s
        """, (grafico_id,))
        
        row = cur.fetchone()
        cur.close()
        conn.close()
        
        if row:
            return Grafico(
                id=row['id'],
                titulo=row['titulo'],
                descricao=row['descricao'],
                tipo_grafico=row['tipo_grafico'],
                assuntos=row['assuntos'],
                configuracoes=row['configuracoes'],
                ativo=row['ativo']
            )
        return None
    
    @staticmethod
    def find_all(ativo=True):
        """Busca todos os gráficos"""
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        if ativo is not None:
            cur.execute("""
                SELECT * FROM dashboard_graficos 
                WHERE ativo = %s
                ORDER BY data_criacao DESC
            """, (ativo,))
        else:
            cur.execute("""
                SELECT * FROM dashboard_graficos 
                ORDER BY data_criacao DESC
            """)
        
        rows = cur.fetchall()
        cur.close()
        conn.close()
        
        graficos = []
        for row in rows:
            graficos.append(Grafico(
                id=row['id'],
                titulo=row['titulo'],
                descricao=row['descricao'],
                tipo_grafico=row['tipo_grafico'],
                assuntos=row['assuntos'],
                configuracoes=row['configuracoes'],
                ativo=row['ativo']
            ))
        
        return graficos
    
    def delete(self):
        """Remove gráfico (soft delete)"""
        self.ativo = False
        self.save()
    
    def get_dados(self):
        """
        Busca dados de todos os assuntos do gráfico e retorna no formato Chart.js
        """
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        datasets = []
        labels_set = set()
        
        for assunto_key in self.assuntos:
            if assunto_key not in ASSUNTOS_DISPONIVEIS:
                continue
            
            assunto = ASSUNTOS_DISPONIVEIS[assunto_key]
            query = assunto['query']
            
            cur.execute(query)
            rows = cur.fetchall()
            
            # Processar dados
            labels = []
            data = []
            
            for row in rows:
                # Detectar campo de label (primeiro campo não numérico)
                label_key = None
                data_key = None
                
                for key in row.keys():
                    if label_key is None and isinstance(row[key], (str, datetime)):
                        label_key = key
                    elif data_key is None and isinstance(row[key], (int, float)):
                        data_key = key
                
                if label_key and data_key:
                    label_value = row[label_key]
                    if isinstance(label_value, datetime):
                        label_value = label_value.strftime('%Y-%m')
                    
                    labels.append(str(label_value))
                    labels_set.add(str(label_value))
                    data.append(float(row[data_key]))
            
            # Adicionar dataset
            datasets.append({
                "label": assunto['label'],
                "data": data,
                "labels": labels,  # Labels específicos deste dataset
            })
        
        cur.close()
        conn.close()
        
        # Unificar labels de todos os datasets
        all_labels = sorted(list(labels_set))
        
        return {
            "labels": all_labels,
            "datasets": datasets,
            "tipo_grafico": self.tipo_grafico,
            "titulo": self.titulo,
            "descricao": self.descricao
        }


# ============================================
# FUNÇÕES AUXILIARES
# ============================================

def get_assuntos_disponiveis(categoria=None):
    """
    Retorna lista de assuntos disponíveis para seleção
    Args:
        categoria: Filtrar por categoria (opcional)
    """
    assuntos = {}
    
    for key, value in ASSUNTOS_DISPONIVEIS.items():
        # Filtrar por categoria se especificado
        if categoria and value.get("categoria") != categoria:
            continue
        
        assuntos[key] = {
            "label": value["label"],
            "descricao": value["descricao"],
            "categoria": value.get("categoria", "Geral")
        }
    
    return assuntos


def get_categorias_disponiveis():
    """Retorna lista de categorias disponíveis"""
    categorias = set()
    
    for value in ASSUNTOS_DISPONIVEIS.values():
        categoria = value.get("categoria", "Geral")
        categorias.add(categoria)
    
    # Retornar ordenado
    return sorted(list(categorias))


def get_dados_assunto(assunto_key):
    """
    Busca dados de um assunto específico
    Retorna no formato Chart.js ready
    """
    if assunto_key not in ASSUNTOS_DISPONIVEIS:
        return {"error": "Assunto não encontrado"}
    
    assunto = ASSUNTOS_DISPONIVEIS[assunto_key]
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    cur.execute(assunto['query'])
    rows = cur.fetchall()
    
    cur.close()
    conn.close()
    
    # Processar dados para Chart.js
    labels = []
    data = []
    
    for row in rows:
        # Detectar campo de label e data
        label_key = None
        data_key = None
        
        for key in row.keys():
            if label_key is None and isinstance(row[key], (str, datetime)):
                label_key = key
            elif data_key is None and isinstance(row[key], (int, float)):
                data_key = key
        
        if label_key and data_key:
            label_value = row[label_key]
            if isinstance(label_value, datetime):
                label_value = label_value.strftime('%Y-%m')
            
            labels.append(str(label_value))
            data.append(float(row[data_key]))
    
    return {
        "label": assunto['label'],
        "descricao": assunto['descricao'],
        "labels": labels,
        "data": data
    }


def get_estatisticas_gerais():
    """
    Retorna estatísticas gerais para os 12 cards principais do dashboard
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    stats = {}
    
    # 1. Total de Leads
    cur.execute("SELECT COUNT(*) as total FROM lead WHERE ativo = 'S'")
    stats['total_leads'] = cur.fetchone()['total']
    
    # 2. Leads por Departamento
    cur.execute("""
        SELECT departamento, COUNT(*) as total 
        FROM lead 
        WHERE ativo = 'S' 
        GROUP BY departamento
    """)
    stats['por_departamento'] = {row['departamento']: row['total'] for row in cur.fetchall()}
    
    # 3. Leads Prioritárias (Queimando + MuitoQuente)
    cur.execute("""
        SELECT COUNT(*) as total 
        FROM lead 
        WHERE prioridade IN ('Queimando', 'MuitoQuente') 
        AND ativo = 'S'
    """)
    stats['leads_prioritarias'] = cur.fetchone()['total']
    
    # 4. Score Médio
    cur.execute("SELECT AVG(score) as media FROM lead WHERE ativo = 'S'")
    stats['score_medio'] = round(cur.fetchone()['media'] or 0, 2)
    
    # 5-12. Dados dos assuntos principais
    for key in ['perdas_clientes_fidelizados', 'perdas_leads_ruins', 'leads_recuperadas', 
                'leads_queimando_perdidas', 'distribuicao_prioridade', 'taxa_conversao_vendas',
                'satisfacao_cliente', 'origem_leads']:
        stats[key] = get_dados_assunto(key)
    
    cur.close()
    conn.close()
    
    return stats


# ============================================
# INICIALIZAÇÃO
# ============================================

if __name__ == "__main__":
    # Criar tabelas na primeira execução
    print("🔧 Criando tabelas do dashboard...")
    create_dashboard_tables()
    print("✅ Sistema de dashboard inicializado!")
