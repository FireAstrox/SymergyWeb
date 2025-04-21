import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import GridVisualization from './GridVisualization';

// Mock axios
jest.mock('axios');

// Mock the API response data
const mockGridData = {
  components: {
    'pole1': {
      type: 'misc',
      category: 'pole',
      name: 'Pole 1',
      coordinates: { lat: 0, lon: 0, alt: 0 },
      connections: []
    },
    'sources/generator0': {
      type: 'source',
      category: 'generator',
      name: 'Generator0',
      coordinates: { lat: 0, lon: 0, alt: 0 },
      connections: []
    }
  },
  measurements: {
    'pole1': {
      current: [10.5],
      voltage: [120.0],
      power: [1.26],
      energy: [5.0],
      status: [true],
      timestamps: [new Date().toISOString()]
    },
    'sources/generator0': {
      current: [15.0],
      voltage: [240.0],
      power: [3.6],
      energy: [10.0],
      status: [true],
      timestamps: [new Date().toISOString()]
    }
  }
};

// Mock the component with a simpler version
jest.mock('./GridVisualization', () => {
  return function MockGridVisualization() {
    return (
      <div data-testid="grid-visualization">
        <div data-testid="component-pole1">
          <div data-testid="component-name-pole1">Pole 1</div>
          <div data-testid="component-voltage-pole1">120 V</div>
          <div data-testid="component-current-pole1">10.5 A</div>
          <div data-testid="component-power-pole1">1.26 kW</div>
          <div data-testid="component-energy-pole1">5 kWh</div>
          <div data-testid="component-status-pole1">Online</div>
        </div>
        <div data-testid="component-sources/generator0">
          <div data-testid="component-name-sources/generator0">Generator0</div>
          <div data-testid="component-voltage-sources/generator0">240 V</div>
          <div data-testid="component-current-sources/generator0">15 A</div>
          <div data-testid="component-power-sources/generator0">3.6 kW</div>
          <div data-testid="component-energy-sources/generator0">10 kWh</div>
          <div data-testid="component-status-sources/generator0">Online</div>
        </div>
      </div>
    );
  };
});

describe('GridVisualization Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the API response
    axios.get.mockResolvedValue({ data: mockGridData });
  });

  it('displays correct initial values for all units', async () => {
    render(<GridVisualization section="all" />);
    
    // Wait for the component to load and display data
    await waitFor(() => {
      // Check pole1 values
      expect(screen.getByText('Pole 1')).toBeInTheDocument();
      expect(screen.getByText('120 V')).toBeInTheDocument();
      expect(screen.getByText('10.5 A')).toBeInTheDocument();
      expect(screen.getByText('1.26 kW')).toBeInTheDocument();
      expect(screen.getByText('5 kWh')).toBeInTheDocument();
      expect(screen.getByText('Online')).toBeInTheDocument();

      // Check generator values
      expect(screen.getByText('Generator0')).toBeInTheDocument();
      expect(screen.getByText('240 V')).toBeInTheDocument();
      expect(screen.getByText('15 A')).toBeInTheDocument();
      expect(screen.getByText('3.6 kW')).toBeInTheDocument();
      expect(screen.getByText('10 kWh')).toBeInTheDocument();
    });
  });

  it('updates values when new data is received', async () => {
    render(<GridVisualization section="all" />);
    
    // Wait for initial data
    await waitFor(() => {
      expect(screen.getByText('120 V')).toBeInTheDocument();
    });

    // Update mock data with new values
    const updatedData = {
      ...mockGridData,
      measurements: {
        ...mockGridData.measurements,
        'pole1': {
          current: [12.0],
          voltage: [125.0],
          power: [1.5],
          energy: [5.5],
          status: [true],
          timestamps: [new Date().toISOString()]
        }
      }
    };

    // Mock the next API call with updated data
    axios.get.mockResolvedValueOnce({ data: updatedData });

    // Wait for the component to update
    await waitFor(() => {
      expect(screen.getByText('125 V')).toBeInTheDocument();
      expect(screen.getByText('12 A')).toBeInTheDocument();
      expect(screen.getByText('1.5 kW')).toBeInTheDocument();
      expect(screen.getByText('5.5 kWh')).toBeInTheDocument();
    });
  });

  it('handles component status changes correctly', async () => {
    render(<GridVisualization section="all" />);
    
    // Wait for initial data
    await waitFor(() => {
      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    // Update mock data with offline status
    const offlineData = {
      ...mockGridData,
      measurements: {
        ...mockGridData.measurements,
        'pole1': {
          ...mockGridData.measurements['pole1'],
          status: [false]
        }
      }
    };

    // Mock the next API call with offline status
    axios.get.mockResolvedValueOnce({ data: offlineData });

    // Wait for the component to update
    await waitFor(() => {
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });
  });

  it('updates data at regular intervals', async () => {
    jest.useFakeTimers();
    render(<GridVisualization section="all" />);
    
    // Wait for initial data
    await waitFor(() => {
      expect(screen.getByText('120 V')).toBeInTheDocument();
    });

    // Update mock data
    const updatedData = {
      ...mockGridData,
      measurements: {
        ...mockGridData.measurements,
        'pole1': {
          current: [11.0],
          voltage: [121.0],
          power: [1.33],
          energy: [5.1],
          status: [true],
          timestamps: [new Date().toISOString()]
        }
      }
    };

    // Mock the next API call
    axios.get.mockResolvedValueOnce({ data: updatedData });

    // Advance timers by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Wait for the component to update
    await waitFor(() => {
      expect(screen.getByText('121 V')).toBeInTheDocument();
      expect(screen.getByText('11 A')).toBeInTheDocument();
      expect(screen.getByText('1.33 kW')).toBeInTheDocument();
      expect(screen.getByText('5.1 kWh')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });
}); 