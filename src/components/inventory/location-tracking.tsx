"use client"

import { useState, useEffect } from "react"
import { 
  MapPinIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  TruckIcon,
  SignalIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Asset, InventoryPermissions } from '@/types/inventory'

interface LocationTrackingProps {
  assets: Asset[]
  permissions: InventoryPermissions
}

interface LocationUpdate {
  id: string
  assetId: string
  latitude: number
  longitude: number
  accuracy: number
  timestamp: string
  source: 'gps' | 'manual' | 'rfid' | 'beacon'
  batteryLevel?: number
  address?: string
  notes?: string
}

interface GeofenceAlert {
  id: string
  assetId: string
  type: 'entry' | 'exit' | 'unauthorized_movement'
  geofenceName: string
  latitude: number
  longitude: number
  timestamp: string
  acknowledged: boolean
}

interface TrackingDevice {
  id: string
  assetId: string
  deviceType: 'gps_tracker' | 'rfid_tag' | 'bluetooth_beacon' | 'cellular'
  deviceId: string
  status: 'active' | 'inactive' | 'low_battery' | 'offline'
  batteryLevel?: number
  lastUpdate: string
  signalStrength?: number
}

export function LocationTracking({ assets, permissions }: LocationTrackingProps) {
  const [activeView, setActiveView] = useState<'map' | 'list' | 'alerts' | 'devices'>('map')
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [locationUpdates, setLocationUpdates] = useState<LocationUpdate[]>([])
  const [geofenceAlerts, setGeofenceAlerts] = useState<GeofenceAlert[]>([])
  const [trackingDevices, setTrackingDevices] = useState<TrackingDevice[]>([])
  const [loading, setLoading] = useState(false)
  const [realTimeTracking, setRealTimeTracking] = useState(false)

  // Initialize sample data
  useEffect(() => {
    const sampleUpdates: LocationUpdate[] = [
      {
        id: '1',
        assetId: '1',
        latitude: -17.8216,
        longitude: 31.0492,
        accuracy: 5,
        timestamp: '2024-07-19T10:30:00Z',
        source: 'manual',
        address: 'Head Office, 123 Main Street, Harare'
      },
      {
        id: '2',
        assetId: '3',
        latitude: -17.8100,
        longitude: 31.0450,
        accuracy: 3,
        timestamp: '2024-07-19T08:45:00Z',
        source: 'gps',
        batteryLevel: 85,
        address: 'Client Site A, Harare'
      },
      {
        id: '3',
        assetId: '2',
        latitude: -17.8350,
        longitude: 31.0650,
        accuracy: 8,
        timestamp: '2024-07-19T09:30:00Z',
        source: 'rfid',
        address: 'Branch Office A, 456 Branch Street, Harare'
      }
    ]

    const sampleAlerts: GeofenceAlert[] = [
      {
        id: '1',
        assetId: '3',
        type: 'unauthorized_movement',
        geofenceName: 'Head Office Parking',
        latitude: -17.8200,
        longitude: 31.0480,
        timestamp: '2024-07-19T07:30:00Z',
        acknowledged: false
      }
    ]

    const sampleDevices: TrackingDevice[] = [
      {
        id: '1',
        assetId: '3',
        deviceType: 'gps_tracker',
        deviceId: 'GPS-001-TC2024',
        status: 'active',
        batteryLevel: 85,
        lastUpdate: '2024-07-19T08:45:00Z',
        signalStrength: 92
      },
      {
        id: '2',
        assetId: '1',
        deviceType: 'rfid_tag',
        deviceId: 'RFID-RF001234',
        status: 'active',
        lastUpdate: '2024-07-19T10:30:00Z'
      },
      {
        id: '3',
        assetId: '2',
        deviceType: 'bluetooth_beacon',
        deviceId: 'BLE-HP404-002',
        status: 'low_battery',
        batteryLevel: 15,
        lastUpdate: '2024-07-19T09:30:00Z',
        signalStrength: 78
      }
    ]

    setLocationUpdates(sampleUpdates)
    setGeofenceAlerts(sampleAlerts)
    setTrackingDevices(sampleDevices)
  }, [])

  // Load tracking data from backend
  useEffect(() => {
    const loadTrackingData = async () => {
      setLoading(true)
      try {
        const [updatesResponse, alertsResponse, devicesResponse] = await Promise.all([
          fetch('/api/inventory/tracking/locations'),
          fetch('/api/inventory/tracking/alerts'),
          fetch('/api/inventory/tracking/devices')
        ])

        if (updatesResponse.ok) {
          const updates = await updatesResponse.json()
          setLocationUpdates(updates)
        }

        if (alertsResponse.ok) {
          const alerts = await alertsResponse.json()
          setGeofenceAlerts(alerts)
        }

        if (devicesResponse.ok) {
          const devices = await devicesResponse.json()
          setTrackingDevices(devices)
        }
      } catch (error) {
        console.log('Backend not available, using sample data')
      } finally {
        setLoading(false)
      }
    }

    loadTrackingData()
  }, [])

  // Real-time tracking simulation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (realTimeTracking) {
      interval = setInterval(async () => {
        try {
          const response = await fetch('/api/inventory/tracking/live-updates')
          if (response.ok) {
            const updates = await response.json()
            setLocationUpdates(prev => [...updates, ...prev.slice(0, 10)])
          }
        } catch (error) {
          // Simulate live updates with sample data
          const simulatedUpdate: LocationUpdate = {
            id: Date.now().toString(),
            assetId: '3', // Vehicle
            latitude: -17.8100 + (Math.random() - 0.5) * 0.01,
            longitude: 31.0450 + (Math.random() - 0.5) * 0.01,
            accuracy: Math.floor(Math.random() * 10) + 1,
            timestamp: new Date().toISOString(),
            source: 'gps',
            batteryLevel: 85 - Math.floor(Math.random() * 5),
            address: 'Mobile Location'
          }
          setLocationUpdates(prev => [simulatedUpdate, ...prev.slice(0, 10)])
        }
      }, 5000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [realTimeTracking])

  const getAssetName = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId)
    return asset ? asset.name : 'Unknown Asset'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'low_battery':
        return 'bg-yellow-100 text-yellow-800'
      case 'offline':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'gps':
        return <GlobeAltIcon className="h-4 w-4 text-blue-600" />
      case 'rfid':
        return <SignalIcon className="h-4 w-4 text-green-600" />
      case 'manual':
        return <MapPinIcon className="h-4 w-4 text-gray-600" />
      case 'beacon':
        return <SignalIcon className="h-4 w-4 text-purple-600" />
      default:
        return <MapPinIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch(`/api/inventory/tracking/alerts/${alertId}/acknowledge`, {
        method: 'POST'
      })
    } catch (error) {
      console.log('Backend not available')
    }
    
    setGeofenceAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    )
  }

  const refreshLocation = async (assetId: string) => {
    try {
      const response = await fetch(`/api/inventory/tracking/refresh/${assetId}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const update = await response.json()
        setLocationUpdates(prev => [update, ...prev])
      }
    } catch (error) {
      // Simulate refresh
      const simulatedUpdate: LocationUpdate = {
        id: Date.now().toString(),
        assetId,
        latitude: -17.8216 + (Math.random() - 0.5) * 0.01,
        longitude: 31.0492 + (Math.random() - 0.5) * 0.01,
        accuracy: Math.floor(Math.random() * 10) + 1,
        timestamp: new Date().toISOString(),
        source: 'manual',
        address: 'Updated Location'
      }
      setLocationUpdates(prev => [simulatedUpdate, ...prev])
    }
  }

  const filteredUpdates = selectedAsset 
    ? locationUpdates.filter(update => update.assetId === selectedAsset)
    : locationUpdates

  const renderMapView = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Asset Location Map</CardTitle>
              <CardDescription>Real-time asset positions and tracking</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={realTimeTracking ? "default" : "outline"}
                onClick={() => setRealTimeTracking(!realTimeTracking)}
              >
                {realTimeTracking ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Live Tracking
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Start Tracking
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Placeholder for map component */}
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <GlobeAltIcon className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Interactive Map</h3>
              <p className="mt-2 text-gray-600">
                Map integration with Google Maps/OpenStreetMap coming soon
              </p>
              <div className="mt-4 space-y-2">
                {assets.slice(0, 3).map(asset => {
                  const lastUpdate = locationUpdates.find(u => u.assetId === asset.id)
                  return (
                    <div key={asset.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">{asset.name}</span>
                      </div>
                      {lastUpdate && (
                        <span className="text-xs text-gray-500">
                          {lastUpdate.latitude.toFixed(4)}, {lastUpdate.longitude.toFixed(4)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderListView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Location History</h3>
          <p className="text-gray-600">Track asset movement and location updates</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Assets</option>
            {assets.map(asset => (
              <option key={asset.id} value={asset.id}>{asset.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUpdates.map((update) => (
          <Card key={update.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  {getSourceIcon(update.source)}
                  <div>
                    <h4 className="font-semibold">{getAssetName(update.assetId)}</h4>
                    <p className="text-gray-600">{update.address || 'Unknown Address'}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Lat: {update.latitude.toFixed(6)}</span>
                      <span>Lng: {update.longitude.toFixed(6)}</span>
                      <span>Accuracy: ±{update.accuracy}m</span>
                      {update.batteryLevel && <span>Battery: {update.batteryLevel}%</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {update.source}
                  </span>
                  <p className="text-sm mt-2">
                    {new Date(update.timestamp).toLocaleString()}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => refreshLocation(update.assetId)}
                    className="mt-2"
                  >
                    <ArrowPathIcon className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderAlerts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Geofence Alerts</h3>
          <p className="text-gray-600">Monitor unauthorized movements and boundary violations</p>
        </div>
      </div>

      <div className="grid gap-4">
        {geofenceAlerts.map((alert) => (
          <Card key={alert.id} className={alert.acknowledged ? 'opacity-50' : ''}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  <div>
                    <h4 className="font-semibold text-red-900">
                      {alert.type.replace('_', ' ').toUpperCase()}
                    </h4>
                    <p className="text-gray-600">{getAssetName(alert.assetId)}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Geofence: {alert.geofenceName}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Lat: {alert.latitude.toFixed(6)}</span>
                      <span>Lng: {alert.longitude.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                  {!alert.acknowledged && (
                    <Button
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="mt-2"
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderDevices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Tracking Devices</h3>
          <p className="text-gray-600">Monitor device status and battery levels</p>
        </div>
      </div>

      <div className="grid gap-4">
        {trackingDevices.map((device) => (
          <Card key={device.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <SignalIcon className="h-6 w-6 text-blue-600" />
                  <div>
                    <h4 className="font-semibold">{device.deviceId}</h4>
                    <p className="text-gray-600">{getAssetName(device.assetId)}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Type: {device.deviceType.replace('_', ' ')}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      {device.batteryLevel && <span>Battery: {device.batteryLevel}%</span>}
                      {device.signalStrength && <span>Signal: {device.signalStrength}%</span>}
                      <span>Last Update: {new Date(device.lastUpdate).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(device.status)}`}>
                    {device.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Location Tracking</h2>
          <p className="text-gray-600">Real-time asset location monitoring and tracking</p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={activeView === 'map' ? 'default' : 'outline'}
            onClick={() => setActiveView('map')}
          >
            <GlobeAltIcon className="h-4 w-4 mr-2" />
            Map
          </Button>
          <Button
            variant={activeView === 'list' ? 'default' : 'outline'}
            onClick={() => setActiveView('list')}
          >
            <MapPinIcon className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={activeView === 'alerts' ? 'default' : 'outline'}
            onClick={() => setActiveView('alerts')}
          >
            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
            Alerts
          </Button>
          <Button
            variant={activeView === 'devices' ? 'default' : 'outline'}
            onClick={() => setActiveView('devices')}
          >
            <SignalIcon className="h-4 w-4 mr-2" />
            Devices
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tracked Assets</CardTitle>
            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trackingDevices.filter(d => d.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Updates</CardTitle>
            <ArrowPathIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationUpdates.length}</div>
            <p className="text-xs text-muted-foreground">
              Location records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <ExclamationTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {geofenceAlerts.filter(a => !a.acknowledged).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Unacknowledged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Battery Issues</CardTitle>
            <SignalIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {trackingDevices.filter(d => d.status === 'low_battery').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Low battery devices
            </p>
          </CardContent>
        </Card>
      </div>

      {activeView === 'map' && renderMapView()}
      {activeView === 'list' && renderListView()}
      {activeView === 'alerts' && renderAlerts()}
      {activeView === 'devices' && renderDevices()}
    </div>
  )
}
