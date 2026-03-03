from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.api_config import ApiConfig
from extensions import db
import logging

api_config_bp = Blueprint('api_config', __name__)
logger = logging.getLogger(__name__)

@api_config_bp.route('/api_config', methods=['GET'])
@jwt_required()
def get_api_config():
    """Gets the current user's API configuration status."""
    current_user_id = get_jwt_identity()
    config = ApiConfig.query.filter_by(user_id=current_user_id).first()

    if not config:
        return jsonify({'message': 'API configuration not found. Please set it up.'}), 404
        
    return jsonify(config.to_dict()), 200

@api_config_bp.route('/api_config', methods=['POST', 'PUT'])
@jwt_required()
def save_api_config():
    """Creates or updates the API configuration for the current user."""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'platform' not in data or 'config' not in data:
        return jsonify({'message': 'Missing platform or config data'}), 400

    platform = data['platform']
    config_data = data['config']
    
    if platform not in ['facebook', 'instagram', 'whatsapp']:
        return jsonify({'message': 'Invalid platform specified'}), 400

    
    config = ApiConfig.query.filter_by(user_id=current_user_id).first()
    if not config:
        config = ApiConfig(user_id=current_user_id)
        db.session.add(config)

    
    if platform == 'facebook':
        
        if 'app_id' not in config_data or 'app_secret' not in config_data:
            return jsonify({'message': 'Facebook config requires app_id and app_secret'}), 400
        config.facebook_config = config_data
        
    elif platform == 'instagram':
        
        if 'access_token' not in config_data:
             return jsonify({'message': 'Instagram config requires access_token'}), 400
        config.instagram_config = config_data
        
    elif platform == 'whatsapp':
        
        if 'account_sid' not in config_data or 'auth_token' not in config_data:
            return jsonify({'message': 'WhatsApp config requires account_sid and auth_token'}), 400
        config.whatsapp_config = config_data

    try:
        db.session.commit()
        logger.info(f"API configuration updated for user {current_user_id} on platform {platform}.")
        return jsonify({'message': f'{platform.capitalize()} API configuration saved successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error saving API config: {e}")
        return jsonify({'message': 'An error occurred while saving the configuration.'}), 500

