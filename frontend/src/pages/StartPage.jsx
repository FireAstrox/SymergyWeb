import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../svg/logo.svg'; // Assuming you have a logo SVG file

const StartPage = () => {
  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-4" style={{ paddingBottom: '10vh' }}>
      <div className="max-w-3xl w-full text-center">
        {/* Logo */}
        <div className="mb-6">
          <img 
            src={logo} 
            alt="Symergy Logo" 
            className="mx-auto w-64 h-64"
          />
        </div>
        
        {/* Title and subtitle */}
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-500 mb-3">
          Symergy
        </h1>
        <p className="text-xl text-white mb-10">
          Real-time monitoring and visualization of electrical grid components
        </p>
        
        {/* Navigation button */}
        <div className="flex justify-center">
          <Link 
            to="/dashboard" 
            className="bg-yellow-500 hover:bg-yellow-600 text-navy-900 font-bold py-4 px-12 rounded-lg transition-colors duration-300 text-xl"
          >
            Start
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StartPage; 