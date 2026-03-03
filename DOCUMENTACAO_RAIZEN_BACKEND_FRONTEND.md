# Documentação Completa — Assistente Raizen (Backend + Frontend)

## 1) Objetivo desta documentação

Este documento explica **cada código/arquivo relevante** da implementação atual do assistente **Raizen**, mostrando:

- o que cada arquivo faz;
- para que serve;
- como backend e frontend se conectam;
- o fluxo passo a passo de ativação e uso.

> Escopo: módulo de Assistentes IA (com foco em Raizen), integração de API, rotas, modelos, UI, e scripts SQL de migração/rollback.

---

## 2) Arquitetura geral

## Backend (Flask)

- Sobe no `app.py`.
- Registra blueprints em `routes.py`.
- O módulo de assistentes fica em `modules/assistants/routes.py` com prefixo `/api/assistants`.
- O domínio de dados dos assistentes está em `models/assistants.py`.
- O motor do Raizen está em `assistants/raizen.py`.
- Existe compatibilidade com legado Quim em `assistants/quim.py`.

## Frontend (React + Axios)

- A camada de API está em `src/services/api.ts`.
- A tela de assistentes está em `src/components/Assistentes.tsx`.
- O fluxo de ativação usa token de API antes de permitir conversa.

---

## 3) Backend — arquivo por arquivo

## 3.1 `zioncrm-backend/app.py`

### O que faz
- Cria a aplicação Flask (`create_app`).
- Inicializa CORS, JWT, DB, Migrate e SocketIO.
- Chama `register_routes(app)`.

### Para que serve
- É o ponto principal de bootstrap do backend.

### Fluxo
1. Carrega `Config`.
2. Inicializa extensões.
3. Registra rotas de todos os módulos.
4. Em execução direta, inicia servidor SocketIO.

---

## 3.2 `zioncrm-backend/routes.py`

### O que faz
- Importa blueprints de todos os módulos.
- Registra cada blueprint com seu `url_prefix`.

### Para que serve
- Centraliza o roteamento da API.

### Ponto do assistente
- Registra `assistants_bp` em `/api/assistants`.

---

## 3.3 `zioncrm-backend/modules/assistants/routes.py`

### O que faz
É o núcleo HTTP do módulo de assistentes:

- ativação por token;
- conversa (criar, listar, enviar mensagem, renomear, excluir);
- CRUD de dados de treinamento (admin);
- seleção do modelo/tabela por assistente (incluindo Raizen).

### Para que serve
- Orquestrar regras de negócio do assistente via API REST.

### Partes importantes

#### a) Ativação por usuário
- `_assistant_config_key(user_id, suffix)` gera chaves em `SystemConfig`.
- `_is_assistants_activated(user_id)` valida:
  - `assistants.user.<id>.enabled == true`
  - `assistants.user.<id>.api_token` preenchido

Endpoints:
- `GET /api/assistants/activation-status`
- `POST /api/assistants/activation` (body: `{ "api_token": "..." }`)

#### b) Bloqueio antes de ativar
- Em `start_conversation` e `send_message`:
  - se não estiver ativado, retorna `403` com mensagem de ativação.

#### c) Mapeamento de instâncias
- `assistant_instances` contém os assistentes carregados em memória.
- `"Raizen"` está mapeado para `RaizenAssistant`.
- `"Quim"` também aponta para Raizen por compatibilidade.

#### d) Resposta e treinamento
- `generate_assistant_response(...)` escolhe tabela de treino por nome/especialidade.
- Para `Quim` ou `Raizen`, usa `RaizenTrainingData`.
- CRUD de treino aceita tanto `quim` quanto `raizen` na URL.

---

## 3.4 `zioncrm-backend/models/assistants.py`

### O que faz
Define as entidades do módulo:

