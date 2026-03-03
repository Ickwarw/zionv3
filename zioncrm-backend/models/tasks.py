from extensions import db
from models.base import BaseModel
from datetime import datetime

class Task(db.Model, BaseModel):
    __tablename__ = 'tasks'
    
    title = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.DateTime, nullable=False)
    completed_at = db.Column(db.DateTime)
    status_id = db.Column(db.Integer, db.ForeignKey('task_statuses.id'))
    priority_id = db.Column(db.Integer, db.ForeignKey('task_priorities.id'))
    category_id = db.Column(db.Integer, db.ForeignKey('task_categories.id'))
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    status = db.relationship('TaskStatus', backref='tasks')
    priority = db.relationship('TaskPriority', backref='tasks')
    category = db.relationship('TaskCategory', backref='tasks')
    assignee = db.relationship('User', foreign_keys=[assigned_to], backref='assigned_tasks')
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_tasks')
    comments = db.relationship('TaskComment', backref='task', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'due_date': self.due_date.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'status_id': self.status_id,
            'status': self.status.to_dict() if self.status else None,
            'priority_id': self.priority_id,
            'priority': self.priority.to_dict() if self.priority else None,
            'category_id': self.category_id,
            'category': self.category.to_dict() if self.category else None,
            'assigned_to': self.assigned_to,
            'assignee': {
                'id': self.assignee.id,
                'username': self.assignee.username,
                'full_name': self.assignee.full_name
            } if self.assignee else None,
            'created_by': self.created_by,
            'creator': {
                'id': self.creator.id,
                'username': self.creator.username
            } if self.creator else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class TaskStatus(db.Model, BaseModel):
    __tablename__ = 'task_statuses'
    
    name = db.Column(db.String(64), nullable=False, unique=True)
    color = db.Column(db.String(7), default='#3788d8')  # Hex color code
    order = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'color': self.color,
            'order': self.order,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class TaskPriority(db.Model, BaseModel):
    __tablename__ = 'task_priorities'
    
    name = db.Column(db.String(64), nullable=False, unique=True)
    color = db.Column(db.String(7), default='#3788d8')  # Hex color code
    order = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'color': self.color,
            'order': self.order,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class TaskCategory(db.Model, BaseModel):
    __tablename__ = 'task_categories'
    
    name = db.Column(db.String(64), nullable=False, unique=True)
    color = db.Column(db.String(7), default='#3788d8')  # Hex color code
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'color': self.color,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class TaskComment(db.Model, BaseModel):
    __tablename__ = 'task_comments'
    
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    
    # Relationships
    user = db.relationship('User', backref='task_comments')
    
    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'user_id': self.user_id,
            'user': {
                'id': self.user.id,
                'username': self.user.username,
                'full_name': self.user.full_name
            } if self.user else None,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
