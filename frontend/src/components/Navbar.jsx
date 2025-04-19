import React from 'react';
import { Link } from 'react-router-dom';
import logoSvg from '../svg/logo.svg';

const Navbar = () => {
  return (
    <nav className="bg-navy-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center">
        <Link to="/" className="flex items-center mr-8">
          <img src={logoSvg} alt="Logo" className="h-16 mr-3" />
          <span className="text-2xl font-bold">Symergy</span>
        </Link>
        
        <div className="flex items-center self-center">
          <Link to="/dashboard" className="hover:text-yellow-500 transition-colors text-xl pt-1">
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 