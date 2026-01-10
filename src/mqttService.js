import mqtt from 'mqtt';
import { MQTT_CONFIG } from './config';

class MQTTService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.messageCallbacks = [];
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
        
        // Subscribe to ESP32 data topics
        this.client.subscribe([MQTT_CONFIG.topicGasValue, MQTT_CONFIG.topicGasStatus], (err) => {
          if (err) {
            console.error('Failed to subscribe:', err);
          } else {
            console.log(`✓ Subscribed to ESP32 topics: ${MQTT_CONFIG.topicGasValue} & ${MQTT_CONFIG.topicGasStatus}`);
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
        
        // Parse ESP32 data based on topic
        if (topic === MQTT_CONFIG.topicGasValue) {
          this.gasValue = parseInt(messageStr) || 0;
        } else if (topic === MQTT_CONFIG.topicGasStatus) {
          this.gasStatus = messageStr;
        }
        
        // Notify all subscribers with processed data
        const processedData = {
          sensorReading: this.gasValue,
          gasDetected: this.gasStatus === 'GAS_DETECTED',
          status: this.gasStatus,
          message: this.gasStatus === 'GAS_DETECTED' ? `⚠️ GAS DETECTED! (${this.gasValue} ppm)` : `✓ Safe (${this.gasValue} ppm)`,
          topic,
          timestamp: new Date()
        };
        
        this.messageCallbacks.forEach(callback => {
          callback(processedData);
        });
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
