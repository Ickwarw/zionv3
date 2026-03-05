#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/test_voip_realtime.sh \
#     BASE_URL USERNAME PASSWORD EXTENSION [FROM_NUMBER]
#
# Example:
#   ./scripts/test_voip_realtime.sh \
#     "http://localhost:5000/api" "admin" "123456" "1001" "11999999999"

if [[ $# -lt 4 ]]; then
  echo "Uso: $0 BASE_URL USERNAME PASSWORD EXTENSION [FROM_NUMBER]"
  exit 1
fi

BASE_URL="$1"
USERNAME="$2"
PASSWORD="$3"
EXTENSION="$4"
FROM_NUMBER="${5:-11999999999}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Comando obrigatório não encontrado: $1"
    exit 1
  fi
}

require_cmd curl
require_cmd jq

echo "==> 1) Login"
LOGIN_RESP="$(curl -sS -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${USERNAME}\",\"password\":\"${PASSWORD}\"}")"

TOKEN="$(echo "$LOGIN_RESP" | jq -r '.access_token // empty')"
if [[ -z "$TOKEN" ]]; then
  echo "Falha no login:"
  echo "$LOGIN_RESP" | jq .
  exit 1
fi
echo "Login OK"

AUTH_HEADER="Authorization: Bearer ${TOKEN}"

echo "==> 2) Garantir extensão VoIP do usuário"
EXT_RESP="$(curl -sS -X POST "${BASE_URL}/voip/extension" \
  -H "Content-Type: application/json" \
  -H "${AUTH_HEADER}" \
  -d "{\"extension_number\":\"${EXTENSION}\",\"display_name\":\"${EXTENSION}\",\"sip_server\":\"pbx.local\"}")"
echo "$EXT_RESP" | jq .

CALL_ID="test-$(date +%s)"
echo "==> 3) Criar chamada de teste (incoming-call), call_id=${CALL_ID}"
INCOMING_RESP="$(curl -sS -X POST "${BASE_URL}/voip/incoming-call" \
  -H "Content-Type: application/json" \
  -d "{\"to\":\"${EXTENSION}\",\"from\":\"${FROM_NUMBER}\",\"call_id\":\"${CALL_ID}\"}")"
echo "$INCOMING_RESP" | jq .

echo "==> 4) Atualizar para connected"
CONNECTED_RESP="$(curl -sS -X POST "${BASE_URL}/voip/call/status" \
  -H "Content-Type: application/json" \
  -d "{\"call_id\":\"${CALL_ID}\",\"status\":\"connected\"}")"
echo "$CONNECTED_RESP" | jq '.message, .call.call_id, .call.status, .call.connect_time'

sleep 2

echo "==> 5) Atualizar para completed"
COMPLETED_RESP="$(curl -sS -X POST "${BASE_URL}/voip/call/status" \
  -H "Content-Type: application/json" \
  -d "{\"call_id\":\"${CALL_ID}\",\"status\":\"completed\"}")"
echo "$COMPLETED_RESP" | jq '.message, .call.call_id, .call.status, .call.end_time, .call.duration'

echo "==> 6) Consultar chamadas do usuário"
CALLS_RESP="$(curl -sS -X GET "${BASE_URL}/voip/calls?page=1&per_page=5" \
  -H "${AUTH_HEADER}")"
echo "$CALLS_RESP" | jq '.calls[] | {call_id, phone_number, direction, status, start_time, connect_time, end_time, duration}'

echo "Fluxo concluído. Abra o frontend no discador para validar os eventos em tempo real."
