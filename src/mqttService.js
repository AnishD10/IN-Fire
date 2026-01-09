import mqtt from 'mqtt';
import { MQTT_CONFIG } from './config';

class MQTTService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.messageCallbacks = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      console.log('Connecting to HiveMQ Cloud:', MQTT_CONFIG.brokerUrl);
      
      this.client = mqtt.connect(MQTT_CONFIG.brokerUrl, MQTT_CONFIG.options);

      this.client.on('connect', () => {
        console.log('✓ Connected to HiveMQ Cloud!');
        this.isConnected = true;
        
        // Subscribe to LPG topic
        this.client.subscribe(MQTT_CONFIG.topic, (err) => {
          if (err) {
            console.error('Failed to subscribe:', err);
          } else {
            console.log(`✓ Subscribed to topic: ${MQTT_CONFIG.topic}`);
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
        
        // Notify all subscribers
        this.messageCallbacks.forEach(callback => {
          callback({
            topic,
            message: messageStr,
            timestamp: new Date()
          });
        });
      });

      this.client.on('disconnect', () => {
        console.log('Disconnected from MQTT broker');
        this.isConnected = false;
      });

      this.client.on('reconnect', () => {
        console.log('Reconnecting...');
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
