'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { api } from '@/lib/api'

export default function DataEntryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    energyData: {
      electricity: {
        grid: '',
        renewable: '',
      },
      fuel: {
        diesel: '',
        petrol: '',
        naturalGas: '',
        lpg: '',
      },
    },
    wasteData: {
      recyclable: '',
      hazardous: '',
      landfill: '',
    },
    notes: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [section, subsection, field] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subsection]: {
            ...prev[section][subsection],
            [field]: value === '' ? '' : parseFloat(value) || 0,
          },
        },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate that at least some data is entered
      const hasEnergyData = Object.values(formData.energyData.electricity).some(v => v > 0) ||
                           Object.values(formData.energyData.fuel).some(v => v > 0)
      const hasWasteData = Object.values(formData.wasteData).some(v => v > 0)

      if (!hasEnergyData && !hasWasteData) {
        setError('Please enter at least some energy or waste data')
        setLoading(false)
        return
      }

      await api.emissions.create(formData)
      setSuccess('Emission record created successfully!')
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        energyData: {
          electricity: { grid: '', renewable: '' },
          fuel: { diesel: '', petrol: '', naturalGas: '', lpg: '' },
        },
        wasteData: { recyclable: '', hazardous: '', landfill: '' },
        notes: '',
      })

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create emission record')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Data Entry</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Add Emission Record</h2>
            <p className="card-description">
              Enter your energy consumption and waste disposal data for automatic emissions calculation
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card-content space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                {success}
              </div>
            )}

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            {/* Energy Data */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Energy Consumption</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Electricity (kWh)</h4>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="electricity.grid" className="block text-sm text-gray-600">
                        Grid Electricity
                      </label>
                      <input
                        type="number"
                        id="electricity.grid"
                        name="energyData.electricity.grid"
                        value={formData.energyData.electricity.grid}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label htmlFor="electricity.renewable" className="block text-sm text-gray-600">
                        Renewable Electricity
                      </label>
                      <input
                        type="number"
                        id="electricity.renewable"
                        name="energyData.electricity.renewable"
                        value={formData.energyData.electricity.renewable}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Fuel Consumption</h4>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="fuel.diesel" className="block text-sm text-gray-600">
                        Diesel (L)
                      </label>
                      <input
                        type="number"
                        id="fuel.diesel"
                        name="energyData.fuel.diesel"
                        value={formData.energyData.fuel.diesel}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label htmlFor="fuel.petrol" className="block text-sm text-gray-600">
                        Petrol (L)
                      </label>
                      <input
                        type="number"
                        id="fuel.petrol"
                        name="energyData.fuel.petrol"
                        value={formData.energyData.fuel.petrol}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label htmlFor="fuel.naturalGas" className="block text-sm text-gray-600">
                        Natural Gas (m³)
                      </label>
                      <input
                        type="number"
                        id="fuel.naturalGas"
                        name="energyData.fuel.naturalGas"
                        value={formData.energyData.fuel.naturalGas}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label htmlFor="fuel.lpg" className="block text-sm text-gray-600">
                        LPG (L)
                      </label>
                      <input
                        type="number"
                        id="fuel.lpg"
                        name="energyData.fuel.lpg"
                        value={formData.energyData.fuel.lpg}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="input"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Waste Data */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Waste Disposal (kg)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="waste.recyclable" className="block text-sm font-medium text-gray-700 mb-2">
                    Recyclable Waste
                  </label>
                  <input
                    type="number"
                    id="waste.recyclable"
                    name="wasteData.recyclable"
                    value={formData.wasteData.recyclable}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="input"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="waste.hazardous" className="block text-sm font-medium text-gray-700 mb-2">
                    Hazardous Waste
                  </label>
                  <input
                    type="number"
                    id="waste.hazardous"
                    name="wasteData.hazardous"
                    value={formData.wasteData.hazardous}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="input"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="waste.landfill" className="block text-sm font-medium text-gray-700 mb-2">
                    Landfill Waste
                  </label>
                  <input
                    type="number"
                    id="waste.landfill"
                    name="wasteData.landfill"
                    value={formData.wasteData.landfill}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="input"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="input"
                placeholder="Add any additional notes about this emission record..."
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.notes.length}/500 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Record
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 