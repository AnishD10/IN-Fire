import { useState, useEffect } from 'react';
import { nodeRedService } from './nodeRedService';
import { mqttService } from './mqttService';
import { Flame, Wifi, WifiOff, AlertTriangle, CheckCircle, Bell, Zap, Wind, Volume2, Gauge } from 'lucide-react';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [gasDetected, setGasDetected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [sensorReading, setSensorReading] = useState(0);
  const [threshold, setThreshold] = useState(300);
  const [lastThresholdTime, setLastThresholdTime] = useState(null);
  const [sensorTestMode, setSensorTestMode] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  
  // Component Status States
  const [components, setComponents] = useState({
    ledGreen: { active: false, label: 'LED Green (Safe)' },
    ledRed: { active: false, label: 'LED Red (Danger)' },
    buzzer: { active: false, label: 'Buzzer (Alarm)' },
    exhaustFan: { active: false, label: 'Exhaust Fan (Relay)' },
    mq2Sensor: { active: false, label: 'MQ2 Sensor' },
    esp32: { active: false, label: 'ESP32 Microcontroller' }
  });

  // Load persisted messages on first render
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lpg_messages');
      const savedLast = localStorage.getItem('lpg_last_message');
      if (saved) {
        const parsed = JSON.parse(saved);
        const restored = parsed.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(restored);
        if (restored.length > 0) {
          setLastMessage(restored[0]);
        } else if (savedLast) {
          const lm = JSON.parse(savedLast);
          setLastMessage({ ...lm, timestamp: new Date(lm.timestamp) });
        }
      } else if (savedLast) {
        const lm = JSON.parse(savedLast);
        setLastMessage({ ...lm, timestamp: new Date(lm.timestamp) });
      }
    } catch (e) {
      console.error('Failed to restore messages', e);
    }
  }, []);

  useEffect(() => {
    // Connect to Node-RED WebSocket
    nodeRedService.connect()
      .then(() => {
        setIsConnected(true);
      })
      .catch((error) => {
        console.error('Connection failed:', error);
        setIsConnected(false);
      });

    // Connect to MQTT for publishing last message across devices
    mqttService.connect()
      .then(() => {
        console.log('✓ MQTT Connected for shared last message');
      })
      .catch((error) => {
        console.error('MQTT connection failed:', error);
      });

    // Listen for messages from Node-RED
    const unsubscribe = nodeRedService.onMessage((data) => {
      console.log('Received:', data);
      
      // Extract sensor reading (PPM value)
      const reading = data.sensorReading || parseInt(data.message.match(/\d+/)?.[0]) || 0;
      setSensorReading(reading);
      
      // Use processed data from Node-RED
      const isDanger = data.gasDetected || reading > threshold;
      setGasDetected(isDanger);
      setLastUpdate(data.timestamp);
      
      // Track when gas exceeds threshold
      if (isDanger && !gasDetected) {
        setLastThresholdTime(new Date());
      }
      
      // Update component status based on sensor reading (only in non-test mode)
      if (!sensorTestMode) {
        setComponents(prev => ({
          ...prev,
          ledGreen: { ...prev.ledGreen, active: !isDanger },
          ledRed: { ...prev.ledRed, active: isDanger },
          buzzer: { ...prev.buzzer, active: isDanger },
          exhaustFan: { ...prev.exhaustFan, active: isDanger },
          mq2Sensor: { ...prev.mq2Sensor, active: true },
          esp32: { ...prev.esp32, active: true }
        }));
      }
      
      // Add to messages list (keep last 10)
      const entry = {
        id: Date.now(),
        ...data
      };
      setLastMessage(entry);
      
      // Publish last message to MQTT so ALL devices receive it (with retain flag)
      mqttService.publishLastMessage(entry);
      
      setMessages(prev => {
        const next = [entry, ...prev].slice(0, 10);
        try {
          localStorage.setItem('lpg_messages', JSON.stringify(next));
          localStorage.setItem('lpg_last_message', JSON.stringify(entry));
        } catch (e) {
          console.error('Failed to persist messages', e);
        }
        return next;
      });
    });

    return () => {
      unsubscribe();
      nodeRedService.disconnect();
      mqttService.disconnect();
    };
  }, [gasDetected, threshold, sensorTestMode]);

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-orange-500 p-3 rounded-xl">
                  <Flame className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    LPG Gas Detection System
                  </h1>
                  <p className="text-blue-200">Real-time Monitoring via Node-RED</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-blue-800/50 px-4 py-2 rounded-lg">
                {isConnected ? (
                  <>
                    <Wifi className="w-6 h-6 text-green-400" />
                    <span className="text-green-400 font-semibold">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-6 h-6 text-red-400" />
                    <span className="text-red-400 font-semibold">Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Gas Status Card */}
          <div className={`lg:col-span-2 rounded-2xl shadow-2xl p-8 transition-all duration-300 ${
            gasDetected 
              ? 'bg-red-900/30 border-4 border-red-500 animate-pulse' 
              : 'bg-green-900/30 border-4 border-green-500'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Gas Status</h2>
              {gasDetected ? (
                <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
              ) : (
                <CheckCircle className="w-12 h-12 text-green-500" />
              )}
            </div>
            
            <div className="text-center py-8">
              <div className={`text-6xl font-bold mb-4 ${
                gasDetected ? 'text-red-500' : 'text-green-500'
              }`}>
                {gasDetected ? 'DANGER' : 'SAFE'}
              </div>
              
              <div className={`text-2xl font-semibold ${
                gasDetected ? 'text-red-300' : 'text-green-300'
              }`}>
                {gasDetected ? '⚠️ GAS DETECTED!' : '✓ No Gas Detected'}
              </div>
              
              {lastUpdate && (
                <div className="mt-6 text-gray-400 text-sm">
                  Last update: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
            </div>

            {gasDetected && (
              <div className="mt-6 bg-red-900/50 border border-red-700 rounded-lg p-4">
                <p className="text-red-300 font-semibold text-center">
                  🚨 ALERT: Evacuate area immediately!
                </p>
              </div>
            )}
          </div>

          {/* Sensor Reading Card */}
          <div className="bg-slate-800/50 border-2 border-slate-600 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Gauge className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">MQ2 Sensor Reading</h2>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-yellow-400 mb-2">
                  {sensorReading}
                </div>
                <p className="text-gray-400 text-sm">PPM (Parts Per Million)</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Threshold</span>
                  <span className="text-white">{threshold} PPM</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      sensorReading > threshold ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((sensorReading / threshold) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-center py-2 bg-slate-700/50 rounded-lg">
                <p className="text-xs text-gray-400">Status</p>
                <p className={`font-semibold ${
                  sensorReading > threshold ? 'text-red-400' : 'text-green-400'
                }`}>
                  {sensorReading > threshold ? 'EXCEEDS THRESHOLD' : 'SAFE LEVEL'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Component Status Section */}
        <div className="mt-6 bg-slate-800/50 border-2 border-slate-600 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Zap className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Hardware Components</h2>
            </div>
            <button
              onClick={() => setSensorTestMode(!sensorTestMode)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                sensorTestMode
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {sensorTestMode ? '🧪 Test Mode ON' : '🧪 Test Mode'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(components).map(([key, component]) => (
              <div 
                key={key}
                className={`p-4 rounded-lg border-2 transition-all ${
                  component.active
                    ? 'bg-green-900/20 border-green-500 shadow-lg shadow-green-500/50'
                    : 'bg-slate-700/30 border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{component.label}</p>
                    <p className={`text-xs mt-2 font-semibold ${
                      component.active ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      {component.active ? '✓ ACTIVE' : '✗ INACTIVE'}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    component.active ? 'bg-green-500 animate-pulse' : 'bg-slate-600'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>

          {sensorTestMode && (
            <div className="mt-6 bg-orange-900/20 border-2 border-orange-600 rounded-lg p-4">
              <p className="text-orange-300 font-semibold mb-4">🧪 Test Mode: Simulate Sensor Readings</p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSensorReading(150);
                    setGasDetected(false);
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-semibold"
                >
                  Test Safe Level (150 PPM)
                </button>
                <button
                  onClick={() => {
                    setSensorReading(400);
                    setGasDetected(true);
                    setLastThresholdTime(new Date());
                  }}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-semibold"
                >
                  Test Danger Level (400 PPM)
                </button>
                <button
                  onClick={() => {
                    setSensorReading(0);
                    setGasDetected(false);
                  }}
                  className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all text-sm font-semibold"
                >
                  Reset to 0 PPM
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Last Threshold Alert */}
        {lastThresholdTime && (
          <div className="mt-6 bg-yellow-900/20 border-2 border-yellow-600 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Last Threshold Exceedance</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Time Detected</p>
                <p className="text-yellow-300 font-mono">{lastThresholdTime.toLocaleTimeString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Date</p>
                <p className="text-yellow-300 font-mono">{lastThresholdTime.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Minutes Ago</p>
                <p className="text-yellow-300 font-mono">
                  {Math.floor((new Date() - lastThresholdTime) / 60000)} min
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages Panel */}
          <div className="bg-slate-800/50 border-2 border-slate-600 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Live Messages</h2>
              <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                {messages.length}
              </span>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {messages.length === 0 ? (
                lastMessage ? (
                  <div 
                    className={`p-4 rounded-lg border-l-4 ${
                      lastMessage.gasDetected
                        ? 'bg-red-900/20 border-red-500'
                        : 'bg-blue-900/20 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-semibold text-lg">
                          {lastMessage.message}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          PPM: {lastMessage.sensorReading || 'N/A'}
                        </p>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {lastMessage.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Most recent received</p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Waiting for messages from ESP32...</p>
                    <p className="text-sm mt-2">Topic: <code className="bg-slate-700 px-2 py-1 rounded">LPG</code></p>
                  </div>
                )
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      msg.gasDetected
                        ? 'bg-red-900/20 border-red-500'
                        : 'bg-blue-900/20 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-semibold text-lg">
                          {msg.message}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          PPM: {msg.sensorReading || 'N/A'}
                        </p>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Info Card */}
          <div className="bg-slate-800/50 border-2 border-slate-600 rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">System Information</h2>
            <div className="space-y-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">MQTT Broker</p>
                <p className="text-white font-mono text-sm break-all">
                  d9224a87ae11416ebdfea8fc7ef45621.s1.eu.hivemq.cloud
                </p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Topic</p>
                <p className="text-white font-mono">LPG</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Connection Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <p className="text-white font-semibold">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Total Messages Received</p>
                <p className="text-white font-bold text-2xl">{messages.length}</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-400 text-sm">
        <p>LPG Gas Detection System © 2026 | ESP32 + HiveMQ Cloud</p>
      </footer>
    </div>
  );
}

export default App;
