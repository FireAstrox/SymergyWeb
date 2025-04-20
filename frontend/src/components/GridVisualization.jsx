import React, { useState, useEffect, memo, useCallback } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import poleIcon from '../svg/pole_icon.svg';
import airportIcon from '../svg/airport.svg';
import bigHouseIcon from '../svg/big_house_icon.svg';
import houseIcon from '../svg/house_icon.svg';
import generatorIcon from '../svg/generator.svg';
import hydroIcon from '../svg/hydro.svg';
import solarIcon from '../svg/solar.svg';
import windIcon from '../svg/wind_icon.svg';

// Add voltage thresholds
const VOLTAGE_THRESHOLDS = {
  CRITICAL_HIGH: 132, // >110% (120V + 12V)
  WARNING_HIGH: 126,  // >105% (120V + 6V)
  NORMAL_HIGH: 120,   // 100% (nominal)
  NORMAL_LOW: 114,    // >95% (120V - 6V)
  WARNING_LOW: 108,   // >90% (120V - 12V)
  CRITICAL_LOW: 0     // 0V or disconnected
};

// Add helper function for voltage color
const getVoltageStatusColor = (voltage, isOnline) => {
  if (!isOnline) return 'text-black';
  if (voltage === 0) return 'text-black';
  if (voltage > VOLTAGE_THRESHOLDS.CRITICAL_HIGH) return 'text-red-600';
  if (voltage > VOLTAGE_THRESHOLDS.WARNING_HIGH) return 'text-orange-500';
  if (voltage > VOLTAGE_THRESHOLDS.NORMAL_HIGH) return 'text-yellow-500';
  if (voltage > VOLTAGE_THRESHOLDS.NORMAL_LOW) return 'text-green-600';
  if (voltage > VOLTAGE_THRESHOLDS.WARNING_LOW) return 'text-teal-500';
  if (voltage > VOLTAGE_THRESHOLDS.CRITICAL_LOW) return 'text-cyan-600';
  return 'text-black';
};

