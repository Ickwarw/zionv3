from flask import Flask, request, jsonify
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship, declarative_base

app = Flask(__name__)
engine = create_engine("sqlite:///voip_system.db")
Session = sessionmaker(bind=engine)
session = Session()
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    sector = Column(String)


class Call(Base):
    __tablename__ = "calls"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    number = Column(String)
    direction = Column(String)  
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime)
    recording_path = Column(String)
    transferred_to_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    transferred_at = Column(DateTime, nullable=True)

    user = relationship("User", foreign_keys=[user_id])
    transferred_to = relationship("User", foreign_keys=[transferred_to_user_id])


Base.metadata.create_all(engine)

@app.route("/make_call", methods=["POST"])
def make_call():
    data = request.json
    user_id = data.get("user_id")
    number = data.get("number")

    if not user_id or not number:
        return jsonify({"error": "user_id e number são obrigatórios"}), 400

    call = Call(user_id=user_id, number=number, direction="outbound")
    session.add(call)
    session.commit()

    return jsonify({"message": "Ligação realizada", "call_id": call.id}), 201

@app.route("/receive_call", methods=["POST"])
def receive_call():
    data = request.json
    user_id = data.get("user_id")
    number = data.get("number")

    if not user_id or not number:
        return jsonify({"error": "user_id e number são obrigatórios"}), 400

    call = Call(user_id=user_id, number=number, direction="inbound")
    session.add(call)
    session.commit()

    return jsonify({"message": "Ligação recebida", "call_id": call.id}), 201

@app.route("/end_call/<int:call_id>", methods=["POST"])
def end_call(call_id):
    call = session.query(Call).filter_by(id=call_id).first()
    if not call:
        return jsonify({"error": "Chamada não encontrada"}), 404

    call.ended_at = datetime.utcnow()
    call.recording_path = f"recordings/call_{call.id}.mp3"
    session.commit()

    return jsonify({"message": "Chamada finalizada", "call_id": call.id}), 200

@app.route("/transfer_call", methods=["POST"])
def transfer_call():
    data = request.json
    call_id = data.get("call_id")
    target_user_id = data.get("target_user_id")
    target_sector = data.get("target_sector")

    if not call_id:
        return jsonify({"error": "call_id é obrigatório"}), 400

    call = session.query(Call).filter_by(id=call_id).first()
    if not call:
        return jsonify({"error": "Chamada não encontrada"}), 404

    if target_user_id:
        user = session.query(User).filter_by(id=target_user_id).first()
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404
        call.transferred_to_user_id = user.id
        call.transferred_at = datetime.utcnow()
        session.commit()

        return jsonify({
            "message": f"Chamada {call.id} transferida para {user.name}",
            "call_id": call.id,
            "to_user": user.name
        }), 200

    if target_sector:
        user = session.query(User).filter_by(sector=target_sector).first()
        if not user:
            return jsonify({"error": "Nenhum usuário encontrado no setor"}), 404
        call.transferred_to_user_id = user.id
        call.transferred_at = datetime.utcnow()
        session.commit()

        return jsonify({
            "message": f"Chamada {call.id} transferida para setor {target_sector} (usuário {user.name})",
            "call_id": call.id,
            "to_sector": target_sector,
            "to_user": user.name
        }), 200

    return jsonify({"error": "Necessário informar target_user_id ou target_sector"}), 400


@app.route("/transfer_history/<int:call_id>", methods=["GET"])
def transfer_history(call_id):
    call = session.query(Call).filter_by(id=call_id).first()
    if not call:
        return jsonify({"error": "Chamada não encontrada"}), 404

    return jsonify({
        "call_id": call.id,
        "original_user": call.user_id,
        "transferred_to": call.transferred_to_user_id,
        "transferred_at": call.transferred_at.isoformat() if call.transferred_at else None
    }), 200

@app.route("/reports", methods=["GET"])
def reports():
    total_calls = session.query(Call).count()
    inbound = session.query(Call).filter_by(direction="inbound").count()
    outbound = session.query(Call).filter_by(direction="outbound").count()
    transferred = session.query(Call).filter(Call.transferred_to_user_id != None).count()

    return jsonify({
        "total_calls": total_calls,
        "inbound_calls": inbound,
        "outbound_calls": outbound,
        "transferred_calls": transferred
    }), 200


if __name__ == "__main__":
    app.run(port=5000, debug=True)