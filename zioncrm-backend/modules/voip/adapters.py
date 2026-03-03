import requests
from config import Config
from urllib.parse import urljoin

CFG = Config()

class VoipAdapter:
    def initiate_call(self, from_number, to_number, extra=None):
        raise NotImplementedError

    def start_recording(self, call_uuid, postback_url):
        raise NotImplementedError

    def hangup_call(self, call_uuid):
        raise NotImplementedError

    def get_call_status(self, call_uuid):
        raise NotImplementedError

class SimpleHttpAdapter(VoipAdapter):

    def __init__(self, base_ip=None, login=None, password=None):
        self.base = f"http://{base_ip or CFG.VOIP_GATEWAY_IP}/api/"
        self.auth = {"login": login or CFG.VOIP_GATEWAY_LOGIN, "password": password or CFG.VOIP_GATEWAY_PASSWORD}

    def _post(self, path, payload):
        url = urljoin(self.base, path)
        data = dict(payload or {})
        data.update(self.auth)
        resp = requests.post(url, json=data, timeout=15)
        resp.raise_for_status()
        return resp.json()

    def initiate_call(self, from_number, to_number, extra=None):
        return self._post("calls/initiate", {"from": from_number, "to": to_number, "extra": extra or {}})

    def start_recording(self, call_uuid, postback_url):
        return self._post("calls/record", {"call_uuid": call_uuid, "postback": postback_url})

    def hangup_call(self, call_uuid):
        return self._post("calls/hangup", {"call_uuid": call_uuid})

    def get_call_status(self, call_uuid):
        return self._post("calls/status", {"call_uuid": call_uuid})
