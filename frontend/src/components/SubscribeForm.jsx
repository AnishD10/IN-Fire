import { useState } from 'react'
import { subscribe } from '../services/api'

export default function SubscribeForm({ onSubscribe }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      onSubscribe('Please enter an email address', 'warning')
      return
    }

    try {
      setLoading(true)
      const response = await subscribe(email)

      if (response.success) {
        onSubscribe(`✓ Welcome email sent to ${email}! Check your inbox.`, 'success')
        setEmail('')
      } else {
        onSubscribe(`✗ ${response.error}`, 'danger')
      }
    } catch (error) {
      console.error('Subscribe error:', error)
      onSubscribe(`✗ Error: ${error.message}`, 'danger')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 h-full">
      <h2 className="text-2xl font-bold text-white mb-4">📧 Subscribe to Alerts</h2>
      <p className="text-gray-400 text-sm mb-6">
        Get instant email notifications when gas leakage is detected.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={loading}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Subscribing...' : 'Subscribe Now'}
        </button>
      </form>

      {/* Features */}
      <div className="mt-6 space-y-3 text-sm text-gray-400">
        <h3 className="font-semibold text-white mb-3">You'll receive alerts for:</h3>
        <div className="flex items-start gap-2">
          <span className="text-green-500 mt-1">✓</span>
          <span>Gas leakage detection</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-green-500 mt-1">✓</span>
          <span>System status changes</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-green-500 mt-1">✓</span>
          <span>Critical alerts</span>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="mt-6 p-3 bg-gray-700 rounded-lg text-xs text-gray-400">
        Your email is safe with us. Unsubscribe anytime.
      </div>
    </div>
  )
}
