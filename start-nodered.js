const http = require('http');
const express = require('express');
const RED = require('node-red');

// Create an Express app
const app = express();

// Create a server
const server = http.createServer(app);

// Create the settings object
const settings = {
  httpAdminRoot: '/admin',
  httpNodeRoot: '/',
  userDir: './node-red-data/',
  flowFile: 'flows.json',
  flowFilePretty: true,
  uiPort: 1880,
  functionGlobalContext: {},
  credentialSecret: 'lpg-detection-secret',
  httpNodeCors: {
    origin: '*',
    methods: 'GET,PUT,POST,DELETE'
  },
  logging: {
    console: {
      level: 'info',
      metrics: false,
      audit: false
    }
  }
};

// Initialise the runtime with a server and settings
RED.init(server, settings);

// Serve the editor UI from /admin
app.use(settings.httpAdminRoot, RED.httpAdmin);

// Serve the http nodes UI from /
app.use(settings.httpNodeRoot, RED.httpNode);

// Start the runtime
RED.start();

server.listen(1880, () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Node-RED for LPG Gas Detection System   ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  console.log('✓ Node-RED is running on http://localhost:1880');
  console.log('✓ Editor UI: http://localhost:1880/admin');
  console.log('✓ WebSocket: ws://localhost:1880/gas-data');
  console.log('✓ API Status: http://localhost:1880/api/status');
  console.log('');
  console.log('Architecture:');
  console.log('ESP32 → HiveMQ Cloud → Node-RED → React Dashboard');
  console.log('');
  console.log('Press Ctrl+C to stop Node-RED');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  RED.stop();
  process.exit();
});