// Update the ComponentDetailModal to conditionally render charts based on component type
const ComponentDetailModal = ({ component, measurements, onClose }) => {
  // Format data for charts - create 5-minute history
  const formatTimeSeriesData = useCallback(() => {
    if (!measurements) return [];
    
    const timestamps = measurements.timestamps || [];
    const voltages = measurements.voltage || [];
    const currents = measurements.current || [];
    const powers = measurements.power || [];
    const energies = measurements.energy || [];
    
    // Get the last index
    const lastIndex = timestamps.length - 1;
    
    // Calculate how many data points to show (5 minutes worth)
    const dataPoints = Math.min(300, timestamps.length); // 5 minutes = 300 seconds
    
    // Calculate the starting index
    const startIndex = Math.max(0, lastIndex - dataPoints + 1);
    
    const data = [];
    
    for (let i = startIndex; i <= lastIndex; i++) {
      if (timestamps[i]) {
        // Parse the timestamp - handle both ISO strings and numeric timestamps
        let timestamp;
        try {
          // Try to parse as ISO string first
          timestamp = new Date(timestamps[i]);
          // Check if valid date
          if (isNaN(timestamp.getTime())) {
            // If not valid, try as numeric timestamp
            timestamp = new Date(Number(timestamps[i]));
          }
        } catch (e) {
          // Fallback to current time if parsing fails
          console.warn("Failed to parse timestamp:", timestamps[i]);
          timestamp = new Date();
        }
        
        // Format time for display - ensure it's in local time
        const timeStr = timestamp.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: false // Use 24-hour format for consistency
        });
        
        data.push({
          time: timeStr,
          timestamp: timestamp.getTime(), // Store raw timestamp for sorting
          voltage: voltages[i] || 0,
          current: currents[i] || 0,
          power: powers[i] || 0,
          energy: energies[i] || 0,
        });
      }
    }
    
    // Sort by timestamp to ensure chronological order
    data.sort((a, b) => a.timestamp - b.timestamp);
    
    return data;
  }, [measurements]);
  
  const timeSeriesData = formatTimeSeriesData();
  
  // Get the latest values
  const lastIndex = measurements?.status?.length - 1 || 0;
  const status = measurements?.status?.[lastIndex] ?? false;
  const voltage = measurements?.voltage?.[lastIndex] ?? 0;
  const current = measurements?.current?.[lastIndex] ?? 0;
  const power = measurements?.power?.[lastIndex] ?? 0;
  const energy = measurements?.energy?.[lastIndex] ?? 0;
  
  // Check if this is a pole component
  const isPole = component.category === 'pole' || (component.id && component.id.includes('pole'));
  
  // Add a helper function to calculate appropriate Y-axis domain
  const calculateYDomain = useCallback((dataKey, buffer = 0.2) => {
    if (!timeSeriesData || timeSeriesData.length === 0) {
      return [0, 10]; // Default fallback
    }
    
    // Filter out zero values which might skew the scale
    const nonZeroValues = timeSeriesData
      .map(item => item[dataKey])
      .filter(val => val > 0);
    
    if (nonZeroValues.length === 0) {
      return [0, 10]; // Default if no non-zero values
    }
    
    const minValue = Math.min(...nonZeroValues);
    const maxValue = Math.max(...nonZeroValues);
    
    // Calculate buffer amount
    const range = maxValue - minValue;
    const bufferAmount = range * buffer;
    
    // Set min to 0 or slightly below the minimum value
    const yMin = 0; // Always start at 0 for these metrics
    
    // Set max to the maximum value plus a buffer
    const yMax = maxValue + bufferAmount;
    
    // Ensure we have a minimum range to prevent flat lines
    return [yMin, Math.max(yMax, minValue + 1)];
  }, [timeSeriesData]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-navy-900 text-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 border-b border-yellow-500">
          <h2 className="text-xl font-bold">{component.name}</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-yellow-500"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Component details */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-navy-800 p-3 rounded-lg">
              <div className="text-sm text-gray-300">Status</div>
              <div className="flex items-center mt-1">
                <div className={`h-3 w-3 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'} mr-2`} />
                <span className="text-lg font-semibold">{status ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            <div className="bg-navy-800 p-3 rounded-lg">
              <div className="text-sm text-gray-300">Voltage</div>
              <div className="text-lg font-semibold">{voltage.toFixed(2)} V</div>
            </div>
            
            {/* Only show current for non-poles */}
            {!isPole && (
              <div className="bg-navy-800 p-3 rounded-lg">
                <div className="text-sm text-gray-300">Current</div>
                <div className="text-lg font-semibold">{current.toFixed(2)} A</div>
              </div>
            )}
            
            {/* Only show power for non-poles */}
            {!isPole && (
              <div className="bg-navy-800 p-3 rounded-lg">
                <div className="text-sm text-gray-300">Power</div>
                <div className="text-lg font-semibold">{power.toFixed(2)} kW</div>
              </div>
            )}
            
            {/* Only show energy for non-poles */}
            {!isPole && (
              <div className="bg-navy-800 p-3 rounded-lg">
                <div className="text-sm text-gray-300">Energy</div>
                <div className="text-lg font-semibold">{energy.toFixed(2)} kWh</div>
              </div>
            )}
            
            <div className="bg-navy-800 p-3 rounded-lg">
              <div className="text-sm text-gray-300">Type</div>
              <div className="text-lg font-semibold capitalize">{component.type} ({component.category})</div>
            </div>
          </div>
          
          {/* Always show Voltage History */}
          <div className="border border-yellow-500 rounded-lg p-4 mb-6 bg-white">
            <h3 className="text-lg font-semibold mb-4 text-navy-900">Voltage History</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                <XAxis 
                  dataKey="time" 
                  stroke="#333" 
                  tick={{ fontSize: 12 }}
                  tickCount={6}
                  minTickGap={30}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#333" 
                  domain={calculateYDomain('voltage')}
                  tickCount={7}
                  tick={{ fontSize: 12 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="voltage" 
                  stroke="#FFD700" 
                  strokeWidth={2}
                  dot={false} 
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Only show Current and Power History for non-poles */}
          {!isPole && (
            <>
              <div className="border border-yellow-500 rounded-lg p-4 mb-6 bg-white">
                <h3 className="text-lg font-semibold mb-4 text-navy-900">Current History</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#333" 
                      tick={{ fontSize: 12 }}
                      tickCount={6}
                      minTickGap={30}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      stroke="#333" 
                      domain={calculateYDomain('current')}
                      tickCount={7}
                      tick={{ fontSize: 12 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="current" 
                      stroke="#FF4500" 
                      strokeWidth={2}
                      dot={false} 
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="border border-yellow-500 rounded-lg p-4 mb-6 bg-white">
                <h3 className="text-lg font-semibold mb-4 text-navy-900">Power History</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#333" 
                      tick={{ fontSize: 12 }}
                      tickCount={6}
                      minTickGap={30}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      stroke="#333" 
                      domain={calculateYDomain('power')}
                      tickCount={7}
                      tick={{ fontSize: 12 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="power" 
                      stroke="#4CAF50" 
                      strokeWidth={2}
                      dot={false} 
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="border border-yellow-500 rounded-lg p-4 bg-white">
                <h3 className="text-lg font-semibold mb-4 text-navy-900">Energy History</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#333" 
                      tick={{ fontSize: 12 }}
                      tickCount={6}
                      minTickGap={30}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      stroke="#333" 
                      domain={calculateYDomain('energy')}
                      tickCount={7}
                      tick={{ fontSize: 12 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="energy" 
                      stroke="#1E90FF" 
                      strokeWidth={2}
                      dot={false} 
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Update the ComponentCard to be clickable
const ComponentCard = ({ name, status, power, voltage, demand, energy, isPole, componentId, category, onClick }) => {
  const voltageColor = getVoltageStatusColor(voltage, status);
  const isAirport = componentId && componentId.includes('airport');
  const isMunicipalOrCommercial = category === 'municipal' || category === 'commercial';
  const isResidential = category === 'residential';
  const isGenerator = componentId && componentId.includes('generator');
  const isHydro = componentId && componentId.includes('hydro_plant');
  const isSolar = componentId && componentId.includes('solar');
  const isWind = componentId && componentId.includes('turbine');
  
  // Create a specific layout for poles
  if (isPole) {
    return (
      <div 
        className={`p-4 rounded-lg ${status ? 'bg-navy-900' : 'bg-red-900'} text-white mb-4 relative cursor-pointer hover:shadow-lg transition-shadow`}
        onClick={onClick}
      >
        {/* Left side content */}
        <div className="flex">
          <div className="flex-grow">
            {/* Component name */}
            <h3 className="font-semibold">{name}</h3>
            
            {/* Status indicator */}
            <div className="flex items-center mt-2 mb-3">
              <div className={`h-2 w-2 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'} mr-2`} />
              <span className={`text-sm px-2 py-0.5 rounded-full ${status ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {status ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {/* Voltage reading */}
            <div className={`text-sm ${voltageColor}`}>
              Voltage: {voltage?.toFixed(2)} V
            </div>
          </div>
          
          {/* Right side SVG */}
          <div className="absolute top-4 right-0" style={{ width: '70px', height: '70px' }}>
            <img
              src={poleIcon}
              alt="Pole Icon"
              style={{ 
                width: '100%', 
                height: '100%', 
                filter: status ? 'brightness(0) invert(1)' : 'brightness(0) invert(0.3)'
              }}
            />
          </div>
        </div>
      </div>
    );
  }
  
  // Regular layout for non-pole components
  return (
    <div 
      className={`p-3 rounded-lg ${status ? 'bg-navy-900' : 'bg-red-900'} text-white mb-4 relative cursor-pointer hover:shadow-lg transition-shadow`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{name}</h3>
        <div className={`h-2 w-2 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
      
      {/* Airport SVG for airport components */}
      {isAirport && (
        <div className="absolute top-4 right-10" style={{ width: '70px', height: '70px' }}>
          <img
            src={airportIcon}
            alt="Airport Icon"
            style={{ 
              width: '100%', 
              height: '100%', 
              filter: status ? 'brightness(0) invert(1)' : 'brightness(0) invert(0.3)'
            }}
          />
        </div>
      )}
      
      {/* Generator SVG for generator components */}
      {isGenerator && (
        <div className="absolute top-4 right-10" style={{ width: '70px', height: '70px' }}>
          <img
            src={generatorIcon}
            alt="Generator Icon"
            style={{ 
              width: '100%', 
              height: '100%', 
              filter: status ? 'brightness(0) invert(1)' : 'brightness(0) invert(0.3)'
            }}
          />
        </div>
      )}
      
      {/* Hydro SVG for hydro plant components */}
      {isHydro && (
        <div className="absolute top-4 right-10" style={{ width: '70px', height: '70px' }}>
          <img
            src={hydroIcon}
            alt="Hydro Plant Icon"
            style={{ 
              width: '100%', 
              height: '100%', 
              filter: status ? 'brightness(0) invert(1)' : 'brightness(0) invert(0.3)'
            }}
          />
        </div>
      )}
      
      {/* Solar SVG for solar components */}
      {isSolar && (
        <div className="absolute top-4 right-10" style={{ width: '70px', height: '70px' }}>
          <img
            src={solarIcon}
            alt="Solar Panel Icon"
            style={{ 
              width: '100%', 
              height: '100%', 
              filter: status ? 'brightness(0) invert(1)' : 'brightness(0) invert(0.3)'
            }}
          />
        </div>
      )}
      
      {/* Wind SVG for wind turbine components */}
      {isWind && (
        <div className="absolute top-4 right-10" style={{ width: '70px', height: '70px' }}>
          <img
            src={windIcon}
            alt="Wind Turbine Icon"
            style={{ 
              width: '100%', 
              height: '100%', 
              filter: status ? 'brightness(0) invert(1)' : 'brightness(0) invert(0.3)'
            }}
          />
        </div>
      )}
      
      {/* Big House SVG for municipal or commercial loads */}
      {!isAirport && !isGenerator && !isHydro && !isSolar && !isWind && isMunicipalOrCommercial && (
        <div className="absolute top-4 right-10" style={{ width: '70px', height: '70px' }}>
          <img
            src={bigHouseIcon}
            alt="Building Icon"
            style={{ 
              width: '100%', 
              height: '100%', 
              filter: status ? 'brightness(0) invert(1)' : 'brightness(0) invert(0.3)'
            }}
          />
        </div>
      )}
      
      {/* House SVG for residential loads */}
      {isResidential && (
        <div className="absolute top-4 right-10" style={{ width: '70px', height: '70px' }}>
          <img
            src={houseIcon}
            alt="House Icon"
            style={{ 
              width: '100%', 
              height: '100%', 
              filter: status ? 'brightness(0) invert(1)' : 'brightness(0) invert(0.3)'
            }}
          />
        </div>
      )}
      
      <div className="text-sm mt-1">
        <div>Power: {power?.toFixed(2)} kW</div>
        <div className={voltageColor}>Voltage: {voltage?.toFixed(2)} V</div>
        <div>Current: {demand?.toFixed(2)} A</div>
        <div>Energy: {energy?.toFixed(2)} kWh</div>
      </div>
    </div>
  );
};

// Create memoized version of ComponentCard
const MemoizedComponentCard = React.memo(ComponentCard);

const GridVisualization = ({ section }) => {
  const [gridData, setGridData] = useState({
    components: {},
    measurements: {}
  });
  
  // Add state for the selected component
  const [selectedComponent, setSelectedComponent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let fetchController = null;
    let lastFetchTime = 0;
    const FETCH_INTERVAL = 1000; // 1 second

    const fetchData = async () => {
      try {
        const now = Date.now();
        // Ensure we're not fetching too frequently
        if (now - lastFetchTime < FETCH_INTERVAL) {
          return;
        }
        lastFetchTime = now;

        // Cancel any pending requests
        if (fetchController) {
          fetchController.abort();
        }
        
        // Create a new AbortController for this request
        fetchController = new AbortController();

        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/grid/data?t=${now}`, {
          signal: fetchController.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setGridData(prevData => {
            // Only update if data has actually changed
            const prevDataStr = JSON.stringify(prevData);
            const newDataStr = JSON.stringify(data);
            if (prevDataStr !== newDataStr) {
              return data;
            }
            return prevData;
          });
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching grid data:', error);
        }
      }
    };

    // Initial fetch
    fetchData();
    
    // Set up polling interval with requestAnimationFrame for smoother updates
    let frameId;
    let lastFrameTime = 0;
    
    const tick = (timestamp) => {
      if (!lastFrameTime) lastFrameTime = timestamp;
      
      const elapsed = timestamp - lastFrameTime;
      
      if (elapsed >= FETCH_INTERVAL) {
        fetchData();
        lastFrameTime = timestamp;
      }
      
      frameId = requestAnimationFrame(tick);
    };
    
    frameId = requestAnimationFrame(tick);

    return () => {
      isMounted = false;
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      if (fetchController) {
        fetchController.abort();
      }
    };
  }, []);

  // Filter and group components by their type and category from the structure
  const groupedComponents = React.useMemo(() => {
    return Object.entries(gridData.components).reduce((acc, [id, component]) => {
      // Skip the meter structure itself
      if (id === "meterstructure") return acc;

      // For loads, we want to use the actual component type and category
      if (component.type === 'load') {
        if (!acc.load) acc.load = {};
        
        // Special handling for municipal vs commercial categorization
        let category = component.category;
        if (['church', 'airport', 'town_hall', 'post_office', 'water_pump'].includes(id)) {
          category = 'municipal';
        }
        
        if (!acc.load[category]) acc.load[category] = [];
        acc.load[category].push([id, component]);
      }
      // For poles - check if the ID contains 'pole'
      else if (id.includes('pole')) {
        if (!acc.none) acc.none = {};
        if (!acc.none.pole) acc.none.pole = [];
        acc.none.pole.push([id, component]);
      }
      // For sources
      else if (component.type === 'source') {
        if (!acc.source) acc.source = {};
        if (!acc.source[component.category]) acc.source[component.category] = [];
        acc.source[component.category].push([id, component]);
      }
      return acc;
    }, {});
  }, [gridData.components]);

  // Create component card with useCallback
  const createComponentCard = React.useCallback((id, component) => {
    const measurements = gridData.measurements[id] || {
      status: [true],
      timestamps: [],
      voltage: [0],
      current: [0],
      power: [0],
      energy: [0]
    };
    const lastIndex = measurements.status?.length - 1;
    const isPole = id.includes('pole');

    return (
      <MemoizedComponentCard
        key={id}
        name={component.name}
        status={measurements.status?.[lastIndex] ?? false}
        power={measurements.power?.[lastIndex] ?? 0}
        voltage={measurements.voltage?.[lastIndex] ?? 0}
        demand={measurements.current?.[lastIndex] ?? 0}
        energy={measurements.energy?.[lastIndex] ?? 0}
        isPole={isPole}
        componentId={id}
        category={component.category}
        onClick={() => {
          window.location.href = `/components/${encodeURIComponent(id)}`;
        }}
      />
    );
  }, [gridData.measurements]);

  // Render section with useMemo
  const renderedSection = React.useMemo(() => {
    switch (section) {
      case 'poles':
        const poles = groupedComponents.none?.pole || [];
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {poles.length > 0 ? (
              poles.map(([id, component]) => createComponentCard(id, component))
            ) : (
              <div className="text-navy-900">No poles found</div>
            )}
          </div>
        );

      case 'loads':
        const loadCategories = groupedComponents.load || {};
        return (
          <div>
            {Object.entries(loadCategories).map(([category, components]) => (
              <div key={category} className="mb-6 last:mb-0">
                <h3 className="text-lg font-semibold mb-4 capitalize text-navy-900">{category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {components.map(([id, component]) => createComponentCard(id, component))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'sources':
        const sourceCategories = groupedComponents.source || {};
        return (
          <div>
            {Object.entries(sourceCategories).map(([category, components]) => (
              <div key={category} className="mb-6 last:mb-0">
                <h3 className="text-lg font-semibold mb-4 capitalize text-navy-900">{category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {components.map(([id, component]) => createComponentCard(id, component))}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  }, [section, groupedComponents, createComponentCard]);

  return (
    <div className="w-full h-full">
      {renderedSection}
    </div>
  );
};

export default GridVisualization; 