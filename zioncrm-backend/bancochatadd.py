import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "postgres")
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_NAME = os.environ.get("DB_NAME", "zioncrm")

DATABASE_URI = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

def create_chat_tables():
    """
    Creates the necessary tables and columns for the chat system enhancements.
    """
    with app.app_context():
        with db.engine.connect() as connection:
            try:
                print("Starting database schema modifications for chat features...")

                print("Altering 'chat_channels' table to add 'status' column...")
                connection.execute(text("""
                    ALTER TABLE chat_channels
                    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending';
                """))
                print("'status' column added successfully.")

                print("Creating 'chat_ratings' table...")
                connection.execute(text("""
                    CREATE TABLE IF NOT EXISTS chat_ratings (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        channel_id INTEGER NOT NULL REFERENCES chat_channels(id),
                        user_id INTEGER NOT NULL REFERENCES users(id),
                        rating INTEGER NOT NULL,
                        comment TEXT,
                        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc'),
                        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc')
                    );
                """))
                print("'chat_ratings' table created successfully.")
           
                print("Creating 'chat_metrics' table...")
                connection.execute(text("""
                    CREATE TABLE IF NOT EXISTS chat_metrics (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL REFERENCES users(id),
                        total_started INT DEFAULT 0,
                        total_transferred INT DEFAULT 0,
                        total_finished INT DEFAULT 0,
                        average_rating FLOAT DEFAULT 0.0,
                        date DATE NOT NULL,
                        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc'),
                        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc'),
                        UNIQUE(user_id, date)
                    );
                """))
                print("'chat_metrics' table created successfully.")

                connection.commit()
                print("\nDatabase schema modifications completed successfully!")

            except Exception as e:
                connection.rollback()
                print(f"An error occurred: {e}")
                print("Transaction rolled back.")

if __name__ == '__main__':
    create_chat_tables()

