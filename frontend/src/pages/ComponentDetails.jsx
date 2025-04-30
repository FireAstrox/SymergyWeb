import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload, label, dataKey }) => {
  if (active && payload && payload.length) {
    // Get the appropriate unit based on the data key
    const units = {
      voltage: 'V',
      current: 'A',
      power: 'kW',
      energy: 'kWh'
    };
    
    const unit = units[dataKey] || '';
    const value = payload[0].value;
    
    return (
      <div className="bg-navy-900 text-white p-2 rounded shadow-lg border border-yellow-500">
        <p className="text-sm">{`Time: ${label}`}</p>
        <p className="text-sm font-semibold">{`${dataKey.charAt(0).toUpperCase() + dataKey.slice(1)}: ${value.toFixed(2)} ${unit}`}</p>
      </div>
    );
  }
  
  return null;
};

const ComponentDetails = () => {
  const { componentId } = useParams();
  const [component, setComponent] = useState(null);
  const [measurements, setMeasurements] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch component data
  useEffect(() => {
    let isMounted = true;
    let fetchController = null;

    const fetchData = async () => {
      try {
        // Cancel any pending requests
        if (fetchController) {
          fetchController.abort();
        }
        
        // Create a new AbortController for this request
        fetchController = new AbortController();

        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const timestamp = new Date().getTime();
        const response = await fetch(`${API_URL}/api/grid/data?t=${timestamp}`, {
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
        
        // Find the component by ID
        const decodedId = decodeURIComponent(componentId);
        const componentData = data.components[decodedId];
        const measurementData = data.measurements[decodedId];
        
        if (!componentData) {
          throw new Error(`Component not found: ${decodedId}`);
        }
        
        if (isMounted) {
          setComponent(componentData);
          setMeasurements(measurementData);
          setLoading(false);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching component data:', error);
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };
    
    fetchData();
    const intervalId = setInterval(fetchData, 1000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
      if (fetchController) {
        fetchController.abort();
      }
    };
  }, [componentId]);
  
  // Format time series data for charts
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
  
  // Calculate Y-axis domain based on data
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
    
    // Check for abnormally large values (likely data errors)
    // Most electrical measurements shouldn't exceed these thresholds in a normal grid
    const thresholds = {
      'voltage': 1000,    // 1000V is high for most distribution systems
      'current': 10000,   // 10000A is extremely high
      'power': 10000,     // 10000kW is very high for most components
      'energy': 100000    // 100000kWh is very high for short-term measurements
    };
    
    const threshold = thresholds[dataKey] || 1000;
    const minValue = Math.min(...nonZeroValues);
    const maxValue = Math.max(...nonZeroValues);
    
    // If values are abnormally high, use a more reasonable approach
    if (maxValue > threshold) {
      // For extremely large values, look at the actual data pattern
      // Sort values to find median and quartiles
      const sortedValues = [...nonZeroValues].sort((a, b) => a - b);
      const medianIndex = Math.floor(sortedValues.length / 2);
      const medianValue = sortedValues[medianIndex];
      
      // If median is also very large, we might need to use a fixed scale
      if (medianValue > threshold) {
        // Check if the data has meaningful variations or is mostly flat
        const variations = nonZeroValues.map(v => Math.abs(v - medianValue));
        const avgVariation = variations.reduce((sum, v) => sum + v, 0) / variations.length;
        
        // If variations are small relative to the values, use a scale that shows these variations
        if (avgVariation / medianValue < 0.1) { // Less than 10% variation
          // Find the min and max of recent values to focus on current trends
          const recentValues = nonZeroValues.slice(-20); // Last 20 points
          const recentMin = Math.min(...recentValues);
          const recentMax = Math.max(...recentValues);
          
          // Use a range that shows the variations clearly with max value 10 units higher
          return [
            Math.max(0, recentMin - 1),
            recentMax + 10
          ];
        }
        
        // For data with large variations, use a more typical range for the measurement type
        const typicalRanges = {
          'voltage': [0, 500],    // 0-500V
          'current': [0, 100],    // 0-100A
          'power': [0, 1000],     // 0-1000kW
          'energy': [0, 10000]    // 0-10000kWh
        };
        
        return typicalRanges[dataKey] || [0, 100];
      }
      
      // Use median as reference and add 10 units
      return [0, medianValue + 10];
    }
    
    // For normal values, always set max to the maximum value plus 10 units
    const yMin = 0; // Always start at 0 for these metrics
    const yMax = maxValue + 10; // Always add 10 units to the maximum value
    
    return [yMin, yMax];
  }, [timeSeriesData]);
  
  // Get the latest values
  const lastIndex = measurements?.status?.length - 1 || 0;
  const status = measurements?.status?.[lastIndex] ?? false;
  const voltage = measurements?.voltage?.[lastIndex] ?? 0;
  const current = measurements?.current?.[lastIndex] ?? 0;
  const power = measurements?.power?.[lastIndex] ?? 0;
  const energy = measurements?.energy?.[lastIndex] ?? 0;
  
  // Check if this is a pole component
  const isPole = component?.category === 'pole' || (componentId && componentId.includes('pole'));
  
  // Format Y-axis tick values
  const formatYAxisTick = (value) => {
    // For values less than 10, show up to 1 decimal place
    // For larger values, show only integers
    return value < 10 ? value.toFixed(1) : Math.round(value);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-navy-900">Loading component data...</div>
      </div>
    );
  }
  
  if (!component) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-red-600">Component not found</div>
      </div>
    );
  }
  
  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6 border-b border-yellow-500 pb-4">
        <h1 className="text-2xl font-bold text-navy-900">{component.name}</h1>
      </div>
      
      {/* Component details */}
      <div className="bg-navy-900 text-white rounded-lg p-6 mb-6">
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
      </div>
      
      {/* Charts */}
      <div className="space-y-6">
        {/* Always show Voltage History */}
        <div className="border border-yellow-500 rounded-lg p-4 bg-white">
          <h3 className="text-lg font-semibold mb-4 text-navy-900">Voltage History</h3>
          <ResponsiveContainer width="100%" height={300}>
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
                tickFormatter={formatYAxisTick}
              />
              <Tooltip content={<CustomTooltip dataKey="voltage" />} />
              <Line 
                type="monotone" 
                dataKey="voltage" 
                stroke="#FFD700" 
                strokeWidth={2}
                dot={false} 
                activeDot={{ r: 6, stroke: '#FFD700', strokeWidth: 2, fill: '#fff' }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Only show Current and Power History for non-poles */}
        {!isPole && (
          <>
            <div className="border border-yellow-500 rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold mb-4 text-navy-900">Current History</h3>
              <ResponsiveContainer width="100%" height={300}>
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
                    tickFormatter={formatYAxisTick}
                  />
                  <Tooltip content={<CustomTooltip dataKey="current" />} />
                  <Line 
                    type="monotone" 
                    dataKey="current" 
                    stroke="#FF4500" 
                    strokeWidth={2}
                    dot={false} 
                    activeDot={{ r: 6, stroke: '#FF4500', strokeWidth: 2, fill: '#fff' }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="border border-yellow-500 rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold mb-4 text-navy-900">Power History</h3>
              <ResponsiveContainer width="100%" height={300}>
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
                    tickFormatter={formatYAxisTick}
                  />
                  <Tooltip content={<CustomTooltip dataKey="power" />} />
                  <Line 
                    type="monotone" 
                    dataKey="power" 
                    stroke="#4CAF50" 
                    strokeWidth={2}
                    dot={false} 
                    activeDot={{ r: 6, stroke: '#4CAF50', strokeWidth: 2, fill: '#fff' }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="border border-yellow-500 rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold mb-4 text-navy-900">Energy History</h3>
              <ResponsiveContainer width="100%" height={300}>
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
                    tickFormatter={formatYAxisTick}
                  />
                  <Tooltip content={<CustomTooltip dataKey="energy" />} />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke="#1E90FF" 
                    strokeWidth={2}
                    dot={false} 
                    activeDot={{ r: 6, stroke: '#1E90FF', strokeWidth: 2, fill: '#fff' }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ComponentDetails; 