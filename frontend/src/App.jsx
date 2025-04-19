import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ComponentDetails from './pages/ComponentDetails';
import Layout from './components/Layout';
import logoSvg from './svg/logo.svg';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="component/:componentId" element={<ComponentDetails />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App; 