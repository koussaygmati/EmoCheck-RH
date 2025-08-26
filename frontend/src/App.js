import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Accueil from './pages/Accueil';
import LoginAdmin from './pages/LoginAdmin';
import RegisterEmploye from './pages/RegisterEmploye';
import EntretienEmploye from './pages/EntretienEmploye';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardBI from './pages/DashboardBI'; // Ajouté pour le Dashboard Power BI

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/loginadmin" element={<LoginAdmin />} /> {/* changé login en loginadmin pour plus clair */}
        <Route path="/register" element={<RegisterEmploye />} />
        <Route path="/entretien/:id" element={<EntretienEmploye />} />
        <Route path="/dashboardadmin" element={<DashboardAdmin />} /> {/* renommé DashboardAdmin */}
        <Route path="/dashboardbi" element={<DashboardBI />} /> {/* route ajoutée pour Power BI */}
      </Routes>
    </Router>
  );
}

export default App;
