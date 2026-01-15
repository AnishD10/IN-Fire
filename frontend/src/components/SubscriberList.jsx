import { useState, useEffect } from 'react'
import { getSubscribers, removeSubscriber } from '../services/api'

export default function SubscriberList({ onAlert }) {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [unsubscribing, setUnsubscribing] = useState(null)

  useEffect(() => {
    loadSubscribers()
    // Refresh list every 10 seconds
    const interval = setInterval(loadSubscribers, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadSubscribers = async () => {
    try {
      const response = await getSubscribers()
      if (response.subscribers && Array.isArray(response.subscribers)) {
        setSubscribers(response.subscribers)
      } else if (Array.isArray(response)) {
        setSubscribers(response)
      } else {
        setSubscribers([])
      }
    } catch (error) {
      console.error('Failed to load subscribers:', error)
      onAlert?.('Failed to load subscribers', 'danger')
      setSubscribers([])
    } finally {
      setLoading(false)
    }
  }

  const handleUnsubscribe = async (email) => {
    if (!confirm(`Are you sure you want to unsubscribe ${email}?`)) {
      return
    }

    try {
      setUnsubscribing(email)
      const response = await removeSubscriber(email)

      if (response.success || response.message) {
        setSubscribers(subscribers.filter(s => s.email !== email))
        onAlert?.(`✓ ${email} unsubscribed successfully`, 'success')
      } else {
        onAlert?.(`✗ Failed to unsubscribe ${email}`, 'danger')
      }
    } catch (error) {
      console.error('Unsubscribe error:', error)
      onAlert?.(`✗ Error: ${error.message}`, 'danger')
    } finally {
      setUnsubscribing(null)
    }
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
      <h2 className="text-2xl font-bold text-white mb-6">👥 Alert Subscribers</h2>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading subscribers...</p>
        </div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-8 bg-gray-700 rounded-lg">
          <p className="text-gray-400">No subscribers yet</p>
          <p className="text-sm text-gray-500 mt-2">Add emails via the subscription form to get alerts</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subscribers.map((subscriber) => (
              <div
                key={subscriber.email}
                className="bg-gray-700 rounded-lg p-4 flex items-center justify-between border border-gray-600 hover:border-gray-500 transition-all"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <div className="text-xl mr-3">📧</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{subscriber.email}</p>
                    <p className="text-xs text-gray-400">
                      {subscriber.subscribedAt 
                        ? `Joined ${new Date(subscriber.subscribedAt).toLocaleDateString()}`
                        : 'Active subscriber'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleUnsubscribe(subscriber.email)}
                  disabled={unsubscribing === subscriber.email}
                  className="ml-4 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {unsubscribing === subscriber.email ? '...' : 'Unsubscribe'}
                </button>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 p-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-blue-200">
                <strong>Total Subscribers:</strong> {subscribers.length}
              </span>
              <span className="text-sm text-blue-300">
                {subscribers.length === 1 ? '1 member' : `${subscribers.length} members`} will receive alerts
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
