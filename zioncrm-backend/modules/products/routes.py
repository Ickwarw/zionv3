from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.products import Product, Supplier, ProductCategory, ProductInventory, SupplierContact
from extensions import db
import logging
from datetime import datetime
import os
import uuid
import qrcode
from PIL import Image
from io import BytesIO
import base64

products_bp = Blueprint('products', __name__)
logger = logging.getLogger(__name__)

# Get all products
@products_bp.route('/products', methods=['GET'])
@jwt_required()
def get_products():
    # Get query parameters
    category_id = request.args.get('category_id', type=int)
    supplier_id = request.args.get('supplier_id', type=int)
    search = request.args.get('search', '')
    low_stock = request.args.get('low_stock', type=bool, default=False)
    
    # Build query
    query = Product.query
    
    # Filter by category
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    # Filter by supplier
    if supplier_id:
        query = query.filter_by(supplier_id=supplier_id)
    
    # Search by name, sku, or description
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(search_term)) |
            (Product.sku.ilike(search_term)) |
            (Product.description.ilike(search_term))
        )
    
    # Filter by low stock
    if low_stock != None and low_stock == True:
        query = query.join(ProductInventory).filter(
            ProductInventory.quantity <= ProductInventory.reorder_level
        )
    
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Get products with pagination
    products = query.order_by(Product.name).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'products': [product.to_dict() for product in products.items],
        'total': products.total,
        'pages': products.pages,
        'current_page': products.page
    }), 200

# Get a specific product
@products_bp.route('/products/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'message': 'Product not found'}), 404
    
    return jsonify(product.to_dict()), 200

# Create a new product
@products_bp.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'sku', 'price']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    # Check if SKU already exists
    if Product.query.filter_by(sku=data['sku']).first():
        return jsonify({'message': 'SKU already exists'}), 400
    
    # Create new product
    product = Product(
        name=data['name'],
        sku=data['sku'],
        description=data.get('description', ''),
        price=data['price'],
        cost_price=data.get('cost_price', 0),
        category_id=data.get('category_id'),
        supplier_id=data.get('supplier_id'),
        tax_rate=data.get('tax_rate', 0),
        weight=data.get('weight', 0),
        dimensions=data.get('dimensions', ''),
        barcode=data.get('barcode', ''),
        created_by=current_user_id
    )
    
    db.session.add(product)
    db.session.commit()
    
    # Create inventory record
    inventory = ProductInventory(
        product_id=product.id,
        quantity=data.get('quantity', 0),
        reorder_level=data.get('reorder_level', 5),
        reorder_quantity=data.get('reorder_quantity', 10),
        location=data.get('location', '')
    )
    
    db.session.add(inventory)
    db.session.commit()
    
    # Generate QR code for the product
    qr_data = f"PRODUCT:{product.id}|SKU:{product.sku}|NAME:{product.name}"
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save QR code to file
    qr_filename = f"product_qr_{product.id}.png"
    qr_path = os.path.join(current_app.config['UPLOAD_FOLDER'], qr_filename)
    os.makedirs(os.path.dirname(qr_path), exist_ok=True)
    img.save(qr_path)
    
    # Update product with QR code path
    product.qr_code = qr_filename
    db.session.commit()
    
    logger.info(f"New product created: {product.name} by user {current_user_id}")
    
    return jsonify({
        'message': 'Product created successfully',
        'product': product.to_dict()
    }), 201

