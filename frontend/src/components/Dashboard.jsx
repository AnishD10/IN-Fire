import { useState, useEffect } from 'react'

export default function Dashboard({ gasData, loading, onAlert }) {
  const [prevValue, setPrevValue] = useState(null)
  const THRESHOLD = 1200

  // Check for status change
  useEffect(() => {
    if (!gasData) return

    if (prevValue !== gasData.status) {
      if (gasData.status === 'GAS_DETECTED') {
        onAlert('⚠️ GAS LEAKAGE DETECTED!', 'danger')
        onAlert('📧 Alert emails being sent to all subscribers...', 'warning')
      } else {
        onAlert('✅ Gas level returned to normal', 'success')
      }
      setPrevValue(gasData.status)
    }
  }, [gasData?.status])

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 animate-pulse">
        <div className="h-12 bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-8 bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (!gasData) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-gray-400">
        No data available
      </div>
    )
  }

  const isGasDetected = gasData.status === 'GAS_DETECTED'
  const statusColor = isGasDetected ? 'text-red-500' : 'text-green-500'
  const bgColor = isGasDetected ? 'bg-red-900 bg-opacity-10 border-red-700' : 'bg-green-900 bg-opacity-10 border-green-700'
  const alertClass = isGasDetected ? 'animate-pulse' : ''

  return (
    <div className={`rounded-xl border ${bgColor} p-8 ${alertClass}`}>
      <h2 className="text-2xl font-bold text-white mb-8">📊 Real-Time Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gas Value Card */}
        <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
          <h3 className="text-gray-300 text-sm font-semibold mb-4">CURRENT GAS VALUE</h3>
          <div className="text-5xl font-bold text-white mb-2">{gasData.value}</div>
          <p className="text-gray-400 text-sm">
            Threshold: <span className="text-yellow-400">{THRESHOLD}</span>
          </p>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-gray-600 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all ${
                gasData.value > THRESHOLD ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((gasData.value / THRESHOLD) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
          <h3 className="text-gray-300 text-sm font-semibold mb-4">SYSTEM STATUS</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className={`status-indicator ${isGasDetected ? 'danger' : 'normal'}`}></div>
            <span className={`text-3xl font-bold ${statusColor}`}>
              {isGasDetected ? 'ALERT' : 'NORMAL'}
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-400">
            <p>Last Updated: <span className="text-white">{new Date(gasData.timestamp).toLocaleTimeString()}</span></p>
            <p>Status: <span className={statusColor}>{gasData.status}</span></p>
          </div>
        </div>
      </div>

      {/* Alert Message */}
      {isGasDetected && (
        <div className="mt-6 bg-red-900 border border-red-700 rounded-lg p-4 text-red-200">
          <p className="font-semibold">🚨 CRITICAL ALERT</p>
          <p className="text-sm mt-1">Gas leakage detected! Take immediate action.</p>
        </div>
      )}

      {/* Gauge-like display */}
      <div className="mt-6">
        <h4 className="text-gray-300 text-sm font-semibold mb-3">LEVEL SCALE</h4>
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>SAFE</span>
          <span>WARNING</span>
          <span>CRITICAL</span>
        </div>
        <div className="h-2 bg-gray-600 rounded-full overflow-hidden flex">
          <div className="flex-1 bg-green-500"></div>
          <div className="flex-1 bg-yellow-500"></div>
          <div className="flex-1 bg-red-500"></div>
        </div>
      </div>
    </div>
  )
}
