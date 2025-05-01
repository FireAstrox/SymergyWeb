"""
MQTT Client implementation for the Symergy Web system.
This module provides a wrapper around the Paho MQTT client library to handle
real-time communication with the microgrid system's MQTT broker.

The MQTTClient class manages the connection to the MQTT broker and handles
message subscriptions and callbacks for incoming messages. It uses environment
variables for configuration to support different deployment environments.
"""

import paho.mqtt.client as mqtt
import os

class MQTTClient:
    """
    A wrapper class for the Paho MQTT client that handles connection management
    and message handling for the microgrid system.
    """
    def __init__(self):
        """
        Initialize the MQTT client with default callbacks for connection and message handling.
        """
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        
    def connect(self):
        """
        Connect to the MQTT broker using configuration from environment variables.
        Falls back to default values (localhost:1883) if environment variables are not set.
        """
        host = os.getenv('MQTT_BROKER_HOST', 'localhost')
        port = int(os.getenv('MQTT_BROKER_PORT', 1883))
        self.client.connect(host, port, 60)  # 60 second keepalive
        self.client.loop_start()  # Start the network loop in a background thread

    def on_connect(self, client, userdata, flags, rc):
        """
        Callback function called when the client connects to the broker.
        
        Args:
            client: The MQTT client instance
            userdata: User data passed to the client
            flags: Response flags from the broker
            rc: Result code from the connection attempt
        """
        print(f"Connected with result code {rc}")
        # Subscribe to relevant topics
        self.client.subscribe("microgrid/data/#")  # Subscribe to all microgrid data topics

    def on_message(self, client, userdata, msg):
        """
        Callback function called when a message is received from the broker.
        
        Args:
            client: The MQTT client instance
            userdata: User data passed to the client
            msg: The received message containing topic and payload
        """
        print(f"Received message on {msg.topic}: {msg.payload}")
