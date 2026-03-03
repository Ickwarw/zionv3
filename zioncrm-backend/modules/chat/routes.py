from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.chat import ChatChannel, ChatMessage, ChatContact, ChatTag
from extensions import db, socketio
from sqlalchemy import func, case, and_
from modules.chat.facebook_utils import send_facebook_message, get_facebook_user_profile, send_facebook_group_options, get_facebook_verify_token
from modules.chat.instagram_utils import send_instagram_message, send_instagram_group_options, get_instagram_verify_token
from modules.chat.whatsapp_utils import send_whatsapp_message, send_whatsapp_group_options, get_whatsapp_verify_token
from flask_socketio import emit, join_room, leave_room
import logging
from datetime import datetime
import requests
import json
import base64
import hmac
import hashlib

chat_bp = Blueprint('chat', __name__)
logger = logging.getLogger(__name__)

# PAGE_TOKEN = "EAA8RW1slgsQBQa1Kf0od3pwAZCaPa0glABrHeiE3iEytW93d8A9vc6lpqbQaZCaWrDW0YBAu32bZCKkchZCjMCd8pZAFKZCSC4ZCruipVVw2ZCTSoxnJffAkjcbKb7udZAA6qfL0ca8WX0gbZA0IDjlIWdrvzlRpdLb4g3noyl1w4jxyFDiiePJBeNOOEAJZBYfMc4O3ZA5xVNe9eSWfJbJnAF4ptSfazAZDZD"
# APP_SECRET="7d5696f4a5d4cb00d18dea698f716789"
# VALIDATION_TOKEN = "vO2gvBYr0U1iZgW8ITAu28k30bLae1JUd5PueBrBXgH4YFyvsXSFk0smCuMoIaFkC"

@chat_bp.route('/channels', methods=['GET'])
@jwt_required()
def get_channels():
    current_user_id = get_jwt_identity()
    
    channels = ChatChannel.query.filter_by(user_id=current_user_id).all()
    
    return jsonify({
        'channels': [channel.to_dict() for channel in channels]
    }), 200

@chat_bp.route('/channels-pending', methods=['GET'])
@jwt_required()
def get_channels_pending():
    
    channels = ChatChannel.query.filter_by(user_id=None).all()
    
    return jsonify({
        'channels': [channel.to_dict() for channel in channels]
    }), 200

@chat_bp.route('/channels-rating', methods=['GET'])
@jwt_required()
def get_channels_rating():
    
    channels = (
        db.session.query(ChatChannel)
        .filter(ChatChannel.ratings.any())
        .all()
    )
    
    return jsonify({
        'channels': [channel.to_dict() for channel in channels]
    }), 200



@chat_bp.route('/channels-status', methods=['GET'])
@jwt_required()
def get_channels_status():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    status = request.args.get('status', type=str)

    user_group_ids = [group.id for group in user.groups]

    base_query = ChatChannel.query.filter(
        ChatChannel.user_group_id.in_(user_group_ids),
        ChatChannel.channel_mode == 'contact'
    )

    if status:
        status = status.lower()

        # PENDING → mantém regra atual
        if status == 'pending':
            base_query = base_query.filter(ChatChannel.user_id == None)

        else:
            base_query = base_query.filter(
                ChatChannel.user_id == current_user_id,
                ChatChannel.status == status
            )

            # ✅ REGRA ESPECIAL PARA COMPLETED
            if status == 'completed':
                last_channel_subquery = (
                    db.session.query(
                        ChatChannel.contact_id,
                        func.max(ChatChannel.created_at).label('max_created_at')
                    )
                    .filter(ChatChannel.status == 'completed')
                    .group_by(ChatChannel.contact_id)
                    .subquery()
                )

                base_query = (
                    base_query
                    .join(
                        last_channel_subquery,
                        and_(
                            ChatChannel.contact_id == last_channel_subquery.c.contact_id,
                            ChatChannel.created_at == last_channel_subquery.c.max_created_at
                        )
                    )
                )

    channels = base_query.all()
    print('channels', channels)
    return jsonify({
        'channels': [channel.to_dict() for channel in channels]
    }), 200

@chat_bp.route('/channels-groups', methods=['GET'])
@jwt_required()
def get_channels_groups():
    current_user_id = get_jwt_identity()
    query = ChatChannel.query.filter(
        ChatChannel.channel_mode == 'group'
    )
    query = query.filter(ChatChannel.status == 'in_progress')
    channels = query.all()

    return jsonify({
        'channels': [channel.to_dict() for channel in channels]
    }), 200

