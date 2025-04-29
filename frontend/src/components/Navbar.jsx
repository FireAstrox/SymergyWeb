import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoSvg from '../svg/logo.svg';

const Navbar = () => {
  const location = useLocation();
  
  // Helper function to determine if a link is active
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-navy-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center">
        <Link to="/" className="flex items-center mr-8">
          <img src={logoSvg} alt="Logo" className="h-16 mr-3" />
          <span className="text-2xl font-bold">Symergy</span>
        </Link>
        
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