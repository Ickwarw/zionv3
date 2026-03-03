from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.leads import Lead, LeadStatus, LeadSource, LeadActivity, LeadDepartment
from extensions import db
import logging
from datetime import datetime

leads_bp = Blueprint('leads', __name__)
logger = logging.getLogger(__name__)

# Get all leads
@leads_bp.route('/', methods=['GET'])
@jwt_required()
def get_leads():
    current_user_id = get_jwt_identity()
    
    # Get query parameters
    department_id = request.args.get('department_id', type=int)
    status_id = request.args.get('status_id', type=int)
    source_id = request.args.get('source_id', type=int)
    assigned_to = request.args.get('assigned_to', type=int)
    search = request.args.get('search', '')
    
    # Build query
    query = Lead.query

    # Filter by status
    if department_id:
        query = query.filter_by(department_id=department_id)
    
    # Filter by status
    if status_id:
        query = query.filter_by(status_id=status_id)
    
    # Filter by source
    if source_id:
        query = query.filter_by(source_id=source_id)
    
    # Filter by assigned user
    if assigned_to:
        query = query.filter_by(assigned_to=assigned_to)
    
    # Search by name, email, or phone
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Lead.name.ilike(search_term)) |
            (Lead.email.ilike(search_term)) |
            (Lead.phone.ilike(search_term)) |
            (Lead.company.ilike(search_term))
        )
    
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Get leads with pagination
    leads = query.order_by(Lead.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'leads': [lead.to_dict() for lead in leads.items],
        'total': leads.total,
        'pages': leads.pages,
        'current_page': leads.page
    }), 200

# Get a specific lead
@leads_bp.route('/<int:lead_id>', methods=['GET'])
@jwt_required()
def get_lead(lead_id):
    lead = Lead.query.get(lead_id)
    
    if not lead:
        return jsonify({'message': 'Lead not found'}), 404
    
    return jsonify(lead.to_dict()), 200

# Create a new lead
@leads_bp.route('/', methods=['POST'])
@jwt_required()
def create_lead():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'email', 'phone']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    # Create new lead
    lead = Lead(
        name=data['name'],
        email=data['email'],
        phone=data['phone'],
        company=data.get('company', ''),
        position=data.get('position', ''),
        address=data.get('address', ''),
        city=data.get('city', ''),
        state=data.get('state', ''),
        zip_code=data.get('zip_code', ''),
        country=data.get('country', ''),
        status_id=data.get('status_id'),
        source_id=data.get('source_id'),
        assigned_to=data.get('assigned_to', current_user_id),
        notes=data.get('notes', ''),
        value=data.get('value', 0),
        created_by=current_user_id
    )
    
    db.session.add(lead)
    db.session.commit()
    
    # Create initial activity
    activity = LeadActivity(
        lead_id=lead.id,
        user_id=current_user_id,
        activity_type='created',
        description=f'Lead created by {User.query.get(current_user_id).username}'
    )
    
    db.session.add(activity)
    db.session.commit()
    
    logger.info(f"New lead created: {lead.name} by user {current_user_id}")
    
    return jsonify({
        'message': 'Lead created successfully',
        'lead': lead.to_dict()
    }), 201