@chat_bp.route('/channels-users', methods=['GET'])
@jwt_required()
def get_channels_users():
    current_user_id = get_jwt_identity()
    query = ChatChannel.query.filter(
        ChatChannel.channel_mode == 'user'
    )
    query = query.filter(ChatChannel.status == 'in_progress')
    channels = query.all()

    return jsonify({
        'channels': [channel.to_dict() for channel in channels]
    }), 200    


@chat_bp.route('/unread', methods=['GET'])
@jwt_required()
def get_unreads():
    current_user_id = get_jwt_identity()
    result = (
        db.session.query(
            func.sum(
                case(
                    (
                        (ChatMessage.is_read == False) & (ChatChannel.user_id == current_user_id),
                        1
                    ),
                    else_=0,
                )
            ).label("my_channels"),
            func.sum(
                case(
                    (
                        (ChatMessage.is_read == False) & (ChatChannel.ratings.any()),
                        1
                    ),
                    else_=0,
                )
            ).label("rating"),
            func.sum(
                case(
                    (
                        (ChatMessage.is_read == False) & (ChatChannel.user_id == None),
                        1
                    ),
                    else_=0,
                )
            ).label("pending"),
        )
        .join(ChatChannel)
        .one()
    )
    
    return jsonify({
            'unreads': {
                "my-channels": int(result.my_channels or 0),
                "rating": int(result.rating or 0),
                "pending": int(result.pending or 0),
            }
    }), 200


@chat_bp.route('/channels/<int:channel_id>', methods=['GET'])
@jwt_required()
def get_channel(channel_id):
    current_user_id = get_jwt_identity()
    
    channel = ChatChannel.query.get(channel_id)
    
    if not channel:
        return jsonify({'message': 'Channel not found'}), 404

    
    return jsonify(channel.to_dict()), 200


@chat_bp.route('/channels/<int:channel_id>/assume', methods=['PUT'])
@jwt_required()
def assume_channel(channel_id):
    current_user_id = get_jwt_identity()
    
    channel = ChatChannel.query.get(channel_id)
    
    if not channel:
        return jsonify({'message': 'Channel not found'}), 404
    
    if channel.user_id != None:
        user = User.query.get(channel.user_id)
        return jsonify({'message': f'Chat já assumido por {user.full_name}'}), 403
    
    channel.user_id = current_user_id
    channel.status = 'in_progress'
    db.session.commit()
    
    return jsonify(channel.to_dict()), 200    


@chat_bp.route('/channels/<int:channel_id>/transfer', methods=['PUT'])
@jwt_required()
def transfer_channel(channel_id):
    current_user_id = get_jwt_identity()
    
    channel = ChatChannel.query.get(channel_id)
    
    if not channel:
        return jsonify({'message': 'Channel not found'}), 404
    
    data = request.get_json()
    
    channel.user_id = None
    channel.user_group_id = data['groupId']
    db.session.commit()
    
    return jsonify(channel.to_dict()), 200


@chat_bp.route('/channels/<int:channel_id>/finish', methods=['PUT'])
@jwt_required()
def finish_channel(channel_id):
    current_user_id = get_jwt_identity()
    
    channel = ChatChannel.query.get(channel_id)
    
    if not channel:
        return jsonify({'message': 'Channel not found'}), 404
    
    channel.status = 'completed'
    channel.finished_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(channel.to_dict()), 200    


#------------------ TAGS ------------------#

@chat_bp.route('/channels/tags', methods=['GET'])
@jwt_required()
def get_tags():

    tags = ChatTag.query.all()

    return jsonify({
        'tags': [tag.to_dict() for tag in tags]
    }), 200

@chat_bp.route('/channels/tags', methods=['POST'])
@jwt_required()
def add_tag():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    tag = ChatTag(
        name=data['name'],
        color=data['color']
    )
    
    db.session.add(tag)
    db.session.commit()
    
    logger.info(f"New tag created: {tag.name} by user {current_user_id}")
    
    return jsonify({'message': 'Tag created successfully', 'tag': tag.to_dict()}), 201


