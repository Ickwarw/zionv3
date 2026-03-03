from models import db, Call, Client, Recording
from sqlalchemy import func, and_
from datetime import datetime, timedelta
import pandas as pd
import io

def parse_range(start, end):
    if start:
        start_dt = datetime.fromisoformat(start)
    else:
        start_dt = datetime.utcnow() - timedelta(days=30)
    if end:
        end_dt = datetime.fromisoformat(end)
    else:
        end_dt = datetime.utcnow()
    return start_dt, end_dt

def summary_stats(start=None, end=None):
    s,e = parse_range(start,end)
    total_calls = db.session.query(func.count(Call.id)).filter(Call.started_at >= s, Call.started_at <= e).scalar()
    inbound = db.session.query(func.count(Call.id)).filter(Call.started_at>=s, Call.started_at<=e, Call.direction=='inbound').scalar()
    outbound = db.session.query(func.count(Call.id)).filter(Call.started_at>=s, Call.started_at<=e, Call.direction=='outbound').scalar()
    avg_duration = db.session.query(func.avg(Call.duration_seconds)).filter(Call.started_at>=s, Call.started_at<=e, Call.duration_seconds != None).scalar() or 0
    total_recordings = db.session.query(func.count(Recording.id)).join(Call).filter(Call.started_at>=s, Call.started_at<=e).scalar()
    total_recordings_bytes = db.session.query(func.coalesce(func.sum(Recording.filesize),0)).join(Call).filter(Call.started_at>=s, Call.started_at<=e).scalar()
    avg_rating = db.session.query(func.avg(Call.rating)).filter(Call.started_at>=s, Call.started_at<=e, Call.rating != None).scalar() or None

    return {
        "period_start": s.isoformat(),
        "period_end": e.isoformat(),
        "total_calls": int(total_calls or 0),
        "inbound_calls": int(inbound or 0),
        "outbound_calls": int(outbound or 0),
        "avg_duration_seconds": float(avg_duration),
        "total_recordings": int(total_recordings or 0),
        "total_recordings_bytes": int(total_recordings_bytes or 0),
        "avg_rating": float(avg_rating) if avg_rating is not None else None
    }

def calls_by_source(start=None, end=None):
    s,e = parse_range(start,end)
    q = db.session.query(Call.source, func.count(Call.id)).filter(Call.started_at>=s, Call.started_at<=e).group_by(Call.source).all()
    return [{"source": src or "unknown", "count": c} for src,c in q]

def daily_volume(start=None, end=None):
    s,e = parse_range(start,end)
    q = db.session.query(func.date(Call.started_at).label("day"), func.count(Call.id)).filter(Call.started_at>=s, Call.started_at<=e).group_by(func.date(Call.started_at)).order_by(func.date(Call.started_at)).all()
    return [{"day": str(day), "count": cnt} for day,cnt in q]

def duration_stats(start=None, end=None):
    s,e = parse_range(start,end)
    q = db.session.query(
        func.min(Call.duration_seconds),
        func.max(Call.duration_seconds),
        func.avg(Call.duration_seconds),
        func.count(Call.id)
    ).filter(Call.started_at>=s, Call.started_at<=e, Call.duration_seconds != None).first()
    if not q:
        return {}
    return {"min": q[0], "max": q[1], "avg": float(q[2] or 0), "count": int(q[3] or 0)}

def top_clients(n=10, start=None, end=None):
    s,e = parse_range(start,end)
    q = db.session.query(Client.id, Client.name, func.count(Call.id).label("calls")).join(Call, Call.client_id==Client.id).filter(Call.started_at>=s, Call.started_at<=e).group_by(Client.id, Client.name).order_by(func.count(Call.id).desc()).limit(n).all()
    return [{"client_id": cid, "name": name, "calls": calls} for cid,name,calls in q]

def export_calls_csv(start=None, end=None):
    s,e = parse_range(start,end)
    q = db.session.query(Call.id, Call.call_uuid, Call.direction, Call.source, Call.started_at, Call.ended_at, Call.duration_seconds, Call.from_number, Call.to_number, Call.client_id, Call.rating)
    q = q.filter(Call.started_at>=s, Call.started_at<=e).order_by(Call.started_at.asc())
    df = pd.read_sql(q.statement, db.session.bind)
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    buf.seek(0)
    return buf.getvalue()
