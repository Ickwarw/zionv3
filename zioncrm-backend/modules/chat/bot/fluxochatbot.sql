CREATE DATABASE fluxo;
CREATE USER fluxo WITH PASSWORD 'fluxo';
GRANT ALL PRIVILEGES ON DATABASE fluxo TO fluxo;

\c fluxo;

CREATE TABLE flows (
    id UUID PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,  -- USUARIO CRIADOR (integrar depois)
    updated_by UUID   -- USUARIO ATUALIZADOR
);

CREATE TABLE flow_logs (
    id SERIAL PRIMARY KEY,
    flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
    action VARCHAR(20),
    created_at TIMESTAMP NOT NULL,
    user_id UUID -- USUARIO (integrar depois)
);

CREATE INDEX idx_flows_data ON flows USING GIN (data);
CREATE INDEX idx_flow_logs_flow ON flow_logs(flow_id);