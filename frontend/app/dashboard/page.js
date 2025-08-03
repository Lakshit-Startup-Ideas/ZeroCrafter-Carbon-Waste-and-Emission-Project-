'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, Calendar, Download, Leaf, LogOut, Plus, Settings, TrendingUp, Users, MessageCircle } from 'lucide-react'
import { api } from '@/lib/api'
import EmissionsChart from '@/components/EmissionsChart'
import WasteChart from '@/components/WasteChart'
import EmissionsTable from '@/components/EmissionsTable'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [emissions, setEmissions] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(userData))
    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch emissions data
      const emissionsResponse = await api.emissions.getAll({ limit: 10 })
      setEmissions(emissionsResponse.data.emissions)
      setSummary(emissionsResponse.data.summary)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ZeroCraftr</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/ai-chat')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                AI Assistant
              </button>
              <span className="text-sm text-gray-600">
                Welcome, {user?.companyName}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Track your emissions and sustainability metrics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Emissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalEmissions ? `${summary.totalEmissions.toFixed(2)} kg CO₂e` : '0 kg CO₂e'}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Records</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalRecords || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.averageEmissions ? `${summary.averageEmissions.toFixed(2)} kg CO₂e` : '0 kg CO₂e'}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Company</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.companyName || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Emissions Trend</h3>
              <p className="card-description">
                Monthly emissions over time
              </p>
            </div>
            <div className="card-content">
              <EmissionsChart data={emissions} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Waste Breakdown</h3>
              <p className="card-description">
                Distribution of waste types
              </p>
            </div>
            <div className="card-content">
              <WasteChart data={emissions} />
            </div>
          </div>
        </div>

        {/* Recent Emissions Table */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="card-title">Recent Emissions</h3>
                <p className="card-description">
                  Latest emission records
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push('/data-entry')}
                  className="btn btn-primary btn-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </button>
                <button className="btn btn-outline btn-sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
          <div className="card-content">
            <EmissionsTable data={emissions} />
          </div>
        </div>
      </div>
    </div>
  )
} 