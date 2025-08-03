'use client'

import { useState, useEffect } from 'react'
import { Zap, TrendingUp, Leaf } from 'lucide-react'
import { api } from '@/lib/api'

export default function AISuggestions() {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      const response = await api.ai.getSuggestions({
        timeframe: 'month',
        focus: 'overall'
      })
      setSuggestions(response.data.suggestions || [])
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-600" />
            AI Suggestions
          </h3>
          <p className="card-description">
            Loading personalized recommendations...
          </p>
        </div>
        <div className="card-content">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-600" />
            AI Suggestions
          </h3>
          <p className="card-description">
            Add some emission data to get personalized recommendations
          </p>
        </div>
        <div className="card-content">
          <p className="text-gray-500 text-sm">
            Start tracking your emissions to receive AI-powered sustainability suggestions.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-600" />
          AI Suggestions
        </h3>
        <p className="card-description">
          Personalized recommendations based on your data
        </p>
      </div>
      <div className="card-content">
        <div className="space-y-4">
          {suggestions.slice(0, 3).map((suggestion, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {suggestion.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {suggestion.description}
                  </p>
                  <div className="space-y-1">
                    {suggestion.actions.slice(0, 2).map((action, actionIndex) => (
                      <div key={actionIndex} className="flex items-center text-xs text-gray-500">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  suggestion.priority === 'high' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {suggestion.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => window.location.href = '/ai-chat'}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            <Leaf className="h-4 w-4 mr-1" />
            Chat with AI Assistant
          </button>
        </div>
      </div>
    </div>
  )
} 