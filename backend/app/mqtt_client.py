import paho.mqtt.client as mqtt
import os

class MQTTClient:
    def __init__(self):
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        
    def connect(self):
        host = os.getenv('MQTT_BROKER_HOST', 'localhost')
        port = int(os.getenv('MQTT_BROKER_PORT', 1883))
        self.client.connect(host, port, 60)
        self.client.loop_start()

    def on_connect(self, client, userdata, flags, rc):
        print(f"Connected with result code {rc}")
        # Subscribe to relevant topics
        self.client.subscribe("microgrid/data/#")

    def on_message(self, client, userdata, msg):
        print(f"Received message on {msg.topic}: {msg.payload}")
