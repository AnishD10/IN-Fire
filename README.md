# LPG Gas Detection System - Frontend

Real-time LPG gas detection dashboard that displays messages from ESP32 via HiveMQ Cloud.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## 📡 System Architecture

```
ESP32 (Thonny) → HiveMQ Cloud (MQTT) → React Dashboard
```

### Your Configuration

- **MQTT Broker**: `d9224a87ae11416ebdfea8fc7ef45621.s1.eu.hivemq.cloud`
- **Port**: 8884 (WSS - WebSocket Secure)
- **Topic**: `LPG`
- **Username**: `LPG_Detection`
- **Password**: `Fire@101`

## 📋 How It Works

1. **ESP32 (Thonny)** publishes messages to topic `LPG`
2. **HiveMQ Cloud** receives and distributes messages
3. **React Dashboard** subscribes to `LPG` topic and displays messages in real-time

## 🎨 Features

- ✅ **Real-time Message Display** - Shows live messages from ESP32
- ✅ **Gas Detection Status** - Visual alerts when gas is detected
- ✅ **Connection Status** - Shows if connected to HiveMQ Cloud
- ✅ **Message History** - Keeps last 10 messages
- ✅ **Responsive Design** - Works on all devices

## 🔧 Testing

### Test Without ESP32

You can test the dashboard by publishing messages manually:

**Option 1: Using HiveMQ Web Client**
1. Go to http://www.hivemq.com/demos/websocket-client/
2. Connect with your credentials
3. Publish to topic `LPG` with message `GAS is DETECTED`

**Option 2: Using MQTT.fx or MQTT Explorer**
1. Download MQTT client
2. Connect to your HiveMQ cluster
3. Publish messages to topic `LPG`

### Test With Your ESP32

Just run your Thonny code! The dashboard will automatically display messages.

## 🐛 Troubleshooting

### Dashboard Shows "Disconnected"

1. **Check browser console** (F12) for errors
2. **Verify credentials** in `src/config.js`
3. **Check HiveMQ cluster** is active
4. **Test connection** using HiveMQ Web Client first

### Messages Not Appearing

1. **Verify ESP32 is publishing** - Check Thonny serial output
2. **Check topic name** - Must be exactly `LPG` (case-sensitive)
3. **Check browser console** - Should show "Message from LPG: ..."

### Common Errors

**WebSocket connection failed:**
- Ensure using `wss://` (not `ws://`) for port 8884
- Check firewall/antivirus settings

**Authentication failed:**
- Verify username and password are correct
- Check HiveMQ Cloud credentials

## 📂 Project Structure

```
IN-Fire/
├── src/
│   ├── App.jsx           # Main dashboard component
│   ├── main.jsx          # React entry point
│   ├── index.css         # Global styles
│   ├── config.js         # MQTT configuration
│   └── mqttService.js    # MQTT client service
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔐 Security Note

⚠️ **Production Use**: 
- Move credentials to environment variables
- Use `.env` file (not committed to git)
- Implement proper authentication

## 📝 Message Format

Your ESP32 sends:
```python
payload = b"GAS is DETECTED"
```

The dashboard detects gas when message contains both "gas" and "detected" (case-insensitive).

## 🎯 Next Steps

- [ ] Add database to store message history
- [ ] Add email/SMS notifications
- [ ] Add user authentication
- [ ] Add charts and graphs
- [ ] Add mobile app support

## 📞 Support

If you encounter issues:
1. Check browser console (F12)
2. Check Thonny serial output
3. Verify HiveMQ Cloud is active
4. Test with HiveMQ Web Client first

---

**Built with React + Vite + Tailwind CSS + MQTT.js**
