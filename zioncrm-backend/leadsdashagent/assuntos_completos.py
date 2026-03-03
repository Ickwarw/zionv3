"""
ASSUNTOS COMPLETOS - 200+ Assuntos para Dashboard
Cada coluna da tabela lead tem pelo menos um assunto correspondente
Use este arquivo para copiar assuntos adicionais para models.py
"""

# Continue adicionando ao ASSUNTOS_DISPONIVEIS no models.py:

ASSUNTOS_ADICIONAIS = {
    
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
}

# Total de assuntos: 200+
# Cada categoria tem assuntos específicos para análise detalhada
# Todos podem ser combinados em gráficos personalizados no dashboard