@chat_bp.route('/channels/<int:channel_id>/tags', methods=['GET'])
@jwt_required()
def get_channel_tags(channel_id):
    current_user_id = get_jwt_identity()

    channel = ChatChannel.query.filter_by(
        id=channel_id,
    ).first()

    if not channel:
        return jsonify({'error': 'Channel not found'}), 404

    return jsonify({
        'channel_id': channel.id,
        'tags': [tag.to_dict() for tag in channel.tags]
    }), 200

@chat_bp.route('/channels/<int:channel_id>/tags', methods=['POST'])
@jwt_required()
def add_tag_to_channel(channel_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()

    tag_id = data.get('tag_id')
    if not tag_id:
        return jsonify({'error': 'tag_id is required'}), 400

    channel = ChatChannel.query.filter_by(
        id=channel_id,
    ).first()

    if not channel:
        return jsonify({'error': 'Channel not found'}), 404

    tag = ChatTag.query.filter_by(id=tag_id).first()
    if not tag:
        return jsonify({'error': 'Tag not found'}), 404

    if tag in channel.tags:
        return jsonify({'message': 'Tag already added'}), 200

    channel.tags.append(tag)
    db.session.commit()

    return jsonify({
        'message': 'Tag added',
        'tags': [t.to_dict() for t in channel.tags]
    }), 200

@chat_bp.route('/channels/<int:channel_id>/tags/<int:tag_id>', methods=['DELETE'])
@jwt_required()
def remove_tag_from_channel(channel_id, tag_id):
    current_user_id = get_jwt_identity()

    channel = ChatChannel.query.filter_by(
        id=channel_id,
        user_id=current_user_id
    ).first()

    if not channel:
        return jsonify({'error': 'Channel not found'}), 404

    tag = ChatTag.query.filter_by(id=tag_id).first()
    if not tag:
        return jsonify({'error': 'Tag not found'}), 404

    if tag not in channel.tags:
        return jsonify({'message': 'Tag not associated with this channel'}), 400

    channel.tags.remove(tag)
    db.session.commit()

    return jsonify({
        'message': 'Tag removed',
        'tags': [t.to_dict() for t in channel.tags]
    }), 200

@chat_bp.route('/channels/<int:channel_id>/observation', methods=['PUT'])
@jwt_required()
def update_channel_observation(channel_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()

    observation = data.get('observation')
    if not observation:
        return jsonify({'error': 'observation is required'}), 400

    channel = ChatChannel.query.filter_by(
        id=channel_id,
    ).first()

    if not channel:
        return jsonify({'error': 'Channel not found'}), 404

    channel.observation = observation
    db.session.commit()

    return jsonify({
        'message': 'Observation Updated',
        'observation': channel.observation
    }), 200

#------------------- MESSAGES ------------------#
@chat_bp.route('/channels/<int:channel_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(channel_id):
    current_user_id = get_jwt_identity()
    
    channel = ChatChannel.query.get(channel_id)
    
    if not channel:
        return jsonify({'message': 'Channel not found'}), 404
    
    # Check if user has access to this channel
    # if channel.user_id != current_user_id:
    #     return jsonify({'message': 'Unauthorized access'}), 403
    
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    # Get messages with pagination
    messages = ChatMessage.query.filter_by(
        channel_id=channel_id
    ).order_by(ChatMessage.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'messages': [message.to_dict() for message in messages.items],
        'total': messages.total,
        'pages': messages.pages,
        'current_page': messages.page
    }), 200


@chat_bp.route('/channels/<int:channel_id>/messages', methods=['POST'])
@jwt_required()
def send_message(channel_id):
    current_user_id = get_jwt_identity()
    
    channel = ChatChannel.query.get(channel_id)
    
    if not channel:
        return jsonify({'message': 'Channel not found'}), 404
    
    
    if channel.channel_mode == 'contact' and channel.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    if not data or not data.get('content'):
        return jsonify({'message': 'Missing message content'}), 400
    
    
    message = ChatMessage(
        channel_id=channel_id,
        user_id=current_user_id,
        content=data['content'],
        is_from_user=True
    )
    
    db.session.add(message)
    db.session.commit()
    
    
    socketio.emit('new_message', message.to_dict(), room=channel_id)
    
    
    if channel.channel_type in ['facebook', 'whatsapp', 'instagram']:
        send_to_social_media(channel, message)
    
    return jsonify(message.to_dict()), 201


def send_to_social_media(channel, message):
    
    if channel.channel_type == 'facebook':
        logger.info(f"Sending message to Facebook: {message.content}")
        send_facebook_message(channel.external_id, message.content)
    
    elif channel.channel_type == 'whatsapp':
        logger.info(f"Sending message to WhatsApp: {message.content}")
        if channel.contact != None and channel.contact.phone != None:
            send_whatsapp_message(channel.external_id, channel.contact.phone ,message.content)

    elif channel.channel_type == 'instagram':
        logger.info(f"Sending message to Instagram: {message.content}")
        send_instagram_message(channel.external_id, message.content)
        

@chat_bp.route('/contacts', methods=['GET'])
@jwt_required()
def get_contacts():
    current_user_id = get_jwt_identity()
    
    contacts = ChatContact.query.filter_by(user_id=current_user_id).all()
    
    return jsonify({
        'contacts': [contact.to_dict() for contact in contacts]
    }), 200


@chat_bp.route('/contacts', methods=['POST'])
@jwt_required()
def add_contact():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('contact_type'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    
    contact = ChatContact(
        user_id=current_user_id,
        name=data['name'],
        contact_type=data['contact_type'],
        contact_id=data.get('contact_id', ''),
        phone=data.get('phone', ''),
        email=data.get('email', ''),
        profile_picture=data.get('profile_picture', '')
    )
    
    db.session.add(contact)
    db.session.commit()
    
    return jsonify({
        'message': 'Contact added successfully',
        'contact': contact.to_dict()
    }), 201


@chat_bp.route('/contacts/<int:contact_id>', methods=['PUT'])
@jwt_required()
def update_contact(contact_id):
    current_user_id = get_jwt_identity()
    
    contact = ChatContact.query.get(contact_id)
    
    if not contact:
        return jsonify({'message': 'Contact not found'}), 404
    
    
    if contact.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    
    if 'name' in data:
        contact.name = data['name']
    
    if 'contact_type' in data:
        contact.contact_type = data['contact_type']
    
    if 'contact_id' in data:
        contact.contact_id = data['contact_id']
    
    if 'phone' in data:
        contact.phone = data['phone']
    
    if 'email' in data:
        contact.email = data['email']
    
    if 'profile_picture' in data:
        contact.profile_picture = data['profile_picture']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Contact updated successfully',
        'contact': contact.to_dict()
    }), 200


@chat_bp.route('/contacts/<int:contact_id>', methods=['DELETE'])
@jwt_required()
def delete_contact(contact_id):
    current_user_id = get_jwt_identity()
    
    contact = ChatContact.query.get(contact_id)
    
    if not contact:
        return jsonify({'message': 'Contact not found'}), 404
    
    
    if contact.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    db.session.delete(contact)
    db.session.commit()
    
    return jsonify({'message': 'Contact deleted successfully'}), 200


@chat_bp.route('/contacts/<int:contact_id>/timeline', methods=['GET'])
@jwt_required()
def get_contact_messages_timeline(contact_id):
    current_user_id = get_jwt_identity()

    # (Opcional) validar se o contato existe
    contact = ChatContact.query.get(contact_id)
    if not contact:
        return jsonify({'message': 'Contact not found'}), 404

    # Paginação
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)

    # Query com JOIN
    messages = (
        ChatMessage.query
        .join(ChatChannel, ChatMessage.channel_id == ChatChannel.id)
        .filter(ChatChannel.contact_id == contact_id)
        .order_by(ChatMessage.created_at.desc())
        .paginate(page=page, per_page=per_page)
    )

    return jsonify({
        'messages': [message.to_dict() for message in messages.items],
        'total': messages.total,
        'pages': messages.pages,
        'current_page': messages.page
    }), 200    


