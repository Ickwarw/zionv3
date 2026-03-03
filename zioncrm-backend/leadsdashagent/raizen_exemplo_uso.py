"""
Exemplo de Uso do Assistente Raizen
Demonstra as principais funcionalidades do assistente
"""

import json
from raizen import RaizenAssistant

# ============================================
# CONFIGURAÇÃO INICIAL
# ============================================

# Antes de executar, configure suas API Keys nas variáveis de ambiente:
# Windows:
#   setx OPENAI_API_KEY "sua-chave-aqui"
#   setx GOOGLE_API_KEY "sua-chave-aqui"
#   setx ANTHROPIC_API_KEY "sua-chave-aqui"
#
# Linux/Mac:
#   export OPENAI_API_KEY="sua-chave-aqui"
#   export GOOGLE_API_KEY="sua-chave-aqui"
#   export ANTHROPIC_API_KEY="sua-chave-aqui"

# ============================================
# INICIALIZAÇÃO DO ASSISTENTE
# ============================================

def exemplo_basico():
    """Exemplo básico de uso do Raizen"""
    print("=" * 60)
    print("EXEMPLO 1: Uso Básico")
    print("=" * 60)
    
    # Inicializa o assistente
    raizen = RaizenAssistant('raizen_config.json')
    
    # Lista modelos disponíveis
    print("\nModelos OpenAI disponíveis:")
    modelos = raizen.get_available_models('openai')
    for i, modelo in enumerate(modelos[:5], 1):
        print(f"{i}. {modelo['nome']} - ${modelo.get('preco_input', 0)}/1M tokens input")
    
    # Faz uma consulta simples
    resposta = raizen.chat(
        message="Quais são as principais tendências de marketing digital para 2026?",
        provider='openai',
        model_id='gpt-4o-mini',
        prompt_type='analise_marketing'
    )
    
    print(f"\nProvider: {resposta['provider']}")
    print(f"Modelo: {resposta['model_nome']}")
    print(f"Resposta: {resposta['resposta'][:200]}...")
    print(f"Tokens usados: {resposta['tokens']['total']}")
    print(f"Custo: ${resposta['custo_usd']:.6f}")


def exemplo_analise_marketing():
    """Exemplo de análise de dados de marketing"""
    print("\n" + "=" * 60)
    print("EXEMPLO 2: Análise de Marketing")
    print("=" * 60)
    
    raizen = RaizenAssistant('raizen_config.json')
    
    # Dados fictícios de uma campanha
    dados_campanha = {
        "campanha": "Email Marketing - Black Friday 2025",
        "periodo": "01/11/2025 - 30/11/2025",
        "investimento": 5000.00,
        "metricas": {
            "emails_enviados": 50000,
            "taxa_abertura": 25.5,
            "taxa_clique": 5.2,
            "conversoes": 250,
            "receita_gerada": 75000.00,
            "ticket_medio": 300.00
        },
        "canais": {
            "email": {"investimento": 2000, "conversoes": 150, "receita": 45000},
            "social_media": {"investimento": 2000, "conversoes": 70, "receita": 21000},
            "google_ads": {"investimento": 1000, "conversoes": 30, "receita": 9000}
        }
    }
    
    # Análise com Gemini (gratuito)
    resposta = raizen.analyze_marketing_data(
        dados=dados_campanha,
        provider='google',
        model_id='gemini-1.5-flash'
    )
    
    print(f"\nAnálise da Campanha:")
    print(f"Modelo: {resposta['model_nome']}")
    print(f"\n{resposta['resposta']}")
    print(f"\nCusto da consulta: ${resposta['custo_usd']:.6f}")


