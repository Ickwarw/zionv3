from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.tasks import Task, TaskStatus, TaskPriority, TaskCategory, TaskComment
from extensions import db
import logging
from datetime import datetime, timedelta

tasks_bp = Blueprint('tasks', __name__)
logger = logging.getLogger(__name__)

# Get all tasks
@tasks_bp.route('/', methods=['GET'])
@jwt_required()
def get_tasks():
    current_user_id = get_jwt_identity()
    
    # Get query parameters
    status_id = request.args.get('status_id', type=int)
    priority_id = request.args.get('priority_id', type=int)
    category_id = request.args.get('category_id', type=int)
    assigned_to = request.args.get('assigned_to', type=int)
    search = request.args.get('search', '')
    due_date = request.args.get('due_date')  # today, tomorrow, week, overdue
    
    # Build query
    query = Task.query
    
    # Filter by status
    if status_id:
        query = query.filter_by(status_id=status_id)
    
    # Filter by priority
    if priority_id:
        query = query.filter_by(priority_id=priority_id)
    
    # Filter by category
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    # Filter by assigned user
    if assigned_to:
        query = query.filter_by(assigned_to=assigned_to)
    else:
        # If no assigned_to filter, show tasks assigned to current user or created by current user
        query = query.filter(
            (Task.assigned_to == current_user_id) | 
            (Task.created_by == current_user_id)
        )
    
    # Search by title or description
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Task.title.ilike(search_term)) |
            (Task.description.ilike(search_term))
        )
    
    # Filter by due date
    today = datetime.utcnow().date()
    if due_date == 'today':
        query = query.filter(
            db.func.date(Task.due_date) == today
        )
    elif due_date == 'tomorrow':
        tomorrow = today + timedelta(days=1)
        query = query.filter(
            db.func.date(Task.due_date) == tomorrow
        )
    elif due_date == 'week':
        week_end = today + timedelta(days=7)
        query = query.filter(
            db.func.date(Task.due_date) >= today,
            db.func.date(Task.due_date) <= week_end
        )
    elif due_date == 'overdue':
        query = query.filter(
            db.func.date(Task.due_date) < today,
            Task.status_id != TaskStatus.query.filter_by(name='Completed').first().id
        )
    
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Get tasks with pagination
    tasks = query.order_by(Task.due_date).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'tasks': [task.to_dict() for task in tasks.items],
        'total': tasks.total,
        'pages': tasks.pages,
        'current_page': tasks.page
    }), 200

# Get a specific task
@tasks_bp.route('/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    current_user_id = get_jwt_identity()
    
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    
    # Check if user has access to this task
    if task.assigned_to != current_user_id and task.created_by != current_user_id:
        # Check if user is admin
        user = User.query.get(current_user_id)
        if not user or not user.is_admin:
            return jsonify({'message': 'Unauthorized access'}), 403
    
    return jsonify(task.to_dict()), 200

# Create a new task
@tasks_bp.route('/', methods=['POST'])
@jwt_required()
def create_task():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'due_date']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    # Parse due date
    try:
        due_date = datetime.fromisoformat(data['due_date'])
    except ValueError:
        return jsonify({'message': 'Invalid date format'}), 400
    
    # Create new task
    task = Task(
        title=data['title'],
        description=data.get('description', ''),
        due_date=due_date,
        status_id=data.get('status_id'),
        priority_id=data.get('priority_id'),
        category_id=data.get('category_id'),
        assigned_to=data.get('assigned_to', current_user_id),
        created_by=current_user_id
    )
    
    db.session.add(task)
    db.session.commit()
    
    logger.info(f"New task created: {task.title} by user {current_user_id}")
    
    return jsonify({
        'message': 'Task created successfully',
        'task': task.to_dict()
    }), 201

