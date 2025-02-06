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
    client.subscribe("symergygrid/#") # Sub to all incoming data (this may want to be changed)

def on_message(client, userdata, msg):
    try:
        topic = msg.topic
        payload = json.loads(msg.payload.decode())
        current_time = datetime.utcnow().isoformat()

        # Handle meter structure message
        if topic == "symergygrid/meterstructure":
            if not components_loaded:
                components_loaded = True
                for component in payload["components"]:
                    components[component["id"]] = {
                        "type": component["type"],
                        "name": component.get("name", component["id"]),
                        "coordinates": component["coordinates"],
                        "connections": component["connections"]
                    }
                print(f"Updated component information: {len(components)} components")
                return
            else:
                # We can handle prompting the user to change the component structure here.
                print("Attempted to reload component structure after loaded.")

        # Handle component measurements
        # Example topic: symergygrid/components/generator1/demand
        # This may need to be updated to handle metrics (a fifth subtopic)
        parts = topic.split('/')
        if len(parts) == 4 and parts[1] == "components":
            component_id = parts[2]
            measurement_type = parts[3]

            if component_id in components:
                # Units for data will be assumed (even though it is part of the payload)
                measurements[component_id][measurement_type].append(payload["value"])
                measurements[component_id]["timestamps"].append(current_time)
                print(f"Received {measurement_type} for {component_id}: {payload['value']}")

    except Exception as e:
        print(f"Error processing message: {e}")

# Setup MQTT client
mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

def start_mqtt():
    mqtt_client.connect("test.mosquitto.org", 1883, 60)
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
