"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import {
  MapPinIcon,
  RadioIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  SignalIcon,
  ClockIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon
} from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import dynamic from 'next/dynamic'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false })

interface LocationTrackingProps {
  assets: any[]
  permissions: any
}

interface TrackingDevice {
  id: string
  assetId: string
  type: 'GPS' | 'RFID' | 'Bluetooth' | 'WiFi'
  status: 'online' | 'offline' | 'low-battery' | 'error'
  batteryLevel: number
  lastUpdate: string
  accuracy: number
  signal: number
}

interface GeofenceZone {
  id: string
  name: string
  type: 'safe' | 'restricted' | 'maintenance'
  coordinates: { lat: number; lng: number }
  radius: number
  color: string
  active: boolean
}

interface LocationAlert {
  id: string
  assetId: string
  type: 'geofence_violation' | 'device_offline' | 'unauthorized_movement' | 'low_battery'
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  acknowledged: boolean
}

export function LocationTracking({ assets, permissions }: LocationTrackingProps) {
  const { data: session } = useSession()
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [trackingDevices, setTrackingDevices] = useState<TrackingDevice[]>([])
  const [geofences, setGeofences] = useState<GeofenceZone[]>([])
  const [alerts, setAlerts] = useState<LocationAlert[]>([])
  const [mapCenter, setMapCenter] = useState([-17.8216, 31.0492]) // Harare coordinates
  const [showGeofences, setShowGeofences] = useState(true)
  const [showTrackingDevices, setShowTrackingDevices] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  const mapRef = useRef<any>(null)

  // Initialize tracking devices and geofences
  useEffect(() => {
    const mockDevices: TrackingDevice[] = assets.map((asset, index) => ({
      id: `device-${asset.id}`,
      assetId: asset.id,
      type: ['GPS', 'RFID', 'Bluetooth', 'WiFi'][index % 4] as any,
      status: ['online', 'offline', 'low-battery'][index % 3] as any,
      batteryLevel: Math.floor(Math.random() * 100),
      lastUpdate: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      accuracy: Math.floor(Math.random() * 10) + 1,
      signal: Math.floor(Math.random() * 100)
    }))

    const mockGeofences: GeofenceZone[] = [
      {
        id: 'zone-1',
        name: 'Head Office Safe Zone',
        type: 'safe',
        coordinates: { lat: -17.8216, lng: 31.0492 },
        radius: 200,
        color: '#10B981',
        active: true
      },
      {
        id: 'zone-2',
        name: 'Warehouse Perimeter',
        type: 'safe',
        coordinates: { lat: -17.8350, lng: 31.0650 },
        radius: 150,
        color: '#3B82F6',
        active: true
      },
      {
        id: 'zone-3',
        name: 'Restricted Area',
        type: 'restricted',
        coordinates: { lat: -17.8100, lng: 31.0450 },
        radius: 100,
        color: '#EF4444',
        active: true
      },
      {
        id: 'zone-4',
        name: 'Maintenance Zone',
        type: 'maintenance',
        coordinates: { lat: -17.8280, lng: 31.0580 },
        radius: 75,
        color: '#F59E0B',
        active: true
      }
    ]

    const mockAlerts: LocationAlert[] = [
      {
        id: 'alert-1',
        assetId: assets[0]?.id || '1',
        type: 'geofence_violation',
        message: 'Asset moved outside safe zone',
        severity: 'high',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        acknowledged: false
      },
      {
        id: 'alert-2',
        assetId: assets[1]?.id || '2',
        type: 'device_offline',
        message: 'Tracking device has gone offline',
        severity: 'medium',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        acknowledged: false
      }
    ]

    setTrackingDevices(mockDevices)
    setGeofences(mockGeofences)
    setAlerts(mockAlerts)
  }, [assets])

  // Real-time location updates simulation
  useEffect(() => {
    if (!isRealTimeEnabled) return

    const interval = setInterval(() => {
      setTrackingDevices(prev => prev.map(device => ({
        ...device,
        lastUpdate: new Date().toISOString(),
        batteryLevel: Math.max(0, device.batteryLevel - Math.random() * 2),
        signal: Math.max(0, Math.min(100, device.signal + (Math.random() - 0.5) * 10))
      })))

      // Simulate asset coordinate updates
      assets.forEach(asset => {
        if (asset.coordinates && Math.random() < 0.3) {
          const newLat = asset.coordinates.lat + (Math.random() - 0.5) * 0.001
          const newLng = asset.coordinates.lng + (Math.random() - 0.5) * 0.001
          asset.coordinates = {
            ...asset.coordinates,
            lat: newLat,
            lng: newLng,
            lastUpdated: new Date().toISOString()
          }
        }
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [isRealTimeEnabled, assets])

  const getDeviceStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100'
      case 'offline': return 'text-red-600 bg-red-100'
      case 'low-battery': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'GPS': return <MapPinIcon className="h-4 w-4" />
      case 'RFID': return <RadioIcon className="h-4 w-4" />
      case 'Bluetooth': return <DevicePhoneMobileIcon className="h-4 w-4" />
      case 'WiFi': return <SignalIcon className="h-4 w-4" />
      default: return <MapPinIcon className="h-4 w-4" />
    }
  }

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  const filteredAssets = assets.filter(asset => {
    if (filterStatus === 'all') return true
    const device = trackingDevices.find(d => d.assetId === asset.id)
    return device?.status === filterStatus
  })

  const createCustomIcon = (color: string, isSelected: boolean = false) => {
    if (typeof window === 'undefined') return null
    
    const L = require('leaflet')
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: ${isSelected ? '20px' : '16px'};
        height: ${isSelected ? '20px' : '16px'};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [isSelected ? 20 : 16, isSelected ? 20 : 16],
      iconAnchor: [isSelected ? 10 : 8, isSelected ? 10 : 8]
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Location Tracking</h3>
          <p className="text-gray-600">Real-time asset location monitoring and geofence management</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isRealTimeEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${isRealTimeEnabled ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <span>{isRealTimeEnabled ? 'Live' : 'Paused'}</span>
              </div>
            </button>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Devices</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="low-battery">Low Battery</option>
          </select>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.filter(a => !a.acknowledged).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <h4 className="text-sm font-medium text-yellow-800">
                Active Location Alerts ({alerts.filter(a => !a.acknowledged).length})
              </h4>
            </div>
          </div>
          <div className="space-y-2">
            {alerts.filter(a => !a.acknowledged).slice(0, 3).map(alert => (
              <div key={alert.id} className={`p-3 rounded border ${getAlertSeverityColor(alert.severity)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs opacity-75">
                      Asset: {assets.find(a => a.id === alert.assetId)?.name} - {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="text-xs px-2 py-1 bg-white rounded hover:bg-gray-50"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-3">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Asset Location Map</h4>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showGeofences}
                    onChange={(e) => setShowGeofences(e.target.checked)}
                    className="rounded"
                  />
                  <span>Show Geofences</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showTrackingDevices}
                    onChange={(e) => setShowTrackingDevices(e.target.checked)}
                    className="rounded"
                  />
                  <span>Show Devices</span>
                </label>
              </div>
            </div>
            
            <div className="h-96 bg-gray-100 rounded-lg relative overflow-hidden">
              {typeof window !== 'undefined' && (
                <MapContainer
                  center={mapCenter as [number, number]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  ref={mapRef}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Asset Markers */}
                  {filteredAssets.map(asset => {
                    if (!asset.coordinates) return null
                    const device = trackingDevices.find(d => d.assetId === asset.id)
                    const isSelected = selectedAsset === asset.id
                    const markerColor = device?.status === 'online' ? '#10B981' : 
                                       device?.status === 'low-battery' ? '#F59E0B' : '#EF4444'
                    
                    return (
                      <Marker
                        key={asset.id}
                        position={[asset.coordinates.lat, asset.coordinates.lng]}
                        icon={createCustomIcon(markerColor, isSelected)}
                        eventHandlers={{
                          click: () => setSelectedAsset(asset.id)
                        }}
                      >
                        <Popup>
                          <div className="p-2">
                            <h5 className="font-semibold">{asset.name}</h5>
                            <p className="text-sm text-gray-600">{asset.assetNumber}</p>
                            <p className="text-sm">Location: {asset.location?.name || asset.location}</p>
                            {device && (
                              <div className="mt-2 text-xs">
                                <p>Device: {device.type}</p>
                                <p>Status: <span className={`px-1 rounded ${getDeviceStatusColor(device.status)}`}>{device.status}</span></p>
                                <p>Battery: {device.batteryLevel}%</p>
                                <p>Last Update: {new Date(device.lastUpdate).toLocaleTimeString()}</p>
                              </div>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    )
                  })}
                  
                  {/* Geofence Circles */}
                  {showGeofences && geofences.filter(zone => zone.active).map(zone => (
                    <Circle
                      key={zone.id}
                      center={[zone.coordinates.lat, zone.coordinates.lng]}
                      radius={zone.radius}
                      pathOptions={{
                        color: zone.color,
                        fillColor: zone.color,
                        fillOpacity: 0.2,
                        weight: 2
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h5 className="font-semibold">{zone.name}</h5>
                          <p className="text-sm">Type: {zone.type}</p>
                          <p className="text-sm">Radius: {zone.radius}m</p>
                        </div>
                      </Popup>
                    </Circle>
                  ))}
                </MapContainer>
              )}
              
              {/* Fallback for SSR */}
              {typeof window === 'undefined' && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Loading map...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Map Legend */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Online</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Low Battery</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Offline</span>
                </div>
              </div>
              <div className="text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Asset List */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Tracked Assets</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {filteredAssets.map(asset => {
                const device = trackingDevices.find(d => d.assetId === asset.id)
                const isSelected = selectedAsset === asset.id
                
                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium text-sm truncate">{asset.name}</h5>
                          {device && (
                            <span className={`px-2 py-1 rounded-full text-xs ${getDeviceStatusColor(device.status)}`}>
                              {device.status}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{asset.assetNumber}</p>
                        {asset.coordinates && (
                          <p className="text-xs text-gray-500">
                            Last seen: {new Date(asset.coordinates.lastUpdated).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      {device && (
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            {getDeviceIcon(device.type)}
                            <span className="text-xs">{device.batteryLevel}%</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Signal: {device.signal}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Geofence Management */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Geofence Zones</h4>
            <div className="space-y-3">
              {geofences.map(zone => (
                <div key={zone.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: zone.color }}
                    ></div>
                    <div>
                      <h6 className="font-medium text-sm">{zone.name}</h6>
                      <p className="text-xs text-gray-600 capitalize">{zone.type} • {zone.radius}m</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={zone.active}
                        onChange={(e) => {
                          setGeofences(prev => prev.map(g => 
                            g.id === zone.id ? { ...g, active: e.target.checked } : g
                          ))
                        }}
                        className="rounded text-blue-600"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700" 
              size="sm"
            >
              <MapPinIcon className="h-4 w-4 mr-2" />
              Add Geofence
            </Button>
          </div>

          {/* Device Status Summary */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Device Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Online</span>
                <span className="font-medium text-green-600">
                  {trackingDevices.filter(d => d.status === 'online').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Low Battery</span>
                <span className="font-medium text-yellow-600">
                  {trackingDevices.filter(d => d.status === 'low-battery').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Offline</span>
                <span className="font-medium text-red-600">
                  {trackingDevices.filter(d => d.status === 'offline').length}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Total Devices</span>
                  <span className="font-medium">{trackingDevices.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
