from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.voip import CallLog, VoipExtension, VoipContact
from extensions import db, socketio
from flask_socketio import emit
import logging
from datetime import datetime
import time
import uuid

voip_bp = Blueprint('voip', __name__)
logger = logging.getLogger(__name__)

# Get user's VoIP extension
@voip_bp.route('/extension', methods=['GET'])
@jwt_required()
def get_extension():
    current_user_id = get_jwt_identity()
    
    extension = VoipExtension.query.filter_by(user_id=current_user_id).first()
    
    if not extension:
        return jsonify({'message': 'No extension found for this user'}), 404
    
    return jsonify(extension.to_dict()), 200

# Create or update user's VoIP extension
@voip_bp.route('/extension', methods=['POST'])
@jwt_required()
def create_extension():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('extension_number'):
        return jsonify({'message': 'Missing extension number'}), 400
    
    # Check if extension already exists
    extension = VoipExtension.query.filter_by(user_id=current_user_id).first()
    
    if extension:
        # Update existing extension
        extension.extension_number = data['extension_number']
        extension.password = data.get('password', extension.password)
        extension.display_name = data.get('display_name', extension.display_name)
        extension.sip_server = data.get('sip_server', extension.sip_server)
    else:
        # Create new extension
        extension = VoipExtension(
            user_id=current_user_id,
            extension_number=data['extension_number'],
            password=data.get('password', ''),
            display_name=data.get('display_name', ''),
            sip_server=data.get('sip_server', '')
        )
        db.session.add(extension)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Extension saved successfully',
        'extension': extension.to_dict()
    }), 200

# Get call logs
@voip_bp.route('/calls', methods=['GET'])
@jwt_required()
def get_call_logs():
    current_user_id = get_jwt_identity()
    
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Get call direction filter
    direction = request.args.get('direction')
    
    query = CallLog.query.filter_by(user_id=current_user_id)
    
    if direction:
        query = query.filter_by(direction=direction)
    
    call_logs = query.order_by(CallLog.start_time.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'calls': [call.to_dict() for call in call_logs.items],
        'total': call_logs.total,
        'pages': call_logs.pages,
        'current_page': call_logs.page
    }), 200

# Get a specific call log
@voip_bp.route('/calls/<int:call_id>', methods=['GET'])
@jwt_required()
def get_call_log(call_id):
    current_user_id = get_jwt_identity()
    
    call = CallLog.query.get(call_id)
    
    if not call:
        return jsonify({'message': 'Call log not found'}), 404
    
    # Check if user has access to this call log
    if call.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    return jsonify(call.to_dict()), 200

# Initiate a call
@voip_bp.route('/call', methods=['POST'])
@jwt_required()
def initiate_call():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('phone_number'):
        return jsonify({'message': 'Missing phone number'}), 400
    
    # In a real implementation, this would initiate a SIP call
    # For now, we'll just create a call log
    
    call_id = str(uuid.uuid4())
    
    # Create call log
    call = CallLog(
        user_id=current_user_id,
        call_id=call_id,
        phone_number=data['phone_number'],
        direction='outbound',
        start_time=datetime.utcnow(),
        status='initiating'
    )
    
    db.session.add(call)
    db.session.commit()
    
    # Emit call initiation event via WebSocket
    socketio.emit('call_status', {
        'call_id': call_id,
        'status': 'initiating',
        'phone_number': data['phone_number']
    }, room=f'user_{current_user_id}')
    
    # Simulate call connection (in a real implementation, this would be handled by SIP events)
    def connect_call():
        time.sleep(2)  # Simulate connection delay
        
        call.status = 'connected'
        call.connect_time = datetime.utcnow()
        db.session.commit()
        
        socketio.emit('call_status', {
            'call_id': call_id,
            'status': 'connected',
            'phone_number': data['phone_number']
        }, room=f'user_{current_user_id}')
    
    # Start the call connection process in a background thread
    # In a real implementation, this would be handled by SIP events
    # threading.Thread(target=connect_call).start()
    
    return jsonify({
        'message': 'Call initiated',
        'call': call.to_dict()
    }), 200

