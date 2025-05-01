"""
Health monitoring system for the Symergy Web backend.
This module implements a background thread that continuously monitors the health of the system's
critical components, specifically the MQTT connection and Flask server.

The HealthMonitor class runs as a daemon thread and performs two main functions:
1. MQTT Connection Monitoring:
   - Tracks the last received MQTT message
   - Automatically attempts to reconnect if no messages are received for 30 seconds
   
2. Flask Server Health Check:
   - Periodically checks if the Flask server is responding
   - Logs any health check failures

This ensures system reliability by automatically recovering from connection issues
and providing early warning of potential system problems.
"""

import threading
import time
import requests
import os

class HealthMonitor(threading.Thread):
    """
    A daemon thread that monitors the health of critical system components.
    Implements automatic recovery for MQTT connection issues and monitors Flask server health.
    """
    def __init__(self, mqtt_client):
        """
        Initialize the health monitor.
        
        Args:
            mqtt_client: The MQTT client instance to monitor and manage
        """
        threading.Thread.__init__(self)
        self.daemon = True  # Thread will exit when main program exits
        self.mqtt_client = mqtt_client
        self.last_message_time = time.time()
        self.running = True
        
    def message_received(self):
        """
        Update the timestamp of the last received MQTT message.
        Should be called whenever a new MQTT message is received.
        """
        self.last_message_time = time.time()
        
    def run(self):
        """
        Main monitoring loop that runs continuously while the thread is active.
        Performs periodic health checks and automatic recovery actions.
        """
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
        """
        Stop the health monitoring thread.
        Sets the running flag to False, which will cause the monitoring loop to exit.
        """
        self.running = False 