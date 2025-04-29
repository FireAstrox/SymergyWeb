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
            <div class="legend-item">
              <span class="legend-line"></span>
              <span>Connections</span>
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
    const FETCH_INTERVAL = 60000; // 60 seconds - check for GeoJSON updates every minute

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
          
          // Check if we have GeoJSON data and if it has changed
          if (data.components.geojson && data.components.geojson.data) {
            const newGeoJsonString = JSON.stringify(data.components.geojson.data);
            const currentGeoJsonString = lastGeoJsonUpdateRef.current;
            
            // Only update if the GeoJSON data has changed
            if (newGeoJsonString !== currentGeoJsonString) {
              console.log("GeoJSON data updated at", new Date().toLocaleTimeString());
              setGeoJsonData(data.components.geojson.data);
              lastGeoJsonUpdateRef.current = newGeoJsonString;
            }
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
            return { ...defaultPointStyle, fillColor: '#1E90FF' }; // Dodger Blue
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
      // Skip popups for connection lines
      if (feature.geometry.type === 'LineString') {
        layer.bindTooltip(`Connection: ${feature.properties.from} → ${feature.properties.to}`);
        return;
      }
      
      const { id, name, type, category } = feature.properties;
      
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
        
        statusInfo = `<div class="status ${status ? 'online' : 'offline'}">
          <span class="status-indicator"></span>
          ${status ? 'Online' : 'Offline'}
        </div>`;
        
        measurementInfo = `
          <div class="measurements">
            <div>Voltage: ${voltage.toFixed(1)} V</div>
            ${type !== 'none' ? `<div>Current: ${current.toFixed(1)} A</div>` : ''}
            ${type !== 'none' ? `<div>Power: ${power.toFixed(1)} kW</div>` : ''}
          </div>
        `;
      }
      
      const popupContent = `
        <div class="map-popup">
          <h3>${name || id || 'Unnamed'}</h3>
          <div class="component-info">
            <div>Type: ${type || 'Unknown'}</div>
            ${category ? `<div>Category: ${category}</div>` : ''}
          </div>
          ${statusInfo}
          ${measurementInfo}
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
      <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
        <div className="text-xl text-navy-900">Loading map data...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] w-full bg-gray-100">
      <style jsx global>{`
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
        
        /* Legend styles */
        .legend {
          background-color: rgba(25, 32, 71, 0.9);
          color: white;
          padding: 10px;
          border-radius: 5px;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
          line-height: 1.5;
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
        
        /* Component List Styles */
        .component-list-container {
          position: absolute;
          top: 190px;
          left: 10px;
          z-index: 1000;
          background-color: rgba(25, 32, 71, 0.9);
          color: white;
          border-radius: 5px;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          max-height: calc(100vh - 200px);
          display: flex;
          flex-direction: column;
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
        }
        
        .component-item:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .component-item.selected {
          background-color: rgba(255, 255, 255, 0.2);
          font-weight: bold;
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