import React from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardBI() {
  const navigate = useNavigate();

  // Remplace ici par ton vrai lien Power BI public
  const powerbiUrl = "https://app.powerbi.com/view?r=eyJrIjoiMmRkODkwMDMtZWQxNS00MTljLWE3MmItZWEwZjc3NWMwNGU1IiwidCI6ImRiZDY2NjRkLTRlYjktNDZlYi05OWQ4LTVjNDNiYTE1M2M2MSIsImMiOjl9";

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      color: 'white',
      fontFamily: 'Segoe UI, sans-serif',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Tableau de bord Power BI
      </h1>

      <button
        onClick={() => navigate('/')}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: '#2980b9',
          color: 'white',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'background-color 0.3s',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1c5980'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2980b9'}
      >
        ← Retour à l'accueil
      </button>

      <div style={{
        width: '100%',
        maxWidth: '1000px',
        flexGrow: 1,
      }}>
        <iframe
          title="Dashboard Power BI"
          width="100%"
          height="700"
          src={powerbiUrl}
          frameBorder="0"
          allowFullScreen
          style={{
            borderRadius: '10px',
            boxShadow: '0 0 15px rgba(0,0,0,0.3)',
            border: 'none',
          }}
        />
      </div>
    </div>
  );
}

export default DashboardBI;