# Update a lead
@leads_bp.route('/<int:lead_id>', methods=['PUT'])
@jwt_required()
def update_lead(lead_id):
    current_user_id = get_jwt_identity()
    
    lead = Lead.query.get(lead_id)
    
    if not lead:
        return jsonify({'message': 'Lead not found'}), 404
    
    data = request.get_json()
    
    # Track changes for activity log
    changes = []
    
    # Update lead fields
    if 'name' in data and data['name'] != lead.name:
        old_value = lead.name
        lead.name = data['name']
        changes.append(f'Name changed from "{old_value}" to "{lead.name}"')
    
    if 'email' in data and data['email'] != lead.email:
        old_value = lead.email
        lead.email = data['email']
        changes.append(f'Email changed from "{old_value}" to "{lead.email}"')
    
    if 'phone' in data and data['phone'] != lead.phone:
        old_value = lead.phone
        lead.phone = data['phone']
        changes.append(f'Phone changed from "{old_value}" to "{lead.phone}"')
    
    if 'company' in data and data['company'] != lead.company:
        old_value = lead.company
        lead.company = data['company']
        changes.append(f'Company changed from "{old_value}" to "{lead.company}"')
    
    if 'position' in data and data['position'] != lead.position:
        old_value = lead.position
        lead.position = data['position']
        changes.append(f'Position changed from "{old_value}" to "{lead.position}"')
    
    if 'address' in data and data['address'] != lead.address:
        lead.address = data['address']
        changes.append('Address updated')
    
    if 'city' in data and data['city'] != lead.city:
        lead.city = data['city']
        changes.append('City updated')
    
    if 'state' in data and data['state'] != lead.state:
        lead.state = data['state']
        changes.append('State updated')
    
    if 'zip_code' in data and data['zip_code'] != lead.zip_code:
        lead.zip_code = data['zip_code']
        changes.append('ZIP code updated')
    
    if 'country' in data and data['country'] != lead.country:
        lead.country = data['country']
        changes.append('Country updated')
    
    if 'status_id' in data and data['status_id'] != lead.status_id:
        old_status = LeadStatus.query.get(lead.status_id).name if lead.status_id else 'None'
        new_status = LeadStatus.query.get(data['status_id']).name if data['status_id'] else 'None'
        lead.status_id = data['status_id']
        changes.append(f'Status changed from "{old_status}" to "{new_status}"')
    
    if 'source_id' in data and data['source_id'] != lead.source_id:
        old_source = LeadSource.query.get(lead.source_id).name if lead.source_id else 'None'
        new_source = LeadSource.query.get(data['source_id']).name if data['source_id'] else 'None'
        lead.source_id = data['source_id']
        changes.append(f'Source changed from "{old_source}" to "{new_source}"')
    
    if 'assigned_to' in data and data['assigned_to'] != lead.assigned_to:
        old_user = User.query.get(lead.assigned_to).username if lead.assigned_to else 'None'
        new_user = User.query.get(data['assigned_to']).username if data['assigned_to'] else 'None'
        lead.assigned_to = data['assigned_to']
        changes.append(f'Assigned user changed from "{old_user}" to "{new_user}"')
    
    if 'notes' in data and data['notes'] != lead.notes:
        lead.notes = data['notes']
        changes.append('Notes updated')
    
    if 'value' in data and data['value'] != lead.value:
        old_value = lead.value
        lead.value = data['value']
        changes.append(f'Value changed from {old_value} to {lead.value}')
    
    # Update the lead
    lead.updated_at = datetime.utcnow()
    db.session.commit()
    
    # Create activity log if there were changes
    if changes:
        activity = LeadActivity(
            lead_id=lead.id,
            user_id=current_user_id,
            activity_type='updated',
            description='\n'.join(changes)
        )
        
        db.session.add(activity)
        db.session.commit()
    
    logger.info(f"Lead {lead_id} updated by user {current_user_id}")
    
    return jsonify({
        'message': 'Lead updated successfully',
        'lead': lead.to_dict()
    }), 200

# Delete a lead
@leads_bp.route('/<int:lead_id>', methods=['DELETE'])
@jwt_required()
def delete_lead(lead_id):
    current_user_id = get_jwt_identity()
    
    lead = Lead.query.get(lead_id)
    
    if not lead:
        return jsonify({'message': 'Lead not found'}), 404
    
    # Delete all activities for this lead
    LeadActivity.query.filter_by(lead_id=lead_id).delete()
    
    # Delete the lead
    db.session.delete(lead)
    db.session.commit()
    
    logger.info(f"Lead {lead_id} deleted by user {current_user_id}")
    
    return jsonify({'message': 'Lead deleted successfully'}), 200

# Get lead activities
@leads_bp.route('/<int:lead_id>/activities', methods=['GET'])
@jwt_required()
def get_lead_activities(lead_id):
    lead = Lead.query.get(lead_id)
    
    if not lead:
        return jsonify({'message': 'Lead not found'}), 404
    
    activities = LeadActivity.query.filter_by(
        lead_id=lead_id
    ).order_by(LeadActivity.created_at.desc()).all()
    
    return jsonify({
        'activities': [activity.to_dict() for activity in activities]
    }), 200

