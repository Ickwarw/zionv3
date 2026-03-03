from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Client(db.Model):
    __tablename__ = "clients"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, index=True)
    phone = db.Column(db.String(50), nullable=True, index=True)
    metadata = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Call(db.Model):
    __tablename__ = "calls"
    id = db.Column(db.Integer, primary_key=True)
    call_uuid = db.Column(db.String(128), unique=True, nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=True)
    direction = db.Column(db.String(10))  # 'inbound' or 'outbound'
    source = db.Column(db.String(50))  # 'whats','telefone','facebook','instagram',...
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    ended_at = db.Column(db.DateTime, nullable=True)
    duration_seconds = db.Column(db.Integer, nullable=True)
    from_number = db.Column(db.String(50), nullable=True, index=True)
    to_number = db.Column(db.String(50), nullable=True, index=True)
    location = db.Column(db.String(255), nullable=True)
    rating = db.Column(db.Integer, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    client = db.relationship("Client", backref="calls")
    recordings = db.relationship("Recording", backref="call", lazy=True)

class Recording(db.Model):
    __tablename__ = "recordings"
    id = db.Column(db.Integer, primary_key=True)
    call_id = db.Column(db.Integer, db.ForeignKey('calls.id'), nullable=False)
    filename = db.Column(db.String(512), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    filesize = db.Column(db.Integer, nullable=True)
    mime_type = db.Column(db.String(100), nullable=True)