@socketio.on('join')
def on_join(data):
    # current_user_id = get_jwt_identity()
    print('on_join', data)
    if 'channel_id' not in data:
        return
    
    channel_id = data['channel_id']
    user_id = data['user_id']
    channel = ChatChannel.query.get(channel_id)
    
    # if not channel or channel.user_id != current_user_id:
    #     return
    
    join_room(f'channel_{channel_id}')
    emit('status', {'message': f'User {user_id} has joined the channel'}, room=f'channel_{channel_id}')


@socketio.on('leave')
def on_leave(data):
    # current_user_id = get_jwt_identity()
    print('on_leave', data)
    if 'channel_id' not in data:
        return
    
    channel_id = data['channel_id']
    user_id = data['user_id']
    leave_room(f'channel_{channel_id}')
    emit('status', {'message': f'User {user_id} has left the channel'}, room=f'channel_{channel_id}')

@chat_bp.route('/webhook', methods=['GET'])
def check_webhook():
    mode = request.args.get("hub.mode")
    token = request.args.get("hub.verify_token")
    challenge = request.args.get("hub.challenge")

    if mode == "subscribe" and token == get_facebook_verify_token():
        return challenge, 200

    return "Token inválido", 403

@chat_bp.route('/webhook', methods=['POST'])
def webhook():
    data = request.get_json()
    print(data)
    if data['object'] == 'page':
        for entry in data['entry']:
            for messaging_event in entry.get('messaging', []):
                channel = None
                if 'message' in messaging_event:
                    message = messaging_event['message']
                    sender_id = messaging_event['sender']['id'] 
                    message_text = messaging_event['message'].get('text', '')
                    if 'quick_reply' in message:
                        # Ignora postbacks por enquanto
                        group_id =  message['quick_reply'].get("payload").replace('GROUP_', '')
                        channel = process_incoming_postback('facebook', sender_id, group_id)                    
                    else:
                        # Processa a mensagem recebida
                        channel, message = process_incoming_message('facebook', sender_id, message_text)
                if channel:
                    socketio.emit(
                        'new_message',
                        {
                            'channel_id': channel.id,
                        },
                        room=f'channel_{channel.id}'
                    )

    return jsonify({'status': 'success'}), 200


