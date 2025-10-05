import { useState, useEffect } from 'react'
import './App.css'
import MapView from './components/MapView'
import Sidebar from './components/Sidebar'
import { useGPSData } from './hooks/useGPSData'
import { useBluetoothData } from './hooks/useBluetoothData'
import { useGeofencing } from './hooks/useGeofencing'
import { useTrackStorage } from './hooks/useTrackStorage'
import { GPSPoint } from './types/gps'

function App() {
  const [activeTab, setActiveTab] = useState<'live' | 'history' | 'settings'>('live')
  const [isTracking, setIsTracking] = useState(false)
  const [trackPoints, setTrackPoints] = useState<GPSPoint[]>([])
  const [currentPoint, setCurrentPoint] = useState<GPSPoint | null>(null)
  const [isSimulatorMode, setIsSimulatorMode] = useState(false)
  
  const { 
    connectSerial, 
    disconnectSerial, 
    serialConnected, 
    serialData 
  } = useGPSData()
  
  const { 
    connectBluetooth, 
    disconnectBluetooth, 
    bluetoothConnected, 
    bluetoothData 
  } = useBluetoothData()
  
  const { 
    geofences, 
    addGeofence, 
    removeGeofence, 
    checkGeofenceAlerts 
  } = useGeofencing()
  
  const { 
    saveTracks, 
    loadTracks, 
    savedTracks 
  } = useTrackStorage()

  // Handle incoming GPS data
  useEffect(() => {
    if (!isTracking) return
    
    const newPoint = isSimulatorMode 
      ? serialData // In simulator mode, we use the simulated data
      : serialConnected 
        ? serialData 
        : bluetoothConnected 
          ? bluetoothData 
          : null
    
    if (newPoint) {
      setCurrentPoint(newPoint)
      setTrackPoints(prev => [...prev, newPoint])
      
      // Check if point is within any geofence
      checkGeofenceAlerts(newPoint)
    }
  }, [serialData, bluetoothData, isTracking, serialConnected, bluetoothConnected, isSimulatorMode, checkGeofenceAlerts])

  // Start/stop tracking
  const toggleTracking = () => {
    if (isTracking) {
      // Stop tracking and save the track
      if (trackPoints.length > 0) {
        saveTracks({
          id: Date.now().toString(),
          name: `Track ${new Date().toLocaleString()}`,
          points: trackPoints,
          date: new Date().toISOString()
        })
      }
      setTrackPoints([])
    }
    setIsTracking(!isTracking)
  }

  // Toggle simulator mode
  const toggleSimulator = () => {
    if (serialConnected) disconnectSerial()
    if (bluetoothConnected) disconnectBluetooth()
    setIsSimulatorMode(!isSimulatorMode)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isTracking={isTracking}
        toggleTracking={toggleTracking}
        serialConnected={serialConnected}
        bluetoothConnected={bluetoothConnected}
        connectSerial={connectSerial}
        disconnectSerial={disconnectSerial}
        connectBluetooth={connectBluetooth}
        disconnectBluetooth={disconnectBluetooth}
        isSimulatorMode={isSimulatorMode}
        toggleSimulator={toggleSimulator}
        currentPoint={currentPoint}
        savedTracks={savedTracks}
        geofences={geofences}
        addGeofence={addGeofence}
        removeGeofence={removeGeofence}
      />
      <main className="flex-1">
        <MapView 
          trackPoints={trackPoints}
          currentPoint={currentPoint}
          geofences={geofences}
          isEditing={activeTab === 'settings'}
          onGeofenceCreated={addGeofence}
        />
      </main>
    </div>
  )
}

export default App