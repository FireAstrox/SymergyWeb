import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import GridVisualization from './GridVisualization.jsx';

const Dashboard = () => {
  return (
    <div className="grid grid-cols-12 gap-6 h-full pt-4">
      {/* Left column - POLES */}
      <div className="col-span-3">
        <div className="bg-gray-200 rounded-lg relative border-2 border-yellow-500 h-[calc(100vh-100px)]">
          <div className="px-4 py-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900 uppercase tracking-wider">Misc</h2>
            <PlusIcon className="w-5 h-5 text-navy-900" />
          </div>
          <div className="p-4 border-t-2 border-yellow-500 overflow-y-auto" style={{ height: 'calc(100% - 51px)' }}>
            <GridVisualization section="poles" />
          </div>
        </div>
      </div>
      
      {/* Middle column - LOADS */}
      <div className="col-span-5">
        <div className="bg-gray-200 rounded-lg relative border-2 border-yellow-500 h-[calc(100vh-100px)]">
          <div className="px-4 py-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900 uppercase tracking-wider">Loads</h2>
            <PlusIcon className="w-5 h-5 text-navy-900" />
          </div>
          <div className="p-4 border-t-2 border-yellow-500 overflow-y-auto" style={{ height: 'calc(100% - 51px)' }}>
            <GridVisualization section="loads" />
          </div>
        </div>
      </div>

      {/* Right column - SOURCES */}
      <div className="col-span-4">
        <div className="bg-gray-200 rounded-lg relative border-2 border-yellow-500 h-[calc(100vh-100px)]">
          <div className="px-4 py-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900 uppercase tracking-wider">Sources</h2>
            <PlusIcon className="w-5 h-5 text-navy-900" />
          </div>
          <div className="p-4 border-t-2 border-yellow-500 overflow-y-auto" style={{ height: 'calc(100% - 51px)' }}>
            <GridVisualization section="sources" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 