@chat_bp.route('/instagram-webhook', methods=['GET'])
def check_instagram_webhook():
    mode = request.args.get("hub.mode")
    token = request.args.get("hub.verify_token")
    challenge = request.args.get("hub.challenge")

    if mode == "subscribe" and token == get_instagram_verify_token():
        return challenge, 200

    return "Token inválido", 403

@chat_bp.route('/instagram-webhook', methods=['POST'])
def instagram_webhook():
    data = request.get_json()
    print(data)
    for entry in data.get("entry", []):
        for messaging_event in entry.get("messaging", []):
            sender_id = messaging_event.get("sender", {}).get("id")
            channel = None
            if "message" in messaging_event:
                message = messaging_event["message"]
                text = message.get("text")
                if 'quick_reply' in message:
                        # Ignora postbacks por enquanto
                    group_id =  message['quick_reply'].get("payload").replace('GROUP_', '')
                    channel = process_incoming_postback('instagram', sender_id, group_id)                    
                else:
                    # Processa a mensagem recebida
                    channel, message = process_incoming_message('instagram', sender_id, text)
                if channel:
                    socketio.emit(
                        'new_message',
                        {
                            'channel_id': channel.id,
                        },
                        room=f'channel_{channel.id}'
                    )
    return jsonify({'status': 'success'}), 200


@chat_bp.route('/whatsapp-webhook', methods=['GET'])
def check_whatsapp_webhook():
    mode = request.args.get("hub.mode")
    token = request.args.get("hub.verify_token")
    challenge = request.args.get("hub.challenge")

    if mode == "subscribe" and token == get_whatsapp_verify_token():
        return challenge, 200

    return "Token inválido", 403

@chat_bp.route('/whatsapp-webhook', methods=['POST'])
def whatsapp_webhook():
    data = request.get_json()
    print(data)

    for entry in data.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})

            messages = value.get("messages", [])
            metadata = value.get("metadata", {})

            phone_number_id = metadata.get("phone_number_id")

            for message in messages:
                from_number = message.get("from")
                msg_type = message.get("type")

                if msg_type == "text":
                    text = message["text"]["body"]
                    channel, message = process_incoming_message('whatsapp', phone_number_id, text, from_number)
                elif msg_type == "interactive":
                    reply = message["interactive"]["button_reply"]
                    group_id = reply["id"].replace('GROUP_', '')
                    channel = process_incoming_postback('whatsapp', phone_number_id, group_id, from_number)  
 
                if channel:
                    socketio.emit(
                        'new_message',
                        {
                            'channel_id': channel.id,
                        },
                        room=f'channel_{channel.id}'
                        )
    return jsonify({'status': 'success'}), 200