# Update a task
@tasks_bp.route('/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    current_user_id = get_jwt_identity()
    
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    
    # Check if user has access to update this task
    if task.assigned_to != current_user_id and task.created_by != current_user_id:
        # Check if user is admin
        user = User.query.get(current_user_id)
        if not user or not user.is_admin:
            return jsonify({'message': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    # Update task fields
    if 'title' in data:
        task.title = data['title']
    
    if 'description' in data:
        task.description = data['description']
    
    if 'due_date' in data:
        try:
            task.due_date = datetime.fromisoformat(data['due_date'])
        except ValueError:
            return jsonify({'message': 'Invalid date format'}), 400
    
    if 'status_id' in data:
        task.status_id = data['status_id']
        
        # If task is marked as completed, set completed_at
        completed_status = TaskStatus.query.filter_by(name='Completed').first()
        if completed_status and data['status_id'] == completed_status.id:
            task.completed_at = datetime.utcnow()
        else:
            task.completed_at = None
    
    if 'priority_id' in data:
        task.priority_id = data['priority_id']
    
    if 'category_id' in data:
        task.category_id = data['category_id']
    
    if 'assigned_to' in data:
        task.assigned_to = data['assigned_to']
    
    task.updated_at = datetime.utcnow()
    db.session.commit()
    
    logger.info(f"Task {task_id} updated by user {current_user_id}")
    
    return jsonify({
        'message': 'Task updated successfully',
        'task': task.to_dict()
    }), 200

# Delete a task
@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    current_user_id = get_jwt_identity()
    
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    
    # Check if user has access to delete this task
    if task.created_by != current_user_id:
        # Check if user is admin
        user = User.query.get(current_user_id)
        if not user or not user.is_admin:
            return jsonify({'message': 'Unauthorized access'}), 403
    
    # Delete task comments
    TaskComment.query.filter_by(task_id=task_id).delete()
    
    # Delete the task
    db.session.delete(task)
    db.session.commit()
    
    logger.info(f"Task {task_id} deleted by user {current_user_id}")
    
    return jsonify({'message': 'Task deleted successfully'}), 200

# Get task comments
@tasks_bp.route('/<int:task_id>/comments', methods=['GET'])
@jwt_required()
def get_task_comments(task_id):
    current_user_id = get_jwt_identity()
    
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    
    # Check if user has access to this task
    if task.assigned_to != current_user_id and task.created_by != current_user_id:
        # Check if user is admin
        user = User.query.get(current_user_id)
        if not user or not user.is_admin:
            return jsonify({'message': 'Unauthorized access'}), 403
    
    comments = TaskComment.query.filter_by(
        task_id=task_id
    ).order_by(TaskComment.created_at).all()
    
    return jsonify({
        'comments': [comment.to_dict() for comment in comments]
    }), 200

# Add a task comment
@tasks_bp.route('/<int:task_id>/comments', methods=['POST'])
@jwt_required()
def add_task_comment(task_id):
    current_user_id = get_jwt_identity()
    
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    
    # Check if user has access to this task
    if task.assigned_to != current_user_id and task.created_by != current_user_id:
        # Check if user is admin
        user = User.query.get(current_user_id)
        if not user or not user.is_admin:
            return jsonify({'message': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    if not data or not data.get('content'):
        return jsonify({'message': 'Missing comment content'}), 400
    
    # Create new comment
    comment = TaskComment(
        task_id=task_id,
        user_id=current_user_id,
        content=data['content']
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify({
        'message': 'Comment added successfully',
        'comment': comment.to_dict()
    }), 201

# Get all task statuses
@tasks_bp.route('/statuses', methods=['GET'])
@jwt_required()
def get_task_statuses():
    statuses = TaskStatus.query.order_by(TaskStatus.order).all()
    
    return jsonify({
        'statuses': [status.to_dict() for status in statuses]
    }), 200

# Get all task priorities
@tasks_bp.route('/priorities', methods=['GET'])
@jwt_required()
def get_task_priorities():
    priorities = TaskPriority.query.order_by(TaskPriority.order).all()
    
    return jsonify({
        'priorities': [priority.to_dict() for priority in priorities]
    }), 200

# Get all task categories
@tasks_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_task_categories():
    categories = TaskCategory.query.all()
    
    return jsonify({
        'categories': [category.to_dict() for category in categories]
    }), 200

# Create a new task category
@tasks_bp.route('/categories', methods=['POST'])
@jwt_required()
def create_task_category():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'message': 'Missing category name'}), 400
    
    # Check if category already exists
    if TaskCategory.query.filter_by(name=data['name']).first():
        return jsonify({'message': 'Category name already exists'}), 400
    
    # Create new category
    category = TaskCategory(
        name=data['name'],
        color=data.get('color', '#3788d8')
    )
    
    db.session.add(category)
    db.session.commit()
    
    logger.info(f"New task category created: {category.name} by user {current_user_id}")
    
    return jsonify({
        'message': 'Category created successfully',
        'category': category.to_dict()
    }), 201

# Get task statistics
@tasks_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_task_statistics():
    current_user_id = get_jwt_identity()
    
    # Get total tasks count for current user
    total_tasks = Task.query.filter(
        (Task.assigned_to == current_user_id) | 
        (Task.created_by == current_user_id)
    ).count()
    
    # Get completed tasks count
    completed_status = TaskStatus.query.filter_by(name='Completed').first()
    if completed_status:
        completed_tasks = Task.query.filter(
            ((Task.assigned_to == current_user_id) | (Task.created_by == current_user_id)),
            Task.status_id == completed_status.id
        ).count()
    else:
        completed_tasks = 0
    
    # Get overdue tasks count
    today = datetime.utcnow().date()
    overdue_tasks = Task.query.filter(
        ((Task.assigned_to == current_user_id) | (Task.created_by == current_user_id)),
        db.func.date(Task.due_date) < today
    ).count()
    
    # Get tasks by status
    tasks_by_status = db.session.query(
        TaskStatus.name,
        TaskStatus.color,
        db.func.count(Task.id).label('count')
    ).outerjoin(
        Task, db.and_(
            Task.status_id == TaskStatus.id,
            db.or_(
                Task.assigned_to == current_user_id,
                Task.created_by == current_user_id
            )
        )
    ).group_by(
        TaskStatus.id
    ).all()
    
    # Get tasks by priority
    tasks_by_priority = db.session.query(
        TaskPriority.name,
        TaskPriority.color,
        db.func.count(Task.id).label('count')
    ).outerjoin(
        Task, db.and_(
            Task.priority_id == TaskPriority.id,
            db.or_(
                Task.assigned_to == current_user_id,
                Task.created_by == current_user_id
            )
        )
    ).group_by(
        TaskPriority.id
    ).all()
    
    # Calculate completion rate
    completion_rate = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
    
    return jsonify({
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'overdue_tasks': overdue_tasks,
        'completion_rate': completion_rate,
        'tasks_by_status': [
            {'name': item[0], 'color': item[1], 'count': item[2]} 
            for item in tasks_by_status
        ],
        'tasks_by_priority': [
            {'name': item[0], 'color': item[1], 'count': item[2]} 
            for item in tasks_by_priority
        ]
    }), 200