- `Assistant`
- `Conversation`
- `Message`
- classes de treinamento (`JuliaTrainingData`, `JoceTrainingData`, etc.)
- `RaizenTrainingData` e `QuimTrainingData` (compatibilidade)

### Para que serve
- Persistência de assistentes, conversas e base de conhecimento.

### Modelos relevantes
- `Assistant`: metadados do assistente (nome, descrição, avatar, specialty, greeting).
- `Conversation`: vínculo usuário-assistente.
- `Message`: mensagens de cada conversa.
- `RaizenTrainingData`: base oficial de treino do Raizen (`raizen_training_data`).

---

## 3.5 `zioncrm-backend/assistants/raizen.py`

### O que faz
Implementa a lógica do assistente Raizen:

- inicialização de nome/avatar/especialidade;
- carga de treino local SQLite (`raizen_training_data`);
- respostas por:
  - match em dados de treino;
  - análise básica de vendas/leads;
  - fallback contextual.

### Para que serve
- Motor de resposta do assistente Raizen.

### Métodos principais
- `__init__`: configura identidade e carrega treino.
- `_load_training_data`: cria/tabela e popula seeds iniciais se necessário.
- `_get_data_insights`: gera análise por consultas SQL de exemplo.
- `get_response`: resolve resposta com heurística.
- `add_training_data`: adiciona novo par pergunta/resposta.

---

## 3.6 `zioncrm-backend/assistants/quim.py`

### O que faz
- Mantém compatibilidade com código legado do Quim.
- `QuimAssistant` herda de `RaizenAssistant` e só sobrescreve identidade (nome/avatar/greeting).

### Para que serve
- Evitar quebra de código antigo que ainda importa `QuimAssistant`.

---

## 3.7 `zioncrm-backend/init_data.py`

### O que faz
- Inicializa permissões e dados padrão.
- Cria assistentes padrão no banco.

### Para que serve
- Seed inicial do sistema.

### Ponto Raizen
- O assistente padrão foi configurado como:
  - `name: "Raizen"`
  - `avatar: "raizen_avatar.png"`
  - `specialty: "data_analysis"`

---

## 3.8 Scripts SQL de migração

## `zioncrm-backend/modules/assistants/migration_quim_to_raizen.sql`

### O que faz
- Renomeia assistente `Quim` para `Raizen` na tabela `assistants`.
- Ajusta avatar/greeting.
- Renomeia tabela `quim_training_data` -> `raizen_training_data` quando aplicável.

## `zioncrm-backend/modules/assistants/migration_raizen_to_quim_rollback.sql`

### O que faz
- Reversão completa do script acima.

---

## 4) Frontend — arquivo por arquivo

## 4.1 `zioncrm-frontend/src/services/api.ts`

### O que faz
- Cria cliente Axios (`api`) com baseURL e interceptors de auth.
- Centraliza todos os serviços HTTP do frontend.

### Para que serve
- Padronizar chamadas à API e token JWT.

### Seção de assistentes (`assistantsService`)
- `getActivationStatus()` -> `GET /assistants/activation-status`
- `activateWithApiToken(apiToken)` -> `POST /assistants/activation`
- demais endpoints de conversa e treinamento.

---

## 4.2 `zioncrm-frontend/src/components/Assistentes.tsx`

### O que faz
- Renderiza cards de assistentes e tela de conversa.
- Inclui o assistente `Raizen` no catálogo visual.
- Exige ativação com token antes de liberar conversa.

### Para que serve
- Interface principal de uso de assistentes IA.

### Estados principais
- `isApiActivated`: status global vindo do backend.
- `activationStates`: controle local de dialog de ativação por card.
- `selectedAssistant`: assistente aberto no chat.

### Fluxo de ativação
1. Ao montar componente, chama `getActivationStatus()`.
2. Se usuário clicar em `Ativar`, abre dialog para token.
3. Ao enviar token, chama `activateWithApiToken(token)`.
4. Em sucesso:
   - marca ativado;
   - habilita botão `Conversar`.

