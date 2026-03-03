from extensions import db
from models.base import BaseModel
from datetime import datetime

class Product(db.Model, BaseModel):
    __tablename__ = 'products'
    
    name = db.Column(db.String(128), nullable=False)
    sku = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    cost_price = db.Column(db.Float, default=0)
    category_id = db.Column(db.Integer, db.ForeignKey('product_categories.id'))
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'))
    tax_rate = db.Column(db.Float, default=0)
    weight = db.Column(db.Float, default=0)
    dimensions = db.Column(db.String(64))
    barcode = db.Column(db.String(64))
    qr_code = db.Column(db.String(255))
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    category = db.relationship('ProductCategory', backref='products')
    supplier = db.relationship('Supplier', backref='products')
    inventory = db.relationship('ProductInventory', backref='product', uselist=False, cascade='all, delete-orphan')
    creator = db.relationship('User', backref='created_products')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'sku': self.sku,
            'description': self.description,
            'price': self.price,
            'cost_price': self.cost_price,
            'category_id': self.category_id,
            'category': self.category.name if self.category else None,
            'supplier_id': self.supplier_id,
            'supplier': self.supplier.name if self.supplier else None,
            'tax_rate': self.tax_rate,
            'weight': self.weight,
            'dimensions': self.dimensions,
            'barcode': self.barcode,
            'qr_code': self.qr_code,
            'inventory': self.inventory.to_dict() if self.inventory else None,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class ProductCategory(db.Model, BaseModel):
    __tablename__ = 'product_categories'
    
    name = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.String(255))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class ProductInventory(db.Model, BaseModel):
    __tablename__ = 'product_inventory'
    
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, unique=True)
    quantity = db.Column(db.Integer, default=0)
    reorder_level = db.Column(db.Integer, default=5)
    reorder_quantity = db.Column(db.Integer, default=10)
    location = db.Column(db.String(128))
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'reorder_level': self.reorder_level,
            'reorder_quantity': self.reorder_quantity,
            'location': self.location,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Supplier(db.Model, BaseModel):
    __tablename__ = 'suppliers'
    
    name = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(255))
    city = db.Column(db.String(64))
    state = db.Column(db.String(64))
    zip_code = db.Column(db.String(20))
    country = db.Column(db.String(64))
    website = db.Column(db.String(255))
    contact_person = db.Column(db.String(128))
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    contacts = db.relationship('SupplierContact', backref='supplier', cascade='all, delete-orphan')
    creator = db.relationship('User', backref='created_suppliers')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'country': self.country,
            'website': self.website,
            'contact_person': self.contact_person,
            'notes': self.notes,
            'contacts': [contact.to_dict() for contact in self.contacts],
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class SupplierContact(db.Model, BaseModel):
    __tablename__ = 'supplier_contacts'
    
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=False)
    name = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    position = db.Column(db.String(64))
    
    def to_dict(self):
        return {
            'id': self.id,
            'supplier_id': self.supplier_id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'position': self.position,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
