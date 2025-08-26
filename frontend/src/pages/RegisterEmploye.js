import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RegisterEmploye() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    poste: '',
    date_naissance: '',
    telephone: '',
    cv: '',
  });

  const [confirmation, setConfirmation] = useState('');
  const [erreur, setErreur] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');

    // Préparation des données à envoyer
    const dataToSend = {
      ...formData,
      date_naissance: formData.date_naissance ? formData.date_naissance : null,
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (response.ok) {
        setConfirmation("✅ Inscription réussie !");
        setTimeout(() => navigate(`/entretien/${data.employe_id}`), 1500);
      } else {
        setErreur("❌ Erreur : " + (data.message || data.error));
      }
    } catch (err) {
      setErreur("❌ Erreur de connexion avec le serveur.");
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #2c3e50, #4ca1af)',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#2b2b2b',
        padding: '30px',
        borderRadius: '18px',
        width: '100%',
        maxWidth: '450px',
        color: 'white',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)'
      }}>
        <h2 style={{
          marginBottom: '20px',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#fff',
          borderBottom: '2px solid #444',
          paddingBottom: '10px'
        }}>
          Inscription Employé
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="poste"
            placeholder="Poste souhaité"
            value={formData.poste}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="date"
            name="date_naissance"
            value={formData.date_naissance}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="tel"
            name="telephone"
            placeholder="Téléphone"
            value={formData.telephone}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <textarea
            name="cv"
            placeholder="Lien du CV ou résumé..."
            value={formData.cv}
            onChange={handleChange}
            style={{ ...inputStyle, height: '80px' }}
          />

          <button type="submit" style={{
            backgroundColor: '#f0f0f0',
            color: '#000',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '10px'
          }}>
            S'inscrire
          </button>
        </form>

        {confirmation && <p style={{ color: 'lightgreen', marginTop: '15px' }}>{confirmation}</p>}
        {erreur && <p style={{ color: '#ff4d4d', marginTop: '15px' }}>{erreur}</p>}
      </div>
    </div>
  );
}

const inputStyle = {
  backgroundColor: '#3b3b3b',
  color: '#fff',
  border: '1px solid #555',
  padding: '10px',
  borderRadius: '6px',
  fontSize: '14px'
};

export default RegisterEmploye;
