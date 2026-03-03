from models.group import Group
from models.config import SystemConfig
from extensions import db
from sqlalchemy import func, case, and_
import logging
import requests

import hmac
import hashlib


logger = logging.getLogger(__name__)

# PAGE_TOKEN = "EAA8RW1slgsQBQa1Kf0od3pwAZCaPa0glABrHeiE3iEytW93d8A9vc6lpqbQaZCaWrDW0YBAu32bZCKkchZCjMCd8pZAFKZCSC4ZCruipVVw2ZCTSoxnJffAkjcbKb7udZAA6qfL0ca8WX0gbZA0IDjlIWdrvzlRpdLb4g3noyl1w4jxyFDiiePJBeNOOEAJZBYfMc4O3ZA5xVNe9eSWfJbJnAF4ptSfazAZDZD"
# APP_SECRET="7d5696f4a5d4cb00d18dea698f716789"
# VALIDATION_TOKEN = "vO2gvBYr0U1iZgW8ITAu28k30bLae1JUd5PueBrBXgH4YFyvsXSFk0smCuMoIaFkC"

def get_facebook_tokens():
    configPageToken = SystemConfig.query.filter_by(key='facebook.token').first()
    configAppSecret = SystemConfig.query.filter_by(key='facebook.secret').first()
    if not configPageToken or not configAppSecret:
        logger.error("Facebook tokens not found in the database.")
        return None, None
    return configPageToken.value, configAppSecret.value

def get_facebook_verify_token():
    configToken = SystemConfig.query.filter_by(key='facebook.verify_token').first()
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

def send_facebook_group_options(psid):
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
    send_facebook_options(payload)


def generate_appsecret_proof(access_token: str, app_secret: str) -> str:
    return hmac.new(
        key=app_secret.encode("utf-8"),
        msg=access_token.encode("utf-8"),
        digestmod=hashlib.sha256
    ).hexdigest()

def send_facebook_message(psid, texto):
    configPageToken, configAppSecret = get_facebook_tokens()
    if not configPageToken or not configAppSecret:
        logger.error("Cannot send message: Facebook tokens are missing.")
        return
    url = f"https://graph.facebook.com/v18.0/me/messages"

    payload = {
        "recipient": {"id": psid},
        "message": {"text": texto},
    }

    params = {
        "access_token": configPageToken, #PAGE_TOKEN,
        "appsecret_proof": generate_appsecret_proof(configPageToken, configAppSecret) #APP_SECRET)
        }

    response = requests.post(
        url,
        params=params,
        json=payload,
        timeout=10
    )

    print(response.status_code, response.text)

def send_facebook_options(payload):
    configPageToken, configAppSecret = get_facebook_tokens()
    if not configPageToken or not configAppSecret:
        logger.error("Cannot send options: Facebook tokens are missing.")
        return
    url = f"https://graph.facebook.com/v18.0/me/messages"

    params = {
        "access_token": configPageToken, #PAGE_TOKEN,
        "appsecret_proof": generate_appsecret_proof(configPageToken, configAppSecret) #PAGE_TOKEN, APP_SECRET)
        }

    response = requests.post(
        url,
        params=params,
        json=payload,
        timeout=10
    )

    print(response.status_code, response.text)

def get_facebook_user_profile(psid: str):
    configPageToken, configAppSecret = get_facebook_tokens()
    if not configPageToken or not configAppSecret:
        logger.error("Cannot send options: Facebook tokens are missing.")
        return
    url = f"https://graph.facebook.com/v18.0/{psid}"
    params = {
        "fields": "first_name,last_name,profile_pic,email",
        "access_token": configPageToken, #PAGE_TOKEN,
        "appsecret_proof": generate_appsecret_proof(configPageToken, configAppSecret) #PAGE_TOKEN, APP_SECRET)
    }
    response = requests.get(url, params=params)
    return response.json()
