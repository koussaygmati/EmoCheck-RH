import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function LoginAdmin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Récupère le paramètre redirect dans l'URL, ex: loginadmin?redirect=dashboardbi
  const queryParams = new URLSearchParams(location.search);
  // Sans le "/" au début dans redirectPath sinon on aura //dashboardadmin
  const redirectPath = queryParams.get('redirect') || 'dashboardadmin'; 

  const handleConnexion = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);

        // Stockage simple d'authentification admin
        localStorage.setItem('isAdminAuthenticated', 'true');

        // Redirection dynamique (on ajoute le slash ici)
        navigate(`/${redirectPath}`);
      } else {
        const errData = await response.json();
        setError(errData.message || 'Erreur de connexion');
      }
    } catch (error) {
      setError('Erreur réseau ou serveur indisponible');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c3e50, #4ca1af)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#2b2b2b',
        padding: '30px',
        borderRadius: '18px',
        width: '100%',
        maxWidth: '320px',
        color: 'white',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '25px' }}>🔐 Connexion Admin</h2>
        <form onSubmit={handleConnexion} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label htmlFor="username">Nom d’utilisateur :</label>
          <input
            id="username"
            type="text"
            placeholder="Votre nom d’utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              outline: 'none',
              fontSize: '14px'
            }}
          />

          <label htmlFor="password">Mot de passe :</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              outline: 'none',
              fontSize: '14px'
            }}
          />

          {error && <p style={{ color: 'salmon', fontSize: '14px' }}>{error}</p>}

          <button type="submit" style={{
            backgroundColor: '#2980b9',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1c5980'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2980b9'}
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginAdmin;
