# 🚀 RAIZEN - GUIA RÁPIDO DE INÍCIO

## ⚡ Início Rápido (5 minutos)

### 1. Configure as API Keys

```bash
# Execute o assistente de configuração
python raizen_setup_config.py
```

Ou configure manualmente:

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

### 2. Instale as Dependências

```bash
pip install requests
```

### 3. Execute os Exemplos

```bash
python raizen_exemplo_uso.py
```

### 4. Use no Seu Código

```python
from raizen import RaizenAssistant

raizen = RaizenAssistant('raizen_config.json')

resposta = raizen.chat(
    message="Analise as tendências de marketing digital",
    provider='openai',
    model_id='gpt-4o-mini'
)

print(resposta['resposta'])
```

---

## 🎯 Casos de Uso Comuns

### Análise de Campanha

```python
dados = {
    "envios": 10000,
    "aberturas": 2500,
    "cliques": 500,
    "conversoes": 50
}

analise = raizen.analyze_marketing_data(dados, 'google', 'gemini-1.5-flash')
```

### Previsão de Vendas

```python
historico = [
    {"mes": "2025-01", "vendas": 150000},
    {"mes": "2025-02", "vendas": 160000}
]

previsao = raizen.predict_sales(historico, 3, 'openai', 'gpt-4o')
```

### Análise de Churn

```python
clientes = [
    {"id": "C001", "dias_sem_compra": 90, "reclamacoes": 2}
]

churn = raizen.analyze_customer_churn(clientes, 'anthropic', 'claude-3-5-haiku-20241022')
```

---

## 🤖 Modelos Recomendados

### Econômico (Baixo Custo)
- `gpt-4o-mini` (OpenAI)
- `gemini-1.5-flash` (Google - GRATUITO)
- `claude-3-5-haiku-20241022` (Anthropic)

### Balanceado (Custo-Benefício)
- `gpt-4o` (OpenAI)
- `gemini-1.5-pro` (Google)
- `claude-3-5-sonnet-20241022` (Anthropic)

### Premium (Máxima Qualidade)
- `gpt-4-turbo` (OpenAI)
- `o1-preview` (OpenAI - Raciocínio)
- `claude-3-opus-20240229` (Anthropic)

---

## 🎨 Tipos de Análise

- `analise_marketing`: Campanhas e métricas
- `estrategia_comercial`: Planejamento estratégico
- `recuperacao_clientes`: Retenção e churn
- `captacao_clientes`: Aquisição
- `analise_falhas`: Identificação de problemas
- `dashboard_previsoes`: Dashboards e previsões

---

## 💰 Controle de Custos

```python
# Ver métricas
metricas = raizen.get_metrics()
print(f"Custo total: ${metricas['metricas']['total_cost']:.2f}")

# Resetar métricas
raizen.reset_metrics()
```

---

## 📊 Modelos Gratuitos (Google)

Use sem custos:
- `gemini-1.5-flash` (15 RPM, 1M tokens/dia)
- `gemini-1.5-flash-8b` (15 RPM, 4M tokens/dia)
- `gemini-1.0-pro` (15 RPM)

---

## 🔧 Configurações Avançadas

```python
resposta = raizen.chat(
    message="Sua pergunta",
    provider='openai',
    model_id='gpt-4o',
    temperature=0.7,      # Criatividade (0.0-2.0)
    max_tokens=2000,      # Tamanho da resposta
    reset_history=False   # Manter contexto
)
```

---

## 💾 Salvar/Carregar Conversas

```python
# Salvar
raizen.save_conversation('conversa.json')

# Carregar
raizen.load_conversation('conversa.json')
```

---

## 📚 Arquivos do Projeto

- `raizen.py` - Classe principal
- `raizen_config.json` - Configuração de modelos
- `raizen_interface_config.json` - Config de interface
- `raizen_exemplo_uso.py` - Exemplos práticos
- `raizen_setup_config.py` - Assistente de configuração
- `README_RAIZEN.md` - Documentação completa

---

## ❓ Onde Obter API Keys

- **OpenAI**: https://platform.openai.com/api-keys
- **Google**: https://makersuite.google.com/app/apikey
- **Anthropic**: https://console.anthropic.com/account/keys

---

## 🆘 Problemas Comuns

### "API Key não encontrada"
Configure as variáveis de ambiente ou execute `raizen_setup_config.py`

### "Rate limit exceeded"
Use modelos gratuitos do Google ou aguarde alguns minutos

### "Timeout"
Aumente `timeout_segundos` no `raizen_config.json`

---

## ✅ Checklist de Início

- [ ] API Keys configuradas
- [ ] `requests` instalado
- [ ] `raizen_config.json` presente
- [ ] Executou `raizen_exemplo_uso.py`
- [ ] Primeiro chat funcionando

---

## 🎓 Próximos Passos

1. ✅ Configure as API Keys
2. ✅ Execute os exemplos
3. ✅ Teste com seus dados
4. ✅ Implemente na sua aplicação
5. ✅ Construa a interface frontend

---

**Raizen pronto para uso! 🚀**

Dúvidas? Consulte [README_RAIZEN.md](README_RAIZEN.md)
