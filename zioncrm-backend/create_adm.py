from app import app, db
from models.user import User

def main():
    app.app_context().push()
    admin = User(username='admin', 
                 email='admin@zioncrm.com', 
                 full_name='Admin User', 
                 is_active=True, 
                 is_admin=True); 
    admin.set_password('admin123')
    db.session.add(admin); 
    db.session.commit()

if __name__ == "__main__":
    main()