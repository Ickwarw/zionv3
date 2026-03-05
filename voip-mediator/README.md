# VoIP Mediator (Asterisk + Docker)

Pacote enxuto para usar o CRM com WebRTC no navegador, mesmo quando o SIP do cliente nao suporta WebRTC/WSS.

## O que este mediador faz
- Recebe WebRTC/WSS do frontend (JsSIP)
- Converte e encaminha para SIP legado (UDP)
- Nao inclui painel/admin extra (somente Asterisk)

## Requisitos
- Docker e Docker Compose
- Dominio com DNS apontando para este servidor
- Certificado TLS valido (Let's Encrypt)

## Estrutura
- `docker-compose.yml`
- `config/` arquivos minimos do Asterisk
- `certs/` monte aqui:
  - `fullchain.pem`
  - `privkey.pem`
  - no container os certificados ficam em `/opt/asterisk-certs`

## Passo 1: ajustar trunk SIP
Edite `config/pjsip.conf`:
- `PROVIDER_IP_OR_HOST`
- `PROVIDER_USERNAME`
- `PROVIDER_PASSWORD`

Se o provedor exigir REGISTER, descomente bloco `[trunk-registration]`.

## Passo 2: configurar certificado
Copie os certificados para `certs/`:

```bash
cp /etc/letsencrypt/live/SEU_DOMINIO/fullchain.pem certs/
cp /etc/letsencrypt/live/SEU_DOMINIO/privkey.pem certs/
```

## Passo 3: subir
```bash
docker compose up -d
```

## Passo 4: validar
```bash
docker compose ps
docker compose logs -f asterisk
```

No console do Asterisk:
```bash
docker exec -it voip-mediator-asterisk asterisk -rvvv
```
Comandos uteis:
- `pjsip show transports`
- `pjsip show endpoint 1001`
- `pjsip show registrations`

## Configuracao no CRM (frontend)
Na tela de VoIP do CRM:
- Servidor SIP: `SEU_DOMINIO`
- Porta SIP: `8089`
- Path WebSocket SIP: `/ws`
- Usuario SIP: `1001`
- Senha SIP: `CHANGE_ME_1001`

## Portas
- `8089/tcp` -> WSS (browser)
- `5060/udp` -> trunk SIP
- `10000-10100/udp` -> RTP

## Observacoes importantes
- Em navegador, IP puro com WSS costuma falhar por certificado.
- Para PoC, mantenha dominio + TLS valido.
- Este pacote e propositalmente minimo; pode evoluir depois com multi-ramal/multi-tenant.
