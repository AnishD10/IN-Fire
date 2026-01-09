// MQTT Configuration for Your HiveMQ Cloud
export const MQTT_CONFIG = {
  // HiveMQ Cloud WebSocket Secure URL (from your Thonny code)
  brokerUrl: 'wss://d9224a87ae11416ebdfea8fc7ef45621.s1.eu.hivemq.cloud:8884/mqtt',
  
  options: {
    clientId: `web_lpg_${Math.random().toString(16).substr(2, 8)}`,
    username: 'LPG_Detection',  // From your Thonny code
    password: 'Fire@101',        // From your Thonny code
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
  },
  
  // MQTT Topic (from your Thonny code)
  topic: 'LPG'  // Your ESP32 publishes to this topic
};
