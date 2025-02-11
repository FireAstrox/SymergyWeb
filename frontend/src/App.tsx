import React from 'react';
import Dashboard from './components/Dashboard.tsx';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="w-full px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Symergy
          </h1>
        </div>
      </header>
      <main>
        <div className="w-full px-4 py-6">
          <Dashboard />
        </div>
      </main>
    </div>
  );
};

export default App;
