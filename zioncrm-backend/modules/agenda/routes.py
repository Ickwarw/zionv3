from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.agenda import Event, EventType
from extensions import db
from datetime import datetime, timedelta
from sqlalchemy import and_

import logging

agenda_bp = Blueprint('agenda', __name__)
logger = logging.getLogger(__name__)

@agenda_bp.route('/', methods=['GET'])
@jwt_required()
def get_events():
    current_user_id = get_jwt_identity()
    
    # Get query parameters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Event.query.filter(
        (Event.user_id == current_user_id) | 
        (Event.is_public == True)
    )
    
    if start_date:
        query = query.filter(Event.start_time >= datetime.fromisoformat(start_date))
    
    if end_date:
        query = query.filter(Event.end_time <= datetime.fromisoformat(end_date))
    
    events = query.order_by(Event.start_time).all()
    
    return jsonify({
        'events': [event.to_dict() for event in events]
    }), 200

@agenda_bp.route('/event-type', methods=['GET'])
@jwt_required()
def get_event_type():
    current_user_id = get_jwt_identity()
    
    events = EventType.query.order_by(EventType.name).all()
    
    return jsonify({
        'event_type': [event.to_dict() for event in events]
    }), 200

@agenda_bp.route('/<int:event_id>', methods=['GET'])
@jwt_required()
def get_event(event_id):
    current_user_id = get_jwt_identity()
    
    event = Event.query.get(event_id)
    
    if not event:
        return jsonify({'message': 'Event not found'}), 404
    
    # Check if user has access to this event
    if not event.is_public and event.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    return jsonify(event.to_dict()), 200

@agenda_bp.route('/', methods=['POST'])
@jwt_required()
def create_event():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'start_time', 'end_time']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    # Parse dates
    try:
        start_time = datetime.fromisoformat(data['start_time'])
        end_time = datetime.fromisoformat(data['end_time'])
    except ValueError:
        return jsonify({'message': 'Invalid date format'}), 400
    
    # Validate date range
    if end_time <= start_time:
        return jsonify({'message': 'End time must be after start time'}), 400
    
    # Create new event
    event = Event(
        title=data['title'],
        description=data.get('description', ''),
        start_time=start_time,
        end_time=end_time,
        location=data.get('location', ''),
        event_type_id=data.get('event_type_id', None),
        is_public=data.get('is_public', False),
        user_id=current_user_id,
        color=data.get('color', '#3788d8'),
        reminder_minutes=data.get('reminder_minutes', 15)
    )
    
    db.session.add(event)
    db.session.commit()
    
    logger.info(f"New event created: {event.title} by user {current_user_id}")
    
    return jsonify({'message': 'Event created successfully', 'event': event.to_dict()}), 201

@agenda_bp.route('/<int:event_id>', methods=['PUT'])
@jwt_required()
def update_event(event_id):
    current_user_id = get_jwt_identity()
    
    event = Event.query.get(event_id)
    
    if not event:
        return jsonify({'message': 'Event not found'}), 404
    
    # Check if user owns this event
    if event.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    # Update event fields
    if 'title' in data:
        event.title = data['title']
    
    if 'description' in data:
        event.description = data['description']
    
    if 'location' in data:
        event.location = data['location']
    
    if 'is_public' in data:
        event.is_public = data['is_public']
    
    if 'color' in data:
        event.color = data['color']
    
    if 'reminder_minutes' in data:
        event.reminder_minutes = data['reminder_minutes']

    if 'event_type_id' in data:
        event.event_type_id = data['event_type_id']
    
    # Parse and validate dates if provided
    if 'start_time' in data and 'end_time' in data:
        try:
            start_time = datetime.fromisoformat(data['start_time'])
            end_time = datetime.fromisoformat(data['end_time'])
            
            if end_time <= start_time:
                return jsonify({'message': 'End time must be after start time'}), 400
            
            event.start_time = start_time
            event.end_time = end_time
        except ValueError:
            return jsonify({'message': 'Invalid date format'}), 400
    
    db.session.commit()
    
    logger.info(f"Event updated: {event.title} by user {current_user_id}")
    
    return jsonify({'message': 'Event updated successfully', 'event': event.to_dict()}), 200

@agenda_bp.route('/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    current_user_id = get_jwt_identity()
    
    event = Event.query.get(event_id)
    
    if not event:
        return jsonify({'message': 'Event not found'}), 404
    
    # Check if user owns this event
    if event.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    db.session.delete(event)
    db.session.commit()
    
    logger.info(f"Event deleted: {event.title} by user {current_user_id}")
    
    return jsonify({'message': 'Event deleted successfully'}), 200

@agenda_bp.route('/upcoming', methods=['GET'])
@jwt_required()
def get_upcoming_events():
    current_user_id = get_jwt_identity()
    
    # Get events starting from now, limited to 5
    now = datetime.utcnow()
    events = Event.query.filter(
        (Event.user_id == current_user_id) | (Event.is_public == True),
        Event.start_time >= now
    ).order_by(Event.start_time).limit(5).all()
    
    return jsonify({
        'events': [event.to_dict() for event in events]
    }), 200

@agenda_bp.route('/week-summary', methods=['GET'])
@jwt_required()
def get_week_summary():
    current_user_id = get_jwt_identity()
    
    reference_date = datetime.today()
    # weekday() → Monday=0, Sunday=6
    days_since_sunday = (reference_date.weekday() + 1) % 7
    sunday = reference_date - timedelta(days=days_since_sunday)
    saturday = sunday + timedelta(days=6)
    
    # Get leads by status
    week_events = (
        db.session.query(
            EventType.name,
            db.func.count(Event.id).label('count')
        )
        .outerjoin(
            Event, 
            and_(
                Event.event_type_id == EventType.id,
                Event.user_id == current_user_id,
                Event.start_time >= sunday,
                Event.start_time <= saturday
            )
        )
        .group_by(EventType.id)
        .all()
    )
    
    return jsonify({
        'events': [
            {'name': item[0], 'count': item[1]} 
            for item in week_events
        ]
    }), 200