from extensions import db
from models.base import BaseModel

chat_group_members = db.Table('chat_group_members',
    db.Column('group_id', db.Integer, db.ForeignKey('chat_groups.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
)

class ChatGroup(db.Model, BaseModel):
    __tablename__ = 'chat_groups'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255))

    members = db.relationship('User', secondary=chat_group_members, lazy='subquery',
                              backref=db.backref('chat_groups', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'member_count': len(self.members)
        }
    
# Association table for group-permission relationship
group_permission = db.Table('group_permission',
    db.Column('group_id', db.Integer, db.ForeignKey('groups.id'), primary_key=True),
    db.Column('permission_id', db.Integer, db.ForeignKey('permissions.id'), primary_key=True)
)

class Group(db.Model, BaseModel):
    __tablename__ = 'groups'
    
    name = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.String(255))
    
    # Relationships
    permissions = db.relationship('Permission', secondary=group_permission, 
                                 backref=db.backref('groups', lazy='dynamic'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'permissions': [p.to_dict() for p in self.permissions],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def to_simple_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Permission(db.Model, BaseModel):
    __tablename__ = 'permissions'
    
    name = db.Column(db.String(64), unique=True, nullable=False)
    code = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.String(255))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'description': self.description
        }
