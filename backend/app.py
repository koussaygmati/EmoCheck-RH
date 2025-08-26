from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import os
from fer import FER
import cv2
import tempfile
import traceback
import speech_recognition as sr
import wave
import audioop
from pydub import AudioSegment

app = Flask(__name__)
CORS(app)

# Config pydub avec chemins absolus vers ffmpeg et ffprobe
AudioSegment.converter = r"C:\Users\ASUS\Downloads\ffmpeg-7.1.1-essentials_build\ffmpeg-7.1.1-essentials_build\bin\ffmpeg.exe"
AudioSegment.ffprobe = r"C:\Users\ASUS\Downloads\ffmpeg-7.1.1-essentials_build\ffmpeg-7.1.1-essentials_build\bin\ffprobe.exe"

face_detector = FER(mtcnn=True)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="emocheck_rh"
    )

@app.route('/')
def home():
    return "✅ EmoCheck RH Backend opérationnel !"

@app.route('/login', methods=['POST'])
def login_admin():
    from mysql.connector import Error

    data = request.json
    username = data.get('username')
    password = data.get('password')
    conn = None  # 🔥 important pour éviter l'erreur si la connexion échoue

    if not username or not password:
        return jsonify({"error": "Nom d'utilisateur et mot de passe requis"}), 400

    try:
        conn = get_db_connection()
        if not conn.is_connected():
            return jsonify({"error": "Échec de la connexion à la base de données"}), 500

        cursor = conn.cursor()
        cursor.execute("SELECT * FROM admin WHERE username = %s AND password = %s", (username, password))
        admin = cursor.fetchone()
        cursor.close()

        if admin:
            return jsonify({"message": "Connexion réussie", "admin_id": admin[0]}), 200
        else:
            return jsonify({"error": "Identifiants invalides"}), 401

    except Error as e:
        return jsonify({"error": f"Erreur MySQL: {str(e)}"}), 500

    finally:
        if conn and conn.is_connected():
            conn.close()

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    conn = None

    try:
        date_naissance = data.get('date_naissance')
        if date_naissance in ("", None, "null"):
            date_naissance = None

        conn = get_db_connection()
        cursor = conn.cursor()

        sql = """
            INSERT INTO employe (nom, prenom, email, poste, date_naissance, telephone, cv)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            data['nom'], data['prenom'], data['email'],
            data['poste'], date_naissance,
            data['telephone'], data['cv']
        ))
        employe_id = cursor.lastrowid
        conn.commit()
        cursor.close()

        return jsonify({"message": "Inscription réussie.", "employe_id": employe_id})

    except Exception as e:
        print("Erreur lors de l'inscription :", e)
        return jsonify({"error": str(e)}), 500

    finally:
        try:
            if conn is not None and conn.is_connected():
                conn.close()
        except:
            pass

@app.route('/employes', methods=['GET'])
def get_employes():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, nom, prenom, email, poste, date_naissance FROM employe")
        rows = cursor.fetchall()
        employes = [dict(
            id=row[0],
            nom=row[1],
            prenom=row[2],
            email=row[3],
            poste=row[4],
            date_naissance=row[5].strftime("%Y-%m-%d") if row[5] else None
        ) for row in rows]
        cursor.close()
        return jsonify(employes)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

@app.route('/resultat', methods=['POST'])
def resultat():
    data = request.json
    try:
        employe_id = data.get('employe_id')
        emotion = data.get('emotion')
        confiance = data.get('confiance')
        commentaire = data.get('commentaire') or None
        date_naissance = data.get('date_naissance')

        if date_naissance in ("", None, "null"):
            date_naissance = None

        if not employe_id or not emotion or confiance is None:
            return jsonify({"error": "Champs requis manquants."}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""INSERT INTO entretien 
            (employe_id, date_entretien, emotion_predite, confiance, commentaire, date_naissance) 
            VALUES (%s, %s, %s, %s, %s, %s)""",
            (employe_id, datetime.now(), emotion, confiance, commentaire, date_naissance))
        conn.commit()
        cursor.close()
        return jsonify({"message": "Résultat émotionnel enregistré."})
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

