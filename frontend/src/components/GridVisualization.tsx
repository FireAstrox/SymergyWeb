import React, { useEffect, useState, Fragment } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Dialog, Transition } from '@headlessui/react';
import { ReactComponent as PoleIconSvg } from '../svg/pole_icon.svg';

interface Coordinates {
  lat: number;
  lon: number;
  alt: number;
}

interface Component {
  type: string;
  category: string;
  name: string;
  coordinates: Coordinates;
  connections: string[];
}

interface ComponentMeasurements {
  energy: number[];
  current: number[];
  voltage: number[];
  power: number[];
  timestamps: string[];
  status: boolean[];
}

interface GridData {
  components: { [key: string]: Component };
  measurements: { [key: string]: ComponentMeasurements };
}

const COLORS = {
  source: {
    hydro: '#2196f3',    // blue
    solar: '#ffd700',    // gold
    wind: '#00bcd4',     // cyan
    diesel: '#ff9800'    // orange
  },
  load: '#4caf50',       // green
  misc: '#9e9e9e'        // gray
};

const ComponentGraph: React.FC<{
  component: Component;
  measurements: ComponentMeasurements;
  color: string;
}> = ({ component, measurements, color }) => {
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
        {component.category && (
          <p className="text-sm text-gray-500">Category: {component.category}</p>
        )}
        <p className="text-sm text-gray-500">
          Location: ({component.coordinates.lat.toFixed(4)}, {component.coordinates.lon.toFixed(4)})
        </p>
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
                stroke={color} 
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
            <p className="text-xl font-semibold" style={{ color: color }}>
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

// Add a new PoleModal component
const PoleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  component: Component;
  measurements: ComponentMeasurements;
}> = ({ isOpen, onClose, component, measurements }) => {
  const chartData = measurements.timestamps.map((timestamp, index) => ({
    timestamp: new Date(timestamp).toLocaleTimeString(),
    voltage: measurements.voltage[index],
  }));

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  {component.name} - Voltage History
                </Dialog.Title>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="voltage"
                        stroke="#8884d8"
                        name="Voltage (V)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Add this constant for voltage thresholds (120V nominal system with percentage-based ranges)
const VOLTAGE_THRESHOLDS = {
  CRITICAL_HIGH: 132, // >110% (120V + 12V)
  WARNING_HIGH: 126,  // >105% (120V + 6V)
  NORMAL_HIGH: 120,   // 100% (nominal)
  NORMAL_LOW: 114,    // >95% (120V - 6V)
  WARNING_LOW: 108,   // >90% (120V - 12V)
  CRITICAL_LOW: 0     // 0V or disconnected
};

// Add a helper function to determine voltage status color
const getVoltageStatusColor = (voltage: number, isOnline: boolean): string => {
  if (!isOnline) return 'text-black'; // Offline/Disconnected
  if (voltage === 0) return 'text-black';
  if (voltage > VOLTAGE_THRESHOLDS.CRITICAL_HIGH) return 'text-red-600';
  if (voltage > VOLTAGE_THRESHOLDS.WARNING_HIGH) return 'text-orange-500';
  if (voltage > VOLTAGE_THRESHOLDS.NORMAL_HIGH) return 'text-green-600';
  if (voltage > VOLTAGE_THRESHOLDS.NORMAL_LOW) return 'text-green-600';
  if (voltage > VOLTAGE_THRESHOLDS.WARNING_LOW) return 'text-yellow-500';
  if (voltage > VOLTAGE_THRESHOLDS.CRITICAL_LOW) return 'text-red-600';
  return 'text-black';
};

// Update the PoleIcon component with larger dimensions
const PoleIcon: React.FC = () => (
  <PoleIconSvg 
    className="w-20 h-20 text-gray-400 absolute top-1 right-1" 
  />
);

// Update PoleStatus component
const PoleStatus: React.FC<{
  component: Component;
  measurements: ComponentMeasurements;
}> = ({ component, measurements }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const latestStatus = measurements?.status?.[measurements.status.length - 1] ?? true;
  const latestVoltage = measurements?.voltage?.[measurements.voltage.length - 1] ?? 0;
  
  return (
    <>
      <div 
        className="p-3 bg-white rounded shadow w-full cursor-pointer hover:shadow-md transition-shadow relative"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex flex-col">
          <h3 className="text-sm font-medium text-gray-900 mb-2 pr-8">{component.name}</h3>
          <div className="flex items-center mb-2">
            <div className={`h-2.5 w-2.5 rounded-full mr-2 ${
              latestStatus 
                ? 'bg-green-500'
                : 'bg-black'
            }`} />
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              latestStatus 
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-black'
            }`}>
              {latestStatus ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="flex items-center">
            <span className={`text-sm font-medium ${getVoltageStatusColor(latestVoltage, latestStatus)}`}>
              {latestVoltage.toFixed(1)} V
            </span>
          </div>
        </div>
        <PoleIcon />
      </div>

      <PoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        component={component}
        measurements={measurements}
      />
    </>
  );
};

const GridVisualization: React.FC = () => {
  const [gridData, setGridData] = useState<GridData>({
    components: {},
    measurements: {}
  });
  const [isDistributionExpanded, setIsDistributionExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/grid/data`);
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

  // Update component grouping
  const sourceComponents = Object.entries(gridData.components)
    .filter(([_, component]) => component.type === 'source')
    .reduce((acc, [id, component]) => {
      const category = component.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push([id, component]);
      return acc;
    }, {} as Record<string, [string, Component][]>);

  const loadComponents = Object.entries(gridData.components)
    .filter(([_, component]) => component.type === 'load');

  // Update the miscComponents filtering
  const miscComponents = Object.entries(gridData.components)
    .filter(([_, component]) => component.type === 'misc')
    .sort(([idA], [idB]) => {
      // Sort poles by their number
      const numA = parseInt(idA.replace(/\D/g, ''));
      const numB = parseInt(idB.replace(/\D/g, ''));
      return numA - numB;
    });

  return (
    <div className="p-4 w-full">
      <h2 className="text-xl font-bold mb-6">Generation Sources</h2>
      {Object.entries(sourceComponents).map(([category, components]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold my-4 capitalize">{category}</h3>
          <div className="space-y-6">
            {components.map(([id, component]) => (
              <ComponentGraph
                key={id}
                component={component}
                measurements={gridData.measurements[id]}
                color={COLORS.source[component.category as keyof typeof COLORS.source] || COLORS.source.diesel}
              />
            ))}
          </div>
        </div>
      ))}

      <h2 className="text-xl font-bold my-6">Loads</h2>
      <div className="space-y-6">
        {loadComponents.map(([id, component]) => (
          <ComponentGraph
            key={id}
            component={component}
            measurements={gridData.measurements[id]}
            color={COLORS.load}
          />
        ))}
      </div>

      <div className="border rounded-lg bg-white shadow">
        <button
          onClick={() => setIsDistributionExpanded(!isDistributionExpanded)}
          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
        >
          <h2 className="text-xl font-bold">Distribution Network ({miscComponents.length} poles)</h2>
          <svg
            className={`w-6 h-6 transform transition-transform ${
              isDistributionExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        
        {isDistributionExpanded && (
          <div className="p-6 border-t">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 w-full">
              {miscComponents.length > 0 ? (
                miscComponents.map(([id, component]) => (
                  <PoleStatus
                    key={id}
                    component={component}
                    measurements={gridData.measurements[id] || {
                      status: [true],
                      timestamps: [],
                      voltage: [0],
                      current: [],
                      power: [],
                      energy: []
                    }}
                  />
                ))
              ) : (
                <p className="text-gray-500 col-span-full">No distribution network components found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GridVisualization;
