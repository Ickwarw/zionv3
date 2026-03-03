"""
Raizen Integrated - Integração Completa do Assistente com ML
Combina o assistente de IA com Machine Learning, Banco de Dados e Sistema de Aprendizado
"""

import json
import time
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
import logging

from raizen import RaizenAssistant
from raizen_ml_system import (
    RaizenDatabase, RaizenMLSystem, prepare_data_for_frontend, 
    prepare_data_for_database, serialize_for_json
)

# Configuração de logging
logger = logging.getLogger('RaizenIntegrated')


class RaizenIntegrated:
    """
    Assistente Raizen Integrado com ML, Banco de Dados e Aprendizado Contínuo
    """
    
    def __init__(self, config_file: str = 'raizen_config.json',
                 db_host: str = 'localhost', db_user: str = 'root',
                 db_password: str = '', db_name: str = 'zioncrm'):
        """
        Inicializa sistema integrado
        
        Args:
            config_file: Arquivo de configuração do Raizen
            db_host: Host do banco de dados
            db_user: Usuário do banco
            db_password: Senha do banco
            db_name: Nome do banco de dados
        """
        # Inicializar assistente base
        self.assistant = RaizenAssistant(config_file)
        
        # Inicializar banco de dados
        self.db = RaizenDatabase(db_host, db_user, db_password, db_name)
        if not self.db.connect():
            raise ConnectionError("Falha ao conectar ao banco de dados")
        
        # Inicializar sistema ML
        self.ml_system = RaizenMLSystem(self.db)
        
        # Estado da sessão
        self.current_conversation_id = None
        self.current_session_id = str(uuid.uuid4())
        self.learning_enabled = True
        
        logger.info("Raizen Integrated inicializado com sucesso")
    
    def set_user(self, user_id: int, user_name: str):
        """Define usuário atual"""
        self.ml_system.set_current_user(user_id, user_name)
    
    # =========================================================================
    # CHAT INTELIGENTE COM APRENDIZADO
    # =========================================================================
    
    def chat(self, message: str, provider: str, model_id: str,
             prompt_type: str = 'analise_marketing',
             temperature: Optional[float] = None,
             max_tokens: Optional[int] = None,
             learn_from_interaction: bool = True) -> Dict:
        """
        Chat com o assistente integrando ML e aprendizado
        
        Args:
            message: Mensagem do usuário
            provider: Provider da API (openai, google, anthropic)
            model_id: ID do modelo
            prompt_type: Tipo de prompt
            temperature: Temperatura
            max_tokens: Máximo de tokens
            learn_from_interaction: Se deve aprender desta interação
            
        Returns:
            Resposta completa com dados do chat e ML
        """
        start_time = time.time()
        
        try:
            # Criar ou retomar conversa
            if not self.current_conversation_id:
                model_info = self._get_model_info(provider, model_id)
                self.current_conversation_id = self.ml_system.create_conversation(
                    provider=provider,
                    model_id=model_id,
                    model_name=model_info.get('nome', model_id),
                    prompt_type=prompt_type,
                    session_id=self.current_session_id
                )
            
            # Salvar mensagem do usuário
            user_msg_id = self.ml_system.add_message(
                conversation_id=self.current_conversation_id,
                role='user',
                content=message
            )
            
            # Buscar treinamentos relevantes se aprendizado estiver ativo
            relevant_trainings = []
            if self.learning_enabled and learn_from_interaction:
                relevant_trainings = self.ml_system.get_approved_trainings(
                    category=prompt_type,
                    limit=5
                )
            
            # Enriquecer contexto com treinamentos
            enhanced_message = self._enhance_message_with_training(
                message, relevant_trainings
            )
            
            # Chamar assistente base
            response = self.assistant.chat(
                message=enhanced_message,
                provider=provider,
                model_id=model_id,
                prompt_type=prompt_type,
                temperature=temperature,
                max_tokens=max_tokens,
                reset_history=False
            )
            
            # Calcular tempo de resposta
            response_time_ms = int((time.time() - start_time) * 1000)
            
            # Salvar resposta do assistente
            assistant_msg_id = self.ml_system.add_message(
                conversation_id=self.current_conversation_id,
                role='assistant',
                content=response['resposta'],
                tokens_input=response['tokens']['input'],
                tokens_output=response['tokens']['output'],
                cost=response['custo_usd'],
                temperature=response['temperatura'],
                max_tokens=response['max_tokens'],
                response_time_ms=response_time_ms
            )
            
            # Analisar resposta para gerar insights
            if self.learning_enabled:
                self._analyze_response_for_insights(
                    message, response['resposta'], prompt_type
                )
            
            # Registrar atividade
            self.ml_system.log_activity(
                activity_type='chat',
                action='send_message',
                description=f"Chat com {provider}/{model_id}",
                input_data={'message_length': len(message)},
                output_data={'tokens': response['tokens']['total']},
                status='success',
                execution_time_ms=response_time_ms
            )
            
            # Preparar resposta completa
            complete_response = {
                'success': True,
                'conversation_id': self.current_conversation_id,
                'message_id': assistant_msg_id,
                'user_message_id': user_msg_id,
                'response': response['resposta'],
                'model': {
                    'provider': provider,
                    'model_id': model_id,
                    'model_name': response['model_nome']
                },
                'tokens': response['tokens'],
                'cost': response['custo_usd'],
                'response_time_ms': response_time_ms,
                'timestamp': datetime.now().isoformat(),
                'learning_applied': len(relevant_trainings) > 0,
                'trainings_used': len(relevant_trainings)
            }
            
            # Salvar como dados de treinamento se configurado
            if learn_from_interaction and self.learning_enabled:
                self._save_as_training_candidate(
                    message, response['resposta'], prompt_type, 
                    response['tokens']['total']
                )
            
            return prepare_data_for_frontend(complete_response)
            
        except Exception as e:
            logger.error(f"Erro no chat: {e}")
            self.ml_system.log_activity(
                activity_type='chat',
                action='send_message',
                description=f"Erro no chat",
                status='error',
                error_message=str(e)
            )
            
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _get_model_info(self, provider: str, model_id: str) -> Dict:
        """Busca informações do modelo"""
        models = self.assistant.get_available_models(provider)
        for model in models:
            if model['id'] == model_id:
                return model
        return {'nome': model_id}
    
    def _enhance_message_with_training(self, message: str, 
                                      trainings: List[Dict]) -> str:
        """Enriquece mensagem com dados de treinamento"""
        if not trainings:
            return message
        
        # Adicionar contexto de treinamentos relevantes
        training_context = "\n\n[Contexto de Aprendizado Anterior]:\n"
        for training in trainings[:3]:  # Top 3 mais relevantes
            if training.get('expected_output'):
                training_context += f"- {json.dumps(training['expected_output'], ensure_ascii=False)}\n"
        
        return message + training_context
    
    def _save_as_training_candidate(self, message: str, response: str,
                                   category: str, tokens_used: int):
        """Salva interação como candidata a treinamento"""
        # Apenas salvar se a interação for significativa
        if tokens_used > 100:  # Threshold mínimo
            self.ml_system.save_training_data(
                category=category,
                input_data={
                    'user_message': message,
                    'context': 'chat_interaction'
                },
                model_output={
                    'response': response,
                    'tokens_used': tokens_used
                },
                subcategory='user_interaction',
                auto_approve=False
            )
    
    def _analyze_response_for_insights(self, message: str, response: str,
                                      category: str):
        """Analisa resposta para gerar insights automáticos"""
        # Detectar padrões que indicam oportunidades
        insight_triggers = {
            'churn': ['risco', 'perder', 'cancelar', 'insatisfeito'],
            'opportunity': ['oportunidade', 'potencial', 'crescimento', 'aumentar'],
            'problem': ['problema', 'falha', 'erro', 'gargalo', 'dificuldade']
        }
        
        response_lower = response.lower()
        
        for insight_type, keywords in insight_triggers.items():
            if any(keyword in response_lower for keyword in keywords):
                # Gerar insight
                self.ml_system.create_insight(
                    insight_type=insight_type,
                    title=f"Insight detectado em {category}",
                    description=response[:500],
                    supporting_data={'message': message, 'response': response},
                    priority='medium',
                    confidence_level=60.0,
                    expires_in_days=15
                )
                break
    
    # =========================================================================
    # GERENCIAMENTO DE POPUPS
    # =========================================================================
    
    def get_pending_popups(self) -> Dict:
        """Busca popups pendentes do usuário"""
        try:
            popups = self.ml_system.get_pending_popups()
            
            # Formatar para frontend
            formatted_popups = []
            for popup in popups:
                formatted = {
                    'popup_id': popup['popup_id'],
                    'title': popup['title'],
                    'message': popup['message'],
                    'popup_type': popup['popup_type'],
                    'priority': popup['priority'],
                    'requires_action': popup['requires_action'],
                    'action_type': popup.get('action_type'),
                    'action_data': popup.get('action_data'),
                    'created_at': popup['created_at'].isoformat(),
                    'expires_at': popup['expires_at'].isoformat() if popup.get('expires_at') else None,
                    'buttons': self._generate_popup_buttons(popup)
                }
                formatted_popups.append(formatted)
            
            return {
                'success': True,
                'popups': formatted_popups,
                'count': len(formatted_popups),
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Erro ao buscar popups: {e}")
            return {'success': False, 'error': str(e)}
    
    def _generate_popup_buttons(self, popup: Dict) -> List[Dict]:
        """Gera botões para popup"""
        buttons = []
        
        if popup['requires_action']:
            if popup['action_type'] == 'approve_training':
                buttons = [
                    {'label': 'Aprovar', 'action': 'approve', 'style': 'primary'},
                    {'label': 'Rejeitar', 'action': 'reject', 'style': 'danger'},
                    {'label': 'Ver Detalhes', 'action': 'details', 'style': 'secondary'}
                ]
            elif popup['action_type'] == 'view_customer_analysis':
                buttons = [
                    {'label': 'Ver Análise', 'action': 'view', 'style': 'primary'},
                    {'label': 'Tomar Ação', 'action': 'take_action', 'style': 'primary'},
                    {'label': 'Dispensar', 'action': 'dismiss', 'style': 'secondary'}
                ]
            else:
                buttons = [
                    {'label': 'Confirmar', 'action': 'confirm', 'style': 'primary'},
                    {'label': 'Cancelar', 'action': 'cancel', 'style': 'secondary'}
                ]
        else:
            buttons = [
                {'label': 'OK', 'action': 'dismiss', 'style': 'primary'}
            ]
        
        return buttons
    
    def respond_to_popup(self, popup_id: str, action: str, 
                        response: Optional[str] = None,
                        data: Optional[Dict] = None) -> Dict:
        """Responde a um popup"""
        try:
            # Buscar dados do popup
            popups = self.ml_system.get_pending_popups()
            popup = next((p for p in popups if p['popup_id'] == popup_id), None)
            
            if not popup:
                return {'success': False, 'error': 'Popup não encontrado'}
            
            # Processar ação
            if popup['action_type'] == 'approve_training' and action in ('approve', 'reject'):
                training_id = popup['action_data']['training_id']
                
                if action == 'approve':
                    feedback_score = data.get('feedback_score', 1.0) if data else 1.0
                    success = self.ml_system.approve_training(training_id, feedback_score)
                    message = 'Treinamento aprovado com sucesso'
                else:
                    rejection_reason = response or 'Rejeitado pelo usuário'
                    success = self.ml_system.reject_training(training_id, rejection_reason)
                    message = 'Treinamento rejeitado'
                
                if success:
                    self.ml_system.update_popup_status(
                        popup_id, 'interacted', response, action
                    )
                    return {
                        'success': True,
                        'message': message,
                        'action': action
                    }
            
            # Atualizar status do popup
            new_status = 'interacted' if action != 'dismiss' else 'dismissed'
            self.ml_system.update_popup_status(
                popup_id, new_status, response, action
            )
            
            return {
                'success': True,
                'message': 'Popup processado',
                'action': action
            }
            
        except Exception as e:
            logger.error(f"Erro ao responder popup: {e}")
            return {'success': False, 'error': str(e)}
    
    # =========================================================================
    # ANÁLISE DE CLIENTES COM ML
    # =========================================================================
    
    def analyze_customer(self, customer_id: int, customer_data: Dict,
                        analysis_types: Optional[List[str]] = None) -> Dict:
        """
        Analisa cliente usando IA e ML
        
        Args:
            customer_id: ID do cliente
            customer_data: Dados do cliente
            analysis_types: Tipos de análise (churn_risk, lifetime_value, etc)
        """
        try:
            start_time = time.time()
            
            if not analysis_types:
                analysis_types = ['churn_risk', 'engagement', 'lifetime_value']
            
            analyses = []
            
            for analysis_type in analysis_types:
                # Usar IA para análise
                analysis_prompt = self._create_customer_analysis_prompt(
                    customer_data, analysis_type
                )
                
                ai_response = self.assistant.chat(
                    message=analysis_prompt,
                    provider='openai',
                    model_id='gpt-4o-mini',
                    prompt_type='analise_marketing'
                )
                
                # Parsear resposta IA e gerar análise estruturada
                analysis_result = self._parse_customer_analysis(
                    ai_response['resposta'], customer_data, analysis_type
                )
                
                # Salvar análise no banco
                analysis_id = self.ml_system.analyze_customer(
                    customer_id=customer_id,
                    analysis_type=analysis_type,
                    score=analysis_result['score'],
                    risk_level=analysis_result['risk_level'],
                    behavioral_patterns=analysis_result['patterns'],
                    recommendations=analysis_result['recommendations'],
                    predicted_actions=analysis_result.get('predicted_actions'),
                    intervention_priority=analysis_result['priority']
                )
                
                analysis_result['analysis_id'] = analysis_id
                analyses.append(analysis_result)
            
            execution_time = int((time.time() - start_time) * 1000)
            
            # Registrar atividade
            self.ml_system.log_activity(
                activity_type='customer_analysis',
                action='analyze_customer',
                description=f"Análise do cliente {customer_id}",
                input_data={'customer_id': customer_id, 'types': analysis_types},
                output_data={'analyses_count': len(analyses)},
                status='success',
                execution_time_ms=execution_time
            )
            
            return  {
                'success': True,
                'customer_id': customer_id,
                'analyses': analyses,
                'execution_time_ms': execution_time,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro na análise de cliente: {e}")
            return {'success': False, 'error': str(e)}
    
    def _create_customer_analysis_prompt(self, customer_data: Dict, 
                                        analysis_type: str) -> str:
        """Cria prompt para análise de cliente"""
        prompts = {
            'churn_risk': f"""
Analise o risco de churn do seguinte cliente:

Dados: {json.dumps(customer_data, ensure_ascii=False, indent=2)}

Forneça:
1. Score de risco (0-100)
2. Nível de risco (very_low, low, medium, high, very_high)
3. Principais padrões comportamentais indicativos
4. Recomendações específicas de retenção
5. Prioridade de intervenção (1-10)

Responda em formato estruturado.
""",
            'engagement': f"""
Analise o nível de engajamento do cliente:

Dados: {json.dumps(customer_data, ensure_ascii=False, indent=2)}

Forneça:
1. Score de engajamento (0-100)
2. Tendência (increasing, stable, decreasing)
3. Padrões de interação identificados
4. Oportunidades de aumento de engajamento
5. Canais mais efetivos

Responda em formato estruturado.
""",
            'lifetime_value': f"""
Analise o valor de vida do cliente (LTV):

Dados: {json.dumps(customer_data, ensure_ascii=False, indent=2)}

Forneça:
1. LTV estimado
2. Segmento de valor
3. Potencial de crescimento
4. Oportunidades de upsell/cross-sell
5. Estratégias de maximização de valor

Responda em formato estruturado.
"""
        }
        
        return prompts.get(analysis_type, prompts['churn_risk'])
    
    def _parse_customer_analysis(self, ai_response: str, customer_data: Dict,
                                 analysis_type: str) -> Dict:
        """Parseia resposta da IA em estrutura de análise"""
        # Extrair score (buscar números)
        import re
        scores = re.findall(r'\b(\d{1,3}(?:\.\d+)?)\b', ai_response)
        score = float(scores[0]) if scores else 50.0
        
        # Determinar risk level baseado no score
        if score < 20:
            risk_level = 'very_low'
        elif score < 40:
            risk_level = 'low'
        elif score < 60:
            risk_level = 'medium'
        elif score < 80:
            risk_level = 'high'
        else:
            risk_level = 'very_high'
        
        # Prioridade baseada no score
        priority = min(10, max(1, int(score / 10)))
        
        return {
            'score': score,
            'risk_level': risk_level,
            'priority': priority,
            'patterns': {
                'analysis': ai_response[:500],
                'data_points': customer_data
            },   
            'recommendations': [
                {
                    'action': 'Revisar análise completa',
                    'description': ai_response,
                    'priority': priority
                }
            ],
            'predicted_actions': {
                'next_interaction': 'unknown',
                'probability': score / 100
            }
        }
    
    def get_high_risk_customers(self) -> Dict:
        """Busca clientes de alto risco"""
        try:
            customers = self.ml_system.get_high_risk_customers()
            
            return {
                'success': True,
                'customers': customers,
                'count': len(customers),
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    # =========================================================================
    # DASHBOARD E ESTATÍSTICAS
    # =========================================================================
    
    def get_dashboard_data(self) -> Dict:
        """Gera dados completos para dashboard"""
        try:
            # Buscar dados de diferentes fontes
            pending_popups = self.ml_system.get_pending_popups()
            active_insights = self.ml_system.get_active_insights()
            high_risk_customers = self.ml_system.get_high_risk_customers()
            recent_logs = self.ml_system.get_activity_logs(limit=20)
            
            # Estatísticas gerais
            metrics = self.assistant.get_metrics()
            
            dashboard = {
                'success': True,
                'generated_at': datetime.now().isoformat(),
                'summary': {
                    'total_conversations': metrics['historico_conversas'],
                    'total_requests': metrics['metricas']['total_requests'],
                    'total_tokens': metrics['metricas']['total_tokens'],
                    'total_cost': metrics['metricas']['total_cost'],
                    'active_insights': len(active_insights),
                    'pending_popups': len(pending_popups),
                    'high_risk_customers': len(high_risk_customers),
                    'ml_enabled': self.learning_enabled
                },
                'recent_activity': recent_logs[:10],
                'top_insights': active_insights[:5],
                'pending_popups': pending_popups[:10],
                'high_risk_customers': high_risk_customers[:10],
                'provider_usage': metrics['metricas']['requests_by_provider'],
                'alerts': self._generate_alerts(
                    pending_popups, high_risk_customers, active_insights
                )
            }
            
            return prepare_data_for_frontend(dashboard)
            
        except Exception as e:
            logger.error(f"Erro ao gerar dashboard: {e}")
            return {'success': False, 'error': str(e)}
    
    def _generate_alerts(self, popups: List, customers: List, insights: List) -> List[Dict]:
        """Gera alertas para o dashboard"""
        alerts = []
        
        # Alertas de popups urgentes
        urgent_popups = [p for p in popups if p['priority'] == 'urgent']
        if urgent_popups:
            alerts.append({
                'type': 'popups',
                'severity': 'high',
                'message': f'{len(urgent_popups)} popup(s) urgente(s) aguardando ação',
                'action_required': True
            })
        
        # Alertas de clientes de alto risco
        if len(customers) > 0:
            alerts.append({
                'type': 'customers',
                'severity': 'high',
                'message': f'{len(customers)} cliente(s) em alto risco de churn',
                'action_required': True
            })
        
        # Alertas de insights críticos
        critical_insights = [i for i in insights if i.get('priority') == 'critical']
        if critical_insights:
            alerts.append({
                'type': 'insights',
                'severity': 'critical',
                'message': f'{len(critical_insights)} insight(s) crítico(s) detectado(s)',
                'action_required': True
            })
        
        return alerts
    
    # =========================================================================
    # GERENCIAMENTO DE SESSÃO
    # =========================================================================
    
    def end_conversation(self):
        """Encerra conversa atual"""
        self.current_conversation_id = None
        self.assistant.conversation_history = []
    
    def toggle_learning(self, enabled: bool):
        """Ativa/desativa aprendizado"""
        self.learning_enabled = enabled
        logger.info(f"Aprendizado {'ativado' if enabled else 'desativado'}")
    
    def save_session(self, filename: str):
        """Salva sessão atual"""
        self.assistant.save_conversation(filename)
    
    def disconnect(self):
        """Desconecta do banco de dados"""
        self.db.disconnect()


# =============================================================================
# EXEMPLO DE USO COMPLETO
# =============================================================================

def main():
    """Exemplo de uso do sistema integrado"""
    # Inicializar
    raizen = RaizenIntegrated(
        config_file='raizen_config.json',
        db_host='localhost',
        db_user='root',
        db_password='sua_senha',
        db_name='zioncrm'
    )
    
    # Definir usuário
    raizen.set_user(1, "Administrador")
    
    # Chat com aprendizado
    print("\n=== CHAT COM APRENDIZADO ===")
    response = raizen.chat(
        message="Analise tendências de marketing para captação de clientes ativos",
        provider='google',
        model_id='gemini-1.5-flash',
        learn_from_interaction=True
    )
    print(f"Resposta: {response['response'][:200]}...")
    print(f"Treinamentos aplicados: {response['trainings_used']}")
    
    # Buscar popups pendentes
    print("\n=== POPUPS PENDENTES ===")
    popups = raizen.get_pending_popups()
    print(f"Popups encontrados: {popups['count']}")
    
    # Analisar cliente
    print("\n=== ANÁLISE DE CLIENTE ===")
    customer_data = {
        'customer_id': 123,
        'last_purchase_days': 90,
        'total_purchases': 5,
        'total_value': 1500,
        'engagement_score': 45
    }
    
    analysis = raizen.analyze_customer(
        customer_id=123,
        customer_data=customer_data,
        analysis_types=['churn_risk']
    )
    print(f"Análise concluída: {analysis['success']}")
    
    # Dashboard
    print("\n=== DASHBOARD ===")
    dashboard = raizen.get_dashboard_data()
    print(f"Total de conversas: {dashboard['summary']['total_conversations']}")
    print(f"Clientes em risco: {dashboard['summary']['high_risk_customers']}")
    print(f"Alertas: {len(dashboard['alerts'])}")
    
    # Desconectar
    raizen.disconnect()
    print("\n=== Sistema finalizado ===")


if __name__ == '__main__':
    main()
