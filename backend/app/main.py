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

# Store measurement history for each component
MAX_HISTORY = 100
measurements = defaultdict(lambda: {
    "demand": deque(maxlen=MAX_HISTORY),
    "voltage": deque(maxlen=MAX_HISTORY),
    "power": deque(maxlen=MAX_HISTORY),
    "energy": deque(maxlen=MAX_HISTORY),
    "status": deque(maxlen=MAX_HISTORY),
    "timestamps": deque(maxlen=MAX_HISTORY)
})

def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe("symergygrid/#")

def on_message(client, userdata, msg):
    try:
        topic = msg.topic
        payload = json.loads(msg.payload.decode())
        current_time = datetime.utcnow().isoformat()

        # Handle meter structure message
        if topic == "symergygrid/meterstructure":
            for component in payload["components"]:
                components[component["id"]] = {
                    "type": component["type"],
                    "name": component.get("name", component["id"]),
                    "coordinates": component["coordinates"]
                }
            print(f"Updated component information: {len(components)} components")
            return

        # Handle component measurements
        # Example topic: symergygrid/components/generator1/demand
        parts = topic.split('/')
        if len(parts) == 4 and parts[1] == "components":
            component_id = parts[2]
            measurement_type = parts[3]

            if component_id in components:
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
