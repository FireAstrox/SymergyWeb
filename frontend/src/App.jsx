import React from 'react';
import Dashboard from './components/Dashboard';

const App = () => {
  return (
    <div className="min-h-screen bg-navy-900">
      <div className="p-4 h-screen">
        <div className="flex items-center h-[60px]">
          <img src="/symergy-logo.png" alt="Symergy" className="h-8" />
          <h1 className="text-2xl font-bold text-white ml-4">SYMERGY</h1>
        </div>
        <div className="h-[calc(100%-60px)]">
          <Dashboard />
        </div>
      </div>
    </div>
  );
};

export default App; 