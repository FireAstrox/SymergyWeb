from flask import Flask, jsonify
from flask_cors import CORS
import paho.mqtt.client as mqtt
import json
from threading import Thread
from collections import deque
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Store measurement history
MAX_HISTORY = 100
measurements = {
    "kWh": deque(maxlen=MAX_HISTORY),
    "A": deque(maxlen=MAX_HISTORY),
    "V": deque(maxlen=MAX_HISTORY),
    "kW": deque(maxlen=MAX_HISTORY),
    "timestamps": deque(maxlen=MAX_HISTORY)
}

def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe("symergygrid/#")

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        current_time = datetime.utcnow().isoformat()
        
        # Store measurement if it's one we're tracking
        if payload["unit"] in ["kWh", "A", "V", "kW"]:
            measurements[payload["unit"]].append(payload["value"])
            
            # Add timestamp only once per set of measurements
            if payload["unit"] == "kWh":  # Use kWh as the trigger for new timestamp
                measurements["timestamps"].append(current_time)
            
            print(f"Received {payload['unit']}: {payload['value']}")
    except Exception as e:
        print(f"Error processing message: {e}")

# Setup MQTT client
mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

# Connect to public MQTT broker
def start_mqtt():
    mqtt_client.connect("test.mosquitto.org", 1883, 60)
    mqtt_client.loop_forever()

# Start MQTT client in background thread
mqtt_thread = Thread(target=start_mqtt)
mqtt_thread.daemon = True
mqtt_thread.start()

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/api/grid/data')
def get_grid_data():
    return jsonify({
        "energy": list(measurements["kWh"]),
        "current": list(measurements["A"]),
        "voltage": list(measurements["V"]),
        "power": list(measurements["kW"]),
        "timestamps": list(measurements["timestamps"])
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
