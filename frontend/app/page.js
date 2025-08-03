import Link from 'next/link'
import { ArrowRight, BarChart3, Leaf, Shield, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ZeroCraftr</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Track Your
            <span className="text-green-600"> Carbon Footprint</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            ZeroCraftr helps small manufacturers track energy consumption, waste disposal, 
            and automatically calculate carbon emissions for regulatory compliance and sustainability goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="/login" 
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need for emission tracking
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools to monitor, analyze, and reduce your environmental impact
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <BarChart3 className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
            <p className="text-gray-600">
              Monitor energy consumption and waste disposal in real-time with automated calculations
            </p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Compliance Ready</h3>
            <p className="text-gray-600">
              Generate regulatory reports and maintain compliance with environmental standards
            </p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Zap className="h-12 w-12 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Insights</h3>
            <p className="text-gray-600">
              Get AI-powered suggestions to reduce emissions and improve sustainability
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start tracking your emissions?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join hundreds of manufacturers already using ZeroCraftr
          </p>
          <Link 
            href="/signup" 
            className="bg-white text-green-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Leaf className="h-8 w-8 text-green-400" />
              <span className="ml-2 text-xl font-bold">ZeroCraftr</span>
            </div>
            <p className="text-gray-400">
              © 2024 ZeroCraftr. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 