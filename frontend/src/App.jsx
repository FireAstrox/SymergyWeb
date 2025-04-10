import React from 'react';
import Dashboard from './components/Dashboard';
import logoSvg from './svg/logo.svg';

const App = () => {
  return (
    <div className="min-h-screen bg-navy-900">
      <div className="p-4 h-screen">
        <div className="flex items-center h-[80px]">
          <img src={logoSvg} alt="Symergy" className="h-20" />
          <h1 className="text-3xl font-bold text-white ml-4">SYMERGY</h1>
        </div>
        <div className="h-[calc(100%-80px)]">
          <Dashboard />
        </div>
      </div>
    </div>
  );
};

export default App; 