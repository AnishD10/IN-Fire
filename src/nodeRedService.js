class NodeRedService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.messageCallbacks = [];
    this.reconnectInterval = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      console.log('Connecting to Node-RED WebSocket...');
      
      try {
        this.ws = new WebSocket('ws://localhost:1880/gas-data');

        this.ws.onopen = () => {
          console.log('✓ Connected to Node-RED!');
          this.isConnected = true;
          
          // Clear reconnect interval if exists
          if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
          }
          
          resolve();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket Error:', error);
          this.isConnected = false;
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            console.log('Raw WebSocket data:', event.data);
            const data = JSON.parse(event.data);
            console.log('Parsed data from Node-RED:', data);
            
            // Handle both the processed data format and raw message format
            const message = data.message || data.payload || event.data;
            const sensorReading = data.sensorReading || 
                                 (typeof message === 'string' ? parseInt(message.match(/\d+/)?.[0]) : 0) || 0;
            
            // Notify all subscribers
            this.messageCallbacks.forEach(callback => {
              callback({
                topic: data.topic || 'LPG',
                message: message,
                timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
                gasDetected: data.gasDetected || false,
                severity: data.severity || 'normal',
                sensorReading: sensorReading
              });
            });
          } catch (err) {
            console.error('Error parsing message:', err);
            console.error('Raw data was:', event.data);
          }
        };

        this.ws.onclose = () => {
          console.log('Disconnected from Node-RED');
          this.isConnected = false;
          
          // Attempt to reconnect every 5 seconds
          if (!this.reconnectInterval) {
            this.reconnectInterval = setInterval(() => {
              console.log('Attempting to reconnect...');
              this.connect().catch(() => {});
            }, 5000);
          }
        };
      } catch (error) {
        console.error('Connection failed:', error);
        this.isConnected = false;
        reject(error);
      }
    });
  }

  onMessage(callback) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  disconnect() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.isConnected = false;
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export const nodeRedService = new NodeRedService();
