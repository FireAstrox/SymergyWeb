import threading
import time
import requests
import os

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