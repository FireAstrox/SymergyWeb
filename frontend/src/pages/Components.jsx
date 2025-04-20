import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Components = () => {
  const [components, setComponents] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const { componentId } = useParams();

  useEffect(() => {
    let isMounted = true;
    let fetchController = null;
    let lastFetchTime = 0;
    const FETCH_INTERVAL = 1000; // 1 second

    const fetchComponents = async () => {
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
          setComponents(prevComponents => {
            // Only update if data has actually changed
            const prevDataStr = JSON.stringify(prevComponents);
            const newDataStr = JSON.stringify(data.components);
            if (prevDataStr !== newDataStr) {
              return data.components;
            }
            return prevComponents;
          });
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching components:', error);
        }
      }
    };

    // Initial fetch
    fetchComponents();
    
    // Set up polling interval with requestAnimationFrame for smoother updates
    let frameId;
    let lastFrameTime = 0;
    
    const tick = (timestamp) => {
      if (!lastFrameTime) lastFrameTime = timestamp;
      
      const elapsed = timestamp - lastFrameTime;
      
      if (elapsed >= FETCH_INTERVAL) {
        fetchComponents();
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

  // Group and filter components using useMemo
  const filteredGroups = useMemo(() => {
    // First group the components
    const grouped = Object.entries(components).reduce((acc, [id, component]) => {
      if (id === "meterstructure") return acc;
      
      const category = component.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({ id, ...component });
      return acc;
    }, {});

    // Then filter based on search term
    if (!searchTerm) return grouped;

    return Object.entries(grouped).reduce((acc, [category, items]) => {
      const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredItems.length > 0) {
        acc[category] = filteredItems;
      }
      return acc;
    }, {});
  }, [components, searchTerm]);

  // Memoize the search handler
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className="flex h-[calc(100vh-5rem)]">
      {/* Left Sidebar */}
      <div className="w-80 bg-navy-900 text-white p-4 overflow-y-auto border-r border-yellow-500">
        {/* Search Box */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search components..."
            className="w-full bg-navy-800 text-white placeholder-gray-400 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {/* Component List */}
        <div className="space-y-6">
          {Object.entries(filteredGroups).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-2 capitalize text-yellow-500">{category}</h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    to={`/components/${encodeURIComponent(item.id)}`}
                    className={`block p-2 rounded-lg transition-colors ${
                      componentId === item.id
                        ? 'bg-yellow-500 text-navy-900'
                        : 'hover:bg-navy-800'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 overflow-y-auto bg-white">
        {componentId ? (
          <Outlet />
        ) : (
          <div className="flex items-center justify-center h-full text-navy-900">
            <p className="text-xl">Select a component to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Components; 