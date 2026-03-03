from extensions import db
from models.base import BaseModel
from datetime import datetime

class Assistant(db.Model, BaseModel):
    __tablename__ = 'assistants'
    
    name = db.Column(db.String(64), nullable=False)
    description = db.Column(db.Text)
    avatar = db.Column(db.String(255))
    specialty = db.Column(db.String(64), nullable=False)  # sales, customer_service, data_analysis, etc.
    greeting = db.Column(db.Text, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    model_type = db.Column(db.String(64), default='gpt')  # gpt, bert, custom, etc.
    
    # Relationships
    conversations = db.relationship('Conversation', backref='assistant', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'avatar': self.avatar,
            'specialty': self.specialty,
            'greeting': self.greeting,
            'is_active': self.is_active,
            'model_type': self.model_type,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Conversation(db.Model, BaseModel):
    __tablename__ = 'conversations'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assistant_id = db.Column(db.Integer, db.ForeignKey('assistants.id'), nullable=False)
    title = db.Column(db.String(128), nullable=False)
    
    # Relationships
    messages = db.relationship('Message', backref='conversation', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'assistant_id': self.assistant_id,
            'title': self.title,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Message(db.Model, BaseModel):
    __tablename__ = 'messages'
    
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_from_assistant = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'content': self.content,
            'is_from_assistant': self.is_from_assistant,
            'created_at': self.created_at.isoformat()
        }

# Base class for assistant training data
class AssistantTrainingData(BaseModel):
    __abstract__ = True
    
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(64))
    confidence = db.Column(db.Float, default=1.0)  # 0.0 to 1.0
    is_approved = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'question': self.question,
            'answer': self.answer,
            'category': self.category,
            'confidence': self.confidence,
            'is_approved': self.is_approved,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Individual training data tables for each assistant
class JuliaTrainingData(db.Model, AssistantTrainingData):
    __tablename__ = 'julia_training_data'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class JoceTrainingData(db.Model, AssistantTrainingData):
    __tablename__ = 'joce_training_data'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class BrayanTrainingData(db.Model, AssistantTrainingData):
    __tablename__ = 'brayan_training_data'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RaizenTrainingData(db.Model, AssistantTrainingData):
    __tablename__ = 'raizen_training_data'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class QuimTrainingData(db.Model, AssistantTrainingData):
    __tablename__ = 'quim_training_data'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SalesAssistantTrainingData(db.Model, AssistantTrainingData):
    __tablename__ = 'sales_assistant_training_data'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SupportAssistantTrainingData(db.Model, AssistantTrainingData):
    __tablename__ = 'support_assistant_training_data'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FinanceAssistantTrainingData(db.Model, AssistantTrainingData):
    __tablename__ = 'finance_assistant_training_data'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MarketingAssistantTrainingData(db.Model, AssistantTrainingData):
    __tablename__ = 'marketing_assistant_training_data'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ProductAssistantTrainingData(db.Model, AssistantTrainingData):
    __tablename__ = 'product_assistant_training_data'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AnalyticsAssistantTrainingData(db.Model, AssistantTrainingData):
    __tablename__ = 'analytics_assistant_training_data'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)