# Update a product
@products_bp.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    current_user_id = get_jwt_identity()
    
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'message': 'Product not found'}), 404
    
    data = request.get_json()
    
    # Update product fields
    if 'name' in data:
        product.name = data['name']
    
    if 'sku' in data:
        # Check if new SKU already exists
        existing_product = Product.query.filter_by(sku=data['sku']).first()
        if existing_product and existing_product.id != product_id:
            return jsonify({'message': 'SKU already exists'}), 400
        
        product.sku = data['sku']
    
    if 'description' in data:
        product.description = data['description']
    
    if 'price' in data:
        product.price = data['price']
    
    if 'cost_price' in data:
        product.cost_price = data['cost_price']
    
    if 'category_id' in data:
        product.category_id = data['category_id']
    
    if 'supplier_id' in data:
        product.supplier_id = data['supplier_id']
    
    if 'tax_rate' in data:
        product.tax_rate = data['tax_rate']
    
    if 'weight' in data:
        product.weight = data['weight']
    
    if 'dimensions' in data:
        product.dimensions = data['dimensions']
    
    if 'barcode' in data:
        product.barcode = data['barcode']
    
    # Update inventory if provided
    if 'quantity' in data or 'reorder_level' in data or 'reorder_quantity' in data or 'location' in data:
        inventory = ProductInventory.query.filter_by(product_id=product_id).first()
        
        if not inventory:
            # Create inventory if it doesn't exist
            inventory = ProductInventory(
                product_id=product_id,
                quantity=data.get('quantity', 0),
                reorder_level=data.get('reorder_level', 5),
                reorder_quantity=data.get('reorder_quantity', 10),
                location=data.get('location', '')
            )
            db.session.add(inventory)
        else:
            # Update existing inventory
            if 'quantity' in data:
                inventory.quantity = data['quantity']
            
            if 'reorder_level' in data:
                inventory.reorder_level = data['reorder_level']
            
            if 'reorder_quantity' in data:
                inventory.reorder_quantity = data['reorder_quantity']
            
            if 'location' in data:
                inventory.location = data['location']
    
    product.updated_at = datetime.utcnow()
    db.session.commit()
    
    logger.info(f"Product {product_id} updated by user {current_user_id}")
    
    return jsonify({
        'message': 'Product updated successfully',
        'product': product.to_dict()
    }), 200

# Delete a product
@products_bp.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    current_user_id = get_jwt_identity()
    
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'message': 'Product not found'}), 404
    
    # Delete inventory record
    ProductInventory.query.filter_by(product_id=product_id).delete()
    
    # Delete QR code file if it exists
    if product.qr_code:
        qr_path = os.path.join(current_app.config['UPLOAD_FOLDER'], product.qr_code)
        if os.path.exists(qr_path):
            os.remove(qr_path)
    
    # Delete the product
    db.session.delete(product)
    db.session.commit()
    
    logger.info(f"Product {product_id} deleted by user {current_user_id}")
    
    return jsonify({'message': 'Product deleted successfully'}), 200

def get_qr_code_filename(product_id):
    qr_filename = f"product_qr_{product_id}.png"
    qr_path = os.path.join(current_app.config['UPLOAD_FOLDER'], qr_filename)
    return qr_filename, qr_path


# Get product QR code
@products_bp.route('/products/<int:product_id>/qrcode', methods=['GET'])
@jwt_required()
def get_product_qrcode(product_id):
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'message': 'Product not found'}), 404
    
    qr_filename, qr_path = get_qr_code_filename(product.id)
    if (not product.qr_code) or (not os.path.exists(qr_path)):
        # Generate QR code if it doesn't exist
        qr_data = f"PRODUCT:{product.id}|SKU:{product.sku}|NAME:{product.name}"
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save QR code to file
        # qr_filename = f"product_qr_{product.id}.png"
        # qr_path = os.path.join(current_app.config['UPLOAD_FOLDER'], qr_filename)
        os.makedirs(os.path.dirname(qr_path), exist_ok=True)
        img.save(qr_path)
        
        # Update product with QR code path
        product.qr_code = qr_filename
        db.session.commit()
    
    # Read QR code file and convert to base64
    qr_path = os.path.join(current_app.config['UPLOAD_FOLDER'], product.qr_code)
    
    if not os.path.exists(qr_path):
        return jsonify({'message': 'QR code file not found'}), 404
    
    with open(qr_path, 'rb') as f:
        qr_data = f.read()
    
    qr_base64 = base64.b64encode(qr_data).decode('utf-8')
    
    return jsonify({
        'qr_code': qr_base64,
        'product_id': product.id,
        'sku': product.sku
    }), 200

# Get all product categories
@products_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    categories = ProductCategory.query.all()
    
    return jsonify({
        'categories': [category.to_dict() for category in categories]
    }), 200

# Create a new product category
@products_bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'message': 'Missing category name'}), 400
    
    # Check if category already exists
    if ProductCategory.query.filter_by(name=data['name']).first():
        return jsonify({'message': 'Category name already exists'}), 400
    
    # Create new category
    category = ProductCategory(
        name=data['name'],
        description=data.get('description', '')
    )
    
    db.session.add(category)
    db.session.commit()
    
    logger.info(f"New product category created: {category.name} by user {current_user_id}")
    
    return jsonify({
        'message': 'Category created successfully',
        'category': category.to_dict()
    }), 201

