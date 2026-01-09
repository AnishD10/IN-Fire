# LPG Gas Detection System with Node-RED

Real-time LPG gas detection system using ESP32, HiveMQ Cloud MQTT, Node-RED processing, and React dashboard.

## 🏗️ System Architecture

```
ESP32 (MicroPython) → HiveMQ Cloud (MQTT) → Node-RED (Processing) → React Dashboard
```

### Components

1. **ESP32 Device** - Gas sensor hardware publishing to MQTT
2. **HiveMQ Cloud** - Cloud MQTT broker
3. **Node-RED** - Message processing, logging, and WebSocket server
4. **React Dashboard** - Real-time visualization

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Node-RED MQTT Connection

The Node-RED flow is pre-configured to connect to your HiveMQ Cloud broker. You need to add credentials:

**Option A: Using Node-RED UI (Recommended)**
1. Start Node-RED: `npm run nodered`
2. Open http://localhost:1880/admin
3. Double-click the "Subscribe to LPG" node
4. Click the pencil icon next to "HiveMQ Cloud"
5. Go to "Security" tab
6. Enter:
   - Username: `LPG_Detection`
   - Password: `Fire@101`
7. Click "Update" then "Deploy"

**Option B: Using flows_cred.json**
Create a file named `flows_cred.json` in the project root with:
```json
{
  "hivemq_broker": {
    "user": "LPG_Detection",
    "password": "Fire@101"
  }
}
```

### 3. Start Node-RED

In one terminal:
```bash
npm run nodered
```

Wait for the message: "✓ Node-RED is running on http://localhost:1880"

### 4. Start React Dashboard

In another terminal:
```bash
npm run dev
```

Open http://localhost:5173

## 📡 System Configuration

### MQTT Broker (HiveMQ Cloud)
- **Broker**: `d9224a87ae11416ebdfea8fc7ef45621.s1.eu.hivemq.cloud`
- **Port**: 8883 (MQTTS - secure)
- **Topic**: `LPG`
- **Username**: `LPG_Detection`
- **Password**: `Fire@101`

### Node-RED
- **Editor UI**: http://localhost:1880/admin
- **WebSocket**: ws://localhost:1880/gas-data
- **API Status**: http://localhost:1880/api/status

### React Dashboard
- **Development**: http://localhost:5173
- **Production**: Build with `npm run build`

## 🎨 Node-RED Features

The Node-RED flow provides:

1. **MQTT Subscription** - Receives messages from ESP32 via HiveMQ
2. **Message Processing** - Extracts and enriches gas detection data
3. **WebSocket Server** - Broadcasts processed data to React dashboard
4. **File Logging** - Saves all messages to `gas_detection_log.txt`
5. **HTTP API** - Status endpoint at `/api/status`
6. **Debug Output** - View raw MQTT messages in Node-RED debug panel

### Flow Diagram

```
[MQTT In] → [Process Function] → [WebSocket Out]
                ↓
           [File Logger]
```

## 🔧 Testing

### Test Node-RED Connection

1. Check Node-RED is running: http://localhost:1880/api/status
2. Open Node-RED editor: http://localhost:1880/admin
3. Check debug panel for MQTT messages

### Test Full System

**Method 1: Using Your ESP32**
Run your MicroPython code on ESP32 - messages will flow automatically

**Method 2: Using HiveMQ Web Client**
1. Go to http://www.hivemq.com/demos/websocket-client/
2. Connect with your credentials
3. Publish to topic `LPG` with message: `GAS is DETECTED`
4. Watch Node-RED debug panel and React dashboard

**Method 3: Using Node-RED Inject**
1. Open Node-RED editor
2. Add an "inject" node
3. Configure it to send: `{"payload": "GAS is DETECTED", "topic": "LPG"}`
4. Connect it to "Process Gas Data" node
5. Click the inject button

## 🐛 Troubleshooting

### Node-RED Won't Start

**Error: "Port 1880 already in use"**
- Stop other Node-RED instances: `taskkill /F /IM node.exe` (Windows)
- Or change port in `start-nodered.js`

**Error: "Cannot find module 'node-red'"**
- Run `npm install` again

### Dashboard Shows "Disconnected"

