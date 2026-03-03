import requests
import hmac
import hashlib

PSID = "7442436505811581"
PAGE_TOKEN = "EAA8RW1slgsQBQa1Kf0od3pwAZCaPa0glABrHeiE3iEytW93d8A9vc6lpqbQaZCaWrDW0YBAu32bZCKkchZCjMCd8pZAFKZCSC4ZCruipVVw2ZCTSoxnJffAkjcbKb7udZAA6qfL0ca8WX0gbZA0IDjlIWdrvzlRpdLb4g3noyl1w4jxyFDiiePJBeNOOEAJZBYfMc4O3ZA5xVNe9eSWfJbJnAF4ptSfazAZDZD"
APP_SECRET="7d5696f4a5d4cb00d18dea698f716789"


def generate_appsecret_proof(access_token: str, app_secret: str) -> str:
    return hmac.new(
        key=app_secret.encode("utf-8"),
        msg=access_token.encode("utf-8"),
        digestmod=hashlib.sha256
    ).hexdigest()

proof = generate_appsecret_proof(PAGE_TOKEN, APP_SECRET)

url = f"https://graph.facebook.com/v18.0/{PSID}"
params = {
    "fields": "first_name,last_name,profile_pic",
    "access_token": PAGE_TOKEN,
    "appsecret_proof": proof
}


response = requests.get(url, params=params)
print(response.json())