def exemplo_analise_churn():
    """Exemplo de análise de risco de churn"""
    print("\n" + "=" * 60)
    print("EXEMPLO 3: Análise de Churn")
    print("=" * 60)
    
    raizen = RaizenAssistant('raizen_config.json')
    
    # Dados fictícios de clientes
    dados_clientes = [
        {
            "cliente_id": "C001",
            "nome": "Empresa Alpha",
            "dias_desde_ultima_compra": 90,
            "valor_total_compras": 15000,
            "numero_compras": 3,
            "ticket_medio": 5000,
            "abriu_ultimos_emails": False,
            "respondeu_pesquisa": False,
            "reclamacoes": 2
        },
        {
            "cliente_id": "C002",
            "nome": "Empresa Beta",
            "dias_desde_ultima_compra": 15,
            "valor_total_compras": 50000,
            "numero_compras": 10,
            "ticket_medio": 5000,
            "abriu_ultimos_emails": True,
            "respondeu_pesquisa": True,
            "reclamacoes": 0
        },
        {
            "cliente_id": "C003",
            "nome": "Empresa Gamma",
            "dias_desde_ultima_compra": 120,
            "valor_total_compras": 8000,
            "numero_compras": 2,
            "ticket_medio": 4000,
            "abriu_ultimos_emails": False,
            "respondeu_pesquisa": False,
            "reclamacoes": 3
        }
    ]
    
    # Análise com Claude
    resposta = raizen.analyze_customer_churn(
        dados_clientes=dados_clientes,
        provider='anthropic',
        model_id='claude-3-5-haiku-20241022'
    )
    
    print(f"\nAnálise de Risco de Churn:")
    print(f"Modelo: {resposta['model_nome']}")
    print(f"\n{resposta['resposta']}")
    print(f"\nCusto da consulta: ${resposta['custo_usd']:.6f}")


def exemplo_estrategia_captacao():
    """Exemplo de criação de estratégia de captação"""
    print("\n" + "=" * 60)
    print("EXEMPLO 4: Estratégia de Captação")
    print("=" * 60)
    
    raizen = RaizenAssistant('raizen_config.json')
    
    # Perfil do público-alvo
    perfil_target = {
        "segmento": "B2B",
        "setor": "Tecnologia e Software",
        "tamanho_empresa": "50-200 funcionários",
        "cargo_decisor": ["CTO", "Gerente de TI", "CEO"],
        "dor_principal": "Dificuldade em gerenciar múltiplos sistemas",
        "localizacao": "Brasil (SP, RJ, MG)",
        "faturamento_medio": "R$ 5-50 milhões/ano"
    }
    
    orcamento = 50000.00
    
    # Estratégia com GPT-4o
    resposta = raizen.create_acquisition_strategy(
        perfil_target=perfil_target,
        orcamento=orcamento,
        provider='openai',
        model_id='gpt-4o'
    )
    
    print(f"\nEstratégia de Captação:")
    print(f"Modelo: {resposta['model_nome']}")
    print(f"\n{resposta['resposta']}")
    print(f"\nCusto da consulta: ${resposta['custo_usd']:.6f}")


def exemplo_analise_falhas():
    """Exemplo de identificação de falhas em processos"""
    print("\n" + "=" * 60)
    print("EXEMPLO 5: Identificação de Falhas")
    print("=" * 60)
    
    raizen = RaizenAssistant('raizen_config.json')
    
    # Dados do processo comercial
    dados_processo = {
        "processo": "Funil de Vendas B2B",
        "etapas": [
            {
                "etapa": "Lead Generation",
                "leads": 1000,
                "tempo_medio_dias": 1,
                "taxa_conversao": "50%",
                "problemas": "Muitos leads não qualificados"
            },
            {
                "etapa": "Qualificação",
                "leads": 500,
                "tempo_medio_dias": 3,
                "taxa_conversao": "40%",
                "problemas": "Demora na resposta da equipe"
            },
            {
                "etapa": "Proposta",
                "leads": 200,
                "tempo_medio_dias": 7,
                "taxa_conversao": "30%",
                "problemas": "Propostas genéricas, falta personalização"
            },
            {
                "etapa": "Negociação",
                "leads": 60,
                "tempo_medio_dias": 10,
                "taxa_conversao": "50%",
                "problemas": "Processo decisório longo do cliente"
            },
            {
                "etapa": "Fechamento",
                "leads": 30,
                "tempo_medio_dias": 5,
                "taxa_conversao": "100%",
                "problemas": "Burocracia interna para aprovação"
            }
        ],
        "metricas_gerais": {
            "ciclo_venda_medio": 26,
            "taxa_conversao_geral": "3%",
            "ticket_medio": 50000
        }
    }
    
    # Análise com Claude
    resposta = raizen.identify_process_failures(
        dados_processo=dados_processo,
        provider='anthropic',
        model_id='claude-3-5-sonnet-20241022'
    )
    
    print(f"\nAnálise de Falhas no Processo:")
    print(f"Modelo: {resposta['model_nome']}")
    print(f"\n{resposta['resposta']}")
    print(f"\nCusto da consulta: ${resposta['custo_usd']:.6f}")


