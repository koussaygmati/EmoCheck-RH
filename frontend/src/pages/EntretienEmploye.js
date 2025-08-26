import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

function EntretienEmploye() {
  const { id } = useParams();
  const navigate = useNavigate();
  const employeId = parseInt(id) || 1;

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRecorderRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [message, setMessage] = useState('');
  const [employeInfo, setEmployeInfo] = useState(null);
  const [questions] = useState([
    "🎯 Pouvez-vous vous présenter brièvement ?",
    "🧠 Quelles sont vos compétences clés ?",
    "🏆 Parlez d’un projet dont vous êtes fier.",
    "🚀 Quels sont vos objectifs de carrière ?",
    "🤝 Comment travaillez-vous en équipe ?"
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const videoChunks = useRef([]);
  const audioChunks = useRef([]);
  const [videoBlob, setVideoBlob] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  // Charger les infos de l’employé (dont date_naissance)
  useEffect(() => {
    fetch(`http://localhost:5000/employes`)
      .then(res => res.json())
      .then(data => {
        const emp = data.find(emp => emp.id === employeId);
        if (emp) setEmployeInfo(emp);
      })
      .catch(err => console.error("Erreur infos employé :", err));
  }, [employeId]);

  useEffect(() => {
    startMedia();
  }, []);

  const startMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;

      mediaRecorderRef.current = new MediaRecorder(stream);
      videoChunks.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunks.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(videoChunks.current, { type: 'video/webm' });
        setVideoBlob(blob);
      };

      const audioOnlyStream = new MediaStream(stream.getAudioTracks());
      audioRecorderRef.current = new MediaRecorder(audioOnlyStream);
      audioChunks.current = [];
      audioRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      audioRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      setMessage("✅ Caméra et micro activés.");
    } catch (err) {
      console.error("Erreur d'accès caméra/micro :", err);
      setMessage("❌ Impossible d'accéder à la caméra ou au micro.");
    }
  };

  const handleStart = () => {
    setRecording(true);
    setCurrentQuestionIndex(0);
    videoChunks.current = [];
    audioChunks.current = [];
    setVideoBlob(null);
    setAudioBlob(null);
    mediaRecorderRef.current?.start();
    audioRecorderRef.current?.start();
    setMessage("🎙️ Enregistrement en cours...");
  };

  const handleStop = () => {
    setRecording(false);
    mediaRecorderRef.current?.stop();
    audioRecorderRef.current?.stop();
    setMessage("📤 Traitement des enregistrements...");
  };

  useEffect(() => {
    if (videoBlob && audioBlob) {
      sendVideoAndAudioToBackend(videoBlob, audioBlob);
    }
  }, [videoBlob, audioBlob]);

  const sendVideoAndAudioToBackend = useCallback(async (videoBlob, audioBlob) => {
    try {
      if (!employeInfo) {
        setMessage("❌ Infos employé indisponibles.");
        return;
      }

      const formData = new FormData();
      formData.append('file', videoBlob, 'entretien.webm');
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('employe_id', employeId);
      formData.append('date_naissance', employeInfo.date_naissance); // <-- envoi date naissance

      const response = await fetch('http://localhost:5000/analyse', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(`✅ Emotion détectée : ${result.emotion} (${result.confiance}%) - 🎧 Transcription : ${result.transcription || 'N/A'}`);
      } else {
        setMessage("❌ Erreur analyse émotion/vocale.");
      }
    } catch (err) {
      console.error("Erreur envoi vidéo+audio :", err);
      setMessage("❌ Problème serveur analyse.");
    }
  }, [employeId, employeInfo]);

  const nextQuestion = () => {
    setCurrentQuestionIndex((prev) => (prev + 1 < questions.length ? prev + 1 : prev));
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #2c3e50, #4ca1af)',
      color: '#f5f5f5',
      minHeight: '100vh',
      padding: '30px',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'none',
          border: 'none',
          color: '#00bcd4',
          fontSize: '18px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >
        <FaArrowLeft style={{ marginRight: '8px' }} /> Retour
      </button>

      <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>🧑‍💼 Entretien Employé</h2>
      <p style={{ marginBottom: '20px', color: '#ccc' }}>{message}</p>

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '30px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: '100%',
            maxWidth: '500px',
            borderRadius: '16px',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            backgroundColor: '#000'
          }}
        />

        <div style={{
          backgroundColor: '#2d2d44',
          padding: '20px',
          borderRadius: '12px',
          flex: '1',
          minWidth: '280px',
          maxWidth: '500px'
        }}>
          {recording ? (
            <>
              <h4 style={{ color: '#00bcd4' }}>📢 Question :</h4>
              <p style={{ fontSize: '18px' }}>{questions[currentQuestionIndex]}</p>
              {currentQuestionIndex < questions.length - 1 && (
                <button
                  onClick={nextQuestion}
                  style={{
                    backgroundColor: '#00bcd4',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginTop: '10px',
                  }}
                >
                  👉 Question Suivante
                </button>
              )}
            </>
          ) : (
            <p style={{ color: '#aaa' }}>Cliquez sur le bouton pour démarrer l’entretien.</p>
          )}
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        {!recording ? (
          <button
            onClick={handleStart}
            style={{
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
          >
            ▶️ Démarrer l’entretien
          </button>
        ) : (
          <button
            onClick={handleStop}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            ⏹️ Terminer
          </button>
        )}
      </div>
    </div>
  );
}

export default EntretienEmploye;
