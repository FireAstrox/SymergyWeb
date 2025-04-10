import React, { useState, useEffect, memo } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
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

const ComponentCard = ({ name, status, power, voltage, demand, isPole, componentId, category }) => {
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
      <div className={`p-4 rounded-lg ${status ? 'bg-navy-900' : 'bg-red-900'} text-white mb-4 relative`}>
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
    <div className={`p-3 rounded-lg ${status ? 'bg-navy-900' : 'bg-red-900'} text-white mb-4 relative`}>
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
      </div>
    </div>
  );
};

const GridVisualization = ({ section }) => {
  const [gridData, setGridData] = useState({
    components: {},
    measurements: {}
  });

  useEffect(() => {
    let isMounted = true;
    let fetchController = null;
    let consecutiveErrorCount = 0;
    const MAX_CONSECUTIVE_ERRORS = 3;
    
    const fetchData = async () => {
      if (!isMounted) return;
      
      // Cancel any pending requests
      if (fetchController) {
        fetchController.abort();
      }
      
      // Create a new AbortController for this request
      fetchController = new AbortController();
      
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const timestamp = new Date().getTime(); // Add cache-busting timestamp
        const response = await fetch(`${API_URL}/api/grid/data?t=${timestamp}`, {
          signal: fetchController.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          // Set a timeout for the fetch request
          timeout: 2000
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setGridData(data);
          // Reset error count on successful fetch
          consecutiveErrorCount = 0;
          // Update last successful data time
          window._lastGridDataUpdate = new Date().getTime();
        }
      } catch (error) {
        // Only log errors that aren't from aborting
        if (error.name !== 'AbortError') {
          console.error('Error fetching grid data:', error);
          consecutiveErrorCount++;
          
          // If we've had multiple consecutive errors, try a more aggressive approach
          if (consecutiveErrorCount >= MAX_CONSECUTIVE_ERRORS) {
            console.warn(`${consecutiveErrorCount} consecutive fetch errors - refreshing connection`);
            // Force a health check to the backend
            try {
              await fetch(`${API_URL}/health?t=${timestamp}`);
            } catch (e) {
              console.error('Health check failed:', e);
            }
          }
        }
      }
    };

    // Initial fetch
    fetchData();
    
    // Use a more reliable polling mechanism
    const intervalId = setInterval(fetchData, 1000); // Increased to 1 second for stability
    
    // Add a watchdog timer that will force refresh if needed
    const watchdogId = setInterval(() => {
      const now = new Date().getTime();
      const lastUpdateTime = window._lastGridDataUpdate || 0;
      
      // If we haven't had an update in 10 seconds, force a page refresh
      if (lastUpdateTime > 0 && now - lastUpdateTime > 10000) {
        console.warn(`No data updates for ${(now - lastUpdateTime)/1000} seconds - refreshing page`);
        window.location.reload();
      }
    }, 10000); // Check every 10 seconds

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      clearInterval(watchdogId);
      if (fetchController) {
        fetchController.abort();
      }
    };
  }, []);

  // Record when we get data
  useEffect(() => {
    window._lastGridDataUpdate = new Date().getTime();
  }, [gridData]);

  // Filter and group components by their type and category from the structure
  const groupedComponents = Object.entries(gridData.components).reduce((acc, [id, component]) => {
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

  // Debug logging for loads
  useEffect(() => {
    if (section === 'loads') {
      console.log('Load Components by Category:', groupedComponents.load);
    }
  }, [gridData, groupedComponents, section]);

  // Sort categories in specific order for loads
  const loadCategoryOrder = {
    'municipal': 1,
    'commercial': 2,
    'residential': 3,
    'industrial': 4,
    'other': 999
  };

  // Sort components within each category
  Object.values(groupedComponents).forEach(typeGroup => {
    Object.values(typeGroup).forEach(components => {
      components.sort(([idA, compA], [idB, compB]) => {
        // Extract numbers for numerical sorting
        const numA = parseInt(compA.name.match(/\d+/)?.[0] || '0');
        const numB = parseInt(compB.name.match(/\d+/)?.[0] || '0');
        return numA - numB;
      });
    });
  });


  // Add memo to prevent unnecessary re-renders of ComponentCard
  const MemoizedComponentCard = React.memo(ComponentCard, (prevProps, nextProps) => {
    return (
      prevProps.status === nextProps.status &&
      prevProps.voltage === nextProps.voltage &&
      prevProps.power === nextProps.power &&
      prevProps.demand === nextProps.demand
    );
  });

  // Update createComponentCard to use memoized version
  const createComponentCard = (id, component) => {
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
        isPole={isPole}
        componentId={id}
        category={component.category}
      />
    );
  };

  const renderSection = () => {
    switch (section) {
      case 'poles':
        const poles = groupedComponents.none?.pole || [];
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {/* Always show 2 columns for loads */}
                <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {components.map(([id, component]) => createComponentCard(id, component))}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full">
      {renderSection()}
    </div>
  );
};

export default GridVisualization; 