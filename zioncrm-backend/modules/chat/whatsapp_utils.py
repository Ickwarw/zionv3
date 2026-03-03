import requests
import hmac
import hashlib
from models.group import Group
from models.config import SystemConfig
from extensions import db
from sqlalchemy import func, case, and_
import logging

WHATSAPP_TOKEN = "EAA8RW1slgsQBQr2OLdgVtt9yZCFyCKztFmJfDdUO7tgqxRfxYBZAfbnM3GbDC3ZBV3nZAZA7yXlHAgLvKKebXM9BCMihAy4olZBpR7RXZC24ePls6tYyfZAqdA6g8tREWRi9NrOlZAdpzfUprQUZBpYNtgyitCtPTNOhPeK5MhcZCjlsy5ZBtmmFdBuAeW5gQbY4MzdXjoyRz5SVwuK58LhMSVq3oPcmMtcGnZCY1ZAiCd"
APP_SECRET="7d5696f4a5d4cb00d18dea698f716789"
# VALIDATION_TOKEN = "vO2gvBYr0U1iZgW8ITAu28k30bLae1JUd5PueBrBXgH4YFyvsXSFk0smCuMoIaFkC"

logger = logging.getLogger(__name__)

def get_whatsapp_tokens():
    configPageToken = SystemConfig.query.filter_by(key='whatsapp.token').first()
    configAppSecret = SystemConfig.query.filter_by(key='whatsapp.account').first()
    if not configPageToken or not configAppSecret:
        logger.error("Whatsapp tokens not found in the database.")
        return None, None
    return configPageToken.value, configAppSecret.value


def get_whatsapp_verify_token():
    configToken = SystemConfig.query.filter_by(key='whatsapp.verify_token').first()
    if not configToken:
        return "vO2gvBYr0U1iZgW8ITAu28k30bLae1JUd5PueBrBXgH4YFyvsXSFk0smCuMoIaFkC"
    return configToken.value

def build_quick_replies_from_groups(groups):
    quick_replies = []

    for group in groups:
        quick_replies.append({
            "type": "reply",
            "reply": {
                "id": f"GROUP_{group.id}",
                "title": group.name[:20]
            }
        })
    return quick_replies

# def bot_response(sender_id, message, step):
#     message_payload = None
#     if step == 1:
#         groups = Group.query.all()

#         message_payload = {
#             "recipient": {
#                 "id": sender_id
#             },
#             "message": {
#                 "text": "Deseja falar com qual setor?:",
#                 "quick_replies": build_quick_replies_from_groups(groups)
#             }
#         }

#     return message_payload

def send_whatsapp_group_options(phone_number_id, to):
    groups = Group.query.all()

    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {
                "text": "Deseja falar com qual setor?:"
            },
            "action": {
                "buttons": build_quick_replies_from_groups(groups)
            }
        }
    }
    send_whatsapp_options(payload)

def send_whatsapp_options(payload, phone_number_id):
    url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"

    # params = {
    #     "access_token": WHATSAPP_TOKEN,
    #     "appsecret_proof": generate_appsecret_proof(WHATSAPP_TOKEN, APP_SECRET)
    #     }
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=10
    )

    print(response.status_code, response.text)


def generate_appsecret_proof(access_token: str, app_secret: str) -> str:
    return hmac.new(
        key=app_secret.encode("utf-8"),
        msg=access_token.encode("utf-8"),
        digestmod=hashlib.sha256
    ).hexdigest()


def send_whatsapp_message(phone_number_id, to, text):
    url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"

    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "text": {
            "body": text
        }
    }

    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json",
    }

    response = requests.post(url, json=payload, headers=headers)
    print(response.status_code, response.text)
