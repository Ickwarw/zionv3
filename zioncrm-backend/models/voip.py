from extensions import db
from models.base import BaseModel

class CallLog(db.Model, BaseModel):
    __tablename__ = 'call_logs'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    call_id = db.Column(db.String(64), unique=True, nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    direction = db.Column(db.String(10), nullable=False)  # inbound, outbound
    start_time = db.Column(db.DateTime, nullable=False)
    connect_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    duration = db.Column(db.Integer)  # in seconds
    status = db.Column(db.String(20))  # initiating, ringing, connected, completed, failed
    recording_url = db.Column(db.String(255))
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'call_id': self.call_id,
            'phone_number': self.phone_number,
            'direction': self.direction,
            'start_time': self.start_time.isoformat(),
            'connect_time': self.connect_time.isoformat() if self.connect_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'duration': self.duration,
            'status': self.status,
            'recording_url': self.recording_url,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }

class VoipExtension(db.Model, BaseModel):
    __tablename__ = 'voip_extensions'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    extension_number = db.Column(db.String(20), nullable=False, unique=True)
    password = db.Column(db.String(64))
    display_name = db.Column(db.String(64))
    sip_server = db.Column(db.String(128))
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'extension_number': self.extension_number,
            'display_name': self.display_name,
            'sip_server': self.sip_server,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class VoipContact(db.Model, BaseModel):
    __tablename__ = 'voip_contacts'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(128), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    extension = db.Column(db.String(20))
    company = db.Column(db.String(128))
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'phone_number': self.phone_number,
            'extension': self.extension,
            'company': self.company,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }