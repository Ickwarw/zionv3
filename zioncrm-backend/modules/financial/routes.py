from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.financial import Transaction, Category, Account, Budget
from extensions import db
import logging
from datetime import datetime, timedelta
import calendar

financial_bp = Blueprint('financial', __name__)
logger = logging.getLogger(__name__)

# Get all transactions
@financial_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    current_user_id = get_jwt_identity()
    
    # Get query parameters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    transaction_type = request.args.get('type')  # income, expense
    category_id = request.args.get('category_id', type=int)
    account_id = request.args.get('account_id', type=int)
    
    # Build query
    query = Transaction.query.filter_by(user_id=current_user_id)
    
    if start_date:
        query = query.filter(Transaction.date >= datetime.fromisoformat(start_date))
    
    if end_date:
        query = query.filter(Transaction.date <= datetime.fromisoformat(end_date))
    
    if transaction_type:
        query = query.filter_by(transaction_type=transaction_type)
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if account_id:
        query = query.filter_by(account_id=account_id)
    
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Get transactions with pagination
    transactions = query.order_by(Transaction.date.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'transactions': [transaction.to_dict() for transaction in transactions.items],
        'total': transactions.total,
        'pages': transactions.pages,
        'current_page': transactions.page
    }), 200

# Get a specific transaction
@financial_bp.route('/transactions/<int:transaction_id>', methods=['GET'])
@jwt_required()
def get_transaction(transaction_id):
    current_user_id = get_jwt_identity()
    
    transaction = Transaction.query.get(transaction_id)
    
    if not transaction:
        return jsonify({'message': 'Transaction not found'}), 404
    
    # Check if user owns this transaction
    if transaction.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    return jsonify(transaction.to_dict()), 200

# Create a new transaction
@financial_bp.route('/transactions', methods=['POST'])
@jwt_required()
def create_transaction():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['amount', 'transaction_type', 'date', 'description']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    # Validate transaction type
    if data['transaction_type'] not in ['income', 'expense']:
        return jsonify({'message': 'Invalid transaction type'}), 400
    
    # Parse date
    try:
        date = datetime.fromisoformat(data['date'])
    except ValueError:
        return jsonify({'message': 'Invalid date format'}), 400
    
    # Create new transaction
    transaction = Transaction(
        user_id=current_user_id,
        amount=data['amount'],
        transaction_type=data['transaction_type'],
        date=date,
        description=data['description'],
        category_id=data.get('category_id'),
        account_id=data.get('account_id'),
        payment_method=data.get('payment_method', ''),
        reference=data.get('reference', ''),
        notes=data.get('notes', '')
    )
    
    db.session.add(transaction)
    
    # Update account balance if account_id is provided
    if data.get('account_id'):
        account = Account.query.get(data['account_id'])
        if account and account.user_id == current_user_id:
            if data['transaction_type'] == 'income':
                account.balance += data['amount']
            else:
                account.balance -= data['amount']
    
    db.session.commit()
    
    logger.info(f"New {data['transaction_type']} transaction created by user {current_user_id}")
    
    return jsonify({
        'message': 'Transaction created successfully',
        'transaction': transaction.to_dict()
    }), 201

# Update a transaction
@financial_bp.route('/transactions/<int:transaction_id>', methods=['PUT'])
@jwt_required()
def update_transaction(transaction_id):
    current_user_id = get_jwt_identity()
    
    transaction = Transaction.query.get(transaction_id)
    
    if not transaction:
        return jsonify({'message': 'Transaction not found'}), 404
    
    # Check if user owns this transaction
    if transaction.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    # Store original values for account balance adjustment
    original_amount = transaction.amount
    original_type = transaction.transaction_type
    original_account_id = transaction.account_id
    
    # Update transaction fields
    if 'amount' in data:
        transaction.amount = data['amount']
    
    if 'transaction_type' in data:
        if data['transaction_type'] not in ['income', 'expense']:
            return jsonify({'message': 'Invalid transaction type'}), 400
        transaction.transaction_type = data['transaction_type']
    
    if 'date' in data:
        try:
            transaction.date = datetime.fromisoformat(data['date'])
        except ValueError:
            return jsonify({'message': 'Invalid date format'}), 400
    
    if 'description' in data:
        transaction.description = data['description']
    
    if 'category_id' in data:
        transaction.category_id = data['category_id']
    
    if 'account_id' in data:
        transaction.account_id = data['account_id']
    
    if 'payment_method' in data:
        transaction.payment_method = data['payment_method']
    
    if 'reference' in data:
        transaction.reference = data['reference']
    
    if 'notes' in data:
        transaction.notes = data['notes']
    
    # Update account balances if necessary
    if original_account_id:
        original_account = Account.query.get(original_account_id)
        if original_account and original_account.user_id == current_user_id:
            # Reverse the original transaction effect
            if original_type == 'income':
                original_account.balance -= original_amount
            else:
                original_account.balance += original_amount
    
    if transaction.account_id:
        new_account = Account.query.get(transaction.account_id)
        if new_account and new_account.user_id == current_user_id:
            # Apply the new transaction effect
            if transaction.transaction_type == 'income':
                new_account.balance += transaction.amount
            else:
                new_account.balance -= transaction.amount
    
    db.session.commit()
    
    logger.info(f"Transaction {transaction_id} updated by user {current_user_id}")
    
    return jsonify({
        'message': 'Transaction updated successfully',
        'transaction': transaction.to_dict()
    }), 200

# Delete a transaction
@financial_bp.route('/transactions/<int:transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(transaction_id):
    current_user_id = get_jwt_identity()
    
    transaction = Transaction.query.get(transaction_id)
    
    if not transaction:
        return jsonify({'message': 'Transaction not found'}), 404
    
    # Check if user owns this transaction
    if transaction.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    # Update account balance if necessary
    if transaction.account_id:
        account = Account.query.get(transaction.account_id)
        if account and account.user_id == current_user_id:
            if transaction.transaction_type == 'income':
                account.balance -= transaction.amount
            else:
                account.balance += transaction.amount
    
    db.session.delete(transaction)
    db.session.commit()
    
    logger.info(f"Transaction {transaction_id} deleted by user {current_user_id}")
    
    return jsonify({'message': 'Transaction deleted successfully'}), 200

# Get all categories
@financial_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    current_user_id = get_jwt_identity()
    
    # Get both system categories and user-created categories
    categories = Category.query.filter(
        (Category.user_id.is_(None)) | (Category.user_id == current_user_id)
    ).all()
    
    return jsonify({
        'categories': [category.to_dict() for category in categories]
    }), 200

# Create a new category
@financial_bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'message': 'Missing category name'}), 400
    
    # Create new category
    category = Category(
        user_id=current_user_id,
        name=data['name'],
        type=data.get('type', 'both'),  # income, expense, both
        color=data.get('color', '#3788d8')
    )
    
    db.session.add(category)
    db.session.commit()
    
    return jsonify({
        'message': 'Category created successfully',
        'category': category.to_dict()
    }), 201

# Update a category
@financial_bp.route('/categories/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    current_user_id = get_jwt_identity()
    
    category = Category.query.get(category_id)
    
    if not category:
        return jsonify({'message': 'Category not found'}), 404
    
    # Check if user owns this category or if it's a system category
    if category.user_id is not None and category.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    # Don't allow editing system categories
    if category.user_id is None:
        return jsonify({'message': 'Cannot edit system categories'}), 403
    
    data = request.get_json()
    
    if 'name' in data:
        category.name = data['name']
    
    if 'type' in data:
        if data['type'] not in ['income', 'expense', 'both']:
            return jsonify({'message': 'Invalid category type'}), 400
        category.type = data['type']
    
    if 'color' in data:
        category.color = data['color']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Category updated successfully',
        'category': category.to_dict()
    }), 200

# Delete a category
@financial_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    current_user_id = get_jwt_identity()
    
    category = Category.query.get(category_id)
    
    if not category:
        return jsonify({'message': 'Category not found'}), 404
    
    # Check if user owns this category
    if category.user_id is None or category.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    # Check if category is in use
    if Transaction.query.filter_by(category_id=category_id).first():
        return jsonify({'message': 'Cannot delete category that is in use'}), 400
    
    db.session.delete(category)
    db.session.commit()
    
    return jsonify({'message': 'Category deleted successfully'}), 200

# Get all accounts
@financial_bp.route('/accounts', methods=['GET'])
@jwt_required()
def get_accounts():
    current_user_id = get_jwt_identity()
    
    accounts = Account.query.filter_by(user_id=current_user_id).all()
    
    return jsonify({
        'accounts': [account.to_dict() for account in accounts]
    }), 200

# Create a new account
@financial_bp.route('/accounts', methods=['POST'])
@jwt_required()
def create_account():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'message': 'Missing account name'}), 400
    
    # Create new account
    account = Account(
        user_id=current_user_id,
        name=data['name'],
        account_type=data.get('account_type', 'checking'),
        balance=data.get('initial_balance', 0),
        currency=data.get('currency', 'USD'),
        description=data.get('description', '')
    )
    
    db.session.add(account)
    db.session.commit()
    
    return jsonify({
        'message': 'Account created successfully',
        'account': account.to_dict()
    }), 201

# Get financial summary
@financial_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_financial_summary():
    current_user_id = get_jwt_identity()
    
    # Get date range parameters
    period = request.args.get('period', 'month')  # month, year, all
    
    # Calculate date range based on period
    today = datetime.utcnow().date()
    
    if period == 'month':
        start_date = datetime(today.year, today.month, 1)
        last_day = calendar.monthrange(today.year, today.month)[1]
        end_date = datetime(today.year, today.month, last_day)
    elif period == 'year':
        start_date = datetime(today.year, 1, 1)
        end_date = datetime(today.year, 12, 31)
    else:  # all
        start_date = datetime(1900, 1, 1)  # A long time ago
        end_date = datetime(2100, 12, 31)  # Far in the future
    
    # Get total income
    total_income = db.session.query(db.func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user_id,
        Transaction.transaction_type == 'income',
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).scalar() or 0
    
    # Get total expenses
    total_expenses = db.session.query(db.func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user_id,
        Transaction.transaction_type == 'expense',
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).scalar() or 0
    
    # Get total balance across all accounts
    total_balance = db.session.query(db.func.sum(Account.balance)).filter(
        Account.user_id == current_user_id
    ).scalar() or 0
    
    # Get income by category
    income_by_category = db.session.query(
        Category.name,
        db.func.sum(Transaction.amount).label('total')
    ).join(
        Transaction, Transaction.category_id == Category.id
    ).filter(
        Transaction.user_id == current_user_id,
        Transaction.transaction_type == 'income',
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).group_by(Category.name).all()
    
    # Get expenses by category
    expenses_by_category = db.session.query(
        Category.name,
        db.func.sum(Transaction.amount).label('total')
    ).join(
        Transaction, Transaction.category_id == Category.id
    ).filter(
        Transaction.user_id == current_user_id,
        Transaction.transaction_type == 'expense',
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).group_by(Category.name).all()
    
    return jsonify({
        'total_income': total_income,
        'total_expenses': total_expenses,
        'net_profit': total_income - total_expenses,
        'total_balance': total_balance,
        'income_by_category': [{'category': item[0], 'amount': item[1]} for item in income_by_category],
        'expenses_by_category': [{'category': item[0], 'amount': item[1]} for item in expenses_by_category],
        'period': period,
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat()
    }), 200

# Get monthly financial data for charts
@financial_bp.route('/chart-data', methods=['GET'])
@jwt_required()
def get_chart_data():
    current_user_id = get_jwt_identity()
    
    # Get year parameter
    year = request.args.get('year', datetime.utcnow().year, type=int)
    
    # Initialize data structure for monthly data
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    income_data = [0] * 12
    expense_data = [0] * 12
    
    # Get monthly income
    monthly_income = db.session.query(
        db.func.extract('month', Transaction.date).label('month'),
        db.func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.user_id == current_user_id,
        Transaction.transaction_type == 'income',
        db.func.extract('year', Transaction.date) == year
    ).group_by(
        db.func.extract('month', Transaction.date)
    ).all()
    
    # Get monthly expenses
    monthly_expenses = db.session.query(
        db.func.extract('month', Transaction.date).label('month'),
        db.func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.user_id == current_user_id,
        Transaction.transaction_type == 'expense',
        db.func.extract('year', Transaction.date) == year
    ).group_by(
        db.func.extract('month', Transaction.date)
    ).all()
    
    # Fill in the data arrays
    for month, total in monthly_income:
        income_data[int(month) - 1] = float(total)
    
    for month, total in monthly_expenses:
        expense_data[int(month) - 1] = float(total)
    
    return jsonify({
        'labels': months,
        'income': income_data,
        'expenses': expense_data,
        'year': year
    }), 200

# Get budgets
@financial_bp.route('/budgets', methods=['GET'])
@jwt_required()
def get_budgets():
    current_user_id = get_jwt_identity()
    
    budgets = Budget.query.filter_by(user_id=current_user_id).all()
    
    # For each budget, calculate current spending
    for budget in budgets:
        # Get the date range for the current period
        today = datetime.utcnow().date()
        
        if budget.period == 'monthly':
            start_date = datetime(today.year, today.month, 1)
            last_day = calendar.monthrange(today.year, today.month)[1]
            end_date = datetime(today.year, today.month, last_day)
        elif budget.period == 'yearly':
            start_date = datetime(today.year, 1, 1)
            end_date = datetime(today.year, 12, 31)
        else:  # weekly
            # Calculate the start of the week (Monday)
            start_date = today - timedelta(days=today.weekday())
            start_date = datetime(start_date.year, start_date.month, start_date.day)
            end_date = start_date + timedelta(days=6)
            end_date = datetime(end_date.year, end_date.month, end_date.day, 23, 59, 59)
        
        # Get total spending for this category in this period
        if budget.category_id:
            # For a specific category
            current_spending = db.session.query(db.func.sum(Transaction.amount)).filter(
                Transaction.user_id == current_user_id,
                Transaction.transaction_type == 'expense',
                Transaction.category_id == budget.category_id,
                Transaction.date >= start_date,
                Transaction.date <= end_date
            ).scalar() or 0
        else:
            # For all categories
            current_spending = db.session.query(db.func.sum(Transaction.amount)).filter(
                Transaction.user_id == current_user_id,
                Transaction.transaction_type == 'expense',
                Transaction.date >= start_date,
                Transaction.date <= end_date
            ).scalar() or 0
        
        budget.current_spending = current_spending
    
    return jsonify({
        'budgets': [budget.to_dict() for budget in budgets]
    }), 200

# Create a new budget
@financial_bp.route('/budgets', methods=['POST'])
@jwt_required()
def create_budget():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('amount') or not data.get('period'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Validate period
    if data['period'] not in ['weekly', 'monthly', 'yearly']:
        return jsonify({'message': 'Invalid period'}), 400
    
    # Create new budget
    budget = Budget(
        user_id=current_user_id,
        name=data.get('name', 'Budget'),
        amount=data['amount'],
        period=data['period'],
        category_id=data.get('category_id'),
        color=data.get('color', '#3788d8')
    )
    
    db.session.add(budget)
    db.session.commit()
    
    return jsonify({
        'message': 'Budget created successfully',
        'budget': budget.to_dict()
    }), 201

# Update a budget
@financial_bp.route('/budgets/<int:budget_id>', methods=['PUT'])
@jwt_required()
def update_budget(budget_id):
    current_user_id = get_jwt_identity()
    
    budget = Budget.query.get(budget_id)
    
    if not budget:
        return jsonify({'message': 'Budget not found'}), 404
    
    # Check if user owns this budget
    if budget.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    if 'name' in data:
        budget.name = data['name']
    
    if 'amount' in data:
        budget.amount = data['amount']
    
    if 'period' in data:
        if data['period'] not in ['weekly', 'monthly', 'yearly']:
            return jsonify({'message': 'Invalid period'}), 400
        budget.period = data['period']
    
    if 'category_id' in data:
        budget.category_id = data['category_id']
    
    if 'color' in data:
        budget.color = data['color']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Budget updated successfully',
        'budget': budget.to_dict()
    }), 200

# Delete a budget
@financial_bp.route('/budgets/<int:budget_id>', methods=['DELETE'])
@jwt_required()
def delete_budget(budget_id):
    current_user_id = get_jwt_identity()
    
    budget = Budget.query.get(budget_id)
    
    if not budget:
        return jsonify({'message': 'Budget not found'}), 404
    
    # Check if user owns this budget
    if budget.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized access'}), 403
    
    db.session.delete(budget)
    db.session.commit()
    
    return jsonify({'message': 'Budget deleted successfully'}), 200
