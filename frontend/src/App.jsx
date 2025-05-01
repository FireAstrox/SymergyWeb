/**
 * Main application component that sets up the routing structure for the Symergy Web application.
 * This component uses React Router to handle navigation between different views of the application.
 * 
 * The routing structure is as follows:
 * - Root path (/) shows the StartPage
 * - /dashboard: Main dashboard view showing system overview
 * - /components: List of all system components
 *   - /components/:componentId: Detailed view of a specific component
 * - /map: Interactive map view of the system
 * 
 * All routes except the StartPage are wrapped in a Layout component that provides consistent UI elements
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
import StartPage from './pages/StartPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* StartPage as the landing page */}
        <Route path="/" element={<StartPage />} />
        
        {/* All other routes wrapped in the Layout component */}
        <Route path="/" element={<Layout />}>
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