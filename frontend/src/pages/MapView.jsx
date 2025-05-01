import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to fit map to GeoJSON bounds
const FitBoundsToGeoJSON = ({ geoJsonData }) => {
  const map = useMap();
  const hasZoomed = useRef(false);
  
  useEffect(() => {
    if (geoJsonData && !hasZoomed.current) {
      try {
        // Create a temporary GeoJSON layer to calculate bounds
        const tempLayer = L.geoJSON(geoJsonData);
        const bounds = tempLayer.getBounds();
        
        if (bounds.isValid()) {
          map.fitBounds(bounds);
          hasZoomed.current = true; // Mark that we've zoomed once
        }
      } catch (e) {
        console.warn("Could not fit bounds to GeoJSON data:", e);
      }
    }
  }, [geoJsonData, map]);
  
  return null;
};

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
const getVoltageColor = (voltage, isOnline) => {
  if (!isOnline) return '#888888'; // Gray for offline
  if (voltage === 0) return '#888888'; // Gray for zero voltage
  if (voltage > VOLTAGE_THRESHOLDS.CRITICAL_HIGH) return '#dc2626'; // text-red-600
  if (voltage > VOLTAGE_THRESHOLDS.WARNING_HIGH) return '#f97316'; // text-orange-500
  if (voltage > VOLTAGE_THRESHOLDS.NORMAL_HIGH) return '#eab308'; // text-yellow-500
  if (voltage > VOLTAGE_THRESHOLDS.NORMAL_LOW) return '#16a34a'; // text-green-600
  if (voltage > VOLTAGE_THRESHOLDS.WARNING_LOW) return '#0d9488'; // text-teal-500
  if (voltage > VOLTAGE_THRESHOLDS.CRITICAL_LOW) return '#0891b2'; // text-cyan-600
  return '#888888'; // Gray default
};

// Create a Legend control component
const MapLegend = () => {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    // Create a custom legend control
    const legend = L.control({ position: 'bottomright' });
    
    legend.onAdd = function() {
      const div = L.DomUtil.create('div', 'info legend');
      
      div.innerHTML = `
        <div class="legend-container">
          <h4>Map Legend</h4>
          
          <div class="legend-section">
            <h5>Sources</h5>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #FFD700;"></span>
              <span>Solar</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #87CEEB;"></span>
              <span>Wind</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #1E90FF;"></span>
              <span>Hydro</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #8B4513;"></span>
              <span>Generator</span>
            </div>
          </div>
          
          <div class="legend-section">
            <h5>Loads</h5>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #FF5722;"></span>
              <span>Residential</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #9C27B0;"></span>
              <span>Commercial</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background-color:rgb(244, 54, 155);"></span>
              <span>Industrial</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #2196F3;"></span>
              <span>Municipal</span>
            </div>
          </div>
          
          <div class="legend-section">
            <h5>Infrastructure</h5>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #607D8B;"></span>
              <span>Poles</span>
            </div>
          </div>
          
          <div class="legend-section">
            <h5>Voltage Levels</h5>
            <div class="legend-item">
              <span class="legend-line" style="background-color: #dc2626;"></span>
              <span>Critical High (>132V)</span>
            </div>
            <div class="legend-item">
              <span class="legend-line" style="background-color: #f97316;"></span>
              <span>Warning High (126-132V)</span>
            </div>
            <div class="legend-item">
              <span class="legend-line" style="background-color: #eab308;"></span>
              <span>Normal High (120-126V)</span>
            </div>
            <div class="legend-item">
              <span class="legend-line" style="background-color: #16a34a;"></span>
              <span>Normal (114-120V)</span>
            </div>
            <div class="legend-item">
              <span class="legend-line" style="background-color: #0d9488;"></span>
              <span>Warning Low (108-114V)</span>
            </div>
            <div class="legend-item">
              <span class="legend-line" style="background-color: #0891b2;"></span>
              <span>Critical Low (0-108V)</span>
            </div>
            <div class="legend-item">
              <span class="legend-line" style="background-color: #888888;"></span>
              <span>Offline</span>
            </div>
          </div>
        </div>
      `;
      
      return div;
    };
    
    legend.addTo(map);
    
    return () => {
      legend.remove();
    };
  }, [map]);
  
  return null;
};

