from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.voip import CallLog, VoipExtension, VoipContact
from extensions import db, socketio
from flask_socketio import emit, join_room
import logging
from datetime import datetime
import uuid
from urllib.parse import urljoin
import requests

voip_bp = Blueprint('voip', __name__)
logger = logging.getLogger(__name__)


def _normalize_phone_number(phone_number: str) -> str:
    return ''.join(ch for ch in str(phone_number or '') if ch.isdigit())


def _build_gateway_auth_payload():
    login = current_app.config.get('VOIP_GATEWAY_LOGIN')
    password = current_app.config.get('VOIP_GATEWAY_PASSWORD')
    if login and password:
        return {"login": login, "password": password}
    return None


def _gateway_post(path: str, payload: dict):
    gateway_url = (current_app.config.get('VOIP_GATEWAY_URL') or '').strip()
    auth_payload = _build_gateway_auth_payload()

    if not gateway_url or not auth_payload:
        return None, 'VoIP gateway not configured. Set VOIP_GATEWAY_URL, VOIP_GATEWAY_LOGIN and VOIP_GATEWAY_PASSWORD.'

    base_url = gateway_url if gateway_url.endswith('/') else f'{gateway_url}/'
    target_url = urljoin(base_url, path.lstrip('/'))
    data = dict(payload or {})
    data.update(auth_payload)

    try:
        response = requests.post(target_url, json=data, timeout=15)
        response.raise_for_status()
        return response.json(), None
    except requests.RequestException as exc:
        logger.exception('VoIP gateway request failed')
        return None, str(exc)


def _parse_iso_datetime(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None

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
    data = request.get_json() or {}
    
    if not data.get('phone_number'):
        return jsonify({'message': 'Missing phone number'}), 400

    extension = VoipExtension.query.filter_by(user_id=current_user_id).first()
    from_extension = data.get('from_extension')
    if not from_extension and extension:
        from_extension = extension.extension_number

    target_phone_number = _normalize_phone_number(data['phone_number'])
    if not target_phone_number:
        return jsonify({'message': 'Invalid phone number'}), 400

    gateway_response = None
    call_id = str(uuid.uuid4())
    gateway_enabled = bool(current_app.config.get('VOIP_GATEWAY_URL') and _build_gateway_auth_payload())

    if gateway_enabled:
        if not from_extension:
            return jsonify({'message': 'Missing from_extension to initiate gateway call'}), 400

        gateway_response, gateway_error = _gateway_post('/calls/initiate', {
            'from': from_extension,
            'to': target_phone_number,
            'extra': {
                'user_id': current_user_id
            }
        })

        if gateway_error:
            return jsonify({'message': 'Failed to initiate call', 'detail': gateway_error}), 502

        call_id = str(gateway_response.get('call_uuid') or gateway_response.get('id') or call_id)

    call = CallLog(
        user_id=current_user_id,
        call_id=call_id,
        phone_number=target_phone_number,
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
        'phone_number': target_phone_number
    }, room=f'user_{current_user_id}')
    
    return jsonify({
        'message': 'Call initiated',
        'provider_response': gateway_response,
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
    
    gateway_response = None
    gateway_enabled = bool(current_app.config.get('VOIP_GATEWAY_URL') and _build_gateway_auth_payload())
    if gateway_enabled:
        gateway_response, gateway_error = _gateway_post('/calls/hangup', {
            'call_uuid': call_id
        })

        if gateway_error:
            return jsonify({'message': 'Failed to end call', 'detail': gateway_error}), 502

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
        'provider_response': gateway_response,
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
def register_for_calls(data=None):
    if not data or 'user_id' not in data:
        return

    room = f"user_{data['user_id']}"
    join_room(room)


@voip_bp.route('/call/status', methods=['POST'])
def update_call_status():
    data = request.get_json() or {}
    call_id = data.get('call_id') or data.get('call_uuid')
    status = data.get('status')

    if not call_id or not status:
        return jsonify({'message': 'Missing call_id/call_uuid or status'}), 400

    call = CallLog.query.filter_by(call_id=str(call_id)).first()
    if not call:
        return jsonify({'message': 'Call not found'}), 404

    call.status = status

    if data.get('phone_number'):
        call.phone_number = _normalize_phone_number(data['phone_number']) or call.phone_number

    parsed_connect_time = _parse_iso_datetime(data.get('connect_time'))
    if parsed_connect_time and not call.connect_time:
        call.connect_time = parsed_connect_time
    elif status == 'connected' and not call.connect_time:
        call.connect_time = datetime.utcnow()

    parsed_end_time = _parse_iso_datetime(data.get('end_time'))
    if parsed_end_time:
        call.end_time = parsed_end_time
    elif status in ('completed', 'failed', 'canceled', 'cancelled') and not call.end_time:
        call.end_time = datetime.utcnow()

    if data.get('duration') is not None:
        call.duration = int(data['duration'])
    elif call.connect_time and call.end_time and call.duration is None:
        call.duration = int((call.end_time - call.connect_time).total_seconds())

    db.session.commit()

    socketio.emit('call_status', {
        'call_id': call.call_id,
        'status': call.status,
        'phone_number': call.phone_number,
        'connect_time': call.connect_time.isoformat() if call.connect_time else None,
        'end_time': call.end_time.isoformat() if call.end_time else None,
        'duration': call.duration
    }, room=f'user_{call.user_id}')

    return jsonify({'message': 'Call status updated', 'call': call.to_dict()}), 200

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
