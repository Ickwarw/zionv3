# app.py  (Flask backend)
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2, json, uuid, datetime

app = Flask(__name__)
CORS(app)

DB = {
    "host": "postgres",
    "dbname": "fluxo",
    "user": "fluxo",
    "password": "fluxo"
}

def db():
    return psycopg2.connect(**DB)

@app.route("/api/flow", methods=["POST"])
def create_flow():
    data = request.json
    flow_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow()

    with db() as c:
        cur = c.cursor()
        cur.execute("""
            INSERT INTO flows (id, data, created_at, updated_at, created_by, updated_by)
            VALUES (%s,%s,%s,%s,%s,%s)
        """, (
            flow_id,
            json.dumps(data),
            now,
            now,
            None,  # USUARIO CRIADOR (integrar depois)
            None   # USUARIO ATUALIZADOR
        ))
        cur.execute("""
            INSERT INTO flow_logs (flow_id, action, created_at, user_id)
            VALUES (%s,'CREATE',%s,%s)
        """, (flow_id, now, None))
    return jsonify({"id": flow_id})

@app.route("/api/flow/<flow_id>", methods=["GET"])
def get_flow(flow_id):
    with db() as c:
        cur = c.cursor()
        cur.execute("SELECT data FROM flows WHERE id=%s", (flow_id,))
        r = cur.fetchone()
    return jsonify(r[0] if r else {})

@app.route("/api/flow/<flow_id>", methods=["PUT"])
def update_flow(flow_id):
    data = request.json
    now = datetime.datetime.utcnow()

    with db() as c:
        cur = c.cursor()
        cur.execute("""
            UPDATE flows SET data=%s, updated_at=%s, updated_by=%s
            WHERE id=%s
        """, (
            json.dumps(data),
            now,
            None,  # USUARIO ATUALIZADOR (integrar depois)
            flow_id
        ))
        cur.execute("""
            INSERT INTO flow_logs (flow_id, action, created_at, user_id)
            VALUES (%s,'UPDATE',%s,%s)
        """, (flow_id, now, None))
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)