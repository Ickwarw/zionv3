-- =============================================================================
-- RAIZEN ASSISTANT - SCHEMA DE BANCO DE DADOS
-- Database: zioncrm
-- Sistema de ML, Chat, Treinamento e Logs
-- =============================================================================

USE zioncrm;

-- =============================================================================
-- TABELA: raizen_conversations
-- Armazena todas as conversas entre usuários e o assistente
-- =============================================================================
CREATE TABLE IF NOT EXISTS raizen_conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id VARCHAR(100) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    user_name VARCHAR(255),
    session_id VARCHAR(100),
    provider VARCHAR(50) NOT NULL COMMENT 'openai, google, anthropic',
    model_id VARCHAR(100) NOT NULL,
    model_name VARCHAR(255),
    prompt_type VARCHAR(100) COMMENT 'analise_marketing, estrategia_comercial, etc',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    total_messages INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    total_cost DECIMAL(10, 6) DEFAULT 0.00,
    metadata JSON COMMENT 'Dados adicionais da conversa',
    INDEX idx_user_id (user_id),
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABELA: raizen_messages
-- Armazena todas as mensagens das conversas
-- =============================================================================
CREATE TABLE IF NOT EXISTS raizen_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id VARCHAR(100) NOT NULL,
    message_id VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('system', 'user', 'assistant') NOT NULL,
    content TEXT NOT NULL,
    tokens_input INT DEFAULT 0,
    tokens_output INT DEFAULT 0,
    tokens_total INT DEFAULT 0,
    cost DECIMAL(10, 6) DEFAULT 0.00,
    temperature DECIMAL(3, 2),
    max_tokens INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_time_ms INT COMMENT 'Tempo de resposta em milissegundos',
    metadata JSON COMMENT 'Dados adicionais da mensagem',
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_message_id (message_id),
    INDEX idx_role (role),
    INDEX idx_timestamp (timestamp),
    FOREIGN KEY (conversation_id) REFERENCES raizen_conversations(conversation_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABELA: raizen_chat_popups
-- Armazena popups enviados aos usuários
-- =============================================================================
CREATE TABLE IF NOT EXISTS raizen_chat_popups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    popup_id VARCHAR(100) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    popup_type ENUM('info', 'warning', 'success', 'error', 'question', 'training_approval') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    requires_action BOOLEAN DEFAULT FALSE,
    action_type VARCHAR(50) COMMENT 'approve_training, feedback, confirm, etc',
    action_data JSON COMMENT 'Dados relacionados à ação',
    status ENUM('pending', 'displayed', 'interacted', 'dismissed', 'expired') DEFAULT 'pending',
    user_response TEXT,
    user_action VARCHAR(50),
    displayed_at TIMESTAMP NULL,
    interacted_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    INDEX idx_popup_id (popup_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_popup_type (popup_type),
    INDEX idx_requires_action (requires_action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABELA: raizen_training_data
-- Armazena dados de treinamento aprovados
-- =============================================================================
CREATE TABLE IF NOT EXISTS raizen_training_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    training_id VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL COMMENT 'marketing_analysis, churn_prediction, sales_forecast, etc',
    subcategory VARCHAR(100),
    input_data JSON NOT NULL COMMENT 'Dados de entrada do treinamento',
    expected_output JSON COMMENT 'Saída esperada',
    model_output JSON COMMENT 'Saída gerada pelo modelo',
    feedback_score DECIMAL(3, 2) COMMENT 'Score de 0 a 1',
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by INT COMMENT 'ID do usuário que aprovou',
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    usage_count INT DEFAULT 0 COMMENT 'Quantas vezes foi usado no treinamento',
    last_used_at TIMESTAMP NULL,
    effectiveness_score DECIMAL(5, 2) COMMENT 'Score de efetividade 0-100',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    metadata JSON,
    INDEX idx_training_id (training_id),
    INDEX idx_category (category),
    INDEX idx_is_approved (is_approved),
    INDEX idx_effectiveness_score (effectiveness_score),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABELA: raizen_training_deprecated
-- Armazena treinamentos rejeitados/depreciados
-- =============================================================================
CREATE TABLE IF NOT EXISTS raizen_training_deprecated (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    training_id VARCHAR(100) NOT NULL UNIQUE,
    original_training_id VARCHAR(100) COMMENT 'ID do treinamento original se houver',
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    input_data JSON NOT NULL,
    expected_output JSON,
    model_output JSON,
    rejection_reason TEXT NOT NULL,
    rejected_by INT NOT NULL,
    rejected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deprecation_type ENUM('rejected', 'obsolete', 'error', 'duplicate', 'policy_violation') NOT NULL,
    can_be_reviewed BOOLEAN DEFAULT FALSE,
    reviewed_at TIMESTAMP NULL,
    review_notes TEXT,
    metadata JSON,
    INDEX idx_training_id (training_id),
    INDEX idx_original_training_id (original_training_id),
    INDEX idx_category (category),
    INDEX idx_deprecation_type (deprecation_type),
    INDEX idx_rejected_at (rejected_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABELA: raizen_training_sessions
-- Armazena sessões de treinamento do modelo ML
-- =============================================================================
CREATE TABLE IF NOT EXISTS raizen_training_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL UNIQUE,
    model_type VARCHAR(100) NOT NULL COMMENT 'random_forest, neural_network, etc',
    training_category VARCHAR(100) NOT NULL,
    dataset_size INT NOT NULL,
    training_samples INT NOT NULL,
    validation_samples INT NOT NULL,
    test_samples INT,
    accuracy DECIMAL(5, 4),
    precision_score DECIMAL(5, 4),
    recall_score DECIMAL(5, 4),
    f1_score DECIMAL(5, 4),
    training_duration_seconds INT,
    hyperparameters JSON,
    feature_importance JSON,
    model_path VARCHAR(500) COMMENT 'Caminho do modelo salvo',
    is_active BOOLEAN DEFAULT FALSE,
    activated_at TIMESTAMP NULL,
    deactivated_at TIMESTAMP NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    INDEX idx_session_id (session_id),
    INDEX idx_model_type (model_type),
    INDEX idx_training_category (training_category),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABELA: raizen_ml_predictions
-- Armazena predições feitas pelo modelo ML
-- =============================================================================
CREATE TABLE IF NOT EXISTS raizen_ml_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    prediction_id VARCHAR(100) NOT NULL UNIQUE,
    session_id VARCHAR(100) NOT NULL COMMENT 'ID da sessão de treinamento usada',
    prediction_type VARCHAR(100) NOT NULL COMMENT 'churn, sales_forecast, lead_score, etc',
    input_features JSON NOT NULL,
    prediction_result JSON NOT NULL,
    confidence_score DECIMAL(5, 4),
    actual_outcome JSON COMMENT 'Resultado real (quando disponível)',
    is_accurate BOOLEAN COMMENT 'Se a predição foi correta',
    error_margin DECIMAL(10, 2),
    user_id INT,
    related_entity_type VARCHAR(50) COMMENT 'customer, lead, campaign, etc',
    related_entity_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    feedback_at TIMESTAMP NULL COMMENT 'Quando o feedback foi registrado',
    metadata JSON,
    INDEX idx_prediction_id (prediction_id),
    INDEX idx_session_id (session_id),
    INDEX idx_prediction_type (prediction_type),
    INDEX idx_related_entity (related_entity_type, related_entity_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABELA: raizen_activity_logs
-- Logs de todas as atividades do assistente
-- =============================================================================
CREATE TABLE IF NOT EXISTS raizen_activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    log_id VARCHAR(100) NOT NULL UNIQUE,
    activity_type VARCHAR(100) NOT NULL COMMENT 'chat, training, prediction, popup, etc',
    user_id INT,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    input_data JSON,
    output_data JSON,
    status ENUM('success', 'error', 'warning', 'info') DEFAULT 'info',
    error_message TEXT,
    execution_time_ms INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    INDEX idx_log_id (log_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABELA: raizen_insights
-- Insights gerados pelo assistente
-- =============================================================================
CREATE TABLE IF NOT EXISTS raizen_insights (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    insight_id VARCHAR(100) NOT NULL UNIQUE,
    insight_type VARCHAR(100) NOT NULL COMMENT 'marketing, sales, churn, opportunity, etc',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    confidence_level DECIMAL(5, 2) COMMENT 'Nível de confiança 0-100',
    supporting_data JSON NOT NULL COMMENT 'Dados que suportam o insight',
    recommendations JSON COMMENT 'Recomendações de ação',
    predicted_impact JSON COMMENT 'Impacto previsto',
    status ENUM('new', 'reviewed', 'implemented', 'dismissed') DEFAULT 'new',
    reviewed_by INT,
    reviewed_at TIMESTAMP NULL,
    feedback TEXT,
    implementation_result JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL COMMENT 'Quando o insight perde relevância',
    metadata JSON,
    INDEX idx_insight_id (insight_id),
    INDEX idx_insight_type (insight_type),
    INDEX idx_priority (priority),
    INDEX idx_status (status),
    INDEX idx_confidence_level (confidence_level),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABELA: raizen_customer_analysis
-- Análises de clientes para ML e estratégias
-- =============================================================================
CREATE TABLE IF NOT EXISTS raizen_customer_analysis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    analysis_id VARCHAR(100) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    analysis_type VARCHAR(100) NOT NULL COMMENT 'churn_risk, lifetime_value, engagement, etc',
    score DECIMAL(5, 2) NOT NULL COMMENT 'Score da análise 0-100',
    risk_level ENUM('very_low', 'low', 'medium', 'high', 'very_high'),
    segments JSON COMMENT 'Segmentos do cliente',
    behavioral_patterns JSON COMMENT 'Padrões comportamentais identificados',
    recommendations JSON COMMENT 'Recomendações específicas',
    predicted_actions JSON COMMENT 'Ações previstas do cliente',
    intervention_priority INT COMMENT '1-10, prioridade de intervenção',
    last_interaction_score DECIMAL(5, 2),
    engagement_trend VARCHAR(50) COMMENT 'increasing, stable, decreasing',
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_analysis_at TIMESTAMP NULL,
    is_current BOOLEAN DEFAULT TRUE,
    metadata JSON,
    INDEX idx_analysis_id (analysis_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_analysis_type (analysis_type),
    INDEX idx_risk_level (risk_level),
    INDEX idx_score (score),
    INDEX idx_is_current (is_current)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABELA: raizen_statistics
-- Estatísticas agregadas para dashboards
-- =============================================================================
CREATE TABLE IF NOT EXISTS raizen_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stat_id VARCHAR(100) NOT NULL UNIQUE,
    stat_type VARCHAR(100) NOT NULL COMMENT 'daily, weekly, monthly, realtime',
    category VARCHAR(100) NOT NULL COMMENT 'conversations, trainings, predictions, insights',
    metric_name VARCHAR(255) NOT NULL,
    metric_value DECIMAL(15, 2) NOT NULL,
    metric_unit VARCHAR(50),
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    comparison_previous DECIMAL(15, 2) COMMENT 'Valor do período anterior',
    percentage_change DECIMAL(7, 2) COMMENT 'Mudança percentual',
    trend VARCHAR(50) COMMENT 'up, down, stable',
    breakdown JSON COMMENT 'Detalhamento da estatística',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    INDEX idx_stat_id (stat_id),
    INDEX idx_stat_type (stat_type),
    INDEX idx_category (category),
    INDEX idx_metric_name (metric_name),
    INDEX idx_period (period_start, period_end),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABELA: raizen_feedback
-- Feedback dos usuários sobre respostas e insights
-- =============================================================================
CREATE TABLE IF NOT EXISTS raizen_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    feedback_id VARCHAR(100) NOT NULL UNIQUE,
    feedback_type ENUM('message', 'insight', 'prediction', 'popup', 'training') NOT NULL,
    related_id VARCHAR(100) NOT NULL COMMENT 'ID da mensagem, insight, etc',
    user_id INT NOT NULL,
    rating INT COMMENT '1-5 estrelas',
    sentiment ENUM('positive', 'neutral', 'negative'),
    feedback_text TEXT,
    useful BOOLEAN,
    accurate BOOLEAN,
    actionable BOOLEAN,
    tags JSON COMMENT 'Tags categorizando o feedback',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    INDEX idx_feedback_id (feedback_id),
    INDEX idx_feedback_type (feedback_type),
    INDEX idx_related_id (related_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABELA: raizen_config
-- Configurações do sistema Raizen
-- =============================================================================
CREATE TABLE IF NOT EXISTS raizen_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(255) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    value_type ENUM('string', 'integer', 'float', 'boolean', 'json') DEFAULT 'string',
    category VARCHAR(100) COMMENT 'ml, chat, popup, training, etc',
    description TEXT,
    is_sensitive BOOLEAN DEFAULT FALSE,
    can_be_modified BOOLEAN DEFAULT TRUE,
    modified_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_config_key (config_key),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- INSERIR CONFIGURAÇÕES PADRÃO
-- =============================================================================

INSERT INTO raizen_config (config_key, config_value, value_type, category, description) VALUES
('ml.training.auto_approve', 'false', 'boolean', 'ml', 'Auto-aprovar treinamentos com alta confiança'),
('ml.training.min_confidence', '0.85', 'float', 'ml', 'Confiança mínima para auto-aprovação'),
('ml.training.max_deprecated_age_days', '90', 'integer', 'ml', 'Dias para manter treinamentos depreciados'),
('chat.max_history_messages', '50', 'integer', 'chat', 'Máximo de mensagens no histórico'),
('chat.enable_context_learning', 'true', 'boolean', 'chat', 'Habilitar aprendizado de contexto'),
('popup.default_expiry_hours', '24', 'integer', 'popup', 'Horas padrão para expiração de popups'),
('popup.max_pending_per_user', '5', 'integer', 'popup', 'Máximo de popups pendentes por usuário'),
('insights.min_confidence', '0.70', 'float', 'insights', 'Confiança mínima para gerar insight'),
('insights.auto_expire_days', '30', 'integer', 'insights', 'Dias para expirar insights não revisados'),
('statistics.retention_days', '365', 'integer', 'statistics', 'Dias para manter estatísticas'),
('predictions.feedback_window_days', '7', 'integer', 'predictions', 'Dias para coletar feedback de predições'),
('system.enable_ml', 'true', 'boolean', 'system', 'Habilitar módulo de Machine Learning'),
('system.enable_realtime_learning', 'true', 'boolean', 'system', 'Habilitar aprendizado em tempo real'),
('system.log_retention_days', '180', 'integer', 'system', 'Dias para manter logs de atividade')
ON DUPLICATE KEY UPDATE config_value=VALUES(config_value);

-- =============================================================================
-- VIEWS ÚTEIS
-- =============================================================================

-- View de estatísticas de conversas por usuário
CREATE OR REPLACE VIEW v_raizen_user_conversation_stats AS
SELECT 
    rc.user_id,
    rc.user_name,
    COUNT(DISTINCT rc.id) as total_conversations,
    SUM(rc.total_messages) as total_messages,
    SUM(rc.total_tokens) as total_tokens,
    SUM(rc.total_cost) as total_cost,
    AVG(rc.total_cost) as avg_cost_per_conversation,
    MAX(rc.updated_at) as last_conversation_date,
    COUNT(CASE WHEN rc.is_active = TRUE THEN 1 END) as active_conversations
FROM raizen_conversations rc
GROUP BY rc.user_id, rc.user_name;

-- View de treinamentos aprovados por categoria
CREATE OR REPLACE VIEW v_raizen_approved_trainings AS
SELECT 
    category,
    subcategory,
    COUNT(*) as total_approved,
    AVG(effectiveness_score) as avg_effectiveness,
    SUM(usage_count) as total_usage,
    MAX(approved_at) as last_approval_date
FROM raizen_training_data
WHERE is_approved = TRUE
GROUP BY category, subcategory;

-- View de popups pendentes
CREATE OR REPLACE VIEW v_raizen_pending_popups AS
SELECT 
    cp.id,
    cp.popup_id,
    cp.user_id,
    cp.title,
    cp.priority,
    cp.popup_type,
    cp.requires_action,
    cp.action_type,
    cp.created_at,
    cp.expires_at,
    TIMESTAMPDIFF(HOUR, NOW(), cp.expires_at) as hours_to_expire
FROM raizen_chat_popups cp
WHERE cp.status = 'pending'
  AND (cp.expires_at IS NULL OR cp.expires_at > NOW())
ORDER BY 
    FIELD(cp.priority, 'urgent', 'high', 'medium', 'low'),
    cp.created_at ASC;

-- View de insights ativos por prioridade
CREATE OR REPLACE VIEW v_raizen_active_insights AS
SELECT 
    i.insight_id,
    i.insight_type,
    i.title,
    i.priority,
    i.confidence_level,
    i.status,
    i.created_at,
    i.expires_at,
    DATEDIFF(i.expires_at, NOW()) as days_until_expire
FROM raizen_insights i
WHERE i.status IN ('new', 'reviewed')
  AND (i.expires_at IS NULL OR i.expires_at > NOW())
ORDER BY 
    FIELD(i.priority, 'critical', 'high', 'medium', 'low'),
    i.confidence_level DESC;

-- View de análise de clientes de alto risco
CREATE OR REPLACE VIEW v_raizen_high_risk_customers AS
SELECT 
    ca.customer_id,
    ca.analysis_type,
    ca.score,
    ca.risk_level,
    ca.intervention_priority,
    ca.engagement_trend,
    ca.analyzed_at,
    ca.recommendations
FROM raizen_customer_analysis ca
WHERE ca.is_current = TRUE
  AND ca.risk_level IN ('high', 'very_high')
ORDER BY ca.intervention_priority DESC, ca.score ASC;

-- =============================================================================
-- PROCEDURES ÚTEIS
-- =============================================================================

-- Procedure para limpar dados antigos
DELIMITER //
CREATE PROCEDURE sp_raizen_cleanup_old_data()
BEGIN
    DECLARE v_log_retention INT;
    DECLARE v_stat_retention INT;
    DECLARE v_deprecated_retention INT;
    
    -- Buscar configurações
    SELECT CAST(config_value AS SIGNED) INTO v_log_retention 
    FROM raizen_config WHERE config_key = 'system.log_retention_days';
    
    SELECT CAST(config_value AS SIGNED) INTO v_stat_retention 
    FROM raizen_config WHERE config_key = 'statistics.retention_days';
    
    SELECT CAST(config_value AS SIGNED) INTO v_deprecated_retention 
    FROM raizen_config WHERE config_key = 'ml.training.max_deprecated_age_days';
    
    -- Limpar logs antigos
    DELETE FROM raizen_activity_logs 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL v_log_retention DAY);
    
    -- Limpar estatísticas antigas
    DELETE FROM raizen_statistics 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL v_stat_retention DAY);
    
    -- Limpar treinamentos depreciados muito antigos
    DELETE FROM raizen_training_deprecated 
    WHERE rejected_at < DATE_SUB(NOW(), INTERVAL v_deprecated_retention DAY)
      AND can_be_reviewed = FALSE;
    
    -- Limpar popups expirados
    DELETE FROM raizen_chat_popups 
    WHERE status = 'expired' 
      AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    -- Marcar insights expirados
    UPDATE raizen_insights 
    SET status = 'dismissed'
    WHERE status = 'new' 
      AND expires_at < NOW();
      
END//
DELIMITER ;

-- Procedure para aprovar treinamento
DELIMITER //
CREATE PROCEDURE sp_raizen_approve_training(
    IN p_training_id VARCHAR(100),
    IN p_approved_by INT,
    IN p_feedback_score DECIMAL(3,2)
)
BEGIN
    UPDATE raizen_training_data 
    SET 
        is_approved = TRUE,
        approved_by = p_approved_by,
        approved_at = NOW(),
        feedback_score = p_feedback_score
    WHERE training_id = p_training_id;
    
    -- Registrar log
    INSERT INTO raizen_activity_logs 
    (log_id, activity_type, user_id, action, status, created_at)
    VALUES 
    (UUID(), 'training', p_approved_by, CONCAT('Approved training: ', p_training_id), 'success', NOW());
END//
DELIMITER ;

-- Procedure para rejeitar treinamento
DELIMITER //
CREATE PROCEDURE sp_raizen_reject_training(
    IN p_training_id VARCHAR(100),
    IN p_rejected_by INT,
    IN p_rejection_reason TEXT,
    IN p_deprecation_type VARCHAR(50)
)
BEGIN
    -- Buscar dados do treinamento
    INSERT INTO raizen_training_deprecated 
    (training_id, original_training_id, category, subcategory, input_data, 
     expected_output, model_output, rejection_reason, rejected_by, deprecation_type)
    SELECT 
        UUID(),
        training_id,
        category,
        subcategory,
        input_data,
        expected_output,
        model_output,
        p_rejection_reason,
        p_rejected_by,
        p_deprecation_type
    FROM raizen_training_data
    WHERE training_id = p_training_id;
    
    -- Remover da tabela principal
    DELETE FROM raizen_training_data WHERE training_id = p_training_id;
    
    -- Registrar log
    INSERT INTO raizen_activity_logs 
    (log_id, activity_type, user_id, action, status, created_at)
    VALUES 
    (UUID(), 'training', p_rejected_by, CONCAT('Rejected training: ', p_training_id), 'warning', NOW());
END//
DELIMITER ;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Trigger para atualizar contadores na conversa
DELIMITER //
CREATE TRIGGER tr_raizen_messages_after_insert
AFTER INSERT ON raizen_messages
FOR EACH ROW
BEGIN
    UPDATE raizen_conversations 
    SET 
        total_messages = total_messages + 1,
        total_tokens = total_tokens + NEW.tokens_total,
        total_cost = total_cost + NEW.cost,
        updated_at = NOW()
    WHERE conversation_id = NEW.conversation_id;
END//
DELIMITER ;

-- Trigger para expirar popups automaticamente
DELIMITER //
CREATE TRIGGER tr_raizen_popups_check_expiry
BEFORE UPDATE ON raizen_chat_popups
FOR EACH ROW
BEGIN
    IF NEW.expires_at IS NOT NULL AND NEW.expires_at < NOW() AND OLD.status = 'pending' THEN
        SET NEW.status = 'expired';
    END IF;
END//
DELIMITER ;

-- =============================================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =============================================================================

-- Índices compostos para queries comuns
CREATE INDEX idx_conv_user_active ON raizen_conversations(user_id, is_active, created_at);
CREATE INDEX idx_msg_conv_timestamp ON raizen_messages(conversation_id, timestamp);
CREATE INDEX idx_popup_user_status ON raizen_chat_popups(user_id, status, priority);
CREATE INDEX idx_training_category_approved ON raizen_training_data(category, is_approved, effectiveness_score);
CREATE INDEX idx_prediction_type_date ON raizen_ml_predictions(prediction_type, created_at);
CREATE INDEX idx_insight_type_status ON raizen_insights(insight_type, status, priority);
CREATE INDEX idx_analysis_customer_current ON raizen_customer_analysis(customer_id, is_current, analysis_type);
CREATE INDEX idx_feedback_type_related ON raizen_feedback(feedback_type, related_id);

-- =============================================================================
-- GRANTS (ajuste conforme necessário)
-- =============================================================================

-- GRANT SELECT, INSERT, UPDATE, DELETE ON zioncrm.raizen_* TO 'zioncrm_user'@'localhost';
-- GRANT EXECUTE ON PROCEDURE zioncrm.sp_raizen_* TO 'zioncrm_user'@'localhost';

-- =============================================================================
-- FIM DO SCHEMA
-- =============================================================================

SELECT 'Raizen Database Schema criado com sucesso!' as status;
