from extensions import db
from models.base import BaseModel

class SystemLog(db.Model, BaseModel):
    __tablename__ = 'system_logs'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    log_type = db.Column(db.String(20), nullable=False)
    message = db.Column(db.Text, nullable=False)
    ip_address = db.Column(db.String(45))
    
    
    user = db.relationship('User', backref='logs')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user': self.user.username if self.user else None,
            'log_type': self.log_type,
            'message': self.message,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat()
        }
