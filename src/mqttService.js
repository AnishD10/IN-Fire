import mqtt from 'mqtt';
import { MQTT_CONFIG } from './config';

class MQTTService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.sensorCallbacks = [];      // For sensor data (gas value & status)
    this.messageCallbacks = [];     // For log messages
    this.gasValue = 0;
    this.gasStatus = 'NORMAL';
  }

  connect() {
    return new Promise((resolve, reject) => {
      console.log('Connecting to HiveMQ Cloud:', MQTT_CONFIG.brokerUrl);
      
      this.client = mqtt.connect(MQTT_CONFIG.brokerUrl, MQTT_CONFIG.options);

      this.client.on('connect', () => {
        console.log('✓ Connected to HiveMQ Cloud (Direct ESP32 Feed)!');
        this.isConnected = true;
        
        // Subscribe to ALL topics: sensor data + messages
        this.client.subscribe([
          MQTT_CONFIG.topicGasValue, 
          MQTT_CONFIG.topicGasStatus,
          MQTT_CONFIG.topicMessages
        ], (err) => {
          if (err) {
            console.error('Failed to subscribe:', err);
          } else {
            console.log(`✓ Subscribed to: ${MQTT_CONFIG.topicGasValue}, ${MQTT_CONFIG.topicGasStatus}, ${MQTT_CONFIG.topicMessages}`);
          }
        });
        
        resolve();
      });

      this.client.on('error', (error) => {
        console.error('MQTT Error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.client.on('message', (topic, message) => {
        const messageStr = message.toString();
        console.log(`Message from ${topic}:`, messageStr);
        
        // Handle sensor data topics
        if (topic === MQTT_CONFIG.topicGasValue) {
          this.gasValue = parseInt(messageStr) || 0;
          this.publishSensorData();
        } else if (topic === MQTT_CONFIG.topicGasStatus) {
          this.gasStatus = messageStr;
          this.publishSensorData();
        } 
        // Handle message log topic
        else if (topic === MQTT_CONFIG.topicMessages) {
          const logMessage = {
            text: messageStr,
            timestamp: new Date(),
            source: 'ESP32'
          };
          
          this.messageCallbacks.forEach(callback => {
            callback(logMessage);
          });
        }
      });

      this.client.on('disconnect', () => {
        console.log('Disconnected from MQTT broker');
        this.isConnected = false;
      });

      this.client.on('reconnect', () => {
        console.log('Reconnecting to MQTT...');
      });
    });
  }

  // Publish sensor data to subscribers
  publishSensorData() {
    const processedData = {
      sensorReading: this.gasValue,
      gasDetected: this.gasStatus === 'GAS_DETECTED',
      status: this.gasStatus,
      timestamp: new Date()
    };
    
    this.sensorCallbacks.forEach(callback => {
      callback(processedData);
    });

    // Also publish as a message for live messages list
    const statusMessage = {
      text: this.gasStatus === 'GAS_DETECTED' 
        ? `⚠️ GAS DETECTED - PPM: ${this.gasValue}` 
        : `✓ Safe - PPM: ${this.gasValue}`,
      timestamp: new Date(),
      source: 'Sensor',
      gasDetected: this.gasStatus === 'GAS_DETECTED',
      sensorReading: this.gasValue
    };
    
    this.messageCallbacks.forEach(callback => {
      callback(statusMessage);
    });
  }

  onSensor(callback) {
    this.sensorCallbacks.push(callback);
    return () => {
      this.sensorCallbacks = this.sensorCallbacks.filter(cb => cb !== callback);
    };
  }

  onMessage(callback) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.isConnected = false;
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export const mqttService = new MQTTService();
