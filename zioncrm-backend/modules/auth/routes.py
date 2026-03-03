from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, decode_token
from models.user import User
from models.group import Group, Permission
from extensions import db
import logging

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"msg": "E-mail e senha são obrigatórios"}), 400
    
    email = data.get("email")
    password = data.get("password")
    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"msg": "Credenciais inválidas"}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify(access_token=access_token, user=user.to_dict()), 200


@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    auth_header = request.headers.get("Authorization", None)
    if not auth_header:
        return None
    
    # Extract the token part
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    
    token = parts[1]

    # Decode without verification
    decoded = decode_token(token, allow_expired=True)
    id = decoded["sub"]

    user = User.query.filter_by(id=id).first()
    access_token = create_access_token(identity=user.id)
    return jsonify(access_token=access_token, user=user.to_dict()), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    # user = User.query.get(current_user_id)
    user = User.query.filter_by(id=current_user_id).first()
    return jsonify(user.to_dict()), 200


# Get all groups
@auth_bp.route('/groups', methods=['GET'])
@jwt_required()
def get_groups():
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    groups = Group.query.all()
    
    return jsonify({
        'groups': [group.to_dict() for group in groups]
    }), 200

# Get a specific group
@auth_bp.route('/groups/<int:group_id>', methods=['GET'])
@jwt_required()
def get_group(group_id):
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    group = Group.query.get(group_id)
    
    if not group:
        return jsonify({'message': 'Group not found'}), 404
    
    return jsonify(group.to_dict()), 200

# Create a new group
@auth_bp.route('/groups', methods=['POST'])
@jwt_required()
def create_group():
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'message': 'Missing group name'}), 400
    
    # Check if group already exists
    if Group.query.filter_by(name=data['name']).first():
        return jsonify({'message': 'Group name already exists'}), 400
    
    # Create new group
    group = Group(
        name=data['name'],
        description=data.get('description', '')
    )
    
    # Add permissions if provided
    if 'permissions' in data and isinstance(data['permissions'], list):
        for permission_id in data['permissions']:
            permission = Permission.query.get(permission_id)
            if permission:
                group.permissions.append(permission)
    
    db.session.add(group)
    db.session.commit()
    
    logger.info(f"New group created: {group.name} by user {current_user_id}")
    
    return jsonify({
        'message': 'Group created successfully',
        'group': group.to_dict()
    }), 201

# Update a group
@auth_bp.route('/groups/<int:group_id>', methods=['PUT'])
@jwt_required()
def update_group(group_id):
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    group = Group.query.get(group_id)
    
    if not group:
        return jsonify({'message': 'Group not found'}), 404
    
    data = request.get_json()
    
    # Update group fields
    if 'name' in data:
        # Check if new name already exists
        existing_group = Group.query.filter_by(name=data['name']).first()
        if existing_group and existing_group.id != group_id:
            return jsonify({'message': 'Group name already exists'}), 400
        
        group.name = data['name']
    
    if 'description' in data:
        group.description = data['description']
    
    # Update permissions if provided
    if 'permissions' in data and isinstance(data['permissions'], list):
        # Clear existing permissions
        group.permissions = []
        
        # Add new permissions
        for permission_id in data['permissions']:
            permission = Permission.query.get(permission_id)
            if permission:
                group.permissions.append(permission)
    
    db.session.commit()
    
    logger.info(f"Group {group_id} updated by user {current_user_id}")
    
    return jsonify({
        'message': 'Group updated successfully',
        'group': group.to_dict()
    }), 200

# Delete a group
@auth_bp.route('/groups/<int:group_id>', methods=['DELETE'])
@jwt_required()
def delete_group(group_id):
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    group = Group.query.get(group_id)
    
    if not group:
        return jsonify({'message': 'Group not found'}), 404
    
    # Check if group has users
    if group.users.count() > 0:
        return jsonify({'message': 'Cannot delete group with assigned users'}), 400
    
    db.session.delete(group)
    db.session.commit()
    
    logger.info(f"Group {group_id} deleted by user {current_user_id}")
    
    return jsonify({'message': 'Group deleted successfully'}), 200

# Get all permissions
@auth_bp.route('/permissions', methods=['GET'])
@jwt_required()
def get_permissions():
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    permissions = Permission.query.all()
    
    return jsonify({
        'permissions': [permission.to_dict() for permission in permissions]
    }), 200

# Add users to a group
@auth_bp.route('/groups/<int:group_id>/users', methods=['POST'])
@jwt_required()
def add_users_to_group(group_id):
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    group = Group.query.get(group_id)
    
    if not group:
        return jsonify({'message': 'Group not found'}), 404
    
    data = request.get_json()
    
    if not data or not data.get('user_ids') or not isinstance(data['user_ids'], list):
        return jsonify({'message': 'Missing user IDs'}), 400
    
    # Add users to group
    added_users = []
    for user_id in data['user_ids']:
        user = User.query.get(user_id)
        if user and user not in group.users:
            group.users.append(user)
            added_users.append(user.username)
    
    db.session.commit()
    
    logger.info(f"Users added to group {group.name}: {', '.join(added_users)}")
    
    return jsonify({
        'message': 'Users added to group successfully',
        'group': group.to_dict()
    }), 200

# Remove users from a group
@auth_bp.route('/groups/<int:group_id>/users', methods=['DELETE'])
@jwt_required()
def remove_users_from_group(group_id):
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    group = Group.query.get(group_id)
    
    if not group:
        return jsonify({'message': 'Group not found'}), 404
    
    data = request.get_json()
    
    if not data or not data.get('user_ids') or not isinstance(data['user_ids'], list):
        return jsonify({'message': 'Missing user IDs'}), 400
    
    # Remove users from group
    removed_users = []
    for user_id in data['user_ids']:
        user = User.query.get(user_id)
        if user and user in group.users:
            group.users.remove(user)
            removed_users.append(user.username)
    
    db.session.commit()
    
    logger.info(f"Users removed from group {group.name}: {', '.join(removed_users)}")
    
    return jsonify({
        'message': 'Users removed from group successfully',
        'group': group.to_dict()
    }), 200

# Get users in a group
@auth_bp.route('/groups/<int:group_id>/users', methods=['GET'])
@jwt_required()
def get_users_in_group(group_id):
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    group = Group.query.get(group_id)
    
    if not group:
        return jsonify({'message': 'Group not found'}), 404
    
    return jsonify({
        'users': [
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name
            }
            for user in group.users
        ]
    }), 200

# Check if user has permission
@auth_bp.route('/check-permission', methods=['POST'])
@jwt_required()
def check_permission():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('permission_code'):
        return jsonify({'message': 'Missing permission code'}), 400
    
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # Admin users have all permissions
    if user.is_admin:
        return jsonify({'has_permission': True}), 200
    
    # Check user's groups for the permission
    permission = Permission.query.filter_by(code=data['permission_code']).first()
    
    if not permission:
        return jsonify({'message': 'Permission not found'}), 404
    
    has_permission = False
    
    for group in user.groups:
        if permission in group.permissions:
            has_permission = True
            break
    
    return jsonify({'has_permission': has_permission}), 200