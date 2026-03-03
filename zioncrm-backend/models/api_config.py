from extensions import db
from models.base import BaseModel
from sqlalchemy.dialects.postgresql import JSONB

class ApiConfig(db.Model, BaseModel):
    __tablename__ = 'api_configs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True) # Each user has one set of configs
    
    # Store credentials in a secure JSONB field. This is flexible.
    facebook_config = db.Column(JSONB)
    instagram_config = db.Column(JSONB)
    whatsapp_config = db.Column(JSONB)

    def to_dict(self):
        # Be careful not to expose sensitive keys to unintended users
        return {
            'id': self.id,
            'user_id': self.user_id,
            'has_facebook_config': self.facebook_config is not None,
            'has_instagram_config': self.instagram_config is not None,
            'has_whatsapp_config': self.whatsapp_config is not None,
            'updated_at': self.updated_at.isoformat()
        }

    def get_platform_config(self, platform):
        """Helper to get config for a specific platform."""
        if platform == 'facebook':
            return self.facebook_config
        elif platform == 'instagram':
            return self.instagram_config
        elif platform == 'whatsapp':
            return self.whatsapp_config
        return None

# Modificações inseridas: Criado o modelo ApiConfig para armazenar as configurações de API de forma segura e flexível.
