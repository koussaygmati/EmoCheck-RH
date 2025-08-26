import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

function DashboardAdmin() {
  const [employes, setEmployes] = useState([]);
  const [testsEmploye, setTestsEmploye] = useState([]);
  const [emotionsData, setEmotionsData] = useState([]);
  const [selectedEmployeName, setSelectedEmployeName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://127.0.0.1:5000/employes')
      .then(res => res.json())
      .then(data => setEmployes(data))
      .catch(() => setEmployes([]));

    fetch('http://127.0.0.1:5000/resultats')
      .then(res => res.json())
      .then(data => setEmotionsData(data))
      .catch(() => setEmotionsData([]));
  }, []);

  const voirTests = (id, nom, prenom) => {
    fetch(`http://127.0.0.1:5000/tests_employe/${id}`)
      .then(res => res.json())
      .then(data => {
        setTestsEmploye(data);
        setSelectedEmployeName(`${nom} ${prenom}`);
      })
      .catch(() => setTestsEmploye([]));
  };

  const supprimerEmploye = (id) => {
    if (window.confirm('⚠️ Supprimer cet employé ?')) {
      fetch(`http://127.0.0.1:5000/supprimer_employe/${id}`, { method: 'DELETE' })
        .then(res => {
          if (res.ok) {
            setEmployes(prev => prev.filter(emp => emp.id !== id));
            alert('✅ Employé supprimé');
            setTestsEmploye([]);
            setSelectedEmployeName('');
          } else {
            alert('❌ Erreur suppression');
          }
        })
        .catch(() => alert('❌ Erreur réseau'));
    }
  };

  const supprimerToutesEmotions = () => {
    if (window.confirm('⚠️ Supprimer toutes les détections d’émotions ?')) {
      fetch('http://127.0.0.1:5000/supprimer_emotions', { method: 'DELETE' })
        .then(res => {
          if (res.ok) {
            setEmotionsData([]);
            alert('✅ Toutes les émotions supprimées');
          } else {
            alert('❌ Échec suppression');
          }
        })
        .catch(() => alert('❌ Erreur réseau'));
    }
  };

  const exporterExcel = () => {
    const dataToExport = emotionsData.map(item => ({
      "Nom & Prénom": (item.nom || '') + " " + (item.prenom || ''),
      "Email": item.email || '',
      "Date de naissance": item.date_naissance || '',
      "Date": item.date || '',
      "Heure": item.heure || '',
      "Émotion": item.emotion || '',
      "Intensité (%)": item.intensite || '',
      "Transcription": item.transcription || '',
      "Fluidité": item.fluidite || '',
      "Volume": item.volume || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Émotions');
    XLSX.writeFile(workbook, 'emotions_data.xlsx');
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #2c3e50, #4ca1af)',
      color: 'white',
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
          marginBottom: '25px'
        }}
      >
        <FaArrowLeft style={{ marginRight: '8px' }} /> Retour
      </button>

      <h2 style={{ marginBottom: '20px' }}>📊 Dashboard Administrateur</h2>
      
      <h3>👨‍💼 Liste des Employés</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Nom & Prénom</th>
            <th>Email</th>
            <th>Date de naissance</th>
            <th>Poste</th>
            <th>Voir Tests</th>
            <th>Supprimer</th>
          </tr>
        </thead>
        <tbody>
          {employes.map(emp => (
            <tr key={emp.id}>
              <td>{emp.nom} {emp.prenom || ''}</td>
              <td>{emp.email}</td>
              <td>{emp.date_naissance || '-'}</td>
              <td>{emp.poste || '-'}</td>
              <td>
                <button
                  onClick={() => voirTests(emp.id, emp.nom, emp.prenom || '')}
                  style={styles.button}
                >
                  📄
                </button>
              </td>
              <td>
                <button
                  onClick={() => supprimerEmploye(emp.id)}
                  style={styles.deleteButton}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {testsEmploye.length > 0 && (
        <>
          <h3 style={{ marginTop: '40px' }}>📄 Résultats des tests de {selectedEmployeName}</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Émotion principale</th>
                <th>Score</th>
                <th>Transcription</th>
                <th>Fluidité</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {testsEmploye.map(test => (
                <tr key={test.id}>
                  <td>{test.date_test}</td>
                  <td>{test.emotion_principale}</td>
                  <td>{test.score}</td>
                  <td style={{
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {test.transcription || ''}
                  </td>
                  <td>{test.fluidite}</td>
                  <td>{test.volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '40px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <h3>🎯 Toutes les Détections d’émotions</h3>
        <div>
          <button onClick={exporterExcel} style={styles.exportButton}>📥 Exporter Excel</button>
          <button onClick={supprimerToutesEmotions} style={styles.deleteButton}>🗑️ Tout Supprimer</button>
        </div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Nom & Prénom</th>
            <th>Email</th>
            <th>Date de naissance</th>
            <th>Date</th>
            <th>Heure</th>
            <th>Émotion</th>
            <th>Intensité (%)</th>
            <th>Transcription</th>
            <th>Fluidité</th>
            <th>Volume</th>
          </tr>
        </thead>
        <tbody>
          {emotionsData.map((emp, i) => (
            <tr key={emp.id || i}>
              <td>{emp.nom} {emp.prenom || ''}</td>
              <td>{emp.email}</td>
              <td>{emp.date_naissance || '-'}</td>
              <td>{emp.date}</td>
              <td>{emp.heure}</td>
              <td>{emp.emotion}</td>
              <td>{emp.intensite}%</td>
              <td style={{
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {emp.transcription || ''}
              </td>
              <td>{emp.fluidite}</td>
              <td>{emp.volume}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '30px',
    backgroundColor: '#1e1e1e',
    borderRadius: '10px',
    overflow: 'hidden',
    color: 'white',
  },
  button: {
    backgroundColor: '#3498db',
    border: 'none',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    border: 'none',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginLeft: '10px',
  },
  exportButton: {
    backgroundColor: '#27ae60',
    border: 'none',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '10px'
  }
};

export default DashboardAdmin;
