/**
 * Layout component for the Symergy Web application.
 * Provides a consistent page structure with navigation and content areas.
 * 
 * Features:
 * - Consistent page layout across all routes
 * - Navigation bar integration
 * - Responsive container for content
 * - Proper spacing and padding
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Your existing navbar component

const Layout = () => {
  return (
    <div className="min-h-screen bg-navy-900">
      {/* Navigation bar */}
      <Navbar />
      
      {/* Main content area with consistent padding and container */}
      <main className="container mx-auto py-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 