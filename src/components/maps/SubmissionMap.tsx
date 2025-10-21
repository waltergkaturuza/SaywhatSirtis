"use client"

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

interface SubmissionLocation {
  id: string
  latitude: number
  longitude: number
  submittedAt: string
  formName: string
  submittedBy: string
  accuracy?: number
}

interface SubmissionMapProps {
  submissions: SubmissionLocation[]
  className?: string
}

export default function SubmissionMap({ submissions, className = '' }: SubmissionMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className={`h-80 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  // Default center to Harare, Zimbabwe
  const defaultCenter: [number, number] = [-17.8292, 31.0522]
  
  // Calculate bounds from submissions or use default
  const bounds = submissions.length > 0 
    ? submissions.map(sub => [sub.latitude, sub.longitude] as [number, number])
    : [defaultCenter]

  return (
    <div className={`h-80 rounded-lg overflow-hidden border border-gray-200 ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        bounds={bounds.length > 1 ? bounds : undefined}
        boundsOptions={{ padding: [20, 20] }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {submissions.map((submission) => (
          <Marker
            key={submission.id}
            position={[submission.latitude, submission.longitude]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-900 mb-2">{submission.formName}</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleDateString()}</p>
                  <p><strong>By:</strong> {submission.submittedBy}</p>
                  <p><strong>Coordinates:</strong> {submission.latitude.toFixed(6)}, {submission.longitude.toFixed(6)}</p>
                  {submission.accuracy && (
                    <p><strong>Accuracy:</strong> ±{submission.accuracy.toFixed(1)}m</p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
