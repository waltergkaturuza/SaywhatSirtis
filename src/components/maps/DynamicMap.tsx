"use client"

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

interface SubmissionLocation {
  id: string
  latitude: number
  longitude: number
  submittedAt: string
  formName: string
  submittedBy: string
  accuracy?: number
}

interface DynamicMapProps {
  submissions: SubmissionLocation[]
}

// Create custom red pin icon
const createRedPinIcon = () => {
  return L.divIcon({
    className: 'custom-red-pin',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: #ef4444;
        border: 2px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  })
}

export default function DynamicMap({ submissions }: DynamicMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
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

  const redPinIcon = createRedPinIcon()

  return (
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
          icon={redPinIcon}
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
  )
}
