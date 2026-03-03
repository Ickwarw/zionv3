from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.chat import ChatChannel, ChatMessage, ChatContact, ChatTag
from extensions import db, socketio
from sqlalchemy import func, case, and_
import logging
from datetime import datetime
import requests
import json

meta_webhook_bp = Blueprint('meta_webhook', __name__)
logger = logging.getLogger(__name__)

# SOMENTE PARA BASE de CÓDIGO - alterar para salvar as mensagens no banco de dados

VERIFY_TOKEN = "SEU_TOKEN_DE_VERIFICACAO"
ACCESS_TOKEN = "SEU_TOKEN_DE_ACESSO_LONGO"
PAGE_ID = "SEU_PAGE_ID"

@meta_webhook_bp.route('/webhook', methods=['GET'])
def check_webhook():
    mode = request.args.get("hub.mode")
    token = request.args.get("hub.verify_token")
    challenge = request.args.get("hub.challenge")

    if mode == "subscribe" and token == VERIFY_TOKEN:
        return challenge, 200

    return "Token inválido", 403



@meta_webhook_bp.route('/webhook', methods=['POST'])
def recieve_events():
    body = request.get_json()
    print(json.dumps(body, indent=2))

    if body.get("object") == "instagram":
        processar_instagram(body)

    elif body.get("object") == "page":
        processar_facebook(body)

    return jsonify({"status": "ok"}), 200


# ----------------------------
# PROCESSAR EVENTOS DO INSTAGRAM
# ----------------------------
def processar_instagram(body):
    for entry in body.get("entry", []):
        for change in entry.get("changes", []):
            if change["field"] == "messages":
                mensagens = change["value"]["messages"]

                for msg in mensagens:
                    sender = msg.get("from")
                    texto = msg.get("text")

                    if texto:
                        print(f"[INSTAGRAM] Mensagem de {sender}: {texto}")

                        # Resposta automática
                        send_message(sender, "Recebi sua mensagem no Instagram! 😄")


# ----------------------------
# PROCESSAR EVENTOS DO FACEBOOK
# ----------------------------
def processar_facebook(body):
    for entry in body.get("entry", []):
        for messaging_event in entry.get("messaging", []):
            sender = messaging_event["sender"]["id"]

            if "message" in messaging_event:
                texto = messaging_event["message"].get("text")

                if texto:
                    print(f"[FACEBOOK] Mensagem de {sender}: {texto}")

                    # Resposta automática
                    send_message(sender, "Recebi sua mensagem no Messenger! 😄")


# ----------------------------
# ENVIAR MENSAGEM (FB OU IG)
# ----------------------------
def send_message(user_id, texto):
    url = f"https://graph.facebook.com/v18.0/{PAGE_ID}/messages"

    payload = {
        "recipient": {"id": user_id},
        "message": {"text": texto},
    }

    params = {"access_token": ACCESS_TOKEN}

    r = requests.post(url, json=payload, params=params)
    print("Resposta da API:", r.json())
