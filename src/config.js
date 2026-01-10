// MQTT Configuration for HiveMQ Cloud
// Connected directly to ESP32 data (no Node-RED)
export const MQTT_CONFIG = {
  // HiveMQ Cloud WebSocket Secure URL
  brokerUrl: 'wss://d9224a87ae11416ebdfea8fc7ef45621.s1.eu.hivemq.cloud:8884/mqtt',
  
  options: {
    clientId: `web_lpg_${Math.random().toString(16).substr(2, 8)}`,
    username: 'LPG_Detection',
    password: 'Fire@101',
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
  },
  
  // MQTT Topics (matching ESP32 code)
  topicGasValue: 'LPG/gas/value',      // Gas sensor raw value from ESP32
  topicGasStatus: 'LPG/gas/status',    // Gas status (NORMAL or GAS_DETECTED)
  topicMessages: 'LPG/messages'        // Live message log from ESP32
};
