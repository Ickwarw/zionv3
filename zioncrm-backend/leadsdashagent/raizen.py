"""
Raizen - Assistente Virtual de Marketing e Estratégia Comercial
Integração com OpenAI (ChatGPT), Google (Gemini) e Anthropic (Claude)
"""

import json
import os
import requests
import time
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import logging

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('Raizen')


class RaizenAssistant:
    """
    Assistente Virtual Raizen - Especializado em Marketing e Estratégia Comercial
    """
    
    def __init__(self, config_file: str = 'raizen_config.json'):
        """
        Inicializa o assistente Raizen
        
        Args:
            config_file: Caminho para o arquivo de configuração JSON
        """
        self.config = self._load_config(config_file)
        self.conversation_history = []
        self.metrics = {
            'total_requests': 0,
            'total_tokens': 0,
            'total_cost': 0.0,
            'requests_by_provider': {},
            'requests_by_model': {}
        }
        
        # Chaves de API (devem ser configuradas nas variáveis de ambiente)
        self.api_keys = {
            'openai': os.getenv('OPENAI_API_KEY', ''),
            'google': os.getenv('GOOGLE_API_KEY', ''),
            'anthropic': os.getenv('ANTHROPIC_API_KEY', '')
        }
        
        logger.info("Raizen Assistant inicializado com sucesso")
    
    def _load_config(self, config_file: str) -> Dict:
        """Carrega arquivo de configuração JSON"""
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.error(f"Arquivo de configuração não encontrado: {config_file}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"Erro ao decodificar JSON: {e}")
            raise
    
    def get_available_models(self, provider: Optional[str] = None, 
                           include_free: bool = True, 
                           include_paid: bool = True) -> List[Dict]:
        """
        Retorna lista de modelos disponíveis
        
        Args:
            provider: Filtrar por provider ('openai', 'google', 'anthropic')
            include_free: Incluir modelos gratuitos
            include_paid: Incluir modelos pagos
            
        Returns:
            Lista de modelos disponíveis
        """
        models = []
        modelos_ia = self.config['modelos_ia']
        
        providers = [provider] if provider else ['openai', 'google', 'anthropic']
        
        for prov in providers:
            if prov in modelos_ia:
                provider_data = modelos_ia[prov]
                
                if include_free and 'modelos_gratuitos' in provider_data:
                    for model in provider_data['modelos_gratuitos']:
                        model['provider'] = prov
                        model['tipo'] = 'gratuito'
                        models.append(model)
                
                if include_paid and 'modelos_pagos' in provider_data:
                    for model in provider_data['modelos_pagos']:
                        model['provider'] = prov
                        model['tipo'] = 'pago'
                        models.append(model)
        
        return models
    
    def _prepare_openai_request(self, model: str, messages: List[Dict], 
                                temperature: float, max_tokens: int) -> Dict:
        """Prepara requisição para API da OpenAI"""
        headers = {
            'Authorization': f'Bearer {self.api_keys["openai"]}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': model,
            'messages': messages,
            'temperature': temperature,
            'max_tokens': max_tokens
        }
        
        return {
            'url': 'https://api.openai.com/v1/chat/completions',
            'headers': headers,
            'payload': payload
        }
    
    def _prepare_google_request(self, model: str, messages: List[Dict], 
                               temperature: float, max_tokens: int) -> Dict:
        """Prepara requisição para API do Google Gemini"""
        api_key = self.api_keys['google']
        url = f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}'
        
        # Converte formato de mensagens para formato Gemini
        contents = []
        for msg in messages:
            role = 'user' if msg['role'] == 'user' else 'model'
            contents.append({
                'role': role,
                'parts': [{'text': msg['content']}]
            })
        
        payload = {
            'contents': contents,
            'generationConfig': {
                'temperature': temperature,
                'maxOutputTokens': max_tokens
            }
        }
        
        return {
            'url': url,
            'headers': {'Content-Type': 'application/json'},
            'payload': payload
        }
    
    def _prepare_anthropic_request(self, model: str, messages: List[Dict], 
                                  temperature: float, max_tokens: int) -> Dict:
        """Prepara requisição para API da Anthropic Claude"""
        headers = {
            'x-api-key': self.api_keys['anthropic'],
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
        }
        
        # Separa system message das outras mensagens
        system_message = ""
        conversation_messages = []
        
        for msg in messages:
            if msg['role'] == 'system':
                system_message = msg['content']
            else:
                conversation_messages.append({
                    'role': msg['role'],
                    'content': msg['content']
                })
        
        payload = {
            'model': model,
            'messages': conversation_messages,
            'max_tokens': max_tokens,
            'temperature': temperature
        }
        
        if system_message:
            payload['system'] = system_message
        
        return {
            'url': 'https://api.anthropic.com/v1/messages',
            'headers': headers,
            'payload': payload
        }
    
    def _parse_openai_response(self, response: Dict) -> Dict:
        """Processa resposta da OpenAI"""
        try:
            content = response['choices'][0]['message']['content']
            usage = response.get('usage', {})
            
            return {
                'content': content,
                'tokens_input': usage.get('prompt_tokens', 0),
                'tokens_output': usage.get('completion_tokens', 0),
                'tokens_total': usage.get('total_tokens', 0)
            }
        except (KeyError, IndexError) as e:
            logger.error(f"Erro ao processar resposta OpenAI: {e}")
            raise
    
    def _parse_google_response(self, response: Dict) -> Dict:
        """Processa resposta do Google Gemini"""
        try:
            content = response['candidates'][0]['content']['parts'][0]['text']
            usage = response.get('usageMetadata', {})
            
            return {
                'content': content,
                'tokens_input': usage.get('promptTokenCount', 0),
                'tokens_output': usage.get('candidatesTokenCount', 0),
                'tokens_total': usage.get('totalTokenCount', 0)
            }
        except (KeyError, IndexError) as e:
            logger.error(f"Erro ao processar resposta Google: {e}")
            raise
    
    def _parse_anthropic_response(self, response: Dict) -> Dict:
        """Processa resposta da Anthropic Claude"""
        try:
            content = response['content'][0]['text']
            usage = response.get('usage', {})
            
            return {
                'content': content,
                'tokens_input': usage.get('input_tokens', 0),
                'tokens_output': usage.get('output_tokens', 0),
                'tokens_total': usage.get('input_tokens', 0) + usage.get('output_tokens', 0)
            }
        except (KeyError, IndexError) as e:
            logger.error(f"Erro ao processar resposta Anthropic: {e}")
            raise
    
    def _make_api_request(self, provider: str, request_data: Dict, 
                         retry_attempts: int = 3) -> Dict:
        """
        Faz requisição para API com retry
        
        Args:
            provider: Provider da API ('openai', 'google', 'anthropic')
            request_data: Dados da requisição
            retry_attempts: Número de tentativas em caso de erro
            
        Returns:
            Resposta da API
        """
        for attempt in range(retry_attempts):
            try:
                response = requests.post(
                    request_data['url'],
                    headers=request_data['headers'],
                    json=request_data['payload'],
                    timeout=self.config['configuracoes']['timeout_segundos']
                )
                
                response.raise_for_status()
                return response.json()
                
            except requests.exceptions.RequestException as e:
                logger.warning(f"Tentativa {attempt + 1} falhou: {e}")
                if attempt < retry_attempts - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    logger.error(f"Todas as tentativas falharam para provider {provider}")
                    raise
    
    def _calculate_cost(self, model_info: Dict, tokens_input: int, 
                       tokens_output: int) -> float:
        """
        Calcula custo da requisição
        
        Args:
            model_info: Informações do modelo
            tokens_input: Tokens de entrada
            tokens_output: Tokens de saída
            
        Returns:
            Custo total em USD
        """
        cost_input = (tokens_input / 1000000) * model_info.get('preco_input', 0)
        cost_output = (tokens_output / 1000000) * model_info.get('preco_output', 0)
        return cost_input + cost_output
    
    def _update_metrics(self, provider: str, model: str, tokens: Dict, cost: float):
        """Atualiza métricas de uso"""
        self.metrics['total_requests'] += 1
        self.metrics['total_tokens'] += tokens['tokens_total']
        self.metrics['total_cost'] += cost
        
        if provider not in self.metrics['requests_by_provider']:
            self.metrics['requests_by_provider'][provider] = 0
        self.metrics['requests_by_provider'][provider] += 1
        
        if model not in self.metrics['requests_by_model']:
            self.metrics['requests_by_model'][model] = 0
        self.metrics['requests_by_model'][model] += 1
    
    def chat(self, message: str, provider: str, model_id: str, 
             prompt_type: str = 'analise_marketing',
             temperature: Optional[float] = None,
             max_tokens: Optional[int] = None,
             reset_history: bool = False) -> Dict:
        """
        Envia mensagem para o assistente Raizen
        
        Args:
            message: Mensagem do usuário
            provider: Provider da API ('openai', 'google', 'anthropic')
            model_id: ID do modelo a ser usado
            prompt_type: Tipo de prompt do sistema
            temperature: Temperatura (criatividade)
            max_tokens: Máximo de tokens na resposta
            reset_history: Limpar histórico de conversação
            
        Returns:
            Resposta do assistente com metadados
        """
        if reset_history:
            self.conversation_history = []
            logger.info("Histórico de conversação limpo")
        
        # Usa valores padrão se não fornecidos
        temperature = temperature or self.config['configuracoes']['temperatura_padrao']
        max_tokens = max_tokens or self.config['configuracoes']['max_tokens_padrao']
        
        # Adiciona system prompt
        if not self.conversation_history:
            system_prompt = self.config['prompts_sistema'].get(
                prompt_type, 
                self.config['prompts_sistema']['analise_marketing']
            )
            self.conversation_history.append({
                'role': 'system',
                'content': system_prompt
            })
        
        # Adiciona mensagem do usuário
        self.conversation_history.append({
            'role': 'user',
            'content': message
        })
        
        # Prepara requisição conforme o provider
        if provider == 'openai':
            request_data = self._prepare_openai_request(
                model_id, self.conversation_history, temperature, max_tokens
            )
        elif provider == 'google':
            request_data = self._prepare_google_request(
                model_id, self.conversation_history, temperature, max_tokens
            )
        elif provider == 'anthropic':
            request_data = self._prepare_anthropic_request(
                model_id, self.conversation_history, temperature, max_tokens
            )
        else:
            raise ValueError(f"Provider não suportado: {provider}")
        
        # Faz requisição
        logger.info(f"Enviando requisição para {provider} - {model_id}")
        api_response = self._make_api_request(provider, request_data)
        
        # Processa resposta
        if provider == 'openai':
            parsed_response = self._parse_openai_response(api_response)
        elif provider == 'google':
            parsed_response = self._parse_google_response(api_response)
        elif provider == 'anthropic':
            parsed_response = self._parse_anthropic_response(api_response)
        
        # Adiciona resposta ao histórico
        self.conversation_history.append({
            'role': 'assistant',
            'content': parsed_response['content']
        })
        
        # Busca informações do modelo
        all_models = self.get_available_models()
        model_info = next((m for m in all_models if m['id'] == model_id), {})
        
        # Calcula custo
        cost = self._calculate_cost(
            model_info,
            parsed_response['tokens_input'],
            parsed_response['tokens_output']
        )
        
        # Atualiza métricas
        self._update_metrics(provider, model_id, parsed_response, cost)
        
        # Prepara resposta completa
        result = {
            'assistente': 'Raizen',
            'timestamp': datetime.now().isoformat(),
            'provider': provider,
            'model': model_id,
            'model_nome': model_info.get('nome', model_id),
            'resposta': parsed_response['content'],
            'tokens': {
                'input': parsed_response['tokens_input'],
                'output': parsed_response['tokens_output'],
                'total': parsed_response['tokens_total']
            },
            'custo_usd': round(cost, 6),
            'temperatura': temperature,
            'max_tokens': max_tokens
        }
        
        logger.info(f"Resposta recebida - Tokens: {parsed_response['tokens_total']}, Custo: ${cost:.6f}")
        
        return result
    
    def analyze_marketing_data(self, dados: Dict, provider: str, 
                              model_id: str) -> Dict:
        """
        Analisa dados de marketing e fornece insights
        
        Args:
            dados: Dicionário com dados de marketing
            provider: Provider da API
            model_id: ID do modelo
            
        Returns:
            Análise detalhada com insights e recomendações
        """
        prompt = f"""
        Analise os seguintes dados de marketing e forneça insights acionáveis:
        
        {json.dumps(dados, indent=2, ensure_ascii=False)}
        
        Por favor, forneça:
        1. Principais insights identificados
        2. Tendências observadas
        3. Oportunidades de melhoria
        4. Recomendações específicas
        5. Métricas-chave a monitorar
        6. Previsões e projeções
        """
        
        return self.chat(prompt, provider, model_id, 'analise_marketing', reset_history=True)
    
    def analyze_customer_churn(self, dados_clientes: List[Dict], 
                              provider: str, model_id: str) -> Dict:
        """
        Analisa risco de churn de clientes
        
        Args:
            dados_clientes: Lista de dados de clientes
            provider: Provider da API
            model_id: ID do modelo
            
        Returns:
            Análise de churn com clientes em risco
        """
        prompt = f"""
        Analise os seguintes dados de clientes para identificar risco de churn:
        
        {json.dumps(dados_clientes, indent=2, ensure_ascii=False)}
        
        Por favor, identifique:
        1. Clientes com alto risco de churn
        2. Padrões comportamentais indicativos de churn
        3. Fatores de risco principais
        4. Estratégias de retenção recomendadas
        5. Ações imediatas prioritárias
        6. Previsão de taxa de churn
        """
        
        return self.chat(prompt, provider, model_id, 'recuperacao_clientes', reset_history=True)
    
    def create_acquisition_strategy(self, perfil_target: Dict, 
                                   orcamento: float, provider: str, 
                                   model_id: str) -> Dict:
        """
        Cria estratégia de aquisição de clientes
        
        Args:
            perfil_target: Perfil do público-alvo
            orcamento: Orçamento disponível
            provider: Provider da API
            model_id: ID do modelo
            
        Returns:
            Estratégia completa de aquisição
        """
        prompt = f"""
        Desenvolva uma estratégia completa de aquisição de clientes com base nos seguintes dados:
        
        Perfil do Público-Alvo:
        {json.dumps(perfil_target, indent=2, ensure_ascii=False)}
        
        Orçamento Disponível: R$ {orcamento:,.2f}
        
        Por favor, forneça:
        1. Canais de aquisição recomendados
        2. Distribuição de orçamento por canal
        3. Mensagens-chave para cada canal
        4. KPIs e metas esperadas
        5. Timeline de implementação
        6. Estratégias de otimização
        7. Estimativa de CAC (Custo de Aquisição de Cliente)
        8. Projeção de conversão
        """
        
        return self.chat(prompt, provider, model_id, 'captacao_clientes', reset_history=True)
    
    def identify_process_failures(self, dados_processo: Dict, 
                                 provider: str, model_id: str) -> Dict:
        """
        Identifica falhas e gargalos em processos comerciais
        
        Args:
            dados_processo: Dados do processo comercial
            provider: Provider da API
            model_id: ID do modelo
            
        Returns:
            Análise de falhas e recomendações
        """
        prompt = f"""
        Analise o seguinte processo comercial e identifique falhas e gargalos:
        
        {json.dumps(dados_processo, indent=2, ensure_ascii=False)}
        
        Por favor, identifique:
        1. Principais gargalos identificados
        2. Falhas operacionais críticas
        3. Ineficiências no processo
        4. Impacto estimado de cada falha
        5. Recomendações de melhoria priorizadas
        6. Quick wins (melhorias rápidas)
        7. Melhorias de médio/longo prazo
        8. ROI estimado das melhorias
        """
        
        return self.chat(prompt, provider, model_id, 'analise_falhas', reset_history=True)
    
    def create_dashboard_insights(self, dados: Dict, tipo_dashboard: str,
                                 provider: str, model_id: str) -> Dict:
        """
        Cria insights e recomendações para dashboards
        
        Args:
            dados: Dados para o dashboard
            tipo_dashboard: Tipo de dashboard (vendas, marketing, financeiro, etc)
            provider: Provider da API
            model_id: ID do modelo
            
        Returns:
            Estrutura e insights para dashboard
        """
        prompt = f"""
        Crie uma estrutura de dashboard com insights baseados nos seguintes dados:
        
        Tipo de Dashboard: {tipo_dashboard}
        
        Dados:
        {json.dumps(dados, indent=2, ensure_ascii=False)}
        
        Por favor, forneça:
        1. Métricas principais (KPIs) a exibir
        2. Estrutura recomendada do dashboard
        3. Visualizações sugeridas para cada métrica
        4. Insights principais dos dados
        5. Alertas e flags de atenção
        6. Tendências e previsões
        7. Recomendações de ações
        8. Formato JSON para implementação no frontend
        """
        
        return self.chat(prompt, provider, model_id, 'dashboard_previsoes', reset_history=True)
    
    def predict_sales(self, historico_vendas: List[Dict], 
                     periodo_previsao: int, provider: str, 
                     model_id: str) -> Dict:
        """
        Prevê vendas futuras baseado em histórico
        
        Args:
            historico_vendas: Histórico de vendas
            periodo_previsao: Número de períodos para prever
            provider: Provider da API
            model_id: ID do modelo
            
        Returns:
            Previsão de vendas com análise
        """
        prompt = f"""
        Analise o histórico de vendas e faça previsões para os próximos {periodo_previsao} períodos:
        
        Histórico de Vendas:
        {json.dumps(historico_vendas, indent=2, ensure_ascii=False)}
        
        Por favor, forneça:
        1. Análise de tendências históricas
        2. Sazonalidades identificadas
        3. Previsão de vendas por período
        4. Intervalo de confiança da previsão
        5. Fatores que podem impactar a previsão
        6. Cenários (otimista, realista, pessimista)
        7. Recomendações para atingir metas
        8. Estratégias de contingência
        """
        
        return self.chat(prompt, provider, model_id, 'dashboard_previsoes', reset_history=True)
    
    def get_metrics(self) -> Dict:
        """Retorna métricas de uso do assistente"""
        return {
            'timestamp': datetime.now().isoformat(),
            'metricas': self.metrics,
            'historico_conversas': len(self.conversation_history),
            'custo_medio_por_request': (
                self.metrics['total_cost'] / self.metrics['total_requests']
                if self.metrics['total_requests'] > 0 else 0
            )
        }
    
    def reset_metrics(self):
        """Reseta métricas de uso"""
        self.metrics = {
            'total_requests': 0,
            'total_tokens': 0,
            'total_cost': 0.0,
            'requests_by_provider': {},
            'requests_by_model': {}
        }
        logger.info("Métricas resetadas")
    
    def save_conversation(self, filename: str):
        """Salva histórico de conversação em arquivo"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump({
                    'timestamp': datetime.now().isoformat(),
                    'historico': self.conversation_history,
                    'metricas': self.metrics
                }, f, indent=2, ensure_ascii=False)
            logger.info(f"Conversação salva em {filename}")
        except Exception as e:
            logger.error(f"Erro ao salvar conversação: {e}")
            raise
    
    def load_conversation(self, filename: str):
        """Carrega histórico de conversação de arquivo"""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.conversation_history = data.get('historico', [])
                logger.info(f"Conversação carregada de {filename}")
        except Exception as e:
            logger.error(f"Erro ao carregar conversação: {e}")
            raise


def main():
    """Função de exemplo de uso"""
    # Inicializa o assistente
    raizen = RaizenAssistant('raizen_config.json')
    
    # Lista modelos disponíveis
    print("\n=== MODELOS DISPONÍVEIS ===")
    
    print("\n--- OpenAI (ChatGPT) ---")
    openai_models = raizen.get_available_models('openai')
    for i, model in enumerate(openai_models[:5], 1):
        print(f"{i}. {model['nome']} ({model['id']}) - {model['categoria']}")
    print(f"... e mais {len(openai_models) - 5} modelos")
    
    print("\n--- Google (Gemini) ---")
    google_models = raizen.get_available_models('google')
    for i, model in enumerate(google_models, 1):
        print(f"{i}. {model['nome']} ({model['id']}) - {model['categoria']}")
    
    print("\n--- Anthropic (Claude) ---")
    claude_models = raizen.get_available_models('anthropic')
    for i, model in enumerate(claude_models, 1):
        print(f"{i}. {model['nome']} ({model['id']}) - {model['categoria']}")
    
    # Exemplo de uso (requer API keys configuradas)
    # Descomente para testar:
    
    # response = raizen.chat(
    #     message="Analise as principais tendências de marketing digital para 2026",
    #     provider='openai',
    #     model_id='gpt-4o-mini',
    #     prompt_type='analise_marketing'
    # )
    # print(f"\nResposta: {response['resposta']}")
    # print(f"Custo: ${response['custo_usd']}")
    
    # Exemplo de análise de dados
    # dados_marketing = {
    #     'campanha': 'Email Marketing Q1',
    #     'envios': 10000,
    #     'aberturas': 2500,
    #     'cliques': 500,
    #     'conversoes': 50,
    #     'receita': 15000
    # }
    # 
    # analise = raizen.analyze_marketing_data(
    #     dados=dados_marketing,
    #     provider='google',
    #     model_id='gemini-1.5-flash'
    # )
    # print(f"\nAnálise: {analise['resposta']}")
    
    # Métricas
    print("\n=== MÉTRICAS ===")
    metrics = raizen.get_metrics()
    print(json.dumps(metrics, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
