from extensions import db
from models.base import BaseModel
from datetime import datetime

class Transaction(db.Model, BaseModel):
    __tablename__ = 'transactions'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    transaction_type = db.Column(db.String(10), nullable=False)  # income, expense
    date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.String(255), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'))
    payment_method = db.Column(db.String(64))
    reference = db.Column(db.String(64))
    notes = db.Column(db.Text)
    
    # Relationships
    category = db.relationship('Category', backref='transactions')
    account = db.relationship('Account', backref='transactions')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'amount': self.amount,
            'transaction_type': self.transaction_type,
            'date': self.date.isoformat(),
            'description': self.description,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'account_id': self.account_id,
            'account_name': self.account.name if self.account else None,
            'payment_method': self.payment_method,
            'reference': self.reference,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Category(db.Model, BaseModel):
    __tablename__ = 'categories'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))  # Null for system categories
    name = db.Column(db.String(64), nullable=False)
    type = db.Column(db.String(10), default='both')  # income, expense, both
    color = db.Column(db.String(7), default='#3788d8')  # Hex color code
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'type': self.type,
            'color': self.color,
            'is_system': self.user_id is None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Account(db.Model, BaseModel):
    __tablename__ = 'accounts'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(64), nullable=False)
    account_type = db.Column(db.String(20), default='checking')  # checking, savings, credit, cash
    balance = db.Column(db.Float, default=0)
    currency = db.Column(db.String(3), default='USD')
    description = db.Column(db.String(255))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'account_type': self.account_type,
            'balance': self.balance,
            'currency': self.currency,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Budget(db.Model, BaseModel):
    __tablename__ = 'budgets'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(64), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    period = db.Column(db.String(10), nullable=False)  # weekly, monthly, yearly
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    color = db.Column(db.String(7), default='#3788d8')  # Hex color code
    
    # Relationships
    category = db.relationship('Category', backref='budgets')
    
    # Not stored in database, calculated on the fly
    current_spending = 0
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'amount': self.amount,
            'period': self.period,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else 'All Categories',
            'color': self.color,
            'current_spending': self.current_spending,
            'percentage': min(100, int((self.current_spending / self.amount) * 100)) if self.amount > 0 else 0,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
