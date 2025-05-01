/**
 * Main application component that sets up the routing structure for the Symergy Web application.
 * This component uses React Router to handle navigation between different views of the application.
 * 
 * The routing structure is as follows:
 * - Root path (/) redirects to /dashboard
 * - /dashboard: Main dashboard view showing system overview
 * - /components: List of all system components
 *   - /components/:componentId: Detailed view of a specific component
 * - /map: Interactive map view of the system
 * 
 * All routes are wrapped in a Layout component that provides consistent UI elements
 * across all pages.
 */

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