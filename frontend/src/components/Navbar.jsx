/**
 * Navigation bar component for the Symergy Web application.
 * Provides consistent navigation across all pages with active state highlighting.
 * 
 * Features:
 * - Responsive navigation links
 * - Active state tracking
 * - Brand logo display
 * - Consistent styling with the application theme
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoSvg from '../svg/logo.svg';

const Navbar = () => {
  const location = useLocation();
  
  // Helper function to determine if a link is active based on current path
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-navy-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center">
        {/* Brand logo and name */}
        <Link to="/" className="flex items-center mr-8">
          <img src={logoSvg} alt="Logo" className="h-16 mr-3" />
          <span className="text-2xl font-bold">Symergy</span>
        </Link>
        
        {/* Navigation links with active state highlighting */}
        <div className="flex items-center self-center space-x-6">
          <Link 
            to="/dashboard" 
            className={`transition-colors text-xl pt-1 ${
              isActive('/dashboard') ? 'text-yellow-500' : 'hover:text-yellow-500'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/components" 
            className={`transition-colors text-xl pt-1 ${
              isActive('/components') ? 'text-yellow-500' : 'hover:text-yellow-500'
            }`}
          >
            Components
          </Link>
          <Link 
            to="/map" 
            className={`transition-colors text-xl pt-1 ${
              isActive('/map') ? 'text-yellow-500' : 'hover:text-yellow-500'
            }`}
          >
            Map
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 