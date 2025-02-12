import React from 'react';
import GridVisualization from './GridVisualization';

const Dashboard: React.FC = () => {
  return (
    <div className="w-full">
      <div className="bg-white shadow rounded-lg p-6 w-full">
        <h2 className="text-xl font-semibold mb-4">Grid Status</h2>
        <GridVisualization />
      </div>
    </div>
  );
};

export default Dashboard;
