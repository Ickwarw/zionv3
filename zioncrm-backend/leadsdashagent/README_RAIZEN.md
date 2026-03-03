# 🤖 Raizen - Assistente Virtual de Marketing e Estratégia IA

![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)
![License MIT](https://img.shields.io/badge/license-MIT-green.svg)

Assistente de IA especializado em análise de marketing, estratégia comercial, recuperação e captação de clientes com integração completa aos principais provedores de IA do mercado.

## 🎯 Características Principais

- **Integração Multi-Provider**: OpenAI (ChatGPT), Google (Gemini), Anthropic (Claude)
- **27 Modelos OpenAI**: Desde GPT-3.5 até GPT-4o e série O
- **14 Modelos Google**: Incluindo Gemini 2.0, 1.5 Pro/Flash com tier gratuito
- **9 Modelos Anthropic**: Claude 3.5, 3.0 e 2.x
- **Especializado em Marketing**: Análises, estratégias, dashboards e previsões
- **Rastreamento de Custos**: Controle completo de tokens e gastos
- **Histórico de Conversas**: Salvamento e carregamento de contexto

## 📂 Arquivos do Projeto

```
raizen.py                      # Classe principal do assistente
raizen_config.json             # Configuração de modelos e prompts
raizen_interface_config.json   # Configuração para interface frontend
raizen_exemplo_uso.py          # Exemplos práticos de uso
README_RAIZEN.md              # Esta documentação
```

## 🚀 Instalação

### Dependências

```bash
pip install requests
```

### Configuração de API Keys

Configure suas chaves de API como variáveis de ambiente:

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY = "sua-chave-openai"
$env:GOOGLE_API_KEY = "sua-chave-google"
$env:ANTHROPIC_API_KEY = "sua-chave-anthropic"
```

**Linux/Mac:**
```bash
export OPENAI_API_KEY="sua-chave-openai"
export GOOGLE_API_KEY="sua-chave-google"
export ANTHROPIC_API_KEY="sua-chave-anthropic"
```

**Para tornar permanente (Windows):**
```bash
setx OPENAI_API_KEY "sua-chave-openai"
setx GOOGLE_API_KEY "sua-chave-google"
setx ANTHROPIC_API_KEY "sua-chave-anthropic"
```

## 💡 Uso Básico

### Inicialização

```python
from raizen import RaizenAssistant

# Inicializar o assistente
raizen = RaizenAssistant('raizen_config.json')
```

### Consulta Simples

```python
resposta = raizen.chat(
    message="Quais são as principais tendências de marketing digital?",
    provider='openai',
    model_id='gpt-4o-mini',
    prompt_type='analise_marketing'
)

print(resposta['resposta'])
print(f"Custo: ${resposta['custo_usd']:.6f}")
```

### Listar Modelos Disponíveis

```python
# Todos os modelos
todos_modelos = raizen.get_available_models()

# Apenas OpenAI
openai_models = raizen.get_available_models('openai')

# Apenas gratuitos
modelos_free = raizen.get_available_models(include_paid=False)
```

## 🎯 Funcionalidades Especializadas

### 1. Análise de Marketing

```python
dados_campanha = {
    "campanha": "Email Marketing Q1",
    "envios": 10000,
    "aberturas": 2500,
    "cliques": 500,
    "conversoes": 50,
    "receita": 15000
}

analise = raizen.analyze_marketing_data(
    dados=dados_campanha,
    provider='google',
    model_id='gemini-1.5-flash'
)
```

### 2. Análise de Churn

```python
dados_clientes = [
    {
        "cliente_id": "C001",
        "dias_desde_ultima_compra": 90,
        "valor_total_compras": 15000,
        "reclamacoes": 2
    },
    # ... mais clientes
]

analise_churn = raizen.analyze_customer_churn(
    dados_clientes=dados_clientes,
    provider='anthropic',
    model_id='claude-3-5-haiku-20241022'
)
```

### 3. Estratégia de Captação

```python
perfil_target = {
    "segmento": "B2B",
    "setor": "Tecnologia",
    "tamanho_empresa": "50-200 funcionários"
}

estrategia = raizen.create_acquisition_strategy(
    perfil_target=perfil_target,
    orcamento=50000.00,
    provider='openai',
    model_id='gpt-4o'
)
```

### 4. Identificação de Falhas

```python
dados_processo = {
    "processo": "Funil de Vendas",
    "etapas": [
        {"etapa": "Lead Generation", "leads": 1000, "taxa_conversao": "50%"},
        {"etapa": "Qualificação", "leads": 500, "taxa_conversao": "40%"}
    ]
}

falhas = raizen.identify_process_failures(
    dados_processo=dados_processo,
    provider='anthropic',
    model_id='claude-3-5-sonnet-20241022'
)
```

### 5. Previsão de Vendas

```python
historico_vendas = [
    {"mes": "2025-01", "vendas": 150000},
    {"mes": "2025-02", "vendas": 145000},
    # ... mais meses
]

previsao = raizen.predict_sales(
    historico_vendas=historico_vendas,
    periodo_previsao=3,
    provider='google',
    model_id='gemini-1.5-pro'
)
```

### 6. Insights para Dashboard

```python
dados_dashboard = {
    "vendas_totais": 650000,
    "meta_vendas": 600000,
    "nps": 72,
    "taxa_retencao": "84%"
}

insights = raizen.create_dashboard_insights(
    dados=dados_dashboard,
    tipo_dashboard='vendas',
    provider='openai',
    model_id='gpt-4o'
)
```

## 📊 Modelos Disponíveis

### OpenAI (27 modelos)
- **GPT-4o Series**: Últimos modelos multimodais
- **GPT-4 Turbo**: Performance otimizada
- **GPT-4 Classic**: Contexto 8K/32K
- **GPT-3.5 Turbo**: Econômico
- **O Series**: Raciocínio avançado

### Google Gemini (14 modelos)
- **Gratuitos**: Gemini 1.5 Flash, Flash-8B, 1.0 Pro
- **Gemini 2.0**: Experimental
- **Gemini 1.5 Pro**: Contexto até 2M tokens
- **Com visão**: Pro Vision

### Anthropic Claude (9 modelos)
- **Claude 3.5**: Sonnet e Haiku
- **Claude 3**: Opus, Sonnet, Haiku
- **Claude 2**: 2.1 e 2.0
- **Claude Instant**: Rápido

## 💰 Controle de Custos

### Visualizar Métricas

```python
metricas = raizen.get_metrics()
print(f"Total de requests: {metricas['metricas']['total_requests']}")
print(f"Total de tokens: {metricas['metricas']['total_tokens']}")
print(f"Custo total: ${metricas['metricas']['total_cost']:.6f}")
```

### Resetar Métricas

```python
raizen.reset_metrics()
```

## 💾 Gerenciamento de Conversas

### Salvar Conversa

```python
raizen.save_conversation('minha_conversa.json')
```

### Carregar Conversa

```python
raizen.load_conversation('minha_conversa.json')
```

### Limpar Histórico

```python
resposta = raizen.chat(
    message="Nova conversa",
    provider='openai',
    model_id='gpt-4o-mini',
    reset_history=True  # Limpa o histórico
)
```

## ⚙️ Configurações Avançadas

### Temperatura e Max Tokens

```python
resposta = raizen.chat(
    message="Seja criativo",
    provider='openai',
    model_id='gpt-4o-mini',
    temperature=1.2,  # Mais criativo (0.0 - 2.0)
    max_tokens=4000   # Resposta mais longa
)
```

### Tipos de Prompt

- `analise_marketing`: Análise de dados de marketing
- `estrategia_comercial`: Estratégias comerciais
- `recuperacao_clientes`: Retenção e churn
- `captacao_clientes`: Aquisição de clientes
- `analise_falhas`: Identificação de problemas
- `dashboard_previsoes`: Dashboards e previsões

## 📋 Exemplos Práticos

Execute o arquivo de exemplos:

```bash
python raizen_exemplo_uso.py
```

O menu interativo oferece:
1. Exemplo Básico
2. Análise de Marketing
3. Análise de Churn
4. Estratégia de Captação
5. Identificação de Falhas
6. Previsão de Vendas
7. Dashboard e Insights
8. Métricas de Uso
9. Comparação de Modelos

## 🔧 Estrutura do Projeto

### Classe RaizenAssistant

Principais métodos:

- `chat()`: Conversa básica com o assistente
- `analyze_marketing_data()`: Análise de dados de marketing
- `analyze_customer_churn()`: Análise de risco de churn
- `create_acquisition_strategy()`: Estratégia de aquisição
- `identify_process_failures()`: Identificação de falhas
- `create_dashboard_insights()`: Insights para dashboards
- `predict_sales()`: Previsão de vendas
- `get_available_models()`: Lista modelos disponíveis
- `get_metrics()`: Métricas de uso
- `save_conversation()`: Salva histórico
- `load_conversation()`: Carrega histórico

## 🎨 Interface Frontend

O arquivo `raizen_interface_config.json` contém:

- Estrutura de interface para seleção de modelos
- Agrupamento de modelos por categoria
- Filtros disponíveis
- Exemplos de uso
- Mensagens do sistema
- Configurações de UI

Use este arquivo para construir sua interface frontend.

## 📊 Categorias de Custo

### Econômico
- GPT-4o Mini, GPT-3.5 Turbo
- Gemini Flash, Flash-8B
- Claude Haiku

### Balanceado
- GPT-4o, GPT-4 Turbo
- Gemini Pro
- Claude Sonnet

### Premium
- GPT-4, GPT-4 32K
- O1 Preview
- Claude Opus

## 🔒 Segurança

- Nunca commite API Keys no código
- Use variáveis de ambiente
- Implemente rate limiting em produção
- Monitore custos regularmente

## 🐛 Troubleshooting

### Erro: "API Key não encontrada"
```python
# Verifique se as variáveis de ambiente estão configuradas
import os
print(os.getenv('OPENAI_API_KEY'))  # Deve mostrar sua chave
```

### Erro: "Timeout na requisição"
```python
# Aumente o timeout no raizen_config.json
"timeout_segundos": 120  # Padrão: 60
```

### Erro: "Rate limit exceeded"
```python
# Configure retry_attempts no raizen_config.json
"retry_attempts": 5  # Padrão: 3
```

## 📈 Próximos Passos

1. Configure suas API Keys
2. Execute `raizen_exemplo_uso.py` para testar
3. Adapte os prompts para seu caso de uso
4. Implemente a interface frontend usando `raizen_interface_config.json`
5. Integre com seu sistema existente

## 📄 Licença

MIT License - Sinta-se livre para usar e modificar.

## 🤝 Contribuições

Melhorias e sugestões são bem-vindas!

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação
2. Execute os exemplos práticos
3. Consulte os comentários no código

---

**Raizen** - Seu assistente especializado em Marketing e Estratégia 🚀
