from extensions import db
from models.base import BaseModel
from datetime import datetime

class EventType(db.Model, BaseModel):
    __tablename__ = 'event_type'
    
    name = db.Column(db.String(64), nullable=False, unique=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Event(db.Model, BaseModel):
    __tablename__ = 'events'
    
    title = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(255))
    is_public = db.Column(db.Boolean, default=False)
    event_type_id = db.Column(db.Integer, db.ForeignKey('event_type.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    color = db.Column(db.String(7), default='#3788d8')  # Hex color code
    reminder_minutes = db.Column(db.Integer, default=15)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('events', lazy='dynamic'))
    event_type = db.relationship('EventType', backref=db.backref('events', lazy='dynamic'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat(),
            'location': self.location,
            'is_public': self.is_public,
            'user_id': self.user_id,
            'event_type_id': self.event_type_id,
            'event_type': self.event_type.to_dict() if self.event_type else None,
            'color': self.color,
            'reminder_minutes': self.reminder_minutes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
