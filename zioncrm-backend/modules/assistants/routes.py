from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.assistants import (
    Assistant,
    Conversation,
    Message,
    JuliaTrainingData,
    JoceTrainingData,
    BrayanTrainingData,
    RaizenTrainingData,
    SalesAssistantTrainingData,
    SupportAssistantTrainingData,
    FinanceAssistantTrainingData,
    MarketingAssistantTrainingData,
    ProductAssistantTrainingData,
    AnalyticsAssistantTrainingData,
)
from models.config import SystemConfig
from assistants.julia import JuliaAssistant
from assistants.raizen import RaizenAssistant
from assistants.joce import JoceAssistant
from assistants.cristal import CristalAssistant
from assistants.emanuel import EmanuelAssistant
from assistants.rodolfo import RodolfoAssistant
from assistants.kelly import KellyAssistant
from assistants.erivaldo import ErivaldoAssistant
from assistants.ione import IoneAssistant
from assistants.ivonete import IvoneteAssistant
from extensions import db
import logging
from datetime import datetime

assistants_bp = Blueprint('assistants', __name__)
logger = logging.getLogger(__name__)


def _assistant_config_key(user_id, suffix):
    return f"assistants.user.{user_id}.{suffix}"


def _is_assistants_activated(user_id):
    enabled_cfg = SystemConfig.query.filter_by(
        key=_assistant_config_key(user_id, "enabled")
    ).first()
    token_cfg = SystemConfig.query.filter_by(
        key=_assistant_config_key(user_id, "api_token")
    ).first()

    enabled = bool(enabled_cfg and str(enabled_cfg.value).lower() == 'true')
    has_token = bool(token_cfg and token_cfg.value and token_cfg.value.strip())
    return enabled and has_token

# Inicializa os assistentes
julia_assistant = JuliaAssistant()
raizen_assistant = RaizenAssistant()
joce_assistant = JoceAssistant()
cristal_assistant = CristalAssistant()
emanuel_assistant = EmanuelAssistant()
rodolfo_assistant = RodolfoAssistant()
kelly_assistant = KellyAssistant()
erivaldo_assistant = ErivaldoAssistant()
ione_assistant = IoneAssistant()
ivonete_assistant = IvoneteAssistant()

# Mapeamento de assistentes por nome
assistant_instances = {
    "Julia": julia_assistant,
    "Quim": raizen_assistant,
    "Raizen": raizen_assistant,
    "Joce": joce_assistant,
    "Cristal": cristal_assistant,
    "Emanuel": emanuel_assistant,
    "Rodolfo": rodolfo_assistant,
    "Kelly": kelly_assistant,
    "Erivaldo": erivaldo_assistant,
    "Ione": ione_assistant,
    "Ivonete": ivonete_assistant
}

# Função para obter resposta do assistente correto
def get_assistant_response(assistant_name, user_message, context=None):
    assistant = assistant_instances.get(assistant_name)
    if assistant:
        return assistant.get_response(user_message, context)
    else:
        return "Desculpe, não consegui processar sua solicitação. Assistente não encontrado."


@assistants_bp.route('/activation-status', methods=['GET'])
@jwt_required()
def get_activation_status():
    current_user_id = get_jwt_identity()
    return jsonify({
        'is_activated': _is_assistants_activated(current_user_id)
    }), 200


@assistants_bp.route('/activation', methods=['POST'])
@jwt_required()
def activate_assistants():
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    api_token = (data.get('api_token') or '').strip()

    if not api_token:
        return jsonify({'message': 'Missing api_token'}), 400

    enabled_key = _assistant_config_key(current_user_id, "enabled")
    token_key = _assistant_config_key(current_user_id, "api_token")

    enabled_cfg = SystemConfig.query.filter_by(key=enabled_key).first()
    if not enabled_cfg:
        enabled_cfg = SystemConfig(
            key=enabled_key,
            value='true',
            description='Ativação dos assistentes IA por usuário'
        )
        db.session.add(enabled_cfg)
    else:
        enabled_cfg.value = 'true'

    token_cfg = SystemConfig.query.filter_by(key=token_key).first()
    if not token_cfg:
        token_cfg = SystemConfig(
            key=token_key,
            value=api_token,
            description='Token de API dos assistentes IA por usuário'
        )
        db.session.add(token_cfg)
    else:
        token_cfg.value = api_token

    db.session.commit()

    return jsonify({
        'message': 'Assistentes ativados com sucesso',
        'is_activated': True
    }), 200

