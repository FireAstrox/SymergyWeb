# SymergyWeb - Microgrid Visualization Platform

SymergyWeb is a comprehensive web application for visualizing and monitoring microgrid systems. It provides real-time data visualization of electrical components including power sources, loads, and distribution infrastructure.

![SymergyWeb Dashboard]()

## Features

- **Real-time monitoring** of microgrid components via MQTT
- **Interactive visualization** of power sources, loads, and distribution poles
- **Detailed component views** with historical data charts for voltage, current, power, and energy
- **Responsive design** that works on desktop and mobile devices
- **Status indicators** for component health and operational state
- **Categorized views** for easy navigation between different component types
- **Map visualization** showing the geographical layout of the microgrid
- **Component categorization** by type (residential, commercial, industrial, municipal)

## Architecture

SymergyWeb consists of two main components:

1. **Backend**: A Flask server that connects to an MQTT broker to receive real-time data from the microgrid
2. **Frontend**: A React application that visualizes the data and provides an interactive user interface

## Prerequisites

- Python (v3.8+)
- Docker (v20.10+)
- Docker Compose (v2.0+)
- MQTT broker (This project uses Mosquitto)

## Development

### Docker Deployment

1. Build and start the containers:
   ```bash
   docker compose up -d
   ```

2. The application will be available at `http://localhost:3000`

## Production Deployment

### Docker on a Virtual Private Server

1. Clone the repository on your VPS:
   ```bash
   git clone https://github.com/yourusername/symergyweb.git
   cd symergyweb
   ```

2. Create a `.env` file with production settings:
   ```
   MQTT_BROKER=your-mqtt-broker-address
   MQTT_PORT=1883
   MQTT_USERNAME=your-mqtt-username
   MQTT_PASSWORD=your-mqtt-password
   ```

3. Build and start the containers [^note]:

   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

4. The application will be available at `https://your-server-ip`

[^note]: This docker-compose.prod.yml file has not been tested and is not gauranteed to work

## MQTT Configuration

##### For the full document please reference symergyweb/MQTT STANDARD/mqtt_standard.md

The system expects MQTT messages in the following format:

Topic: symergygrid/components/{type}/{component_id}/{measurement_type}
Payload: {"value": 123.45, "timestamp": "2023-04-01T12:34:56Z"}

Where:
- `type`: "sources", "loads", or "poles"
- `component_id`: Unique identifier for the component
- `measurement_type`: "voltage", "demand", "power", "energy", or "status"

The system also receives meter structure data via:

Topic: symergygrid/meterstructure
Payload: {"components":[{"category":"hydro","connections":[],"coordinates":{"alt":0,"lat":61.7842926,"lon":-156.5863759},"id":"hydro_plant","name":"hydro_plant","type":"source"}, ...]}

This structure defines all components in the microgrid, their categories, connections, and geographical coordinates.

Example test command:
```bash
mosquitto_pub -h localhost -p 1883 -t "symergygrid/components/loads/residential0/voltage" -m '{"value": 120.5, "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}'
```

## Key Components

### Backend (Flask)

The backend (`backend/app/main.py`) handles:
- MQTT connection and message processing
- Data storage and management
- REST API endpoints for the frontend
- Component categorization and structure

### Frontend (React)

The frontend consists of several key components:

#### Pages
- **Dashboard** (`frontend/src/pages/Dashboard.jsx`): Main dashboard with grid visualization
- **MapView** (`frontend/src/pages/MapView.jsx`): Geographical visualization of the microgrid
- **Components** (`frontend/src/pages/Components.jsx`): List of all components
- **ComponentDetails** (`frontend/src/pages/ComponentDetails.jsx`): Detailed view of a specific component

#### Components
- **Layout** (`frontend/src/components/Layout.jsx`): Main application layout with navigation
- **GridVisualization** (`frontend/src/components/GridVisualization.jsx`): Card-based visualization of grid components

#### SVG Icons
The application uses custom SVG icons for different component types:
- `frontend/src/svg/pole_icon.svg`: Distribution poles
- `frontend/src/svg/house_icon.svg`: Residential loads
- `frontend/src/svg/big_house_icon.svg`: Commercial/municipal loads
- `frontend/src/svg/industrial.svg`: Industrial loads
- `frontend/src/svg/generator.svg`: Generator sources
- `frontend/src/svg/hydro.svg`: Hydro power sources
- `frontend/src/svg/solar.svg`: Solar power sources
- `frontend/src/svg/wind_icon.svg`: Wind power sources

## Development

### Project Structure

```
symergyweb/
├── backend/
│   ├── app/
│   │   ├── main.py          # Main Flask application
│   │   └── requirements.txt # Python dependencies
│   └── Dockerfile           # Backend Docker configuration
├── frontend/
│   ├── public/              # Static assets
│   │   ├── components/      # React components
│   │   │   ├── GridVisualization.jsx  # Grid component visualization
│   │   │   └── Layout.jsx   # Main application layout
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.jsx          # Main dashboard
│   │   │   ├── MapView.jsx            # Map visualization
│   │   │   ├── Components.jsx         # Component list
│   │   │   └── ComponentDetails.jsx   # Component details
│   │   ├── svg/             # SVG icons for different component types
│   │   ├── App.jsx          # Main application component
│   │   └── index.js         # Application entry point
│   ├── package.json         # Frontend dependencies
│   └── Dockerfile           # Frontend Docker configuration
└── docker-compose.yml       # Docker Compose configuration
```

### Component Categories

The system supports several component categories:

1. **Sources**:
   - `hydro`: Hydroelectric power plants
   - `solar`: Solar panels
   - `wind`: Wind turbines
   - `diesel`: Diesel generators

2. **Loads**:
   - `residential`: Residential buildings
   - `commercial`: Commercial buildings
   - `industrial`: Industrial facilities (e.g., lumber mill)
   - `municipal`: Public infrastructure (e.g., airport, town hall, water pump)

3. **Distribution**:
   - `pole`: Power distribution poles

### Adding New Features

1. **New Component Types**: 
   - Add new SVG icons to `frontend/src/svg/`
   - Update the `ComponentCard` in `GridVisualization.jsx`
   - Add category detection in `backend/app/main.py`

2. **New Measurements**: 
   - Update the backend's `measurements` structure in `main.py`
   - Add corresponding visualization in the frontend

3. **Map Customization**:
   - Modify the styling in `MapView.jsx` to change how components appear on the map
   - Update the GeoJSON processing to add new features

## Environment Variables

The backend uses the following environment variables:

- `MQTT_BROKER`: MQTT broker address
- `MQTT_PORT`: MQTT broker port (default: 1883)
- `MQTT_USERNAME`: MQTT username
- `MQTT_PASSWORD`: MQTT password

You can set these variables in a `.env` file in the backend directory or through your deployment environment.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments


For questions or support, please open an issue on the GitHub repository.