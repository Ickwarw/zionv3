import os
from datetime import timedelta
from sqlalchemy.engine.url import make_url


class Config:
    
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'zion-crm-secret-key-change-in-production'
    

    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://zioncrm:zioncrm@zioncrm-db:5432/zioncrm'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    
    
    FACEBOOK_API_KEY = os.environ.get('FACEBOOK_API_KEY')
    WHATSAPP_API_KEY = os.environ.get('WHATSAPP_API_KEY')
    INSTAGRAM_API_KEY = os.environ.get('INSTAGRAM_API_KEY')
    
    
    SIP_SERVER = os.environ.get('SIP_SERVER')
    SIP_USERNAME = os.environ.get('SIP_USERNAME')
    SIP_PASSWORD = os.environ.get('SIP_PASSWORD')

    def get_db_config(self):
        url = make_url(self.SQLALCHEMY_DATABASE_URI)

        db_config = {
            "user": url.username,
            "password": url.password,
            "host": url.host,
            "port": url.port,
            "dbname": url.database,
        }

        return db_config