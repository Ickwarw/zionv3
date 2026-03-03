from extensions import db
from models.base import BaseModel
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid

chat_channel_tags = db.Table('chat_channel_tags',
    db.Column('channel_id', db.Integer, db.ForeignKey('chat_channels.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('chat_tags.id'), primary_key=True)
)

chat_channel_members = db.Table('chat_channel_members',
    db.Column('channel_id', db.Integer, db.ForeignKey('chat_channels.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
)

class ChatChannel(db.Model, BaseModel):
    __tablename__ = 'chat_channels'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    channel_type = db.Column(db.String(20), nullable=False)
    external_id = db.Column(db.String(64))
    name = db.Column(db.String(128), nullable=False)
    last_message = db.Column(db.Text)
    last_message_time = db.Column(db.DateTime)
    assumed_at = db.Column(db.DateTime)
    finished_at = db.Column(db.DateTime)
    unread_count = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default='pending', nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('chat_groups.id'), nullable=True)
    user_group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=True)
    observation = db.Column(db.String(4000))
    contact_id = db.Column(db.Integer, db.ForeignKey('chat_contacts.id'))
    
    channel_mode = db.Column(db.String(20), default='contact', nullable=False)

    messages = db.relationship('ChatMessage', backref='channel', lazy='dynamic', cascade='all, delete-orphan')
    ratings = db.relationship('ChatRating', backref='channel', lazy='dynamic', cascade='all, delete-orphan')
    tags = db.relationship('ChatTag', secondary=chat_channel_tags, lazy='subquery',
                           backref=db.backref('channels', lazy=True))
    group = db.relationship('ChatGroup', backref='channels')
    user_group = db.relationship('Group', backref='channels')
    contact = db.relationship('ChatContact', backref='channels')
    
    
    members = db.relationship('User', secondary=chat_channel_members, lazy='subquery',
                              backref=db.backref('internal_chats', lazy=True))

    def to_dict(self):
        channel_dict = {
            'id': self.id,
            'user_id': self.user_id,
            'channel_type': self.channel_type,
            'name': self.name,
            'last_message': self.last_message,
            'last_message_time': self.last_message_time.isoformat() if self.last_message_time else None,
            'unread_count': self.unread_count,
            'channel_mode': self.channel_mode,
            'created_at': self.created_at.isoformat() if self.created_at != None else '',
            'updated_at': self.updated_at.isoformat() if self.updated_at != None else '',
            'assumed_at': self.assumed_at.isoformat() if self.assumed_at != None else None,
            'finished_at': self.finished_at.isoformat() if self.finished_at != None else None,
            'observation': self.observation,
            'user_group_id': self.user_group_id,
            'status': self.status,
            'contact_id': self.contact_id,
            'contact': self.contact.to_dict() if self.contact else None,
            'user_group': {
                'id': self.user_group.id,
                'name': self.user_group.name
            } if self.user_group else None,
        }
        if self.channel_mode == 'contact':
            channel_dict.update({
                'external_id': self.external_id,
                'status': self.status,
                'group_id': self.group_id,
                'group_name': self.group.name if self.group else None,
                'tags': [tag.to_dict() for tag in self.tags],
            })
        else:
            channel_dict['members'] = [member.to_dict() for member in self.members]
            
        return channel_dict

class ChatMessage(db.Model, BaseModel):
    __tablename__ = 'chat_messages'
    
    channel_id = db.Column(db.Integer, db.ForeignKey('chat_channels.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    content = db.Column(db.Text, nullable=False)
    is_from_user = db.Column(db.Boolean, default=True)
    is_read = db.Column(db.Boolean, default=False)
    file_url = db.Column(db.String(512))

    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='chat_attended_messages')
    
    def to_dict(self):
        return {
            'id': self.id,
            'channel_id': self.channel_id,
            'user_id': self.user_id,
            'user': {
                'id': self.user.id,
                'username': self.user.username,
                'full_name': self.user.full_name,
            } if self.user and self.is_from_user else None,
            'content': self.content,
            'is_from_user': self.is_from_user,
            'is_read': self.is_read,
            'file_url': self.file_url,
            'created_at': self.created_at.isoformat() if self.created_at != None else ''
        }

class ChatContact(db.Model, BaseModel):
    __tablename__ = 'chat_contacts'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(128), nullable=False)
    contact_type = db.Column(db.String(20), nullable=False)
    contact_id = db.Column(db.String(64))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    profile_picture = db.Column(db.String(255))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'contact_type': self.contact_type,
            'contact_id': self.contact_id,
            'phone': self.phone,
            'email': self.email,
            'profile_picture': self.profile_picture,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class ChatRating(db.Model, BaseModel):
    __tablename__ = 'chat_ratings'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    channel_id = db.Column(db.Integer, db.ForeignKey('chat_channels.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'channel_id': self.channel_id,
            'user_id': self.user_id,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat()
        }

class ChatTag(db.Model, BaseModel):
    __tablename__ = 'chat_tags'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    color = db.Column(db.String(7), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'color': self.color
        }

class ChatContactHistory(db.Model, BaseModel):
    __tablename__ = 'chat_contact_history'

    id = db.Column(db.Integer, primary_key=True)
    contact_id = db.Column(db.Integer, db.ForeignKey('chat_contacts.id'), nullable=False)
    channel_type = db.Column(db.String(20), nullable=False)
    source = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'contact_id': self.contact_id,
            'channel_type': self.channel_type,
            'source': self.source,
            'created_at': self.created_at.isoformat()
        }


class ChatFlow(db.Model, BaseModel):
    __tablename__ = 'chat_flows'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)

    nodes = db.relationship('ChatFlowNode', backref='flow', lazy='dynamic', cascade='all, delete-orphan')

class ChatFlowNode(db.Model, BaseModel):
    __tablename__ = 'chat_flow_nodes'

    id = db.Column(db.Integer, primary_key=True)
    flow_id = db.Column(db.Integer, db.ForeignKey('chat_flows.id'), nullable=False)
    node_type = db.Column(db.String(50), nullable=False)
    content = db.Column(JSONB, nullable=False)
    
    
    pos_x = db.Column(db.Float, default=0)
    pos_y = db.Column(db.Float, default=0)

    edges = db.relationship('ChatFlowEdge', foreign_keys='ChatFlowEdge.source_node_id', backref='source_node', lazy='dynamic', cascade='all, delete-orphan')

class ChatFlowEdge(db.Model, BaseModel):
    __tablename__ = 'chat_flow_edges'

    id = db.Column(db.Integer, primary_key=True)
    flow_id = db.Column(db.Integer, db.ForeignKey('chat_flows.id'), nullable=False)
    source_node_id = db.Column(db.Integer, db.ForeignKey('chat_flow_nodes.id'), nullable=False)
    target_node_id = db.Column(db.Integer, db.ForeignKey('chat_flow_nodes.id'), nullable=False)
    condition = db.Column(db.String(255))