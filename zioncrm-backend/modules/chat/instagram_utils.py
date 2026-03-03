import requests
import hmac
import hashlib
from models.group import Group
from models.config import SystemConfig
from extensions import db
from sqlalchemy import func, case, and_
import logging

# PAGE_ID = "311094772077392"  # página conectada ao Instagram Professional
# ACCESS_TOKEN = "EAA8RW1slgsQBQpnbBQFFql0ZAJdBzqcGsSXi55E3CsRtupff7aJdBZBx7gLAvZAIdpNu2FlOmZC2k0MV4whPZCP5c0kxhqHxTdeULsU05G1vFpzuB5hJuBRfa23eSHWqw4bTcZAPlFv4DUmoecMZBgkPYqi225FJ90mitfoUvZCXF4Y8bGRm4wZBXmtSYajYZAbHbqPyjjxxATotL7E4KJgbyEo5vTkAZDZD"
# APP_SECRET="7d5696f4a5d4cb00d18dea698f716789"
# VALIDATION_TOKEN = "vO2gvBYr0U1iZgW8ITAu28k30bLae1JUd5PueBrBXgH4YFyvsXSFk0smCuMoIaFkC"


logger = logging.getLogger(__name__)

def get_instagram_tokens():
    configPageToken = SystemConfig.query.filter_by(key='instagram.token').first()
    configAppSecret = SystemConfig.query.filter_by(key='instagram.account').first()
    if not configPageToken or not configAppSecret:
        logger.error("Instagram tokens not found in the database.")
        return None, None
    return configPageToken.value, configAppSecret.value

def get_instagram_verify_token():
    configToken = SystemConfig.query.filter_by(key='instagram.verify_token').first()
    if not configToken:
        return "vO2gvBYr0U1iZgW8ITAu28k30bLae1JUd5PueBrBXgH4YFyvsXSFk0smCuMoIaFkC"
    return configToken.value


def build_quick_replies_from_groups(groups):
    quick_replies = []

    for group in groups:
        quick_replies.append({
            "content_type": "text",
            "title": group.name[:20],  # limite do Messenger
            "payload": f"GROUP_{group.id}"
            # ou group.code, se preferir
        })

    return quick_replies

def bot_response(sender_id, message, step):
    message_payload = None
    if step == 1:
        groups = Group.query.all()

        message_payload = {
            "recipient": {
                "id": sender_id
            },
            "message": {
                "text": "Deseja falar com qual setor?:",
                "quick_replies": build_quick_replies_from_groups(groups)
            }
        }

    return message_payload

def send_instagram_group_options(psid):
    groups = Group.query.all()
    payload = {
        "recipient": {
            "id": psid
        },
        "message": {
            "text": "Por favor, selecione um setor:",
            "quick_replies": build_quick_replies_from_groups(groups)
        }
    }
    send_instagram_options(payload)

def send_instagram_options(payload):
    configPageToken, configAppSecret = get_instagram_tokens()
    if not configPageToken or not configAppSecret:
        logger.error("Cannot send message: Facebook tokens are missing.")
        return
    url = f"https://graph.facebook.com/v18.0/me/messages"

    params = {
        "access_token": configPageToken,
        "appsecret_proof": generate_appsecret_proof(configPageToken, configAppSecret)
        }

    response = requests.post(
        url,
        params=params,
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

def send_instagram_message(user_id, texto):
    configPageToken, configAppSecret = get_instagram_tokens()
    if not configPageToken or not configAppSecret:
        logger.error("Cannot send message: Facebook tokens are missing.")
        return
    url = f"https://graph.facebook.com/v18.0/me/messages"

    payload = {
        "recipient": {"id": user_id},
        "message": {"text": texto},
    }

    params = {
        "access_token": configPageToken,
        "appsecret_proof": generate_appsecret_proof(configPageToken, configAppSecret)
        }

    response = requests.post(
        url,
        params=params,
        json=payload,
        timeout=10
    )