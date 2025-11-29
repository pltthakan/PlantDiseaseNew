import os
import uuid
from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

import tensorflow as tf
from tensorflow.keras.utils import load_img, img_to_array
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import numpy as np
import json

# ---------- Flask ve DB Ayarları ----------
app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite3"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["UPLOAD_FOLDER"] = "uploads"

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# ---------- Model Yükleme ----------
MODEL_PATH = "bitki_hastalik_mobilenet_final-2.h5"
CLASS_PATH = "class_indices.json"
IMAGE_SIZE = (224, 224)

print("📦 Model yükleniyor...")
model = tf.keras.models.load_model(MODEL_PATH)
print("✅ Model yüklendi.")

with open(CLASS_PATH, "r") as f:
    labels = json.load(f)
inv_labels = {v: k for k, v in labels.items()}


# ---------- Veritabanı Modelleri ----------
class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    predictions = db.relationship("Prediction", backref="user", lazy=True)


class Prediction(db.Model):
    __tablename__ = "prediction"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    class_name = db.Column(db.String(120))
    confidence = db.Column(db.Float)
    image_path = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


def create_tables():
    db.create_all()
    print("✅ Veritabanı tabloları oluşturuldu (varsa dokunmaz).")



# ---------- Yardımcı Fonksiyonlar ----------
def predict_image(img_path: str):
    img = load_img(img_path, target_size=IMAGE_SIZE)
    arr = img_to_array(img)
    arr = np.expand_dims(arr, axis=0)
    arr = preprocess_input(arr)
    pred = model.predict(arr, verbose=0)
    class_index = int(np.argmax(pred))
    class_name = inv_labels[class_index]
    confidence = float(pred[0][class_index])
    return class_name, confidence


# ---------- Auth Endpoint'leri ----------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body yok"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email ve şifre zorunlu"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Bu email zaten kayıtlı"}), 400

    pw_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(email=email, password_hash=pw_hash)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Kayıt başarılı", "user_id": user.id})


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body yok"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email ve şifre zorunlu"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Email veya şifre hatalı"}), 401

    return jsonify({"message": "Giriş başarılı", "user_id": user.id})


# ---------- Tahmin Endpoint'i ----------
@app.route("/api/predict", methods=["POST"])
def predict():
    user_id = request.form.get("user_id")

    if "image" not in request.files:
        return jsonify({"error": "Form-data 'image' alanı zorunlu"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Dosya ismi boş"}), 400

    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    class_name, confidence = predict_image(filepath)

    pred = Prediction(
        user_id=int(user_id) if user_id else None,
        class_name=class_name,
        confidence=confidence,
        image_path=filepath,
        created_at=datetime.utcnow()
    )
    db.session.add(pred)
    db.session.commit()

    return jsonify({
        "class_name": class_name,
        "confidence": confidence,
        "prediction_id": pred.id,
        "created_at": pred.created_at.isoformat()
    })


# ---------- Geçmiş Tahminler Endpoint'i ----------
@app.route("/api/history", methods=["GET"])
def history():
    user_id = request.args.get("user_id", type=int)

    if not user_id:
        return jsonify({"error": "user_id query parametresi zorunlu"}), 400

    preds = (Prediction.query
             .filter_by(user_id=user_id)
             .order_by(Prediction.created_at.desc())
             .all())

    data = []
    for p in preds:
        data.append({
            "id": p.id,
            "class_name": p.class_name,
            "confidence": p.confidence,
            "created_at": p.created_at.isoformat()
        })

    return jsonify(data)


@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Plant disease API çalışıyor"})


if __name__ == "__main__":
    # Uygulama context'i içinde tabloları yarat
    with app.app_context():
        create_tables()

    app.run(host="0.0.0.0", port=5000, debug=True)

