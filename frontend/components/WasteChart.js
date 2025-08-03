'use client'

import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function WasteChart({ data }) {
  // Calculate total waste by type
  const wasteTotals = data.reduce((acc, item) => {
    acc.recyclable += item.wasteData.recyclable || 0
    acc.hazardous += item.wasteData.hazardous || 0
    acc.landfill += item.wasteData.landfill || 0
    return acc
  }, { recyclable: 0, hazardous: 0, landfill: 0 })

  const chartData = {
    labels: ['Recyclable', 'Hazardous', 'Landfill'],
    datasets: [
      {
        data: [wasteTotals.recyclable, wasteTotals.hazardous, wasteTotals.landfill],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.parsed
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value.toFixed(2)} kg (${percentage}%)`
          }
        }
      }
    },
  }

  const totalWaste = wasteTotals.recyclable + wasteTotals.hazardous + wasteTotals.landfill

  if (totalWaste === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No waste data available</p>
      </div>
    )
  }

  return (
    <div className="h-64">
      <Pie data={chartData} options={options} />
    </div>
  )
} 