### Fluxo de conversa atual
- A UI mostra mensagens locais simuladas no componente.
- O serviço já possui endpoints reais para integrar conversa persistida.

---

## 5) Fluxo completo — passo a passo (Backend + Frontend)

## 5.1 Subida da aplicação
1. `app.py` cria app.
2. `routes.py` registra `/api/assistants`.
3. `modules/assistants/routes.py` inicializa instâncias (inclui Raizen).

## 5.2 Ativação do assistente
1. Front chama `GET /api/assistants/activation-status`.
2. Backend lê `SystemConfig` por usuário.
3. Se não ativo, front mostra botão `Ativar`.
4. Usuário informa token.
5. Front chama `POST /api/assistants/activation`.
6. Backend grava `enabled=true` e `api_token`.

## 5.3 Conversa
1. Front tenta iniciar conversa.
2. Backend valida ativação:
   - se não ativo: `403`.
   - se ativo: cria `Conversation` + mensagem inicial.
3. Ao enviar mensagem:
   - salva mensagem do usuário;
   - gera resposta via `generate_assistant_response`;
   - salva mensagem do assistente.

## 5.4 Treinamento
1. Admin chama endpoints `/training-data/<assistant_name>`.
2. Para `raizen` ou `quim`, backend usa `RaizenTrainingData`.

---

## 6) Endpoints do módulo Assistentes

- `GET /api/assistants/activation-status`
- `POST /api/assistants/activation`
- `GET /api/assistants/`
- `GET /api/assistants/<assistant_id>`
- `POST /api/assistants/<assistant_id>/conversations`
- `GET /api/assistants/conversations`
- `GET /api/assistants/conversations/<conversation_id>/messages`
- `POST /api/assistants/conversations/<conversation_id>/messages`
- `PUT /api/assistants/conversations/<conversation_id>`
- `DELETE /api/assistants/conversations/<conversation_id>`
- `GET /api/assistants/training-data/<assistant_name>`
- `POST /api/assistants/training-data/<assistant_name>`
- `PUT /api/assistants/training-data/<assistant_name>/<data_id>`
- `DELETE /api/assistants/training-data/<assistant_name>/<data_id>`

---

## 7) Como cada código se relaciona

- `Assistentes.tsx` (UI) chama `assistantsService` em `api.ts`.
- `api.ts` chama `/api/assistants/...`.
- `modules/assistants/routes.py` recebe e aplica regra de ativação/conversa.
- `models/assistants.py` persiste dados em banco.
- `assistants/raizen.py` implementa comportamento do assistente.
- `init_data.py` garante existência de Raizen em setup inicial.
- SQL de migração garante transição de dados existentes Quim -> Raizen.

---

## 8) Compatibilidade legado

Para evitar quebra de versões antigas:

- Nome `Quim` ainda é aceito no backend.
- Classe `QuimAssistant` existe e reaproveita `RaizenAssistant`.
- Rotas de treinamento aceitam `quim` e `raizen`.
- Rollback SQL disponível.

---

## 9) Checklist operacional (sem executar)

- [ ] Backend com rotas de assistentes carregadas (`/api/assistants`).
- [ ] Front com card `Raizen` visível na tela de Assistentes.
- [ ] Ativação por token funcionando (`activation-status` + `activation`).
- [ ] Conversa bloqueada quando não ativado (403 esperado).
- [ ] Conversa liberada após ativação.
- [ ] Migração SQL pronta para execução quando desejado.
- [ ] Rollback SQL pronto para reversão.

---

## 10) Observações finais

- A UI de conversa no `Assistentes.tsx` está com resposta local simulada; o serviço API já está pronto para ligação completa com persistência.
- O módulo já está preparado para transição gradual Quim -> Raizen sem downtime de naming.
- Esta documentação cobre backend e frontend do fluxo de assistentes/raizen de ponta a ponta.