# Get all available assistants
@assistants_bp.route('/', methods=['GET'])
@jwt_required()
def get_assistants():
    assistants = Assistant.query.all()
    return jsonify({
        'assistants': [assistant.to_dict() for assistant in assistants]
    }), 200

# Get a specific assistant
@assistants_bp.route('/<int:assistant_id>', methods=['GET'])
@jwt_required()
def get_assistant(assistant_id):
    assistant = Assistant.query.get(assistant_id)
    
    if not assistant:
        return jsonify({'message': 'Assistant not found'}), 404
    
    return jsonify(assistant.to_dict()), 200

# Start a conversation with an assistant
@assistants_bp.route('/<int:assistant_id>/conversations', methods=['POST'])
@jwt_required()
def start_conversation(assistant_id):
    current_user_id = get_jwt_identity()

    if not _is_assistants_activated(current_user_id):
        return jsonify({'message': 'Assistentes não ativados. Informe a chave da API para ativar.'}), 403
    
    assistant = Assistant.query.get(assistant_id)
    if not assistant:
        return jsonify({'message': 'Assistant not found'}), 404
    
    # Create a new conversation
    conversation = Conversation(
        user_id=current_user_id,
        assistant_id=assistant_id,
        title=f"Conversation with {assistant.name}"
    )
    
    db.session.add(conversation)
    db.session.commit()
    
    # Add initial greeting message from assistant
    greeting = Message(
        conversation_id=conversation.id,
        content=assistant.greeting,
        is_from_assistant=True
    )
    
    db.session.add(greeting)
    db.session.commit()
    
    return jsonify({
        'message': 'Conversation started',
        'conversation': conversation.to_dict(),
        'greeting': greeting.to_dict()
    }), 201

# Get user's conversations
@assistants_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    current_user_id = get_jwt_identity()
    
    conversations = Conversation.query.filter_by(
        user_id=current_user_id
    ).order_by(Conversation.updated_at.desc()).all()
    
    return jsonify({
        'conversations': [conversation.to_dict() for conversation in conversations]
    }), 200