# Add a lead activity
@leads_bp.route('/<int:lead_id>/activities', methods=['POST'])
@jwt_required()
def add_lead_activity(lead_id):
    current_user_id = get_jwt_identity()
    
    lead = Lead.query.get(lead_id)
    
    if not lead:
        return jsonify({'message': 'Lead not found'}), 404
    
    data = request.get_json()
    
    if not data or not data.get('activity_type') or not data.get('description'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Create new activity
    activity = LeadActivity(
        lead_id=lead_id,
        user_id=current_user_id,
        activity_type=data['activity_type'],
        description=data['description']
    )
    
    db.session.add(activity)
    db.session.commit()
    
    return jsonify({
        'message': 'Activity added successfully',
        'activity': activity.to_dict()
    }), 201


# Get all lead departments
@leads_bp.route('/departments', methods=['GET'])
@jwt_required()
def get_lead_departments():
    departments = LeadDepartment.query.all()
    depList = []
    for dep in departments:
        dep_dict = dep.to_dict()
        dep_dict['status_count'] = LeadStatus.query.filter_by(department_id=dep.id).count()
        depList.append(dep_dict)
    
    return jsonify({
        'departments': depList
    }), 200    

# Get all lead statuses of department
@leads_bp.route('/departments/<int:dep_id>/statuses', methods=['GET'])
@jwt_required()
def get_lead_dep_statuses(dep_id):
    statuses = LeadStatus.query \
        .filter_by(department_id=dep_id) \
        .order_by(LeadStatus.order).all()
    
    return jsonify({
        'statuses': [status.to_dict() for status in statuses]
    }), 200

# Get all lead statuses
@leads_bp.route('/statuses', methods=['GET'])
@jwt_required()
def get_lead_statuses():
    statuses = LeadStatus.query.all()
    
    return jsonify({
        'statuses': [status.to_dict() for status in statuses]
    }), 200

# Create a new lead status
@leads_bp.route('/statuses', methods=['POST'])
@jwt_required()
def create_lead_status():
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'message': 'Missing status name'}), 400
    
    # Create new status
    status = LeadStatus(
        name=data['name'],
        color=data.get('color', '#3788d8'),
        order=data.get('order', 0)
    )
    
    db.session.add(status)
    db.session.commit()
    
    return jsonify({
        'message': 'Status created successfully',
        'status': status.to_dict()
    }), 201

# Get all lead sources
@leads_bp.route('/sources', methods=['GET'])
@jwt_required()
def get_lead_sources():
    sources = LeadSource.query.all()
    
    return jsonify({
        'sources': [source.to_dict() for source in sources]
    }), 200

# Create a new lead source
@leads_bp.route('/sources', methods=['POST'])
@jwt_required()
def create_lead_source():
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'message': 'Missing source name'}), 400
    
    # Create new source
    source = LeadSource(
        name=data['name'],
        description=data.get('description', '')
    )
    
    db.session.add(source)
    db.session.commit()
    
    return jsonify({
        'message': 'Source created successfully',
        'source': source.to_dict()
    }), 201

# Get lead statistics
@leads_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_lead_statistics():
    # Get total leads count
    total_leads = Lead.query.count()
    
    # Get leads by status
    leads_by_status = db.session.query(
        LeadStatus.name,
        LeadStatus.color,
        db.func.count(Lead.id).label('count')
    ).outerjoin(
        Lead, Lead.status_id == LeadStatus.id
    ).group_by(
        LeadStatus.id
    ).all()
    
    # Get leads by source
    leads_by_source = db.session.query(
        LeadSource.name,
        db.func.count(Lead.id).label('count')
    ).outerjoin(
        Lead, Lead.source_id == LeadSource.id
    ).group_by(
        LeadSource.id
    ).all()
    
    # Get conversion rate (leads with 'Converted' status)
    converted_status = LeadStatus.query.filter_by(name='Converted').first()
    if converted_status:
        converted_count = Lead.query.filter_by(status_id=converted_status.id).count()
        conversion_rate = (converted_count / total_leads) * 100 if total_leads > 0 else 0
    else:
        conversion_rate = 0
    
    return jsonify({
        'total_leads': total_leads,
        'leads_by_status': [
            {'name': item[0], 'color': item[1], 'count': item[2]} 
            for item in leads_by_status
        ],
        'leads_by_source': [
            {'name': item[0], 'count': item[1]} 
            for item in leads_by_source
        ],
        'conversion_rate': conversion_rate
    }), 200
