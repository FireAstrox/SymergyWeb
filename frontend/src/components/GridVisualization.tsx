import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GridData {
  energy: number[];
  current: number[];
  voltage: number[];
  power: number[];
  timestamps: string[];
}

const GridVisualization: React.FC = () => {
  const [gridData, setGridData] = useState<GridData>({
    energy: [],
    current: [],
    voltage: [],
    power: [],
    timestamps: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/grid/data`);
        const data = await response.json();
        setGridData(data);
      } catch (error) {
        console.error('Error fetching grid data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Transform data for the chart
  const chartData = gridData.timestamps.map((timestamp, index) => ({
    timestamp: new Date(timestamp).toLocaleTimeString(),
    voltage: gridData.voltage[index],
    current: gridData.current[index],
    power: gridData.power[index],
    energy: gridData.energy[index]
  }));

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Grid Measurements</h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="h-[300px]">
          <h4 className="text-sm font-medium mb-2">Power & Energy</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="power" stroke="#ff7300" name="Power (kW)" />
              <Line yAxisId="right" type="monotone" dataKey="energy" stroke="#030ffc" name="Energy (kWh)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-[300px]">
          <h4 className="text-sm font-medium mb-2">Voltage & Current</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="voltage" stroke="#8884d8" name="Voltage (V)" />
              <Line yAxisId="right" type="monotone" dataKey="current" stroke="#82ca9d" name="Current (A)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Latest Voltage</p>
          <p className="text-xl font-semibold">
            {gridData.voltage[gridData.voltage.length - 1]?.toFixed(1) || 0} V
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Latest Current</p>
          <p className="text-xl font-semibold">
            {gridData.current[gridData.current.length - 1]?.toFixed(1) || 0} A
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Latest Power</p>
          <p className="text-xl font-semibold">
            {gridData.power[gridData.power.length - 1]?.toFixed(1) || 0} kW
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Energy Consumption</p>
          <p className="text-xl font-semibold">
            {gridData.energy[gridData.energy.length - 1]?.toFixed(1) || 0} kWh
          </p>
        </div>
      </div>
    </div>
  );
};

export default GridVisualization;
