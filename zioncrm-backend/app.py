from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from extensions import db, migrate, socketio
from routes import register_routes
import logging

def create_app(config_class=Config):
    logger = logging.getLogger(__name__)
    formatter = logging.Formatter('%(asctime)s [%(threadName)-15.15s] [%(levelname)-5.5s] - %(message)s')
    consoleHandler = logging.StreamHandler()
    consoleHandler.setFormatter(formatter)
    logger.addHandler(consoleHandler)
    logger.setLevel( logging.DEBUG)
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    CORS(app, resources={r"/*": {"origins": "*"}})
    JWTManager(app)
    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app, cors_allowed_origins="*")
    
    # Register all routes
    register_routes(app)
    
    return app

app = create_app()


@app.route('/')
def index():
    return "Hello, SocketIO!"

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