def exemplo_previsao_vendas():
    """Exemplo de previsão de vendas"""
    print("\n" + "=" * 60)
    print("EXEMPLO 6: Previsão de Vendas")
    print("=" * 60)
    
    raizen = RaizenAssistant('raizen_config.json')
    
    # Histórico de vendas (12 meses)
    historico_vendas = [
        {"mes": "2025-01", "vendas": 150000, "clientes": 30, "ticket_medio": 5000},
        {"mes": "2025-02", "vendas": 145000, "clientes": 29, "ticket_medio": 5000},
        {"mes": "2025-03", "vendas": 160000, "clientes": 32, "ticket_medio": 5000},
        {"mes": "2025-04", "vendas": 155000, "clientes": 31, "ticket_medio": 5000},
        {"mes": "2025-05", "vendas": 170000, "clientes": 34, "ticket_medio": 5000},
        {"mes": "2025-06", "vendas": 165000, "clientes": 33, "ticket_medio": 5000},
        {"mes": "2025-07", "vendas": 140000, "clientes": 28, "ticket_medio": 5000},
        {"mes": "2025-08", "vendas": 135000, "clientes": 27, "ticket_medio": 5000},
        {"mes": "2025-09", "vendas": 175000, "clientes": 35, "ticket_medio": 5000},
        {"mes": "2025-10", "vendas": 180000, "clientes": 36, "ticket_medio": 5000},
        {"mes": "2025-11", "vendas": 220000, "clientes": 44, "ticket_medio": 5000},
        {"mes": "2025-12", "vendas": 250000, "clientes": 50, "ticket_medio": 5000}
    ]
    
    # Previsão com Gemini Pro
    resposta = raizen.predict_sales(
        historico_vendas=historico_vendas,
        periodo_previsao=3,
        provider='google',
        model_id='gemini-1.5-pro'
    )
    
    print(f"\nPrevisão de Vendas:")
    print(f"Modelo: {resposta['model_nome']}")
    print(f"\n{resposta['resposta']}")
    print(f"\nCusto da consulta: ${resposta['custo_usd']:.6f}")


def exemplo_dashboard():
    """Exemplo de criação de insights para dashboard"""
    print("\n" + "=" * 60)
    print("EXEMPLO 7: Dashboard e Insights")
    print("=" * 60)
    
    raizen = RaizenAssistant('raizen_config.json')
    
    # Dados para o dashboard
    dados_dashboard = {
        "periodo": "Q4 2025",
        "vendas_totais": 650000,
        "meta_vendas": 600000,
        "crescimento": "+15%",
        "novos_clientes": 45,
        "clientes_perdidos": 8,
        "taxa_retencao": "84%",
        "nps": 72,
        "vendas_por_produto": {
            "Produto A": 250000,
            "Produto B": 200000,
            "Produto C": 150000,
            "Produto D": 50000
        },
        "vendas_por_regiao": {
            "Sudeste": 350000,
            "Sul": 150000,
            "Nordeste": 100000,
            "Centro-Oeste": 50000
        },
        "funil_conversao": {
            "visitantes": 50000,
            "leads": 5000,
            "oportunidades": 500,
            "propostas": 150,
            "fechamentos": 45
        }
    }
    
    # Insights com GPT-4o
    resposta = raizen.create_dashboard_insights(
        dados=dados_dashboard,
        tipo_dashboard='vendas',
        provider='openai',
        model_id='gpt-4o'
    )
    
    print(f"\nInsights para Dashboard:")
    print(f"Modelo: {resposta['model_nome']}")
    print(f"\n{resposta['resposta']}")
    print(f"\nCusto da consulta: ${resposta['custo_usd']:.6f}")


def exemplo_metricas():
    """Exemplo de visualização de métricas"""
    print("\n" + "=" * 60)
    print("EXEMPLO 8: Métricas de Uso")
    print("=" * 60)
    
    raizen = RaizenAssistant('raizen_config.json')
    
    # Faz algumas consultas
    raizen.chat("Teste 1", 'openai', 'gpt-4o-mini', reset_history=True)
    raizen.chat("Teste 2", 'google', 'gemini-1.5-flash', reset_history=True)
    
    # Obtém métricas
    metricas = raizen.get_metrics()
    
    print("\nMétricas de Uso do Raizen:")
    print(json.dumps(metricas, indent=2, ensure_ascii=False))
    
    # Salva conversação
    raizen.save_conversation('raizen_conversation.json')
    print("\nConversação salva em 'raizen_conversation.json'")


