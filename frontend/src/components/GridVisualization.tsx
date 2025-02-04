import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Coordinates {
  lat: number;
  lon: number;
  alt: number;
}

interface Component {
  type: string;
  name: string;
  location: string;
  coordinates: Coordinates;
}

interface ComponentMeasurements {
  energy: number[];
  current: number[];
  voltage: number[];
  power: number[];
  timestamps: string[];
}

interface GridData {
  components: { [key: string]: Component };
  measurements: { [key: string]: ComponentMeasurements };
}

const COLORS = {
  generator: '#ff7300',
  load: '#82ca9d',
  meter: '#8884d8'
};

const ComponentGraph: React.FC<{
  component: Component;
  measurements: ComponentMeasurements;
}> = ({ component, measurements }) => {
  const chartData = measurements.timestamps.map((timestamp, index) => ({
    timestamp: new Date(timestamp).toLocaleTimeString(),
    voltage: measurements.voltage[index],
    current: measurements.current[index],
    power: measurements.power[index],
    energy: measurements.energy[index]
  }));

  return (
    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">{component.name}</h3>
        <p className="text-sm text-gray-500">Type: {component.type}</p>
        <p className="text-sm text-gray-500">Location: {component.location}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="power" 
                stroke={COLORS[component.type]} 
                name="Power (kW)" 
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="energy" 
                stroke="#030ffc" 
                name="Energy (kWh)" 
              />
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
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="voltage" 
                stroke="#8884d8" 
                name="Voltage (V)" 
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="current" 
                stroke="#82ca9d" 
                name="Current (A)" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 grid grid-cols-4 gap-4">
          <div className="p-3 bg-white rounded shadow">
            <p className="text-sm text-gray-500">Latest Voltage</p>
            <p className="text-xl font-semibold">
              {measurements.voltage[measurements.voltage.length - 1]?.toFixed(1) || 0} V
            </p>
          </div>
          <div className="p-3 bg-white rounded shadow">
            <p className="text-sm text-gray-500">Latest Current</p>
            <p className="text-xl font-semibold">
              {measurements.current[measurements.current.length - 1]?.toFixed(1) || 0} A
            </p>
          </div>
          <div className="p-3 bg-white rounded shadow">
            <p className="text-sm text-gray-500">Latest Power</p>
            <p className="text-xl font-semibold" style={{ color: COLORS[component.type] }}>
              {measurements.power[measurements.power.length - 1]?.toFixed(1) || 0} kW
            </p>
          </div>
          <div className="p-3 bg-white rounded shadow">
            <p className="text-sm text-gray-500">Energy Consumption</p>
            <p className="text-xl font-semibold">
              {measurements.energy[measurements.energy.length - 1]?.toFixed(1) || 0} kWh
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const GridVisualization: React.FC = () => {
  const [gridData, setGridData] = useState<GridData>({
    components: {},
    measurements: {}
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

  // Separate components by type
  const generators = Object.entries(gridData.components)
    .filter(([_, component]) => component.type === 'generator');
  const loads = Object.entries(gridData.components)
    .filter(([_, component]) => component.type === 'load');

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-6">Generators</h2>
      <div className="space-y-6">
        {generators.map(([id, component]) => (
          <ComponentGraph 
            key={id}
            component={component}
            measurements={gridData.measurements[id]}
          />
        ))}
      </div>

      <h2 className="text-xl font-bold my-6">Loads</h2>
      <div className="space-y-6">
        {loads.map(([id, component]) => (
          <ComponentGraph 
            key={id}
            component={component}
            measurements={gridData.measurements[id]}
          />
        ))}
      </div>
    </div>
  );
};

export default GridVisualization;
