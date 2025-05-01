/**
 * Dashboard page for the Symergy Web application.
 * Displays a grid-based layout of system components organized by their roles.
 * 
 * Features:
 * - Three-column layout for different component types
 * - Real-time component monitoring
 * - Interactive component cards
 * - Responsive grid system
 * 
 * The dashboard is divided into three main sections:
 * 1. Sources: Power generation components
 * 2. Distribution: Network infrastructure
 * 3. Loads: Power consumption components
 */

import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import GridVisualization from '../components/GridVisualization';

const Dashboard = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full pt-4">
        {/* Left column - Power Sources */}
        <div className="md:col-span-4">
          <div className="bg-gray-200 rounded-lg relative border-2 border-yellow-500 h-[calc(100vh-100px)] min-h-[400px]">
            <div className="px-4 py-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-navy-900 uppercase tracking-wider">Sources</h2>
              <PlusIcon className="w-5 h-5 text-navy-900" />
            </div>
            <div className="p-4 border-t-2 border-yellow-500 overflow-y-auto" style={{ height: 'calc(100% - 51px)' }}>
              <GridVisualization section="sources" />
            </div>
          </div>
        </div>
        
        {/* Middle column - Distribution Network */}
        <div className="md:col-span-3">
          <div className="bg-gray-200 rounded-lg relative border-2 border-yellow-500 h-[calc(100vh-100px)] min-h-[400px]">
            <div className="px-4 py-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-navy-900 uppercase tracking-wider">Distribution</h2>
              <PlusIcon className="w-5 h-5 text-navy-900" />
            </div>
            <div className="p-4 border-t-2 border-yellow-500 overflow-y-auto" style={{ height: 'calc(100% - 51px)' }}>
              <GridVisualization section="poles" />
            </div>
          </div>
        </div>
  
        {/* Right column - Power Loads */}
        <div className="md:col-span-5">
          <div className="bg-gray-200 rounded-lg relative border-2 border-yellow-500 h-[calc(100vh-100px)] min-h-[400px]">
            <div className="px-4 py-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-navy-900 uppercase tracking-wider">Loads</h2>
              <PlusIcon className="w-5 h-5 text-navy-900" />
            </div>
            <div className="p-4 border-t-2 border-yellow-500 overflow-y-auto" style={{ height: 'calc(100% - 51px)' }}>
              <GridVisualization section="loads" />
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default Dashboard; 