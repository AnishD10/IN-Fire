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
            const data = JSON.parse(event.data);
            console.log('Message from Node-RED:', data);
            
            // Notify all subscribers
            this.messageCallbacks.forEach(callback => {
              callback({
                topic: data.topic || 'LPG',
                message: data.message,
                timestamp: new Date(data.timestamp),
                gasDetected: data.gasDetected,
                severity: data.severity
              });
            });
          } catch (err) {
            console.error('Error parsing message:', err);
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
