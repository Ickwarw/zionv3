from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.group import Group, Permission
from extensions import db
import logging
from datetime import datetime

users_bp = Blueprint('users', __name__)
logger = logging.getLogger(__name__)

@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():

    # group_id = request.args.get('group_id', type=int)
        
    query = User.query
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    users = query.order_by(User.full_name).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'users': [user.to_dict() for user in users.items],
        'total': users.total,
        'pages': users.pages,
        'current_page': users.page
    }), 200


@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200


@users_bp.route('/', methods=['POST'])
@jwt_required()
def create_user():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    # Validate required fields
    required_fields = ['username', 'email', 'full_name']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'E-Mail já cadastrado'}), 400

    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=data.get('password_hash', ''),
        full_name=data['full_name'],
        is_active=data.get('is_active', True),
        is_admin=data.get('is_admin', False),
        last_login=data.get('last_login'),
        profile_picture=data.get('profile_picture')
    )
    user.set_password(data.get('password'))
    for gp in data.get('groups'):
        group = Group.query.filter_by(id=gp).first()
        if group:
            user.groups.append(group)
   
    db.session.add(user)
    db.session.commit()
    
   
    
    logger.info(f"Novo usuário criado: : {user.email} by user {current_user_id}")
    
    return jsonify({
        'message': 'User created successfully',
        'user': user.to_dict()
    }), 201

@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current_user_id = get_jwt_identity()
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    
    if 'username' in data:
        user.username = data['username']

    # Como é único, somente ADMIN do sistema pode alterar o e-mail
    # if 'email' in data:
    #     user.email = data['email']
    #  Is Admin tmb somente ADMIN do sistema pode alterar
    # if 'is_admin' in data:
        # user.is_admin = data['is_admin']

    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'is_active' in data:
        user.is_active = data['is_active']
    user.updated_at = datetime.utcnow()

    for group in user.groups:
        if group.id not in data.get('groups'):
            user.groups.remove(user)
    for gp in data.get('groups'):
        group = Group.query.filter_by(id=gp).first()
        if group and group not in user.groups:
            user.groups.append(group)

    db.session.commit()
    
    logger.info(f"User {user_id} updated by user {current_user_id}")
    
    return jsonify({
        'message': 'User updated successfully',
        'user': user.to_dict()
    }), 200

@users_bp.route('/groups', methods=['GET'])
@jwt_required()
def get_groups():
    groups = Group.query.all()
    
    return jsonify({
        'groups': [group.to_dict() for group in groups]
    }), 200

@users_bp.route('/groups-simple', methods=['GET'])
def get_groups_simple():
    groups = Group.query.all()
    
    return jsonify({
        'groups': [group.to_simple_dict() for group in groups]
    }), 200    


@users_bp.route('/groups', methods=['POST'])
@jwt_required()
def create_group():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'message': 'Missing Group name'}), 400
    
    if not data or not data.get('permissions'):
        return jsonify({'message': 'Missing Permissions'}), 400
    
    if Group.query.filter_by(name=data['name']).first():
        return jsonify({'message': 'Group name already exists'}), 400
    
    permissions = []
    for pm in data.get('permissions'):
        permission = Permission.query.filter_by(id=pm).first()
        if permission:
            permissions.append(permission)

    group = Group(
        name=data['name'],
        description=data.get('description', ''),
        permissions=permissions
    )
    
    db.session.add(group)
    db.session.commit()
    
    logger.info(f"New Group created: {group.name} by user {current_user_id}")
    
    return jsonify({
        'message': 'Group created successfully',
        'group': group.to_dict()
    }), 201



@users_bp.route('/groups/<int:group_id>', methods=['PUT'])
@jwt_required()
def update_group(group_id):
    current_user_id = get_jwt_identity()
    
    group = Group.query.get(group_id)
    
    if not group:
        return jsonify({'message': 'Group not found'}), 404
    
    data = request.get_json()
    
    if 'name' in data:
        group.name = data['name']
    
    if 'description' in data:
        group.description = data['description']

    permissions = []
    for pm in data.get('permissions'):
        permission = Permission.query.filter_by(id=pm).first()
        if permission:
            permissions.append(permission)

    
    group.updated_at = datetime.utcnow()
    group.permissions=permissions
    db.session.commit()
    
    logger.info(f"Group {group_id} updated by user {current_user_id}")
    
    return jsonify({
        'message': 'Group updated successfully',
        'group': group.to_dict()
    }), 200


@users_bp.route('/permissions', methods=['GET'])
@jwt_required()
def get_permissions():

    query = Permission.query
    
    permissions = query.order_by(Permission.id)
    
    return jsonify({
        'permissions': [permission.to_dict() for permission in permissions],
    }), 200