# Get all suppliers
@products_bp.route('/suppliers', methods=['GET'])
@jwt_required()
def get_suppliers():
    # Get query parameters
    search = request.args.get('search', '')
    
    # Build query
    query = Supplier.query
    
    # Search by name, email, or phone
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Supplier.name.ilike(search_term)) |
            (Supplier.email.ilike(search_term)) |
            (Supplier.phone.ilike(search_term)) |
            (Supplier.contact_person.ilike(search_term))
        )
    
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Get suppliers with pagination
    suppliers = query.order_by(Supplier.name).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'suppliers': [supplier.to_dict() for supplier in suppliers.items],
        'total': suppliers.total,
        'pages': suppliers.pages,
        'current_page': suppliers.page
    }), 200

# Get a specific supplier
@products_bp.route('/suppliers/<int:supplier_id>', methods=['GET'])
@jwt_required()
def get_supplier(supplier_id):
    supplier = Supplier.query.get(supplier_id)
    
    if not supplier:
        return jsonify({'message': 'Supplier not found'}), 404
    
    return jsonify(supplier.to_dict()), 200

# Create a new supplier
@products_bp.route('/suppliers', methods=['POST'])
@jwt_required()
def create_supplier():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'email', 'phone']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    # Create new supplier
    supplier = Supplier(
        name=data['name'],
        email=data['email'],
        phone=data['phone'],
        address=data.get('address', ''),
        city=data.get('city', ''),
        state=data.get('state', ''),
        zip_code=data.get('zip_code', ''),
        country=data.get('country', ''),
        website=data.get('website', ''),
        contact_person=data.get('contact_person', ''),
        notes=data.get('notes', ''),
        created_by=current_user_id
    )
    
    db.session.add(supplier)
    db.session.commit()
    
    # Add contacts if provided
    if 'contacts' in data and isinstance(data['contacts'], list):
        for contact_data in data['contacts']:
            if 'name' in contact_data and 'email' in contact_data:
                contact = SupplierContact(
                    supplier_id=supplier.id,
                    name=contact_data['name'],
                    email=contact_data['email'],
                    phone=contact_data.get('phone', ''),
                    position=contact_data.get('position', '')
                )
                db.session.add(contact)
        
        db.session.commit()
    
    logger.info(f"New supplier created: {supplier.name} by user {current_user_id}")
    
    return jsonify({
        'message': 'Supplier created successfully',
        'supplier': supplier.to_dict()
    }), 201

# Update a supplier
@products_bp.route('/suppliers/<int:supplier_id>', methods=['PUT'])
@jwt_required()
def update_supplier(supplier_id):
    current_user_id = get_jwt_identity()
    
    supplier = Supplier.query.get(supplier_id)
    
    if not supplier:
        return jsonify({'message': 'Supplier not found'}), 404
    
    data = request.get_json()
    
    # Update supplier fields
    if 'name' in data:
        supplier.name = data['name']
    
    if 'email' in data:
        supplier.email = data['email']
    
    if 'phone' in data:
        supplier.phone = data['phone']
    
    if 'address' in data:
        supplier.address = data['address']
    
    if 'city' in data:
        supplier.city = data['city']
    
    if 'state' in data:
        supplier.state = data['state']
    
    if 'zip_code' in data:
        supplier.zip_code = data['zip_code']
    
    if 'country' in data:
        supplier.country = data['country']
    
    if 'website' in data:
        supplier.website = data['website']
    
    if 'contact_person' in data:
        supplier.contact_person = data['contact_person']
    
    if 'notes' in data:
        supplier.notes = data['notes']
    
    supplier.updated_at = datetime.utcnow()
    db.session.commit()
    
    logger.info(f"Supplier {supplier_id} updated by user {current_user_id}")
    
    return jsonify({
        'message': 'Supplier updated successfully',
        'supplier': supplier.to_dict()
    }), 200

# Delete a supplier
@products_bp.route('/suppliers/<int:supplier_id>', methods=['DELETE'])
@jwt_required()
def delete_supplier(supplier_id):
    current_user_id = get_jwt_identity()
    
    supplier = Supplier.query.get(supplier_id)
    
    if not supplier:
        return jsonify({'message': 'Supplier not found'}), 404
    
    # Check if supplier has products
    if Product.query.filter_by(supplier_id=supplier_id).first():
        return jsonify({'message': 'Cannot delete supplier with associated products'}), 400
    
    # Delete supplier contacts
    SupplierContact.query.filter_by(supplier_id=supplier_id).delete()
    
    # Delete the supplier
    db.session.delete(supplier)
    db.session.commit()
    
    logger.info(f"Supplier {supplier_id} deleted by user {current_user_id}")
    
    return jsonify({'message': 'Supplier deleted successfully'}), 200