@app.route('/tests_employe/<int:id>', methods=['GET'])
def tests_employe(id):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, date_entretien, emotion_predite, confiance, commentaire,
                   transcription, fautes_grammaire, fluidite, volume, date_naissance
            FROM entretien WHERE employe_id = %s
        """, (id,))
        rows = cursor.fetchall()
        tests = [{
            "id": row[0],
            "date_test": row[1].strftime("%Y-%m-%d %H:%M"),
            "emotion_principale": row[2],
            "score": row[3],
            "commentaire": row[4],
            "transcription": row[5] or "",
            "fautes_grammaire": row[6] or 0,
            "fluidite": float(row[7]) if row[7] else 0,
            "volume": float(row[8]) if row[8] else 0,
            "date_naissance": row[9].strftime("%Y-%m-%d") if row[9] else None
        } for row in rows]
        cursor.close()
        return jsonify(tests)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

@app.route('/resultats', methods=['GET'])
def tous_les_resultats():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT e.nom, e.prenom, e.email, ent.date_entretien, ent.emotion_predite, ent.confiance, ent.commentaire,
                   ent.transcription, ent.fautes_grammaire, ent.fluidite, ent.volume, ent.date_naissance
            FROM entretien ent
            JOIN employe e ON e.id = ent.employe_id
        """)
        rows = cursor.fetchall()
        resultats = [{
            "nom": row[0],
            "prenom": row[1],
            "email": row[2],
            "date": row[3].strftime("%Y-%m-%d"),
            "heure": row[3].strftime("%H:%M"),
            "emotion": row[4],
            "intensite": row[5],
            "commentaire": row[6],
            "transcription": row[7] or "",
            "fautes_grammaire": row[8] or 0,
            "fluidite": float(row[9]) if row[9] is not None else 0,
            "volume": float(row[10]) if row[10] is not None else 0,
            "date_naissance": row[11].strftime("%Y-%m-%d") if row[11] else None
        } for row in rows]
        cursor.close()
        return jsonify(resultats)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

@app.route('/supprimer_employe/<int:id>', methods=['DELETE'])
def supprimer_employe(id):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM employe WHERE id = %s", (id,))
        conn.commit()
        cursor.close()
        return jsonify({"message": "Employé supprimé avec succès"}), 200
    except Exception as e:
        return jsonify({"message": "Erreur lors de la suppression", "error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

@app.route('/supprimer_emotions', methods=['DELETE'])
def supprimer_emotions():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM entretien")
        conn.commit()
        cursor.close()
        return jsonify({'message': 'Toutes les émotions supprimées'}), 200
    except Exception as e:
        return jsonify({"message": "Erreur lors de la suppression", "error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

@app.route('/analyse', methods=['POST'])
def analyse_emotion():
    try:
        file = request.files.get('file')
        audio_file = request.files.get('audio')
        employe_id = request.form.get('employe_id')
        date_naissance = request.form.get('date_naissance')

        if not file or not audio_file or not employe_id:
            return jsonify({"error": "Fichier vidéo, audio ou ID manquants."}), 400

        # Conversion date_naissance string -> datetime.date ou None
        if date_naissance not in (None, "", "null"):
            try:
                date_naissance = datetime.strptime(date_naissance, "%Y-%m-%d").date()
            except ValueError:
                date_naissance = None
        else:
            date_naissance = None

        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as temp_vid:
            file.save(temp_vid.name)
            temp_vid_path = temp_vid.name

        cap = cv2.VideoCapture(temp_vid_path)
        emotions = []
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            result = face_detector.detect_emotions(frame)
            if result:
                emotions.append(result[0]["emotions"])
        cap.release()
        os.remove(temp_vid_path)

        emotion, confiance = "Aucune", 0
        if emotions:
            avg = {emo: sum(e[emo] for e in emotions) / len(emotions) for emo in emotions[0]}
            emotion = max(avg, key=avg.get)
            confiance = round(avg[emotion] * 100, 2)

        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as temp_audio_webm:
            audio_file.save(temp_audio_webm.name)
            temp_audio_webm_path = temp_audio_webm.name

        wav_path = temp_audio_webm_path.replace(".webm", ".wav")
        audio_segment = AudioSegment.from_file(temp_audio_webm_path)
        audio_segment.export(wav_path, format="wav")

        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)
            try:
                texte = recognizer.recognize_google(audio_data, language="fr-FR")
            except:
                texte = ""

        nb_mots = len(texte.split())
        duree_audio = get_audio_duration(wav_path)
        fluidite = round(nb_mots / duree_audio, 2) if duree_audio > 0 else 0
        fautes = detect_fautes_simples(texte)
        volume = get_volume(wav_path)

        os.remove(temp_audio_webm_path)
        os.remove(wav_path)

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO entretien 
            (employe_id, date_entretien, emotion_predite, confiance, transcription, fautes_grammaire, fluidite, volume, date_naissance)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            employe_id, datetime.now(), emotion, confiance, texte, fautes, fluidite, volume, date_naissance
        ))
        conn.commit()
        cursor.close()
        if conn.is_connected():
            conn.close()

        return jsonify({
            "emotion": emotion,
            "confiance": confiance,
            "transcription": texte,
            "fautes": fautes,
            "fluidite": fluidite,
            "volume": volume
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def get_audio_duration(path):
    try:
        with wave.open(path, 'rb') as wf:
            frames = wf.getnframes()
            rate = wf.getframerate()
            return frames / float(rate)
    except:
        return 0

def get_volume(path):
    try:
        with wave.open(path, 'rb') as wf:
            frames = wf.readframes(wf.getnframes())
            volume = audioop.rms(frames, wf.getsampwidth())
            return round(volume / 1000, 2)
    except:
        return 0

def detect_fautes_simples(text):
    fautes = 0
    fautes += text.count(" je suis pas ")
    fautes += text.count(" il faut que je vais ")
    return fautes

if __name__ == '__main__':
    app.run(debug=True)