1. **Check Node-RED is running**
   - Visit http://localhost:1880/api/status
   - Should return `{"status":"online"}`

2. **Check WebSocket connection**
   - Open browser console (F12)
   - Look for "Connected to Node-RED!" message
   - If not, check Node-RED is on port 1880

3. **Check MQTT connection in Node-RED**
   - Open http://localhost:1880/admin
   - Look for green "connected" status under MQTT node
   - If red, check credentials

### No Messages Appearing

1. **Check ESP32 is publishing**
   - Monitor serial output in Thonny
   - Should see "Message published" confirmations

2. **Check Node-RED debug panel**
   - Open http://localhost:1880/admin
   - Click debug tab (bug icon on right)
   - Should see raw MQTT messages

3. **Test with manual publish**
   - Use HiveMQ Web Client to publish test message
   - If this works, issue is with ESP32

### MQTT Connection Failed in Node-RED

**Check credentials:**
1. Open Node-RED editor
2. Double-click "Subscribe to LPG" node
3. Edit broker configuration
4. Verify username/password in Security tab
5. Click "Deploy" to save

**Test connection:**
- HiveMQ cluster must be active
- Check firewall isn't blocking port 8883
- Verify broker URL is correct

## 📂 Project Structure

```
IN-Fire/
├── src/
│   ├── App.jsx              # React dashboard (connects to Node-RED)
│   ├── nodeRedService.js    # WebSocket client for Node-RED
│   ├── mqttService.js       # (Legacy - kept for reference)
│   ├── config.js            # MQTT configuration
│   ├── main.jsx             # React entry point
│   └── index.css            # Tailwind styles
├── flows.json               # Node-RED flow configuration
├── settings.js              # Node-RED settings
├── start-nodered.js         # Node-RED startup script
├── node-red-data/           # Node-RED user directory (auto-created)
├── gas_detection_log.txt    # Message log file (auto-created)
├── package.json             # Dependencies and scripts
└── README-NODERED.md        # This file
```

## 🎯 Advantages of Node-RED Integration

### Before (Direct MQTT):
```
ESP32 → HiveMQ Cloud → React Dashboard
```
- Limited processing
- No logging
- Simple pass-through

### After (With Node-RED):
```
ESP32 → HiveMQ Cloud → Node-RED → React Dashboard
```
- ✅ Message processing & enrichment
- ✅ Automatic file logging
- ✅ Multiple output endpoints
- ✅ Visual flow programming
- ✅ Easy to add new features:
  - Email alerts
  - Database storage
  - SMS notifications
  - Multiple dashboards
  - Data analytics
  - Historical charts

## 🚀 Next Steps

### Add Features in Node-RED

1. **Email Alerts**
   - Add "email" node
   - Configure SMTP settings
   - Send alert when gas detected

2. **Database Storage**
   - Add "sqlite" or "mysql" node
   - Store all readings
   - Query historical data

3. **Data Analytics**
   - Add "function" node
   - Calculate averages, trends
   - Detect patterns

4. **Multiple Dashboards**
   - Add more WebSocket outputs
   - Create different views
   - Admin vs. User dashboards

### Customize Flows

1. Open Node-RED editor: http://localhost:1880/admin
2. Drag nodes from left palette
3. Wire them together
4. Click "Deploy" to activate
5. Test in React dashboard

## 📝 Scripts

- `npm run dev` - Start React development server
- `npm run build` - Build React app for production
- `npm run nodered` - Start Node-RED server
- `npm run preview` - Preview production build

## 🔒 Security Notes

- Change default credentials in production
- Use environment variables for secrets
- Enable HTTPS for production
- Implement authentication for Node-RED admin UI
- Use wss:// (secure WebSocket) in production

## 📞 Support

For issues:
1. Check Node-RED debug panel
2. Check browser console (F12)
3. Check Node-RED logs in terminal
4. Verify all services are running

## 🎓 Learning Resources

- Node-RED: https://nodered.org/docs/
- MQTT: https://mqtt.org/
- HiveMQ: https://www.hivemq.com/docs/
- React: https://react.dev/

---

**Ready to go!** Start Node-RED first, then your React dashboard, and watch real-time gas detection data flow through the system! 🔥
