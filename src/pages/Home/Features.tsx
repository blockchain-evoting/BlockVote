import { Globe2, LineChart, Shield } from 'lucide-react'
import React from 'react'

const Features = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
    <h2 className="text-2xl font-bold text-center mb-8">Why Choose Our Platform?</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <Shield className="w-12 h-12 text-blue-600 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Secure</h3>
        <p className="text-gray-600">
          End-to-end encryption and advanced security measures ensure your vote remains confidential and tamper-proof.
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <Globe2 className="w-12 h-12 text-blue-600 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Accessible</h3>
        <p className="text-gray-600">
          Vote from anywhere with an internet connection. Our platform is designed to be inclusive and easy to use.
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <LineChart className="w-12 h-12 text-blue-600 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Transparent</h3>
        <p className="text-gray-600">
          Real-time results and comprehensive analytics provide transparency in the electoral process.
        </p>
      </div>
    </div>
  </div>
  )
}

export default Features