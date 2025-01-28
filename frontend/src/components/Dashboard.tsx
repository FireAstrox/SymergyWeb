import React from 'react';
import GridVisualization from './GridVisualization.tsx';

const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Grid Status</h2>
        <GridVisualization />
      </div>
    </div>
  );
};

export default Dashboard;