# Get messages in a conversation
@assistants_bp.route('/conversations/<int:conversation_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(conversation_id):
    current_user_id = get_jwt_identity()
    
    conversation = Conversation.query.get(conversation_id)
    if not conversation:
        return jsonify({'message': 'Conversation not found'}), 404
    
    # Check if user owns this conversation
    if conversation.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    messages = Message.query.filter_by(
        conversation_id=conversation_id
    ).order_by(Message.created_at).all()
    
    return jsonify({
        'messages': [message.to_dict() for message in messages]
    }), 200

# Send a message to an assistant
@assistants_bp.route('/conversations/<int:conversation_id>/messages', methods=['POST'])
@jwt_required()
def send_message(conversation_id):
    current_user_id = get_jwt_identity()

    if not _is_assistants_activated(current_user_id):
        return jsonify({'message': 'Assistentes não ativados. Informe a chave da API para ativar.'}), 403
    
    conversation = Conversation.query.get(conversation_id)
    if not conversation:
        return jsonify({'message': 'Conversation not found'}), 404
    
    # Check if user owns this conversation
    if conversation.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    if not data or not data.get('content'):
        return jsonify({'message': 'Missing message content'}), 400
    
    # Create user message
    user_message = Message(
        conversation_id=conversation_id,
        content=data['content'],
        is_from_assistant=False
    )
    
    db.session.add(user_message)
    
    # Update conversation timestamp
    conversation.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    # Get assistant response based on assistant type and user message
    assistant = Assistant.query.get(conversation.assistant_id)
    assistant_response = generate_assistant_response(assistant, data['content'], conversation_id)
    
    # Create assistant message
    assistant_message = Message(
        conversation_id=conversation_id,
        content=assistant_response,
        is_from_assistant=True
    )
    
    db.session.add(assistant_message)
    db.session.commit()
    
    return jsonify({
        'user_message': user_message.to_dict(),
        'assistant_message': assistant_message.to_dict()
    }), 201

# Helper function to generate assistant responses based on their specialty and training data
def generate_assistant_response(assistant, user_message, conversation_id):
    # Get conversation context (last 5 messages)
    context = Message.query.filter_by(
        conversation_id=conversation_id
    ).order_by(Message.created_at.desc()).limit(5).all()
    
    context_text = " ".join([msg.content for msg in reversed(context)])
    user_message_lower = user_message.lower()
    
    # Select the appropriate training data table based on assistant name
    if assistant.name == "Julia":
        training_data = JuliaTrainingData
    elif assistant.name == "Joce":
        training_data = JoceTrainingData
    elif assistant.name == "Brayan":
        training_data = BrayanTrainingData
    elif assistant.name == "Quim" or assistant.name == "Raizen":
        training_data = RaizenTrainingData
    elif assistant.specialty == "sales":
        training_data = SalesAssistantTrainingData
    elif assistant.specialty == "customer_service":
        training_data = SupportAssistantTrainingData
    elif assistant.specialty == "financial":
        training_data = FinanceAssistantTrainingData
    elif assistant.specialty == "marketing":
        training_data = MarketingAssistantTrainingData
    elif assistant.specialty == "product_management":
        training_data = ProductAssistantTrainingData
    elif assistant.specialty == "data_analysis":
        training_data = AnalyticsAssistantTrainingData
    else:
        # Default to Julia if no match
        training_data = JuliaTrainingData
    
    # Try to find a matching question in the training data
    # In a real implementation, this would use more sophisticated matching
    # such as embeddings, semantic search, or a machine learning model
    
    # First, try to find an exact match
    exact_match = training_data.query.filter(
        training_data.question.ilike(f"%{user_message_lower}%")
    ).order_by(training_data.confidence.desc()).first()
    
    if exact_match:
        return exact_match.answer
    
    # If no exact match, try to find a match based on keywords
    words = user_message_lower.split()
    for word in words:
        if len(word) > 3:  # Only consider words longer than 3 characters
            keyword_match = training_data.query.filter(
                training_data.question.ilike(f"%{word}%")
            ).order_by(training_data.confidence.desc()).first()
            
            if keyword_match:
                return keyword_match.answer
    
    # If still no match, use the default response based on assistant specialty
    if assistant.specialty == "sales":
        default_responses = [
            "I can help you manage your sales pipeline effectively. Would you like me to show you our sales strategies?",
            "Our latest analytics show a 15% increase in conversion rates when using our recommended follow-up sequence.",
            "As your sales assistant, I'm here to help you close more deals. What specific sales challenge are you facing today?"
        ]
    elif assistant.specialty == "customer_service":
        default_responses = [
            "I understand you're looking for assistance. Let me help you resolve your issue quickly. Could you provide more details?",
            "I can help with customer inquiries and support tickets. What specific customer issue are you dealing with?",
            "I'm your customer service assistant. How can I help improve your customer's experience today?"
        ]
    elif assistant.specialty == "data_analysis":
        default_responses = [
            "I can generate detailed reports and analytics. Would you like me to prepare a performance report for you?",
            "Based on current data, I'm seeing interesting trends in your business metrics. Would you like me to provide a detailed analysis?",
            "As your data analysis assistant, I can help you uncover insights from your business data. What would you like to analyze today?"
        ]
    elif assistant.specialty == "task_management":
        default_responses = [
            "I can help you manage your tasks efficiently. Would you like me to prioritize your current tasks or help you create new ones?",
            "I'll help you keep track of your deadlines. Let me check your upcoming due dates and send you a reminder.",
            "I'm your task management assistant. How can I help you stay organized and productive today?"
        ]
    elif assistant.specialty == "financial":
        default_responses = [
            "I can help with financial management. Would you like me to generate a new report or check the status of your accounts?",
            "Let me help you track expenses and manage your budget. I can provide a breakdown of your current spending categories.",
            "As your financial assistant, I can help with invoicing, expense tracking, and financial reporting. What financial task can I assist with today?"
        ]
    elif assistant.specialty == "product_management":
        default_responses = [
            "I can help you manage your inventory. Would you like me to check current stock levels or help with reordering?",
            "I can provide detailed information about your products. Which product would you like to know more about?",
            "I'm your product management assistant. How can I help you manage your products and inventory today?"
        ]
    elif assistant.specialty == "marketing":
        default_responses = [
            "I can help you plan and analyze marketing campaigns. Would you like to review current campaign performance or plan a new promotion?",
            "I can assist with your marketing strategy and content planning. Would you like me to suggest content ideas based on current trends?",
            "As your marketing assistant, I can help with campaigns, content, and customer engagement strategies. What marketing challenge are you facing today?"
        ]
    else:
        default_responses = [
            "I'm here to assist you with your business needs. How can I help you today?",
            "I'd be happy to help you with that. Could you provide more details about what you're looking for?",
            "I'm your AI assistant. I can help with various tasks across your business. What would you like assistance with today?"
        ]
    
    # Return a random default response
    return random.choice(default_responses)

# Rename a conversation
@assistants_bp.route('/conversations/<int:conversation_id>', methods=['PUT'])
@jwt_required()
def update_conversation(conversation_id):
    current_user_id = get_jwt_identity()
    
    conversation = Conversation.query.get(conversation_id)
    if not conversation:
        return jsonify({'message': 'Conversation not found'}), 404
    
    # Check if user owns this conversation
    if conversation.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    if 'title' in data:
        conversation.title = data['title']
        db.session.commit()
    
    return jsonify({
        'message': 'Conversation updated',
        'conversation': conversation.to_dict()
    }), 200

# Delete a conversation
@assistants_bp.route('/conversations/<int:conversation_id>', methods=['DELETE'])
@jwt_required()
def delete_conversation(conversation_id):
    current_user_id = get_jwt_identity()
    
    conversation = Conversation.query.get(conversation_id)
    if not conversation:
        return jsonify({'message': 'Conversation not found'}), 404
    
    # Check if user owns this conversation
    if conversation.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    # Delete all messages in the conversation
    Message.query.filter_by(conversation_id=conversation_id).delete()
    
    # Delete the conversation
    db.session.delete(conversation)
    db.session.commit()
    
    return jsonify({'message': 'Conversation deleted successfully'}), 200

# Get training data for an assistant (admin only)
@assistants_bp.route('/training-data/<string:assistant_name>', methods=['GET'])
@jwt_required()
def get_training_data(assistant_name):
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    # Select the appropriate training data table
    if assistant_name.lower() == "julia":
        training_data = JuliaTrainingData
    elif assistant_name.lower() == "joce":
        training_data = JoceTrainingData
    elif assistant_name.lower() == "brayan":
        training_data = BrayanTrainingData
    elif assistant_name.lower() == "quim" or assistant_name.lower() == "raizen":
        training_data = RaizenTrainingData
    elif assistant_name.lower() == "sales":
        training_data = SalesAssistantTrainingData
    elif assistant_name.lower() == "support":
        training_data = SupportAssistantTrainingData
    elif assistant_name.lower() == "finance":
        training_data = FinanceAssistantTrainingData
    elif assistant_name.lower() == "marketing":
        training_data = MarketingAssistantTrainingData
    elif assistant_name.lower() == "product":
        training_data = ProductAssistantTrainingData
    elif assistant_name.lower() == "analytics":
        training_data = AnalyticsAssistantTrainingData
    else:
        return jsonify({'message': 'Invalid assistant name'}), 400
    
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    # Get training data with pagination
    data = training_data.query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'training_data': [item.to_dict() for item in data.items],
        'total': data.total,
        'pages': data.pages,
        'current_page': data.page
    }), 200