// Add this component to your MapView
const ResetViewButton = ({ geoJsonData }) => {
  const map = useMap();
  
  const resetView = () => {
    if (geoJsonData) {
      try {
        const tempLayer = L.geoJSON(geoJsonData);
        const bounds = tempLayer.getBounds();
        
        if (bounds.isValid()) {
          map.fitBounds(bounds);
        }
      } catch (e) {
        console.warn("Could not fit bounds to GeoJSON data:", e);
      }
    }
  };
  
  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '10px', marginRight: '10px' }}>
      <div className="leaflet-control leaflet-bar">
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); resetView(); }}
          title="Reset view"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
        </a>
      </div>
    </div>
  );
};

// Add this new component to your MapView.jsx file
const ComponentList = ({ geoJsonData, map }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  
  // Extract point features (components) from GeoJSON data
  useEffect(() => {
    if (geoJsonData && geoJsonData.features) {
      const pointFeatures = geoJsonData.features.filter(f => 
        f.geometry && f.geometry.type === 'Point' && f.properties && f.properties.id
      );
      
      setFilteredComponents(pointFeatures);
    }
  }, [geoJsonData]);
  
  // Filter components based on search term
  useEffect(() => {
    if (!geoJsonData || !geoJsonData.features) return;
    
    const pointFeatures = geoJsonData.features.filter(f => 
      f.geometry && f.geometry.type === 'Point' && f.properties && f.properties.id
    );
    
    if (!searchTerm.trim()) {
      setFilteredComponents(pointFeatures);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = pointFeatures.filter(feature => {
      const props = feature.properties;
      return (
        props.id?.toLowerCase().includes(term) ||
        props.name?.toLowerCase().includes(term) ||
        props.type?.toLowerCase().includes(term) ||
        props.category?.toLowerCase().includes(term)
      );
    });
    
    setFilteredComponents(filtered);
  }, [searchTerm, geoJsonData]);
  
  // Handle component selection
  const handleComponentClick = (feature) => {
    if (!map || !feature.geometry || !feature.geometry.coordinates) return;
    
    // Get coordinates (swap lat/lng for GeoJSON)
    const [lng, lat] = feature.geometry.coordinates;
    
    // Center map on component
    map.setView([lat, lng], 18);
    
    // Highlight selected component
    setSelectedComponent(feature.properties.id);
    
    // Find and open the popup for this component
    map.eachLayer(layer => {
      if (layer.feature && 
          layer.feature.properties && 
          layer.feature.properties.id === feature.properties.id) {
        layer.openPopup();
      }
    });
  };
  
  // Group components by type and category
  const groupedComponents = filteredComponents.reduce((acc, feature) => {
    const { type, category } = feature.properties;
    const groupKey = `${type || 'unknown'}-${category || 'unknown'}`;
    
    if (!acc[groupKey]) {
      acc[groupKey] = {
        label: `${category || 'Unknown'} ${type || ''}`,
        features: []
      };
    }
    
    acc[groupKey].features.push(feature);
    return acc;
  }, {});
  
  return (
    <div className={`component-list-container ${isOpen ? 'open' : 'closed'}`}>
      <div className="component-list-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '◀' : '▶'} {isOpen ? 'Hide' : 'Show'} Components
      </div>
      
      {isOpen && (
        <div className="component-list-content">
          <div className="component-list-search">
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search" 
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="component-list-count">
            {filteredComponents.length} components found
          </div>
          
          <div className="component-list-groups">
            {Object.entries(groupedComponents).map(([key, group]) => (
              <div key={key} className="component-group">
                <div className="component-group-header">
                  {group.label} ({group.features.length})
                </div>
                <div className="component-group-items">
                  {group.features.map(feature => (
                    <div 
                      key={feature.properties.id}
                      className={`component-item ${selectedComponent === feature.properties.id ? 'selected' : ''}`}
                      onClick={() => handleComponentClick(feature)}
                    >
                      {feature.properties.name || feature.properties.id}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MapView = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [componentData, setComponentData] = useState({});
  const [measurementData, setMeasurementData] = useState({});
  const geoJsonLayerRef = useRef(null);
  const lastGeoJsonUpdateRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let fetchController = null;
    let lastFetchTime = 0;
    const FETCH_INTERVAL = 1000; // 1 second - update data every second instead of every minute

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
          // Store component and measurement data for popups
          setComponentData(data.components);
          setMeasurementData(data.measurements);
          
          // Always update GeoJSON data to ensure we have the latest measurements
          if (data.components.geojson && data.components.geojson.data) {
            setGeoJsonData(data.components.geojson.data);
          }
          setLoading(false);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching map data:', error);
        }
      }
    };

    // Initial fetch
    fetchData();
    
    // Set up polling interval
    const intervalId = setInterval(fetchData, FETCH_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      if (fetchController) {
        fetchController.abort();
      }
    };
  }, []);

  // Style function for GeoJSON features
  const styleFeature = (feature) => {
    if (!feature.properties) return {};
    
    // Default styles
    const defaultPointStyle = {
      radius: 8,
      fillColor: "#3388ff",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    };
    
    const defaultLineStyle = {
      color: '#3388ff',
      weight: 2,
      opacity: 0.7
    };
    
    // For LineString features (connections)
    if (feature.geometry.type === 'LineString') {
      // Get the source and target IDs
      const { from, to } = feature.properties;
      
      // Check if we have measurement data for the source
      if (from && measurementData[from]) {
        const measurements = measurementData[from];
        const lastIndex = measurements.status?.length - 1 || 0;
        
        const status = measurements.status?.[lastIndex] ?? false;
        const voltage = measurements.voltage?.[lastIndex] ?? 0;
        
        // Use voltage to determine line color
        return {
          ...defaultLineStyle,
          color: getVoltageColor(voltage, status),
          weight: 3 // Make lines slightly thicker for better visibility
        };
      }
      
      return defaultLineStyle;
    }
    
    // For Point features (components)
    if (feature.geometry.type === 'Point') {
      const { type, category } = feature.properties;
      
      // Style based on component type and category
      if (type === 'source') {
        switch (category) {
          case 'solar':
            return { ...defaultPointStyle, fillColor: '#FFD700' }; // Gold
          case 'wind':
          case 'turbine':
            return { ...defaultPointStyle, fillColor: '#87CEEB' }; // Sky Blue
          case 'hydro':
            return { ...defaultPointStyle, fillColor: 'rgb(16, 0, 244)' }; // Dodger Blue
          case 'diesel':
          case 'generator':
            return { ...defaultPointStyle, fillColor: '#8B4513' }; // Saddle Brown
          default:
            return { ...defaultPointStyle, fillColor: '#4CAF50' }; // Green
        }
      } else if (type === 'load') {
        switch (category) {
          case 'residential':
            return { ...defaultPointStyle, fillColor: '#FF5722' }; // Deep Orange
          case 'commercial':
            return { ...defaultPointStyle, fillColor: '#9C27B0' }; // Purple
          case 'industrial':
            return { ...defaultPointStyle, fillColor: 'rgb(244, 54, 155)' }; // Pink (matching legend)
          case 'municipal':
            return { ...defaultPointStyle, fillColor: '#2196F3' }; // Blue
          default:
            return { ...defaultPointStyle, fillColor: '#FF9800' }; // Orange
        }
      } else if (type === 'none' && category === 'distribution') {
        // Poles - make them 40% larger (radius 8 * 1.4 = 11.2)
        return { ...defaultPointStyle, radius: 4.2, fillColor: '#607D8B' }; // Gray
      }
    }
    
    return defaultPointStyle;
  };

  // Function to create custom point markers
  const pointToLayer = (feature, latlng) => {
    if (!feature.properties) return L.circleMarker(latlng);
    
    const { type, category } = feature.properties;
    
    // Use circle markers for all points
    return L.circleMarker(latlng, styleFeature(feature));
  };

  // Handle popup content for each feature
  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      // For connection lines
      if (feature.geometry.type === 'LineString') {
        const { from, to } = feature.properties;
        let tooltipContent = `Connection: ${from} → ${to}`;
        
        // Add voltage information if available
        if (from && measurementData[from]) {
          const measurements = measurementData[from];
          const lastIndex = measurements.status?.length - 1 || 0;
          
          const status = measurements.status?.[lastIndex] ?? false;
          const voltage = measurements.voltage?.[lastIndex] ?? 0;
          
          if (status) {
            tooltipContent += `<br>Voltage: ${voltage.toFixed(1)} V`;
          } else {
            tooltipContent += '<br>Status: Offline';
          }
        }
        
        layer.bindTooltip(tooltipContent);
        return;
      }
      
      const { id, name, type, category } = feature.properties;
      
      // Construct the full component ID with proper plural form
      let fullComponentId = id;
      
      // If we need to construct it manually, use the component name when available
      if (type && category) {
        // For poles, just use the component name
        if (type === 'none' && category === 'distribution') {
          fullComponentId = name ? name.toLowerCase().replace(/\s+/g, '') : id;
        } else {
          // For other components, use the type/category format
          // Convert type to plural form if needed
          let pluralType = type;
          if (type === 'load') pluralType = 'loads';
          if (type === 'source') pluralType = 'sources';
          
          // Use the component name if available, otherwise use category
          const componentName = name ? name.toLowerCase().replace(/\s+/g, '') : category;
          
          // Just use type and name without the $ character
          fullComponentId = `${pluralType}/${componentName}`;
        }
      }
      
      // Get latest measurements if available
      let statusInfo = '';
      let measurementInfo = '';
      
      if (id && measurementData[id]) {
        const measurements = measurementData[id];
        const lastIndex = measurements.status?.length - 1 || 0;
        
        const status = measurements.status?.[lastIndex] ?? false;
        const voltage = measurements.voltage?.[lastIndex] ?? 0;
        const current = measurements.current?.[lastIndex] ?? 0;
        const power = measurements.power?.[lastIndex] ?? 0;
        const frequency = measurements.frequency?.[lastIndex] ?? 0;
        
        statusInfo = `<div class="status ${status ? 'online' : 'offline'}">
          <span class="status-indicator"></span>
          ${status ? 'Online' : 'Offline'}
        </div>`;
        
        // For poles (type 'none' and category 'distribution'), show only voltage
        if (type === 'none' && category === 'distribution') {
          measurementInfo = `
            <div class="measurements">
              <div>Voltage: ${voltage.toFixed(1)} V</div>
            </div>
          `;
        } 
        // For sources, show all relevant measurements
        else if (type === 'source') {
          measurementInfo = `
            <div class="measurements">
              <div>Voltage: ${voltage.toFixed(1)} V</div>
              <div>Current: ${current.toFixed(1)} A</div>
              <div>Power: ${power.toFixed(1)} kW</div>
              ${frequency ? `<div>Frequency: ${frequency.toFixed(1)} Hz</div>` : ''}
              ${category === 'solar' ? `<div>Generation: ${(power * 0.85).toFixed(1)} kW</div>` : ''}
              ${category === 'wind' || category === 'turbine' ? `<div>Wind Speed: ${(Math.random() * 10 + 5).toFixed(1)} m/s</div>` : ''}
              ${category === 'hydro' ? `<div>Flow Rate: ${(Math.random() * 20 + 10).toFixed(1)} m³/s</div>` : ''}
              ${category === 'diesel' || category === 'generator' ? `<div>Fuel Level: ${Math.floor(Math.random() * 100)}%</div>` : ''}
            </div>
          `;
        } 
        // For loads, show consumption-related measurements
        else if (type === 'load') {
          measurementInfo = `
            <div class="measurements">
              <div>Voltage: ${voltage.toFixed(1)} V</div>
              <div>Current: ${current.toFixed(1)} A</div>
              <div>Power: ${power.toFixed(1)} kW</div>
              <div>Consumption: ${(power * 0.95).toFixed(1)} kW</div>
              ${category === 'residential' ? `<div>Households: ${Math.floor(Math.random() * 10 + 1)}</div>` : ''}
              ${category === 'commercial' ? `<div>Businesses: ${Math.floor(Math.random() * 5 + 1)}</div>` : ''}
              ${category === 'industrial' ? `<div>Production: ${Math.floor(Math.random() * 100)}%</div>` : ''}
              ${category === 'municipal' ? `<div>Service Type: ${['Water', 'Sewage', 'Street Lights', 'Public Building'][Math.floor(Math.random() * 4)]}</div>` : ''}
            </div>
          `;
        }
        // For any other component types
        else {
          measurementInfo = `
            <div class="measurements">
              <div>Voltage: ${voltage.toFixed(1)} V</div>
              <div>Current: ${current.toFixed(1)} A</div>
              <div>Power: ${power.toFixed(1)} kW</div>
            </div>
          `;
        }
      }
      
      // Add a details button that redirects to the component details page with the correct ID format
      const detailsButton = `
        <div class="details-button-container">
          <button onclick="window.location.href='/components/${encodeURIComponent(fullComponentId)}'" class="details-button">
            View Details
          </button>
        </div>
      `;
      
      const popupContent = `
        <div class="map-popup">
          <h3>${name || 'Component'}</h3>
          <div class="component-info">
            <div>Type: ${type || 'Unknown'}</div>
            ${category ? `<div>Category: ${category}</div>` : ''}
          </div>
          ${statusInfo}
          ${measurementInfo}
          ${detailsButton}
        </div>
      `;
      
      // Add custom CSS to the popup
      const customPopup = L.popup({
        className: 'custom-popup',
        maxWidth: 300
      }).setContent(popupContent);
      
      layer.bindPopup(customPopup);
    }
  };

  // In your MapView component, add this function to split the GeoJSON data
  const splitGeoJSON = (data) => {
    if (!data || !data.features) return { points: null, lines: null };
    
    const pointFeatures = data.features.filter(f => 
      f.geometry && f.geometry.type === 'Point'
    );
    
    const lineFeatures = data.features.filter(f => 
      f.geometry && f.geometry.type === 'LineString'
    );
    
    return {
      points: pointFeatures.length > 0 ? { 
        type: 'FeatureCollection', 
        features: pointFeatures 
      } : null,
      lines: lineFeatures.length > 0 ? { 
        type: 'FeatureCollection', 
        features: lineFeatures 
      } : null
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="text-xl text-navy-900">Loading map data...</div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <style jsx global>{`
        /* Reset default margins and padding */
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
        }

        /* Make the map container fill the available space below navbar */
        .map-container {
          position: fixed;
          top: 90px; /* Height of the navbar */
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          z-index: 0;
        }

        /* Ensure the Leaflet container fills its parent */
        .leaflet-container {
          height: 100% !important;
          width: 100% !important;
        }

        /* Component List Styles */
        .component-list-container {
          position: fixed;
          top: 180px; /* Positioned below zoom controls */
          left: 10px;
          z-index: 1000;
          background-color: rgba(25, 32, 71, 0.9);
          color: white;
          border-radius: 5px;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          max-height: calc(100vh - 180px); /* Adjusted to account for new top position */
          display: flex;
          flex-direction: column;
        }

        /* Legend styles */
        .legend {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          background-color: rgba(25, 32, 71, 0.9);
          color: white;
          padding: 10px;
          border-radius: 5px;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
          line-height: 1.5;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
        }

        .component-list-container.open {
          width: 300px;
        }

        .component-list-container.closed {
          width: auto;
        }

        .component-list-toggle {
          padding: 10px;
          cursor: pointer;
          font-weight: bold;
          white-space: nowrap;
          color: white;
        }

        .component-list-content {
          padding: 10px;
          overflow-y: auto;
          max-height: calc(100vh - 200px);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .component-list-search {
          position: relative;
        }

        .component-list-search input {
          width: 100%;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #ccc;
          background-color: rgba(255, 255, 255, 0.9);
          color: #333;
        }

        .clear-search {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
        }

        .component-list-count {
          font-size: 12px;
          color: #ccc;
        }

        .component-list-groups {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .component-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .component-group-header {
          font-weight: bold;
          font-size: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          padding-bottom: 3px;
          color: white;
        }

        .component-group-items {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding-left: 5px;
        }

        .component-item {
          padding: 5px;
          cursor: pointer;
          border-radius: 3px;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: white;
        }

        .component-item:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .component-item.selected {
          background-color: rgba(255, 255, 255, 0.2);
          font-weight: bold;
        }

        .custom-popup .leaflet-popup-content-wrapper {
          background-color: rgba(25, 32, 71, 0.9);
          color: white;
          border-radius: 8px;
        }
        .custom-popup .leaflet-popup-tip {
          background-color: rgba(25, 32, 71, 0.9);
        }
        .custom-popup h3 {
          font-weight: bold;
          margin-bottom: 8px;
          font-size: 16px;
        }
        .custom-popup .component-info {
          margin-bottom: 8px;
        }
        .custom-popup .status {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .custom-popup .status-indicator {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 6px;
        }
        .custom-popup .online .status-indicator {
          background-color: #4CAF50;
        }
        .custom-popup .offline .status-indicator {
          background-color: #F44336;
        }
        .custom-popup .measurements {
          font-size: 12px;
        }
        
        .details-button-container {
          margin-top: 10px;
          text-align: center;
        }
        
        .details-button {
          display: inline-block;
          background-color: #eab308;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          text-decoration: none;
          font-size: 12px;
          font-weight: bold;
          transition: background-color 0.3s;
        }
        
        .details-button:hover {
          background-color: #ca8a04;
          text-decoration: none;
        }
        
        .legend-container {
          max-width: 200px;
        }
        
        .legend h4 {
          margin: 0 0 10px;
          font-size: 16px;
          font-weight: bold;
          text-align: center;
        }
        
        .legend-section {
          margin-bottom: 12px;
        }
        
        .legend h5 {
          margin: 0 0 5px;
          font-size: 14px;
          font-weight: bold;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 3px;
          font-size: 12px;
        }
        
        .legend-color {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
          border: 1px solid #000;
        }
        
        .legend-line {
          display: inline-block;
          width: 20px;
          height: 2px;
          background-color: #3388ff;
          margin-right: 8px;
        }
      `}</style>
      
      {geoJsonData ? (
        <MapContainer 
          center={[61.785, -156.585]}
          zoom={15} 
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          whenCreated={mapInstance => {
            mapRef.current = mapInstance;
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBoundsToGeoJSON geoJsonData={geoJsonData} />
          <ResetViewButton geoJsonData={geoJsonData} />
          
          {/* First render the lines (connections) */}
          {splitGeoJSON(geoJsonData).lines && (
            <GeoJSON 
              data={splitGeoJSON(geoJsonData).lines} 
              style={styleFeature}
            />
          )}
          
          {/* Then render the points (components) on top */}
          {splitGeoJSON(geoJsonData).points && (
            <GeoJSON 
              data={splitGeoJSON(geoJsonData).points} 
              style={styleFeature}
              pointToLayer={pointToLayer}
              onEachFeature={onEachFeature}
              ref={geoJsonLayerRef}
            />
          )}
          
          <MapLegend />
        </MapContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-navy-900">No GeoJSON data available</div>
        </div>
      )}
      
      {/* Add the component list for when the map is ready */}
      {geoJsonData && mapRef.current && (
        <ComponentList geoJsonData={geoJsonData} map={mapRef.current} />
      )}
    </div>
  );
};

export default MapView; 