from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.config import SystemConfig
from extensions import db
import logging

config_bp = Blueprint('config', __name__)
logger = logging.getLogger(__name__)

@config_bp.route('/group', methods=['GET'])
@jwt_required()
def get_group_configs():
    # Check if user is admin
    current_user_id = get_jwt_identity()
    # user = User.query.get(current_user_id)
    user = User.query.filter_by(id=current_user_id).first()
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    group_name = request.args.get('group_name')

    configs = SystemConfig.query.filter(
        SystemConfig.key.like(f'{group_name}.%')
    ).all()

    return jsonify({
        'configs': [config.to_dict() for config in configs]
    }), 200

@config_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_configs():
    # Check if user is admin
    current_user_id = get_jwt_identity()
    user = User.query.filter_by(id=current_user_id).first()
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    configs = SystemConfig.query.all()
    return jsonify({
        'configs': [config.to_dict() for config in configs]
    }), 200

@config_bp.route('/<string:key>', methods=['GET'])
@jwt_required()
def get_config(key):
    config = SystemConfig.query.filter_by(key=key).first()
    
    if not config:
        return jsonify({'message': 'Configuration not found'}), 404
    
    return jsonify(config.to_dict()), 200

@config_bp.route('/', methods=['POST'])
@jwt_required()
def create_config():
    # Check if user is admin
    current_user_id = get_jwt_identity()
    user = User.query.filter_by(id=current_user_id).first()
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    if not data or not data.get('key') or 'value' not in data:
        return jsonify({'message': 'Missing key or value'}), 400
    
    # Check if config already exists
    existing_config = SystemConfig.query.filter_by(key=data['key']).first()
    if existing_config:
        return jsonify({'message': 'Configuration key already exists'}), 400
    
    # Create new config
    config = SystemConfig(
        key=data['key'],
        value=data['value'],
        description=data.get('description', '')
    )
    
    db.session.add(config)
    db.session.commit()
    
    logger.info(f"New configuration created: {config.key}")
    
    return jsonify({'message': 'Configuration created successfully', 'config': config.to_dict()}), 201

@config_bp.route('/<string:key>', methods=['PUT'])
@jwt_required()
def update_config(key):
    # Check if user is admin
    current_user_id = get_jwt_identity()
    user = User.query.filter_by(id=current_user_id).first()
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    config = SystemConfig.query.filter_by(key=key).first()
    
    if not config:
        return jsonify({'message': 'Configuration not found'}), 404
    
    data = request.get_json()
    
    if not data or 'value' not in data:
        return jsonify({'message': 'Missing value'}), 400
    
    # Update config
    config.value = data['value']
    if 'description' in data:
        config.description = data['description']
    
    db.session.commit()
    
    logger.info(f"Configuration updated: {config.key}")
    
    return jsonify({'message': 'Configuration updated successfully', 'config': config.to_dict()}), 200

@config_bp.route('/<string:key>', methods=['DELETE'])
@jwt_required()
def delete_config(key):
    # Check if user is admin
    current_user_id = get_jwt_identity()
    user = User.query.filter_by(id=current_user_id).first()
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    config = SystemConfig.query.filter_by(key=key).first()
    
    if not config:
        return jsonify({'message': 'Configuration not found'}), 404
    
    db.session.delete(config)
    db.session.commit()
    
    logger.info(f"Configuration deleted: {key}")
    
    return jsonify({'message': 'Configuration deleted successfully'}), 200

@config_bp.route('/appearance', methods=['GET'])
@jwt_required()
def get_appearance_settings():
    appearance_configs = SystemConfig.query.filter(
        SystemConfig.key.like('appearance.%')
    ).all()
    
    return jsonify({
        'appearance': {config.key.split('.')[1]: config.value for config in appearance_configs}
    }), 200

@config_bp.route('/integrations', methods=['GET'])
@jwt_required()
def get_integration_settings():
    # Check if user is admin
    current_user_id = get_jwt_identity()
    user = User.query.filter_by(id=current_user_id).first()
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    integration_configs = SystemConfig.query.filter(
        SystemConfig.key.like('integration.%')
    ).all()
    
    return jsonify({
        'integrations': {config.key.split('.')[1]: config.value for config in integration_configs}
    }), 200

@config_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notification_settings():
    current_user_id = get_jwt_identity()
    
    notification_configs = SystemConfig.query.filter(
        SystemConfig.key.like(f'notification.user.{current_user_id}.%')
    ).all()
    
    return jsonify({
        'notifications': {config.key.split('.')[-1]: config.value for config in notification_configs}
    }), 200


@config_bp.route('/apis', methods=['POST'])
@jwt_required()
def create_apis_config():
    # Check if user is admin
    current_user_id = get_jwt_identity()
    user = User.query.filter_by(id=current_user_id).first()
    
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    datas = request.get_json()
    for data in datas:
        if not data or not data.get('key') or 'value' not in data:
            # return jsonify({'message': 'Missing key or value'}), 400
            logger.warning(f"Skipping invalid config data: {data}")
            continue
        
        # Check if config already exists
        existing_config = SystemConfig.query.filter_by(key=data['key']).first()
        if existing_config != None:
            # Update config
            existing_config.value = data['value']
            if 'description' in data:
                existing_config.description = data['description']
            db.session.commit()
            logger.info(f"Configuration updated: {existing_config.key}")
        else:
            # Create new config
            config = SystemConfig(
                key=data['key'],
                value=data['value'],
                description=data.get('description', '')
            )
            db.session.add(config)
            db.session.commit()
            logger.info(f"New configuration created: {config.key}")
    
    return jsonify({'message': 'Configurations created successfully'}), 201