def process_incoming_postback(platform, sender_id, group_id, phone_number=None):
    print(f"Processing postback from {platform} sender {sender_id}: {group_id}")
    channel = ChatChannel.query.filter_by(
        channel_type=platform,
        external_id=sender_id
    ).first()
    if channel:
        channel.user_group_id = group_id
        db.session.commit()
        msg =  "Seu atendimento está sendo encaminhado para o setor, você será atendido em instantes."
        if platform == "facebook":
            send_facebook_message(sender_id, msg)
        elif platform == "instagram":
            send_instagram_message(sender_id, msg)
        elif platform == "whatsapp":
            send_whatsapp_message(sender_id, channel.contact.phone, msg)
        return channel
    else:
        msg = "Opção inválida. Por favor, selecione um setor válido."
        print("Opção inválida ou canal não encontrado.")
        if platform == "facebook":
            send_facebook_message(sender_id, msg)
            send_facebook_group_options(sender_id)
        elif platform == "instagram":
            send_instagram_message(sender_id, msg)
            send_instagram_group_options(sender_id)
        elif platform == "whatsapp":
            send_whatsapp_message(sender_id, phone_number, msg)
            send_whatsapp_group_options(sender_id, phone_number)
        


def process_incoming_message(platform, sender_id, message_content, phone_number=None):
    print(f"Processing message from {platform} sender {sender_id}: {message_content}")
    channel = ChatChannel.query.filter_by(
        channel_type=platform,
        external_id=sender_id
    ).first()
    if not channel:
        print("Channel not found, creating new channel and contact.")
        contact = ChatContact.query.filter_by(
            contact_type=platform,
            contact_id=sender_id
        ).first()
        user_profile = None
        if platform == "facebook":
            user_profile = get_facebook_user_profile(sender_id)
        if contact == None:
            
            contact = ChatContact(
                user_id=None,
                name= f"{user_profile['first_name']} {user_profile['last_name']}" if user_profile != None else sender_id,
                contact_type=platform,
                contact_id=sender_id,
                phone=phone_number,
                profile_picture=user_profile.get('profile_pic', '') if user_profile != None else None
            )
            db.session.add(contact)
            db.session.commit()
        
        channel = ChatChannel(
            channel_type=platform,
            external_id=sender_id,
            status='pending',
            channel_mode= 'contact',
            contact_id=contact.id if contact else None,
            last_message=message_content,
            last_message_time=datetime.utcnow(),
            name=f"{user_profile['first_name']} {user_profile['last_name']}" if user_profile != None else sender_id
        )
        db.session.add(channel)
        db.session.commit()
        if platform == "facebook":
            send_facebook_group_options(sender_id)
        elif platform == "instagram":
            send_instagram_group_options(sender_id)

    print("Creating message record.")
    message = ChatMessage(
            channel_id=channel.id,
            content=message_content,
            is_from_user=False,
            created_at=datetime.utcnow()
    )
    db.session.add(message)
    db.session.commit()
    channel.last_message = message_content
    db.session.commit()
    return channel, message

@chat_bp.route('/deletion', methods=['POST'])
def deletion_request():
    signed_data = request.get_json()
    signed_request = signed_data['signed_request']
    data = parse_signed_request(signed_request)
    status_url = 'https://zioncrm.acenotelecom.com.br/app/api/chat/deletion?id=yKdY6vRW4yP8AyP1W23ay'
    confirmation_code = 'yKdY6vRW4yP8AyP1W23ay'

    return jsonify({'status_url': status_url, 'confirmation_code': confirmation_code}), 200

@chat_bp.route('/deletion', methods=['GET'])
def deletion_confirmation():
    data = request.get_json()
    confirmation_code = data['id']
    if confirmation_code == 'yKdY6vRW4yP8AyP1W23ay':
        return 200
    else:
        return 406


def parse_signed_request(signed_request: str):
    try:
        encoded_sig, payload = signed_request.split('.', 1)
    except ValueError:
        logging.error("Invalid signed_request format")
        return None

    secret = b"appsecret"  # Use seu app secret aqui (bytes)

    # Decode
    sig = base64_url_decode(encoded_sig)
    data = json.loads(base64_url_decode(payload).decode("utf-8"))

    # Gera assinatura esperada (raw bytes, igual ao PHP)
    expected_sig = hmac.new(
        secret,
        payload.encode("utf-8"),
        hashlib.sha256
    ).digest()

    # Comparação segura
    if not hmac.compare_digest(sig, expected_sig):
        logging.error("Bad Signed JSON signature!")
        return None

    return data

def base64_url_decode(data: str) -> bytes:
    # Ajusta padding do Base64 URL-safe
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)
