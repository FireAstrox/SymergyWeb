import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ComponentDetails from './pages/ComponentDetails';
import Components from './pages/Components';
import Layout from './components/Layout';
import logoSvg from './svg/logo.svg';
import MapView from './pages/MapView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="components" element={<Components />}>
            <Route path=":componentId" element={<ComponentDetails />} />
          </Route>
          <Route path="map" element={<MapView />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App; 