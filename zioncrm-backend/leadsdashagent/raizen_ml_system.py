"""
Raizen ML - Módulo de Machine Learning e Banco de Dados
Sistema completo de aprendizado, treinamento, chat e popups
"""

import json
import uuid
import mysql.connector
from mysql.connector import Error
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import logging
import hashlib
import time
from decimal import Decimal

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('RaizenML')


class RaizenDatabase:
    """Gerenciamento de conexão com banco de dados"""
    
    def __init__(self, host: str, user: str, password: str, database: str = 'zioncrm'):
        self.host = host
        self.user = user
        self.password = password
        self.database = database
        self.connection = None
    
    def connect(self):
        """Estabelece conexão com banco de dados"""
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                autocommit=False
            )
            logger.info("Conectado ao banco de dados com sucesso")
            return True
        except Error as e:
            logger.error(f"Erro ao conectar ao banco: {e}")
            return False
    
    def disconnect(self):
        """Fecha conexão"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            logger.info("Desconectado do banco de dados")
    
    def execute_query(self, query: str, params: tuple = None, fetch: bool = False) -> Any:
        """Executa query no banco"""
        try:
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute(query, params or ())
            
            if fetch:
                result = cursor.fetchall()
                cursor.close()
                return result
            else:
                self.connection.commit()
                last_id = cursor.lastrowid
                cursor.close()
                return last_id
        except Error as e:
            self.connection.rollback()
            logger.error(f"Erro ao executar query: {e}")
            raise
    
    def execute_many(self, query: str, data: List[tuple]) -> bool:
        """Executa múltiplas inserções"""
        try:
            cursor = self.connection.cursor()
            cursor.executemany(query, data)
            self.connection.commit()
            cursor.close()
            return True
        except Error as e:
            self.connection.rollback()
            logger.error(f"Erro ao executar múltiplas queries: {e}")
            return False


class RaizenMLSystem:
    """Sistema completo de ML do Raizen"""
    
    def __init__(self, db: RaizenDatabase):
        self.db = db
        self.current_user_id = None
        self.current_user_name = None
    
    def set_current_user(self, user_id: int, user_name: str):
        """Define usuário atual"""
        self.current_user_id = user_id
        self.current_user_name = user_name
    
    # =========================================================================
    # SISTEMA DE CONVERSAS E CHAT
    # =========================================================================
    
    def create_conversation(self, provider: str, model_id: str, model_name: str,
                           prompt_type: str, session_id: Optional[str] = None) -> str:
        """Cria nova conversa"""
        conversation_id = str(uuid.uuid4())
        
        query = """
        INSERT INTO raizen_conversations 
        (conversation_id, user_id, user_name, session_id, provider, model_id, 
         model_name, prompt_type, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        
        params = (
            conversation_id,
            self.current_user_id,
            self.current_user_name,
            session_id or str(uuid.uuid4()),
            provider,
            model_id,
            model_name,
            prompt_type
        )
        
        self.db.execute_query(query, params)
        logger.info(f"Conversa criada: {conversation_id}")
        
        return conversation_id
    
    def add_message(self, conversation_id: str, role: str, content: str,
                   tokens_input: int = 0, tokens_output: int = 0, 
                   cost: float = 0.0, temperature: float = None,
                   max_tokens: int = None, response_time_ms: int = None) -> str:
        """Adiciona mensagem à conversa"""
        message_id = str(uuid.uuid4())
        
        query = """
        INSERT INTO raizen_messages
        (message_id, conversation_id, role, content, tokens_input, tokens_output,
         tokens_total, cost, temperature, max_tokens, response_time_ms, timestamp)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        
        params = (
            message_id,
            conversation_id,
            role,
            content,
            tokens_input,
            tokens_output,
            tokens_input + tokens_output,
            cost,
            temperature,
            max_tokens,
            response_time_ms
        )
        
        self.db.execute_query(query, params)
        return message_id
    
    def get_conversation_history(self, conversation_id: str, limit: int = 50) -> List[Dict]:
        """Busca histórico de conversa"""
        query = """
        SELECT message_id, role, content, tokens_total, cost, timestamp
        FROM raizen_messages
        WHERE conversation_id = %s
        ORDER BY timestamp DESC
        LIMIT %s
        """
        
        messages = self.db.execute_query(query, (conversation_id, limit), fetch=True)
        return list(reversed(messages)) if messages else []
    
    # =========================================================================
    # SISTEMA DE POPUPS
    # =========================================================================
    
    def create_popup(self, title: str, message: str, popup_type: str,
                    priority: str = 'medium', requires_action: bool = False,
                    action_type: Optional[str] = None, action_data: Optional[Dict] = None,
                    expires_in_hours: int = 24) -> str:
        """Cria popup para usuário"""
        popup_id = str(uuid.uuid4())
        expires_at = datetime.now() + timedelta(hours=expires_in_hours)
        
        query = """
        INSERT INTO raizen_chat_popups
        (popup_id, user_id, title, message, popup_type, priority, requires_action,
         action_type, action_data, expires_at, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        
        params = (
            popup_id,
            self.current_user_id,
            title,
            message,
            popup_type,
            priority,
            requires_action,
            action_type,
            json.dumps(action_data) if action_data else None,
            expires_at
        )
        
        self.db.execute_query(query, params)
        logger.info(f"Popup criado: {popup_id}")
        
        return popup_id
    
    def get_pending_popups(self, user_id: Optional[int] = None) -> List[Dict]:
        """Busca popups pendentes"""
        uid = user_id or self.current_user_id
        
        query = """
        SELECT popup_id, title, message, popup_type, priority, requires_action,
               action_type, action_data, created_at, expires_at
        FROM raizen_chat_popups
        WHERE user_id = %s 
          AND status = 'pending'
          AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY FIELD(priority, 'urgent', 'high', 'medium', 'low'), created_at
        """
        
        popups = self.db.execute_query(query, (uid,), fetch=True)
        
        # Parse JSON fields
        for popup in popups or []:
            if popup.get('action_data'):
                popup['action_data'] = json.loads(popup['action_data'])
        
        return popups or []
    
    def update_popup_status(self, popup_id: str, status: str, 
                           user_response: Optional[str] = None,
                           user_action: Optional[str] = None):
        """Atualiza status do popup"""
        query = """
        UPDATE raizen_chat_popups
        SET status = %s,
            user_response = %s,
            user_action = %s,
            interacted_at = CASE WHEN %s IN ('interacted', 'dismissed') THEN NOW() ELSE interacted_at END
        WHERE popup_id = %s
        """
        
        params = (status, user_response, user_action, status, popup_id)
        self.db.execute_query(query, params)
    
    # =========================================================================
    # SISTEMA DE TREINAMENTO
    # =========================================================================
    
    def save_training_data(self, category: str, input_data: Dict, 
                          expected_output: Optional[Dict] = None,
                          model_output: Optional[Dict] = None,
                          subcategory: Optional[str] = None,
                          auto_approve: bool = False) -> str:
        """Salva dados de treinamento"""
        training_id = str(uuid.uuid4())
        
        query = """
        INSERT INTO raizen_training_data
        (training_id, category, subcategory, input_data, expected_output, 
         model_output, is_approved, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
        """
        
        params = (
            training_id,
            category,
            subcategory,
            json.dumps(input_data),
            json.dumps(expected_output) if expected_output else None,
            json.dumps(model_output) if model_output else None,
            auto_approve
        )
        
        self.db.execute_query(query, params)
        
        # Se não for auto-aprovado, criar popup para aprovação
        if not auto_approve:
            self._create_training_approval_popup(training_id, category, input_data)
        
        logger.info(f"Treinamento salvo: {training_id}")
        return training_id
    
    def _create_training_approval_popup(self, training_id: str, category: str, 
                                       input_data: Dict):
        """Cria popup para aprovação de treinamento"""
        title = f"Novo Treinamento: {category}"
        message = f"Um novo treinamento foi gerado e precisa de aprovação.\n\nCategoria: {category}\n\nDados: {json.dumps(input_data, ensure_ascii=False, indent=2)[:200]}..."
        
        action_data = {
            'training_id': training_id,
            'category': category,
            'input_preview': str(input_data)[:100]
        }
        
        self.create_popup(
            title=title,
            message=message,
            popup_type='training_approval',
            priority='high',
            requires_action=True,
            action_type='approve_training',
            action_data=action_data,
            expires_in_hours=48
        )
    
    def approve_training(self, training_id: str, feedback_score: float = 1.0) -> bool:
        """Aprova treinamento"""
        try:
            query = "CALL sp_raizen_approve_training(%s, %s, %s)"
            self.db.execute_query(query, (training_id, self.current_user_id, feedback_score))
            
            # Registrar atividade
            self.log_activity(
                activity_type='training',
                action='approve_training',
                description=f"Treinamento aprovado: {training_id}",
                status='success'
            )
            
            return True
        except Exception as e:
            logger.error(f"Erro ao aprovar treinamento: {e}")
            return False
    
    def reject_training(self, training_id: str, rejection_reason: str,
                       deprecation_type: str = 'rejected') -> bool:
        """Rejeita treinamento"""
        try:
            query = "CALL sp_raizen_reject_training(%s, %s, %s, %s)"
            self.db.execute_query(
                query, 
                (training_id, self.current_user_id, rejection_reason, deprecation_type)
            )
            
            # Registrar atividade
            self.log_activity(
                activity_type='training',
                action='reject_training',
                description=f"Treinamento rejeitado: {training_id}",
                input_data={'reason': rejection_reason},
                status='warning'
            )
            
            return True
        except Exception as e:
            logger.error(f"Erro ao rejeitar treinamento: {e}")
            return False
    
    def get_approved_trainings(self, category: Optional[str] = None, 
                              limit: int = 100) -> List[Dict]:
        """Busca treinamentos aprovados"""
        if category:
            query = """
            SELECT training_id, category, subcategory, input_data, expected_output,
                   model_output, effectiveness_score, usage_count, approved_at
            FROM raizen_training_data
            WHERE is_approved = TRUE AND category = %s
            ORDER BY effectiveness_score DESC, usage_count DESC
            LIMIT %s
            """
            params = (category, limit)
        else:
            query = """
            SELECT training_id, category, subcategory, input_data, expected_output,
                   model_output, effectiveness_score, usage_count, approved_at
            FROM raizen_training_data
            WHERE is_approved = TRUE
            ORDER BY effectiveness_score DESC, usage_count DESC
            LIMIT %s
            """
            params = (limit,)
        
        trainings = self.db.execute_query(query, params, fetch=True)
        
        # Parse JSON fields
        for training in trainings or []:
            training['input_data'] = json.loads(training['input_data'])
            if training.get('expected_output'):
                training['expected_output'] = json.loads(training['expected_output'])
            if training.get('model_output'):
                training['model_output'] = json.loads(training['model_output'])
        
        return trainings or []
    
    def update_training_usage(self, training_id: str, effectiveness_score: Optional[float] = None):
        """Atualiza uso de treinamento"""
        if effectiveness_score:
            query = """
            UPDATE raizen_training_data
            SET usage_count = usage_count + 1,
                effectiveness_score = %s,
                last_used_at = NOW()
            WHERE training_id = %s
            """
            params = (effectiveness_score, training_id)
        else:
            query = """
            UPDATE raizen_training_data
            SET usage_count = usage_count + 1,
                last_used_at = NOW()
            WHERE training_id = %s
            """
            params = (training_id,)
        
        self.db.execute_query(query, params)
    
    # =========================================================================
    # SISTEMA DE PREDICTIONS/ML
    # =========================================================================
    
    def save_prediction(self, session_id: str, prediction_type: str,
                       input_features: Dict, prediction_result: Dict,
                       confidence_score: float, related_entity_type: Optional[str] = None,
                       related_entity_id: Optional[int] = None) -> str:
        """Salva predição ML"""
        prediction_id = str(uuid.uuid4())
        
        query = """
        INSERT INTO raizen_ml_predictions
        (prediction_id, session_id, prediction_type, input_features, prediction_result,
         confidence_score, user_id, related_entity_type, related_entity_id, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        
        params = (
            prediction_id,
            session_id,
            prediction_type,
            json.dumps(input_features),
            json.dumps(prediction_result),
            confidence_score,
            self.current_user_id,
            related_entity_type,
            related_entity_id
        )
        
        self.db.execute_query(query, params)
        logger.info(f"Predição salva: {prediction_id}")
        
        return prediction_id
    
    def update_prediction_feedback(self, prediction_id: str, actual_outcome: Dict,
                                  is_accurate: bool, error_margin: Optional[float] = None):
        """Atualiza feedback de predição"""
        query = """
        UPDATE raizen_ml_predictions
        SET actual_outcome = %s,
            is_accurate = %s,
            error_margin = %s,
            feedback_at = NOW()
        WHERE prediction_id = %s
        """
        
        params = (json.dumps(actual_outcome), is_accurate, error_margin, prediction_id)
        self.db.execute_query(query, params)
        
        # Criar treinamento com o feedback
        if is_accurate:
            self._create_training_from_prediction(prediction_id, actual_outcome)
    
    def _create_training_from_prediction(self, prediction_id: str, actual_outcome: Dict):
        """Cria treinamento a partir de predição bem-sucedida"""
        # Buscar dados da predição
        query = """
        SELECT prediction_type, input_features, prediction_result, confidence_score
        FROM raizen_ml_predictions
        WHERE prediction_id = %s
        """
        
        prediction = self.db.execute_query(query, (prediction_id,), fetch=True)
        if prediction:
            pred = prediction[0]
            self.save_training_data(
                category=pred['prediction_type'],
                input_data=json.loads(pred['input_features']),
                expected_output=actual_outcome,
                model_output=json.loads(pred['prediction_result']),
                auto_approve=pred['confidence_score'] > 0.90
            )
    
    # =========================================================================
    # SISTEMA DE INSIGHTS
    # =========================================================================
    
    def create_insight(self, insight_type: str, title: str, description: str,
                      supporting_data: Dict, priority: str = 'medium',
                      confidence_level: float = 75.0, 
                      recommendations: Optional[List[Dict]] = None,
                      predicted_impact: Optional[Dict] = None,
                      expires_in_days: int = 30) -> str:
        """Cria novo insight"""
        insight_id = str(uuid.uuid4())
        expires_at = datetime.now() + timedelta(days=expires_in_days)
        
        query = """
        INSERT INTO raizen_insights
        (insight_id, insight_type, title, description, priority, confidence_level,
         supporting_data, recommendations, predicted_impact, expires_at, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        
        params = (
            insight_id,
            insight_type,
            title,
            description,
            priority,
            confidence_level,
            json.dumps(supporting_data),
            json.dumps(recommendations) if recommendations else None,
            json.dumps(predicted_impact) if predicted_impact else None,
            expires_at
        )
        
        self.db.execute_query(query, params)
        
        # Criar popup para insights de alta prioridade
        if priority in ('high', 'critical'):
            self._create_insight_popup(insight_id, title, description, priority)
        
        logger.info(f"Insight criado: {insight_id}")
        return insight_id
    
    def _create_insight_popup(self, insight_id: str, title: str, 
                            description: str, priority: str):
        """Cria popup para insight importante"""
        self.create_popup(
            title=f"💡 Insight: {title}",
            message=description[:500],
            popup_type='info',
            priority=priority,
            requires_action=False,
            action_data={'insight_id': insight_id},
            expires_in_hours=72
        )
    
    def get_active_insights(self, insight_type: Optional[str] = None) -> List[Dict]:
        """Busca insights ativos"""
        if insight_type:
            query = """
            SELECT * FROM v_raizen_active_insights
            WHERE insight_type = %s
            """
            params = (insight_type,)
        else:
            query = "SELECT * FROM v_raizen_active_insights"
            params = ()
        
        insights = self.db.execute_query(query, params, fetch=True)
        return insights or []
    
    # =========================================================================
    # ANÁLISE DE CLIENTES
    # =========================================================================
    
    def analyze_customer(self, customer_id: int, analysis_type: str,
                        score: float, risk_level: str, 
                        behavioral_patterns: Dict,
                        recommendations: List[Dict],
                        predicted_actions: Optional[Dict] = None,
                        intervention_priority: int = 5) -> str:
        """Cria análise de cliente"""
        analysis_id = str(uuid.uuid4())
        
        # Desativar análises anteriores do mesmo tipo
        query_deactivate = """
        UPDATE raizen_customer_analysis
        SET is_current = FALSE
        WHERE customer_id = %s AND analysis_type = %s AND is_current = TRUE
        """
        self.db.execute_query(query_deactivate, (customer_id, analysis_type))
        
        # Inserir nova análise
        query = """
        INSERT INTO raizen_customer_analysis
        (analysis_id, customer_id, analysis_type, score, risk_level,
         behavioral_patterns, recommendations, predicted_actions, 
         intervention_priority, analyzed_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        
        params = (
            analysis_id,
            customer_id,
            analysis_type,
            score,
            risk_level,
            json.dumps(behavioral_patterns),
            json.dumps(recommendations),
            json.dumps(predicted_actions) if predicted_actions else None,
            intervention_priority
        )
        
        self.db.execute_query(query, params)
        
        # Criar popup para clientes de alto risco
        if risk_level in ('high', 'very_high'):
            self._create_high_risk_customer_popup(customer_id, score, risk_level, recommendations)
        
        return analysis_id
    
    def _create_high_risk_customer_popup(self, customer_id: int, score: float,
                                        risk_level: str, recommendations: List[Dict]):
        """Cria popup para cliente de alto risco"""
        title = f"⚠️ Cliente em Risco: ID {customer_id}"
        message = f"Cliente com risco {risk_level}\nScore: {score:.2f}\n\nAção imediata recomendada!"
        
        self.create_popup(
            title=title,
            message=message,
            popup_type='warning',
            priority='urgent' if risk_level == 'very_high' else 'high',
            requires_action=True,
            action_type='view_customer_analysis',
            action_data={
                'customer_id': customer_id,
                'risk_level': risk_level,
                'recommendations': recommendations[:3]
            },
            expires_in_hours=12
        )
    
    def get_high_risk_customers(self) -> List[Dict]:
        """Busca clientes de alto risco"""
        query = "SELECT * FROM v_raizen_high_risk_customers"
        customers = self.db.execute_query(query, fetch=True)
        
        # Parse JSON fields
        for customer in customers or []:
            if customer.get('behavioral_patterns'):
                customer['behavioral_patterns'] = json.loads(customer['behavioral_patterns'])
            if customer.get('recommendations'):
                customer['recommendations'] = json.loads(customer['recommendations'])
        
        return customers or []
    
    # =========================================================================
    # SISTEMA DE LOGS
    # =========================================================================
    
    def log_activity(self, activity_type: str, action: str, 
                    description: Optional[str] = None,
                    input_data: Optional[Dict] = None,
                    output_data: Optional[Dict] = None,
                    status: str = 'info',
                    error_message: Optional[str] = None,
                    execution_time_ms: Optional[int] = None):
        """Registra atividade no log"""
        log_id = str(uuid.uuid4())
        
        query = """
        INSERT INTO raizen_activity_logs
        (log_id, activity_type, user_id, action, description, input_data,
         output_data, status, error_message, execution_time_ms, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        
        params = (
            log_id,
            activity_type,
            self.current_user_id,
            action,
            description,
            json.dumps(input_data) if input_data else None,
            json.dumps(output_data) if output_data else None,
            status,
            error_message,
            execution_time_ms
        )
        
        self.db.execute_query(query, params)
    
    def get_activity_logs(self, activity_type: Optional[str] = None,
                         user_id: Optional[int] = None,
                         limit: int = 100) -> List[Dict]:
        """Busca logs de atividade"""
        conditions = []
        params = []
        
        if activity_type:
            conditions.append("activity_type = %s")
            params.append(activity_type)
        
        if user_id:
            conditions.append("user_id = %s")
            params.append(user_id)
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        
        query = f"""
        SELECT log_id, activity_type, user_id, action, description, status,
               error_message, execution_time_ms, created_at
        FROM raizen_activity_logs
        WHERE {where_clause}
        ORDER BY created_at DESC
        LIMIT %s
        """
        
        params.append(limit)
        logs = self.db.execute_query(query, tuple(params), fetch=True)
        
        return logs or []
    
    # =========================================================================
    # FEEDBACK E ESTATÍSTICAS
    # =========================================================================
    
    def save_feedback(self, feedback_type: str, related_id: str,
                     rating: Optional[int] = None, sentiment: Optional[str] = None,
                     feedback_text: Optional[str] = None,
                     useful: Optional[bool] = None, accurate: Optional[bool] = None,
                     actionable: Optional[bool] = None) -> str:
        """Salva feedback do usuário"""
        feedback_id = str(uuid.uuid4())
        
        query = """
        INSERT INTO raizen_feedback
        (feedback_id, feedback_type, related_id, user_id, rating, sentiment,
         feedback_text, useful, accurate, actionable, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        
        params = (
            feedback_id,
            feedback_type,
            related_id,
            self.current_user_id,
            rating,
            sentiment,
            feedback_text,
            useful,
            accurate,
            actionable
        )
        
        self.db.execute_query(query, params)
        return feedback_id
    
    def get_statistics(self, stat_type: str, category: str, 
                      period_start: datetime, period_end: datetime) -> List[Dict]:
        """Busca estatísticas"""
        query = """
        SELECT * FROM raizen_statistics
        WHERE stat_type = %s
          AND category = %s
          AND period_start >= %s
          AND period_end <= %s
        ORDER BY period_start DESC
        """
        
        params = (stat_type, category, period_start, period_end)
        stats = self.db.execute_query(query, params, fetch=True)
        
        return stats or []
    
    def get_config(self, config_key: str) -> Any:
        """Busca configuração"""
        query = "SELECT config_value, value_type FROM raizen_config WHERE config_key = %s"
        result = self.db.execute_query(query, (config_key,), fetch=True)
        
        if result:
            value = result[0]['config_value']
            value_type = result[0]['value_type']
            
            if value_type == 'integer':
                return int(value)
            elif value_type == 'float':
                return float(value)
            elif value_type == 'boolean':
                return value.lower() in ('true', '1', 'yes')
            elif value_type == 'json':
                return json.loads(value)
            else:
                return value
        
        return None


# =============================================================================
# FUNÇÕES AUXILIARES PARA EXPORT/IMPORT JSON
# =============================================================================

def serialize_for_json(obj: Any) -> Any:
    """Serializa objetos para JSON"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, bytes):
        return obj.decode('utf-8')
    return obj


def prepare_data_for_frontend(data: Dict) -> Dict:
    """Prepara dados para envio ao frontend"""
    return json.loads(
        json.dumps(data, default=serialize_for_json, ensure_ascii=False)
    )


def prepare_data_for_database(data: Dict) -> Dict:
    """Prepara dados recebidos do frontend para banco"""
    # Remove campos None
    return {k: v for k, v in data.items() if v is not None}


# =============================================================================
# EXEMPLO DE USO
# =============================================================================

def main():
    """Exemplo de uso do sistema"""
    # Conectar ao banco
    db = RaizenDatabase(
        host='localhost',
        user='root',
        password='sua_senha',
        database='zioncrm'
    )
    
    if not db.connect():
        return
    
    # Inicializar sistema ML
    ml_system = RaizenMLSystem(db)
    ml_system.set_current_user(1, "Admin")
    
    # Exemplo: Criar conversa
    conv_id = ml_system.create_conversation(
        provider='openai',
        model_id='gpt-4o-mini',
        model_name='GPT-4o Mini',
        prompt_type='analise_marketing'
    )
    print(f"Conversa criada: {conv_id}")
    
    # Exemplo: Adicionar mensagem
    ml_system.add_message(
        conversation_id=conv_id,
        role='user',
        content='Analise minha campanha de marketing',
        tokens_input=50,
        tokens_output=0
    )
    
    # Exemplo: Criar popup
    popup_id = ml_system.create_popup(
        title='Bem-vindo ao Raizen!',
        message='Sistema de IA pronto para uso',
        popup_type='info',
        priority='medium'
    )
    print(f"Popup criado: {popup_id}")
    
    # Exemplo: Salvar treinamento
    training_id = ml_system.save_training_data(
        category='marketing_analysis',
        input_data={'campaign': 'Email Q1', 'opens': 2500},
        expected_output={'recommendation': 'Increase frequency'},
        auto_approve=False
    )
    print(f"Treinamento salvo: {training_id}")
    
    # Desconectar
    db.disconnect()


if __name__ == '__main__':
    main()
