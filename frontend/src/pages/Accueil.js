import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Accueil() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const navButton = {
    background: 'none',
    border: 'none',
    color: '#2c3e50',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'color 0.3s',
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(to right, #e0ecff, #f7faff)', 
      fontFamily: 'Segoe UI, sans-serif' 
    }}>
      
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '15px 30px',
        borderBottom: '1px solid #ddd',
        backgroundColor: '#ffffff',
        fontSize: '14px'
      }}>
        <h1 style={{ color: '#2c3e50', fontSize: '22px', margin: 0 }}>
          <span style={{ color: '#0066ff' }}>Emo</span>Check RH
        </h1>

        <nav>
          <ul style={{ 
            display: 'flex', 
            gap: '18px', 
            listStyle: 'none', 
            margin: 0, 
            padding: 0, 
            alignItems: 'center'
          }}>
            <li>
              <button
                onClick={() => navigate('/')}
                style={navButton}
                aria-label="🏠 Home"
                onMouseEnter={e => e.currentTarget.style.color = '#0066ff'}
                onMouseLeave={e => e.currentTarget.style.color = '#2c3e50'}
              >
                🏠 Home
              </button>
            </li>

            <li>
              <button
                onClick={() => navigate('/register')}
                style={navButton}
                aria-label="👤 S'inscrire"
                onMouseEnter={e => e.currentTarget.style.color = '#0066ff'}
                onMouseLeave={e => e.currentTarget.style.color = '#2c3e50'}
              >
                👤 S'inscrire
              </button>
            </li>

            <li>
              <button
                onClick={() => navigate('/loginadmin?redirect=dashboardadmin')}
                style={navButton}
                aria-label="🔐 Login Admin"
                onMouseEnter={e => e.currentTarget.style.color = '#0066ff'}
                onMouseLeave={e => e.currentTarget.style.color = '#2c3e50'}
              >
                🔐 Login Admin
              </button>
            </li>

            <li>
              <button
                onClick={() => navigate('/loginadmin?redirect=dashboardbi')}
                style={navButton}
                aria-label="📊 Dashboard BI"
                onMouseEnter={e => e.currentTarget.style.color = '#0066ff'}
                onMouseLeave={e => e.currentTarget.style.color = '#2c3e50'}
              >
                📊 Dashboard BI
              </button>
            </li>
          </ul>
        </nav>

      </header>

      {/* Contenu principal */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '60px 20px',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '40px',
          marginBottom: '20px',
          color: '#2c3e50',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 1s ease'
        }}>
          Human Resources Emotion Intelligence
        </h2>

        <p style={{
          fontSize: '17px',
          color: '#444',
          maxWidth: '700px',
          marginBottom: '10px',
          opacity: visible ? 1 : 0,
          transition: 'opacity 1.5s ease',
        }}>
          EmoCheck RH est une plateforme intelligente conçue pour aider les recruteurs à analyser les émotions
          des candidats en temps réel grâce à la caméra et au micro.
        </p>

        <p style={{
          fontSize: '15px',
          color: '#555',
          maxWidth: '680px',
          marginBottom: '30px',
          opacity: visible ? 1 : 0,
          transition: 'opacity 1.5s ease 0.5s',
        }}>
          Optimisez vos entretiens avec des données émotionnelles fiables et prenez de meilleures décisions RH.
        </p>

        <a 
          href="https://clubrh.mabonnefee.com/fr/article/lintelligence-emotionnelle-indispensable-dans-la-fonction-rh"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '12px 24px',
            border: '2px solid #0066ff',
            color: '#0066ff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            transition: '0.3s',
          }}
        >
          🔍 Voir plus
        </a>
      </main>
    </div>
  );
}

export default Accueil;
