from flask import Flask, jsonify
from flask_cors import CORS
import paho.mqtt.client as mqtt
import json
from threading import Thread
from collections import defaultdict, deque
from datetime import datetime

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

def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe("#")  # Subscribe to all topics as per the new subscription pattern

def on_message(client, userdata, msg):
    try:
        topic = msg.topic
        payload = json.loads(msg.payload.decode())
        current_time = datetime.utcnow().isoformat()

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
                        "coordinates": {"lat": 0, "lon": 0, "alt": 0},  # Default coordinates
                        "connections": []
                    }

                # Store the measurement
                if measurement_type == "demand":
                    measurements[component_id]["current"].append(payload["value"])
                else:
                    measurements[component_id][measurement_type].append(payload["value"])
                measurements[component_id]["timestamps"].append(current_time)
                print(f"Received {measurement_type} for {component_id}: {payload['value']}")
            else:
                # Handle other components (sources, loads)
                component_id = f"{parts[2]}/{parts[3]}"
                measurement_type = parts[4]
                if component_id in components:
                    if measurement_type == "demand":
                        measurements[component_id]["current"].append(payload["value"])
                    else:
                        measurements[component_id][measurement_type].append(payload["value"])
                    measurements[component_id]["timestamps"].append(current_time)

    except Exception as e:
        print(f"Error processing message: {e}")

# Setup MQTT client with credentials
mqtt_client = mqtt.Client()
mqtt_client.username_pw_set("symergyuser", "SymergyRox!")  # Set username and password
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

def start_mqtt():
    mqtt_client.connect("sssn.us", 1883, 60)  # Update to new broker hostname
    mqtt_client.loop_forever()

mqtt_thread = Thread(target=start_mqtt)
mqtt_thread.daemon = True
mqtt_thread.start()

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"})

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
