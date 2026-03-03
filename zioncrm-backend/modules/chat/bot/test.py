import hmac
import hashlib

def generate_appsecret_proof(access_token: str, app_secret: str) -> str:
    return hmac.new(
        key=app_secret.encode("utf-8"),
        msg=access_token.encode("utf-8"),
        digestmod=hashlib.sha256
    ).hexdigest()

print(generate_appsecret_proof('EAA8RW1slgsQBQr2OLdgVtt9yZCFyCKztFmJfDdUO7tgqxRfxYBZAfbnM3GbDC3ZBV3nZAZA7yXlHAgLvKKebXM9BCMihAy4olZBpR7RXZC24ePls6tYyfZAqdA6g8tREWRi9NrOlZAdpzfUprQUZBpYNtgyitCtPTNOhPeK5MhcZCjlsy5ZBtmmFdBuAeW5gQbY4MzdXjoyRz5SVwuK58LhMSVq3oPcmMtcGnZCY1ZAiCd', 
                               '7d5696f4a5d4cb00d18dea698f716789'))