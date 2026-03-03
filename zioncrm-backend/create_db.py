from app import app, db

def main():
    app.app_context().push()
    db.create_all()

if __name__ == "__main__":
    main()