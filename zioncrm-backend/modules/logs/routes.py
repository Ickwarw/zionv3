from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.logs import SystemLog
from extensions import db
import logging
from datetime import datetime, timedelta

logs_bp = Blueprint('logs', __name__)
logger = logging.getLogger(__name__)

# Get all logs
@logs_bp.route('/', methods=['GET'])
@jwt_required()
def get_logs():
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)

     # TODO --> REMOVER ESTE COMENTÁRIO, SOMENTE TIREI PARA TESTE --> TERUYA
    # if not user or not user.is_admin:
    #     return jsonify({'message': 'Unauthorized access'}), 403
    
    # Get query parameters
    log_type = request.args.get('type')
    user_id = request.args.get('user_id', type=int)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    search = request.args.get('search', '')
    
    # Build query
    query = SystemLog.query
    
    # Filter by log type
    if log_type:
        query = query.filter_by(log_type=log_type)
    
    # Filter by user
    if user_id:
        query = query.filter_by(user_id=user_id)
    
    # Filter by date range
    if start_date:
        query = query.filter(SystemLog.created_at >= datetime.fromisoformat(start_date))
    
    if end_date:
        query = query.filter(SystemLog.created_at <= datetime.fromisoformat(end_date))
    
    # Search in message
    if search:
        query = query.filter(SystemLog.message.ilike(f'%{search}%'))
    
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    # Get logs with pagination
    logs = query.order_by(SystemLog.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'logs': [log.to_dict() for log in logs.items],
        'total': logs.total,
        'pages': logs.pages,
        'current_page': logs.page
    }), 200

# Get log types
@logs_bp.route('/types', methods=['GET'])
@jwt_required()
def get_log_types():
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    # TODO --> REMOVER ESTE COMENTÁRIO, SOMENTE TIREI PARA TESTE --> TERUYA
    
    # if not user or not user.is_admin:
    #     return jsonify({'message': 'Unauthorized access'}), 403
    
    # Get distinct log types
    log_types = db.session.query(SystemLog.log_type).distinct().all()
    
    return jsonify({
        'types': [log_type[0] for log_type in log_types]
    }), 200

# Get log statistics
@logs_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_log_statistics():
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    # Get total logs count
    total_logs = SystemLog.query.count()
    
    # Get logs by type
    logs_by_type = db.session.query(
        SystemLog.log_type,
        db.func.count(SystemLog.id).label('count')
    ).group_by(
        SystemLog.log_type
    ).all()
    
    # Get logs by user (top 5)
    logs_by_user = db.session.query(
        User.username,
        db.func.count(SystemLog.id).label('count')
    ).join(
        User, User.id == SystemLog.user_id
    ).group_by(
        User.username
    ).order_by(
        db.func.count(SystemLog.id).desc()
    ).limit(5).all()
    
    # Get logs by day (last 7 days)
    today = datetime.utcnow().date()
    last_week = today - timedelta(days=6)
    
    logs_by_day = []
    for i in range(7):
        day = last_week + timedelta(days=i)
        next_day = day + timedelta(days=1)
        
        count = SystemLog.query.filter(
            SystemLog.created_at >= datetime.combine(day, datetime.min.time()),
            SystemLog.created_at < datetime.combine(next_day, datetime.min.time())
        ).count()
        
        logs_by_day.append({
            'date': day.isoformat(),
            'count': count
        })
    
    return jsonify({
        'total_logs': total_logs,
        'logs_by_type': [
            {'type': item[0], 'count': item[1]} 
            for item in logs_by_type
        ],
        'logs_by_user': [
            {'username': item[0], 'count': item[1]} 
            for item in logs_by_user
        ],
        'logs_by_day': logs_by_day
    }), 200

# Create a log entry (internal use)
def create_log(user_id, log_type, message, ip_address=None):
    log = SystemLog(
        user_id=user_id,
        log_type=log_type,
        message=message,
        ip_address=ip_address
    )
    
    db.session.add(log)
    db.session.commit()
    
    return log

# Clear old logs
@logs_bp.route('/clear', methods=['POST'])
@jwt_required()
def clear_logs():
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    if not data or not data.get('days'):
        return jsonify({'message': 'Missing days parameter'}), 400
    
    days = data['days']
    if not isinstance(days, int) or days <= 0:
        return jsonify({'message': 'Days must be a positive integer'}), 400
    
    # Calculate cutoff date
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # Delete logs older than cutoff date
    deleted_count = SystemLog.query.filter(SystemLog.created_at < cutoff_date).delete()
    
    db.session.commit()
    
    # Create a log entry for this action
    create_log(
        user_id=current_user_id,
        log_type='system',
        message=f'Cleared {deleted_count} logs older than {days} days'
    )
    
    return jsonify({
        'message': f'Cleared {deleted_count} logs older than {days} days'
    }), 200

# Export logs
@logs_bp.route('/export', methods=['GET'])
@jwt_required()
def export_logs():
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    # Get query parameters (same as get_logs)
    log_type = request.args.get('type')
    user_id = request.args.get('user_id', type=int)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    search = request.args.get('search', '')
    
    # Build query
    query = SystemLog.query
    
    # Apply filters
    if log_type:
        query = query.filter_by(log_type=log_type)
    
    if user_id:
        query = query.filter_by(user_id=user_id)
    
    if start_date:
        query = query.filter(SystemLog.created_at >= datetime.fromisoformat(start_date))
    
    if end_date:
        query = query.filter(SystemLog.created_at <= datetime.fromisoformat(end_date))
    
    if search:
        query = query.filter(SystemLog.message.ilike(f'%{search}%'))
    
    # Get all matching logs
    logs = query.order_by(SystemLog.created_at.desc()).all()
    
    # Format logs for export
    export_data = [
        {
            'id': log.id,
            'timestamp': log.created_at.isoformat(),
            'user': log.user.username if log.user else 'System',
            'type': log.log_type,
            'message': log.message,
            'ip_address': log.ip_address
        }
        for log in logs
    ]
    
    # Create a log entry for this action
    create_log(
        user_id=current_user_id,
        log_type='system',
        message=f'Exported {len(logs)} logs'
    )
    
    return jsonify({
        'logs': export_data,
        'count': len(logs),
        'export_date': datetime.utcnow().isoformat()
    }), 200
