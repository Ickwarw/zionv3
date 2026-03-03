import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "troque-por-uma-chave-secreta")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///voip.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    VOIP_GATEWAY_IP = os.getenv("VOIP_GATEWAY_IP", "187.60.60.161")
    VOIP_GATEWAY_LOGIN = os.getenv("VOIP_GATEWAY_LOGIN", "5511920835503")
    VOIP_GATEWAY_PASSWORD = os.getenv("VOIP_GATEWAY_PASSWORD", "&8oYR0")

    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
    MAX_CONTENT_LENGTH = 300 * 1024 * 1024