# Add training data for an assistant (admin only)
@assistants_bp.route('/training-data/<string:assistant_name>', methods=['POST'])
@jwt_required()
def add_training_data(assistant_name):
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    if not data or not data.get('question') or not data.get('answer'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Select the appropriate training data table
    if assistant_name.lower() == "julia":
        training_data_class = JuliaTrainingData
    elif assistant_name.lower() == "joce":
        training_data_class = JoceTrainingData
    elif assistant_name.lower() == "brayan":
        training_data_class = BrayanTrainingData
    elif assistant_name.lower() == "quim" or assistant_name.lower() == "raizen":
        training_data_class = RaizenTrainingData
    elif assistant_name.lower() == "sales":
        training_data_class = SalesAssistantTrainingData
    elif assistant_name.lower() == "support":
        training_data_class = SupportAssistantTrainingData
    elif assistant_name.lower() == "finance":
        training_data_class = FinanceAssistantTrainingData
    elif assistant_name.lower() == "marketing":
        training_data_class = MarketingAssistantTrainingData
    elif assistant_name.lower() == "product":
        training_data_class = ProductAssistantTrainingData
    elif assistant_name.lower() == "analytics":
        training_data_class = AnalyticsAssistantTrainingData
    else:
        return jsonify({'message': 'Invalid assistant name'}), 400
    
    # Create new training data entry
    training_data = training_data_class(
        question=data['question'],
        answer=data['answer'],
        category=data.get('category', ''),
        confidence=data.get('confidence', 1.0),
        is_approved=data.get('is_approved', True)
    )
    
    db.session.add(training_data)
    db.session.commit()
    
    logger.info(f"New training data added for {assistant_name} by user {current_user_id}")
    
    return jsonify({
        'message': 'Training data added successfully',
        'training_data': training_data.to_dict()
    }), 201

# Update training data (admin only)
@assistants_bp.route('/training-data/<string:assistant_name>/<int:data_id>', methods=['PUT'])
@jwt_required()
def update_training_data(assistant_name, data_id):
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    # Select the appropriate training data table
    if assistant_name.lower() == "julia":
        training_data_class = JuliaTrainingData
    elif assistant_name.lower() == "joce":
        training_data_class = JoceTrainingData
    elif assistant_name.lower() == "brayan":
        training_data_class = BrayanTrainingData
    elif assistant_name.lower() == "quim" or assistant_name.lower() == "raizen":
        training_data_class = RaizenTrainingData
    elif assistant_name.lower() == "sales":
        training_data_class = SalesAssistantTrainingData
    elif assistant_name.lower() == "support":
        training_data_class = SupportAssistantTrainingData
    elif assistant_name.lower() == "finance":
        training_data_class = FinanceAssistantTrainingData
    elif assistant_name.lower() == "marketing":
        training_data_class = MarketingAssistantTrainingData
    elif assistant_name.lower() == "product":
        training_data_class = ProductAssistantTrainingData
    elif assistant_name.lower() == "analytics":
        training_data_class = AnalyticsAssistantTrainingData
    else:
        return jsonify({'message': 'Invalid assistant name'}), 400
    
    training_data = training_data_class.query.get(data_id)
    
    if not training_data:
        return jsonify({'message': 'Training data not found'}), 404
    
    data = request.get_json()
    
    # Update training data fields
    if 'question' in data:
        training_data.question = data['question']
    
    if 'answer' in data:
        training_data.answer = data['answer']
    
    if 'category' in data:
        training_data.category = data['category']
    
    if 'confidence' in data:
        training_data.confidence = data['confidence']
    
    if 'is_approved' in data:
        training_data.is_approved = data['is_approved']
    
    db.session.commit()
    
    logger.info(f"Training data {data_id} updated for {assistant_name} by user {current_user_id}")
    
    return jsonify({
        'message': 'Training data updated successfully',
        'training_data': training_data.to_dict()
    }), 200

# Delete training data (admin only)
@assistants_bp.route('/training-data/<string:assistant_name>/<int:data_id>', methods=['DELETE'])
@jwt_required()
def delete_training_data(assistant_name, data_id):
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    # Select the appropriate training data table
    if assistant_name.lower() == "julia":
        training_data_class = JuliaTrainingData
    elif assistant_name.lower() == "joce":
        training_data_class = JoceTrainingData
    elif assistant_name.lower() == "brayan":
        training_data_class = BrayanTrainingData
    elif assistant_name.lower() == "quim" or assistant_name.lower() == "raizen":
        training_data_class = RaizenTrainingData
    elif assistant_name.lower() == "sales":
        training_data_class = SalesAssistantTrainingData
    elif assistant_name.lower() == "support":
        training_data_class = SupportAssistantTrainingData
    elif assistant_name.lower() == "finance":
        training_data_class = FinanceAssistantTrainingData
    elif assistant_name.lower() == "marketing":
        training_data_class = MarketingAssistantTrainingData
    elif assistant_name.lower() == "product":
        training_data_class = ProductAssistantTrainingData
    elif assistant_name.lower() == "analytics":
        training_data_class = AnalyticsAssistantTrainingData
    else:
        return jsonify({'message': 'Invalid assistant name'}), 400
    
    training_data = training_data_class.query.get(data_id)
    
    if not training_data:
        return jsonify({'message': 'Training data not found'}), 404
    
    db.session.delete(training_data)
    db.session.commit()
    
    logger.info(f"Training data {data_id} deleted for {assistant_name} by user {current_user_id}")
    
    return jsonify({'message': 'Training data deleted successfully'}), 200