def exemplo_comparacao_modelos():
    """Exemplo de comparação entre diferentes modelos"""
    print("\n" + "=" * 60)
    print("EXEMPLO 9: Comparação de Modelos")
    print("=" * 60)
    
    raizen = RaizenAssistant('raizen_config.json')
    
    prompt = "Liste 3 estratégias inovadoras para aumentar engajamento em mídias sociais"
    
    modelos_testar = [
        ('openai', 'gpt-4o-mini'),
        ('google', 'gemini-1.5-flash'),
        ('anthropic', 'claude-3-5-haiku-20241022')
    ]
    
    resultados = []
    
    for provider, model_id in modelos_testar:
        resposta = raizen.chat(
            message=prompt,
            provider=provider,
            model_id=model_id,
            reset_history=True
        )
        
        resultados.append({
            'modelo': resposta['model_nome'],
            'tokens': resposta['tokens']['total'],
            'custo': resposta['custo_usd'],
            'resposta_preview': resposta['resposta'][:150] + "..."
        })
    
    print("\nComparação de Respostas:")
    for i, resultado in enumerate(resultados, 1):
        print(f"\n{i}. {resultado['modelo']}")
        print(f"   Tokens: {resultado['tokens']}")
        print(f"   Custo: ${resultado['custo']:.6f}")
        print(f"   Preview: {resultado['resposta_preview']}")


def menu_principal():
    """Menu interativo de exemplos"""
    while True:
        print("\n" + "=" * 60)
        print("RAIZEN - EXEMPLOS DE USO")
        print("=" * 60)
        print("\n1. Exemplo Básico")
        print("2. Análise de Marketing")
        print("3. Análise de Churn")
        print("4. Estratégia de Captação")
        print("5. Identificação de Falhas")
        print("6. Previsão de Vendas")
        print("7. Dashboard e Insights")
        print("8. Métricas de Uso")
        print("9. Comparação de Modelos")
        print("10. Executar Todos")
        print("0. Sair")
        
        escolha = input("\nEscolha uma opção: ").strip()
        
        try:
            if escolha == '1':
                exemplo_basico()
            elif escolha == '2':
                exemplo_analise_marketing()
            elif escolha == '3':
                exemplo_analise_churn()
            elif escolha == '4':
                exemplo_estrategia_captacao()
            elif escolha == '5':
                exemplo_analise_falhas()
            elif escolha == '6':
                exemplo_previsao_vendas()
            elif escolha == '7':
                exemplo_dashboard()
            elif escolha == '8':
                exemplo_metricas()
            elif escolha == '9':
                exemplo_comparacao_modelos()
            elif escolha == '10':
                exemplo_basico()
                exemplo_analise_marketing()
                exemplo_analise_churn()
                exemplo_estrategia_captacao()
                exemplo_analise_falhas()
                exemplo_previsao_vendas()
                exemplo_dashboard()
                exemplo_metricas()
                exemplo_comparacao_modelos()
            elif escolha == '0':
                print("\nObrigado por usar o Raizen!")
                break
            else:
                print("\nOpção inválida!")
        except Exception as e:
            print(f"\nErro ao executar exemplo: {e}")
            print("Certifique-se de ter configurado as API Keys corretamente.")


if __name__ == '__main__':
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║                    RAIZEN ASSISTANT                       ║
    ║         Assistente de Marketing e Estratégia IA          ║
    ║                                                           ║
    ║  Integração com: OpenAI | Google Gemini | Anthropic     ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    
    ATENÇÃO: Antes de executar os exemplos, configure suas API Keys:
    
    Windows (PowerShell):
      $env:OPENAI_API_KEY = "sua-chave-aqui"
      $env:GOOGLE_API_KEY = "sua-chave-aqui"
      $env:ANTHROPIC_API_KEY = "sua-chave-aqui"
    
    Linux/Mac:
      export OPENAI_API_KEY="sua-chave-aqui"
      export GOOGLE_API_KEY="sua-chave-aqui"
      export ANTHROPIC_API_KEY="sua-chave-aqui"
    """)
    
    input("\nPressione Enter para continuar...")
    menu_principal()
