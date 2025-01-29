# SymergyWeb
The Web Portion of the Symergy Project

Test Command for MQTT

docker exec mosquitto mosquitto_pub -h localhost -t "grid/data" -m '{"voltage": 220.5, "current": 10.2, "power": 2249.1, "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}'