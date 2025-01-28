import React, { useEffect, useState } from 'react';

interface GridData {
  voltage: number;
  current: number;
  power: number;
  timestamp: string | null;
}

const GridVisualization: React.FC = () => {
  const [gridData, setGridData] = useState<GridData>({
    voltage: 0,
    current: 0,
    power: 0,
    timestamp: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/grid/data');
        const data = await response.json();
        setGridData(data);
      } catch (error) {
        console.error('Error fetching grid data:', error);
      }
    };

    // Fetch immediately
    fetchData();

    // Then fetch every 5 seconds
    const interval = setInterval(fetchData, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Grid Status</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Voltage</p>
          <p className="text-xl font-semibold">{gridData.voltage.toFixed(1)} V</p>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Current</p>
          <p className="text-xl font-semibold">{gridData.current.toFixed(1)} A</p>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Power</p>
          <p className="text-xl font-semibold">{gridData.power.toFixed(1)} W</p>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Last Updated</p>
          <p className="text-sm">
            {gridData.timestamp ? new Date(gridData.timestamp).toLocaleTimeString() : 'Never'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GridVisualization;
