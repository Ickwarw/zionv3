import os, time
from flask import Flask, request, jsonify, send_from_directory, abort, Response
from config import Config
from models import db, Client, Call, Recording
from voip.adapters import SimpleHttpAdapter
from utils import save_and_convert, allowed_file
from datetime import datetime
from reports import summary_stats, calls_by_source, daily_volume, duration_stats, top_clients, export_calls_csv

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    voip_adapter = SimpleHttpAdapter()

    with app.app_context():
        db.create_all()
        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    @app.route("/clients/search", methods=["GET"])
    def search_clients():
        q = request.args.get("q", "").strip()
        if not q:
            return jsonify([])
        results = Client.query.filter(Client.name.ilike(f"%{q}%")).limit(50).all()
        return jsonify([{"id":c.id,"name":c.name,"phone":c.phone} for c in results])

    @app.route("/clients", methods=["POST"])
    def create_client():
        data = request.get_json() or {}
        name = data.get("name")
        if not name:
            return jsonify({"error":"name required"}), 400
        c = Client(name=name, phone=data.get("phone"), metadata=data.get("metadata"))
        db.session.add(c); db.session.commit()
        return jsonify({"id": c.id, "name": c.name}), 201

    @app.route("/call/outgoing", methods=["POST"])
    def outgoing_call():
        data = request.get_json() or {}
        from_num = data.get("from"); to_num = data.get("to"); client_id = data.get("client_id"); source = data.get("source","telefone")
        if not from_num or not to_num:
            return jsonify({"error":"from and to required"}), 400
        call = Call(call_uuid=f"local-{int(time.time()*1000)}", client_id=client_id, direction="outbound", source=source, from_number=from_num, to_number=to_num, started_at=datetime.utcnow())
        db.session.add(call); db.session.commit()
        try:
            resp = voip_adapter.initiate_call(from_num, to_num, extra={"client_id": client_id})
            call_uuid = resp.get("call_uuid") or resp.get("id")
            if call_uuid:
                call.call_uuid = call_uuid; db.session.commit()
            try:
                postback = request.url_root.rstrip("/") + "/recording/upload"
                voip_adapter.start_recording(call.call_uuid, postback)
            except Exception as e:
                app.logger.info("start_recording failed: %s", e)
            return jsonify({"status":"started","call_id":call.id, "call_uuid": call.call_uuid}), 201
        except Exception as e:
            app.logger.error("gateway error: %s", e)
            return jsonify({"error":"gateway_failure","detail": str(e)}), 500

    @app.route("/webhook/incoming", methods=["POST"])
    def incoming_webhook():
        data = request.get_json() or {}
        event = data.get("event"); call_uuid = data.get("call_uuid")
        if not event or not call_uuid:
            return jsonify({"error":"event and call_uuid required"}), 400
        call = Call.query.filter_by(call_uuid=call_uuid).first()
        if not call:
            call = Call(call_uuid=call_uuid, direction=data.get("direction","inbound"), from_number=data.get("from"), to_number=data.get("to"), source=data.get("source"), started_at=datetime.utcnow())
            db.session.add(call); db.session.commit()
        if event.endswith("started"):
            call.started_at = datetime.fromisoformat(data.get("timestamp")) if data.get("timestamp") else datetime.utcnow()
            call.location = data.get("location")
            db.session.commit()
            return jsonify({"status":"ok"})
        if event.endswith("ended") or event == "call.finished":
            call.ended_at = datetime.fromisoformat(data.get("timestamp")) if data.get("timestamp") else datetime.utcnow()
            dur = data.get("duration_seconds")
            if dur is not None:
                call.duration_seconds = int(dur)
            db.session.commit()
            return jsonify({"status":"ok"})
        return jsonify({"status":"ignored"})

    @app.route("/recording/upload", methods=["POST"])
    def recording_upload():
        if "file" not in request.files:
            return jsonify({"error":"file required"}), 400
        f = request.files["file"]
        call_uuid = request.form.get("call_uuid") or request.args.get("call_uuid")
        if not f or f.filename == "":
            return jsonify({"error":"empty file"}), 400
        if not allowed_file(f.filename):
            return jsonify({"error":"file type not allowed"}), 400
        call = None
        if call_uuid:
            call = Call.query.filter_by(call_uuid=call_uuid).first()
        if not call:
            call = Call(call_uuid=call_uuid or f"unknown-{int(time.time())}", direction="unknown")
            db.session.add(call); db.session.commit()
        filename, filesize, mime = save_and_convert(f, prefix=f"call_{call.id}")
        rec = Recording(call_id=call.id, filename=filename, filesize=filesize, mime_type=mime)
        db.session.add(rec); db.session.commit()
        return jsonify({"status":"ok","recording_id":rec.id,"filename":filename})

    @app.route("/calls/<int:call_id>/rate", methods=["POST"])
    def rate_call(call_id):
        call = Call.query.get_or_404(call_id)
        data = request.get_json() or {}
        r = data.get("rating")
        call.rating = int(r) if r is not None else None
        call.notes = data.get("notes")
        db.session.commit()
        return jsonify({"status":"ok","call_id":call.id})

    @app.route("/recordings/<int:rec_id>/download", methods=["GET"])
    def download_recording(rec_id):
        rec = Recording.query.get_or_404(rec_id)
        return send_from_directory(app.config["UPLOAD_FOLDER"], rec.filename, as_attachment=True)

    @app.route("/reports/summary", methods=["GET"])
    def rpt_summary():
        start = request.args.get("start")
        end = request.args.get("end")
        return jsonify(summary_stats(start, end))

    @app.route("/reports/by_source", methods=["GET"])
    def rpt_by_source():
        start = request.args.get("start"); end = request.args.get("end")
        return jsonify(calls_by_source(start, end))

    @app.route("/reports/daily_volume", methods=["GET"])
    def rpt_daily():
        start = request.args.get("start"); end = request.args.get("end")
        return jsonify(daily_volume(start, end))

    @app.route("/reports/duration", methods=["GET"])
    def rpt_duration():
        start = request.args.get("start"); end = request.args.get("end")
        return jsonify(duration_stats(start, end))

    @app.route("/reports/top_clients", methods=["GET"])
    def rpt_top_clients():
        n = int(request.args.get("n", 10))
        start = request.args.get("start"); end = request.args.get("end")
        return jsonify(top_clients(n, start, end))

    @app.route("/reports/export_calls.csv", methods=["GET"])
    def rpt_export_calls():
        start = request.args.get("start"); end = request.args.get("end")
        csv = export_calls_csv(start, end)
        return Response(csv, mimetype="text/csv", headers={"Content-Disposition": "attachment; filename=calls_export.csv"})

    # ----------------------------------------------------

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000)
