from flask import Flask, jsonify
from flask_cors import CORS
import paho.mqtt.client as mqtt
import json
from threading import Thread

app = Flask(__name__)
CORS(app)

# Store latest grid data
grid_data = {
    "voltage": 0,
    "current": 0,
    "power": 0,
    "timestamp": None
}

# MQTT callbacks
def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    # Subscribe to grid data topic
    client.subscribe("grid/data")

def on_message(client, userdata, msg):
    global grid_data
    try:
        # Parse incoming MQTT message
        payload = json.loads(msg.payload.decode())
        grid_data.update(payload)
        print(f"Received grid data: {payload}")
    except Exception as e:
        print(f"Error processing message: {e}")

# Setup MQTT client
mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

# Connect to MQTT broker
def start_mqtt():
    mqtt_client.connect("mosquitto", 1883, 60)
    mqtt_client.loop_forever()

# Start MQTT client in background thread
mqtt_thread = Thread(target=start_mqtt)
mqtt_thread.daemon = True
mqtt_thread.start()

@app.route('/api/status')
def status():
    return jsonify({"status": "ok"})

@app.route('/api/grid/data')
def get_grid_data():
    return jsonify(grid_data)

@app.route('/health')
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