# Get supplier contacts
@products_bp.route('/suppliers/<int:supplier_id>/contacts', methods=['GET'])
@jwt_required()
def get_supplier_contacts(supplier_id):
    supplier = Supplier.query.get(supplier_id)
    
    if not supplier:
        return jsonify({'message': 'Supplier not found'}), 404
    
    contacts = SupplierContact.query.filter_by(supplier_id=supplier_id).all()
    
    return jsonify({
        'contacts': [contact.to_dict() for contact in contacts]
    }), 200

# Add a supplier contact
@products_bp.route('/suppliers/<int:supplier_id>/contacts', methods=['POST'])
@jwt_required()
def add_supplier_contact(supplier_id):
    supplier = Supplier.query.get(supplier_id)
    
    if not supplier:
        return jsonify({'message': 'Supplier not found'}), 404
    
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('email'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Create new contact
    contact = SupplierContact(
        supplier_id=supplier_id,
        name=data['name'],
        email=data['email'],
        phone=data.get('phone', ''),
        position=data.get('position', '')
    )
    
    db.session.add(contact)
    db.session.commit()
    
    return jsonify({
        'message': 'Contact added successfully',
        'contact': contact.to_dict()
    }), 201

# Update inventory
@products_bp.route('/products/<int:product_id>/inventory', methods=['PUT'])
@jwt_required()
def update_inventory(product_id):
    current_user_id = get_jwt_identity()
    
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'message': 'Product not found'}), 404
    
    data = request.get_json()
    
    if not data or 'quantity' not in data:
        return jsonify({'message': 'Missing quantity'}), 400
    
    inventory = ProductInventory.query.filter_by(product_id=product_id).first()
    
    if not inventory:
        # Create inventory if it doesn't exist
        inventory = ProductInventory(
            product_id=product_id,
            quantity=data['quantity'],
            reorder_level=data.get('reorder_level', 5),
            reorder_quantity=data.get('reorder_quantity', 10),
            location=data.get('location', '')
        )
        db.session.add(inventory)
    else:
        # Update existing inventory
        inventory.quantity = data['quantity']
        
        if 'reorder_level' in data:
            inventory.reorder_level = data['reorder_level']
        
        if 'reorder_quantity' in data:
            inventory.reorder_quantity = data['reorder_quantity']
        
        if 'location' in data:
            inventory.location = data['location']
    
    db.session.commit()
    
    logger.info(f"Inventory updated for product {product_id} by user {current_user_id}")
    
    return jsonify({
        'message': 'Inventory updated successfully',
        'inventory': inventory.to_dict()
    }), 200

# Get low stock products
@products_bp.route('/low-stock', methods=['GET'])
@jwt_required()
def get_low_stock():
    # Get products with quantity below reorder level
    low_stock_products = db.session.query(Product).join(
        ProductInventory
    ).filter(
        ProductInventory.quantity <= ProductInventory.reorder_level
    ).all()
    
    return jsonify({
        'products': [product.to_dict() for product in low_stock_products],
        'count': len(low_stock_products)
    }), 200

# Get product statistics
@products_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_product_statistics():
    # Get total products count
    total_products = Product.query.count()
    
    # Get total suppliers count
    total_suppliers = Supplier.query.count()
    
    # Get low stock products count
    low_stock_count = db.session.query(Product).join(
        ProductInventory
    ).filter(
        ProductInventory.quantity <= ProductInventory.reorder_level
    ).count()
    
    # Get products by category
    products_by_category = db.session.query(
        ProductCategory.name,
        db.func.count(Product.id).label('count')
    ).outerjoin(
        Product, Product.category_id == ProductCategory.id
    ).group_by(
        ProductCategory.id
    ).all()
    
    # Get total inventory value
    total_inventory_value = db.session.query(
        db.func.sum(Product.price * ProductInventory.quantity)
    ).join(
        ProductInventory, ProductInventory.product_id == Product.id
    ).scalar() or 0
    
    return jsonify({
        'total_products': total_products,
        'total_suppliers': total_suppliers,
        'low_stock_count': low_stock_count,
        'products_by_category': [
            {'category': item[0], 'count': item[1]} 
            for item in products_by_category
        ],
        'total_inventory_value': total_inventory_value
    }), 200
