from flask import Flask, jsonify, request
from flask_cors import CORS
import paho.mqtt.client as mqtt
import json
from threading import Thread
from collections import defaultdict, deque
from datetime import datetime
import time
import threading

app = Flask(__name__)
CORS(app)

# Store component information
components = {}
components_loaded = False # Have we loaded the microgrid yet?

# Store measurement history for each component
MAX_HISTORY = 100
measurements = defaultdict(lambda: {
    "demand": deque(maxlen=MAX_HISTORY),  # Amps
    "voltage": deque(maxlen=MAX_HISTORY), # Volts
    "power": deque(maxlen=MAX_HISTORY),   # kW
    "energy": deque(maxlen=MAX_HISTORY),  # kWh
    "status": deque(maxlen=MAX_HISTORY),  # bool
    "timestamps": deque(maxlen=MAX_HISTORY)
})

# Add this class directly in main.py instead of importing it
class HealthMonitor(threading.Thread):
    def __init__(self, mqtt_client):
        threading.Thread.__init__(self)
        self.daemon = True
        self.mqtt_client = mqtt_client
        self.last_message_time = time.time()
        self.running = True
        
    def message_received(self):
        """Call this whenever a message is received"""
        self.last_message_time = time.time()
        
    def run(self):
        """Monitor health and restart connections if needed"""
        while self.running:
            try:
                current_time = time.time()
                # If no messages for 30 seconds, reconnect MQTT
                if current_time - self.last_message_time > 30:
                    print("No MQTT messages received for 30 seconds, reconnecting...")
                    try:
                        self.mqtt_client.disconnect()
                        time.sleep(1)
                        self.mqtt_client.reconnect()
                        print("MQTT reconnection attempted")
                    except Exception as e:
                        print(f"Error during MQTT reconnection: {e}")
                
                # Check if Flask is responding
                try:
                    response = requests.get("http://localhost:5000/health", timeout=2)
                    if response.status_code != 200:
                        print(f"Health check failed with status {response.status_code}")
                except Exception as e:
                    print(f"Health check request failed: {e}")
                    
            except Exception as e:
                print(f"Error in health monitor: {e}")
                
            # Sleep for 10 seconds before next check
            time.sleep(10)
            
    def stop(self):
        self.running = False

def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    # More specific subscription instead of "#" which is too broad
    client.subscribe("symergygrid/components/+/+/+")
    client.subscribe("symergygrid/meterstructure")  # Add subscription for meter structure
    client.subscribe("symergygrid/geojson")  # Add subscription for GeoJSON data
    print("Subscribed to component topics")

def on_disconnect(client, userdata, rc):
    print(f"Disconnected with result code {rc}")
    print("Attempting to reconnect...")
    # Will automatically try to reconnect