# End a call
@voip_bp.route('/call/<string:call_id>/end', methods=['POST'])
@jwt_required()
def end_call(call_id):
    current_user_id = get_jwt_identity()
    
    call = CallLog.query.filter_by(call_id=call_id, user_id=current_user_id).first()
    
    if not call:
        return jsonify({'message': 'Call not found'}), 404
    
    # Update call status
    call.status = 'completed'
    call.end_time = datetime.utcnow()
    
    # Calculate duration if connect_time exists
    if call.connect_time:
        duration = (call.end_time - call.connect_time).total_seconds()
        call.duration = int(duration)
    
    db.session.commit()
    
    # Emit call end event via WebSocket
    socketio.emit('call_status', {
        'call_id': call_id,
        'status': 'completed'
    }, room=f'user_{current_user_id}')
    
    return jsonify({
        'message': 'Call ended',
        'call': call.to_dict()
    }), 200

# Get VoIP contacts
@voip_bp.route('/contacts', methods=['GET'])
@jwt_required()
def get_voip_contacts():
    current_user_id = get_jwt_identity()
    
    contacts = VoipContact.query.filter_by(user_id=current_user_id).all()
    
    return jsonify({
        'contacts': [contact.to_dict() for contact in contacts]
    }), 200

# Add a VoIP contact
@voip_bp.route('/contacts', methods=['POST'])
@jwt_required()
def add_voip_contact():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('phone_number'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Create new contact
    contact = VoipContact(
        user_id=current_user_id,
        name=data['name'],
        phone_number=data['phone_number'],
        extension=data.get('extension', ''),
        company=data.get('company', ''),
        notes=data.get('notes', '')
    )
    
    db.session.add(contact)
    db.session.commit()
    
    return jsonify({
        'message': 'Contact added successfully',
        'contact': contact.to_dict()
    }), 201

# Update a VoIP contact
@voip_bp.route('/contacts/<int:contact_id>', methods=['PUT'])
@jwt_required()
def update_voip_contact(contact_id):
    current_user_id = get_jwt_identity()
    
    contact = VoipContact.query.get(contact_id)
    
    if not contact:
        return jsonify({'message': 'Contact not found'}), 404
    
    # Check if user owns this contact
    if contact.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    # Update contact fields
    if 'name' in data:
        contact.name = data['name']
    
    if 'phone_number' in data:
        contact.phone_number = data['phone_number']
    
    if 'extension' in data:
        contact.extension = data['extension']
    
    if 'company' in data:
        contact.company = data['company']
    
    if 'notes' in data:
        contact.notes = data['notes']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Contact updated successfully',
        'contact': contact.to_dict()
    }), 200

# Delete a VoIP contact
@voip_bp.route('/contacts/<int:contact_id>', methods=['DELETE'])
@jwt_required()
def delete_voip_contact(contact_id):
    current_user_id = get_jwt_identity()
    
    contact = VoipContact.query.get(contact_id)
    
    if not contact:
        return jsonify({'message': 'Contact not found'}), 404
    
    # Check if user owns this contact
    if contact.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    db.session.delete(contact)
    db.session.commit()
    
    return jsonify({'message': 'Contact deleted successfully'}), 200

# WebSocket event handlers for VoIP
@socketio.on('register_for_calls')
@jwt_required()
def register_for_calls():
    current_user_id = get_jwt_identity()
    room = f'user_{current_user_id}'
    join_room(room)

# Handle incoming call (webhook from SIP provider)
@voip_bp.route('/incoming-call', methods=['POST'])
def incoming_call():
    data = request.get_json()
    
    # Verify webhook signature (implementation depends on the provider)
    # if not verify_webhook_signature(request):
    #     return jsonify({'message': 'Invalid signature'}), 401
    
    if not data or not data.get('to') or not data.get('from'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    to_extension = data['to']
    from_number = data['from']
    call_id = data.get('call_id', str(uuid.uuid4()))
    
    # Find the user with this extension
    extension = VoipExtension.query.filter_by(extension_number=to_extension).first()
    
    if not extension:
        return jsonify({'message': 'Extension not found'}), 404
    
    user_id = extension.user_id
    
    # Create call log
    call = CallLog(
        user_id=user_id,
        call_id=call_id,
        phone_number=from_number,
        direction='inbound',
        start_time=datetime.utcnow(),
        status='ringing'
    )
    
    db.session.add(call)
    db.session.commit()
    
    # Notify user via WebSocket
    socketio.emit('incoming_call', {
        'call_id': call_id,
        'phone_number': from_number
    }, room=f'user_{user_id}')
    
    return jsonify({'status': 'success'}), 200
