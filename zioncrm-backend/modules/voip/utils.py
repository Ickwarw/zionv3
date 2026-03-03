import os, time
from werkzeug.utils import secure_filename
from pydub import AudioSegment
from config import Config

CFG = Config()
os.makedirs(CFG.UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXT = {"wav","mp3","ogg","m4a","flac"}

def allowed_file(filename):
    ext = filename.rsplit(".",1)[-1].lower() if "." in filename else ""
    return ext in ALLOWED_EXT

def save_and_convert(file_storage, prefix="rec"):
    fname = secure_filename(file_storage.filename) or f"{prefix}_{int(time.time())}"
    path = os.path.join(CFG.UPLOAD_FOLDER, fname)
    file_storage.save(path)
    size = os.path.getsize(path)
    ext = fname.rsplit(".",1)[-1].lower() if "." in fname else ""
    if ext != "mp3":
        try:
            audio = AudioSegment.from_file(path)
            mp3name = os.path.splitext(fname)[0] + ".mp3"
            mp3path = os.path.join(CFG.UPLOAD_FOLDER, mp3name)
            audio.export(mp3path, format="mp3")
            os.remove(path)
            path = mp3path
            fname = mp3name
            size = os.path.getsize(path)
            mimetype = "audio/mpeg"
        except Exception as e:
            mimetype = "application/octet-stream"
    else:
        mimetype = "audio/mpeg"
    return fname, size, mimetype