def on_message(client, userdata, msg):
    try:
        # Update the health monitor
        if health_monitor:
            health_monitor.message_received()
            
        topic = msg.topic
        payload = json.loads(msg.payload.decode())
        current_time = datetime.utcnow().isoformat()

        # Handle GeoJSON data
        if topic == "symergygrid/geojson":
            print(f"Received GeoJSON update")
            # Store the GeoJSON data
            if "geojson" not in components:
                components["geojson"] = {
                    "type": "geojson",
                    "category": "map",
                    "name": "Grid GeoJSON",
                    "data": payload
                }
            else:
                components["geojson"]["data"] = payload
            
            measurements["geojson"]["status"].append(True)
            measurements["geojson"]["timestamps"].append(current_time)
            return

        # Handle meter structure data
        if topic == "symergygrid/meterstructure":
            print(f"Received meter structure update: {payload}")
            # Store the meter structure data
            if "meterstructure" not in components:
                components["meterstructure"] = {
                    "type": "structure",
                    "category": "meter",
                    "name": "Meter Structure",
                    "coordinates": {"lat": 0, "lon": 0, "alt": 0},
                    "connections": [],
                    "structure": payload  # Store the actual structure data
                }
            else:
                components["meterstructure"]["structure"] = payload  # Update existing structure
            measurements["meterstructure"]["status"].append(True)
            measurements["meterstructure"]["timestamps"].append(current_time)
            return

        # Handle component measurements
        parts = topic.split('/')
        if len(parts) >= 4 and parts[1] == "components":
            # For poles, the format is: symergygrid/components/misc/pole67/status
            if parts[2] == "misc" and "pole" in parts[3]:
                component_id = parts[3]  # Just use 'pole67' as the ID
                measurement_type = parts[4]
                
                # Create component if it doesn't exist
                if component_id not in components:
                    components[component_id] = {
                        "type": "misc",
                        "category": "pole",
                        "name": component_id,
                        "coordinates": {"lat": 0, "lon": 0, "alt": 0},
                        "connections": []
                    }

                # Store the measurement
                if measurement_type == "demand":
                    measurements[component_id]["current"].append(payload["value"])
                else:
                    measurements[component_id][measurement_type].append(payload["value"])
                measurements[component_id]["timestamps"].append(current_time)
                print(f"Received {measurement_type} for {component_id}: {payload['value']}")
            
            # Handle sources (format: symergygrid/components/sources/generator0/status)
            elif parts[2] == "sources":
                component_id = f"sources/{parts[3]}"  # e.g., "sources/generator0"
                measurement_type = parts[4]
                
                # Create source component if it doesn't exist
                if component_id not in components:
                    # Determine category from the component name
                    category = next((cat for cat in ["generator", "turbine", "solar", "hydro"] 
                                  if cat in parts[3]), "other")
                    
                    components[component_id] = {
                        "type": "source",
                        "category": category,
                        "name": parts[3].capitalize(),  # e.g., "Generator0"
                        "coordinates": {"lat": 0, "lon": 0, "alt": 0},
                        "connections": []
                    }

                # Store the measurement
                if measurement_type == "demand":
                    measurements[component_id]["demand"].append(payload["value"])
                    measurements[component_id]["current"].append(payload["value"])  # Store in both places
                else:
                    measurements[component_id][measurement_type].append(payload["value"])
                measurements[component_id]["timestamps"].append(current_time)
                print(f"Received {measurement_type} for {component_id}: {payload['value']}")
                
            # Handle loads (format: symergygrid/components/loads/residential0/status)
            elif parts[2] == "loads":
                component_id = f"loads/{parts[3]}"  # e.g., "loads/residential0"
                measurement_type = parts[4]
                
                # Create load component if it doesn't exist
                if component_id not in components:
                    # Determine category from the component name
                    if "residential" in parts[3]:
                        category = "residential"
                        display_name = f"Residential {parts[3].replace('residential', '')}"
                    else:
                        category = "commercial"
                        display_name = parts[3].replace('_', ' ').title()
                    
                    components[component_id] = {
                        "type": "load",
                        "category": category,
                        "name": display_name,
                        "coordinates": {"lat": 0, "lon": 0, "alt": 0},
                        "connections": []
                    }

                # Store the measurement
                if measurement_type == "demand":
                    measurements[component_id]["demand"].append(payload["value"])
                    measurements[component_id]["current"].append(payload["value"])  # Store in both places
                else:
                    measurements[component_id][measurement_type].append(payload["value"])
                measurements[component_id]["timestamps"].append(current_time)
                print(f"Received {measurement_type} for {component_id}: {payload['value']}")

    except Exception as e:
        print(f"Error processing message: {e}")

# Setup MQTT client with credentials and better connection handling
mqtt_client = mqtt.Client(client_id="symergy_server", clean_session=True)
mqtt_client.username_pw_set("symergyuser", "SymergyRox!")
mqtt_client.on_connect = on_connect
mqtt_client.on_disconnect = on_disconnect  # Add disconnect handler
mqtt_client.on_message = on_message

def start_mqtt():
    global health_monitor
    
    # Create health monitor
    health_monitor = HealthMonitor(mqtt_client)
    health_monitor.start()
    
    while True:
        try:
            print("Connecting to MQTT broker...")
            mqtt_client.connect("sssn.us", 1883, 60)
            mqtt_client.loop_forever()
        except Exception as e:
            print(f"MQTT connection error: {e}")
            time.sleep(5)  # Wait before reconnecting

mqtt_thread = Thread(target=start_mqtt)
mqtt_thread.daemon = True
mqtt_thread.start()

@app.route('/health')
def health_check():
    # Check if we've received any MQTT messages
    mqtt_connected = mqtt_client.is_connected()
    last_message_time = health_monitor.last_message_time if health_monitor else 0
    current_time = time.time()
    message_age = current_time - last_message_time
    
    return jsonify({
        "status": "ok" if mqtt_connected and message_age < 30 else "degraded",
        "mqtt_connected": mqtt_connected,
        "components_count": len(components),
        "last_message_age": message_age,
        "server_time": current_time
    })

@app.route('/api/grid/data')
def get_grid_data():
    response_data = {
        "components": components,
        "measurements": {
            comp_id: {
                "current": list(data["demand"]),
                "voltage": list(data["voltage"]),
                "power": list(data["power"]),
                "energy": list(data["energy"]),
                "status": list(data["status"]),
                "timestamps": list(data["timestamps"])
            }
            for comp_id, data in measurements.items()
        }
    }
    return jsonify(response_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
