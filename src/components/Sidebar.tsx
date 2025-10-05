import { useState } from 'react';
import { GPSPoint, Geofence, Track } from '../types/gps';

interface SidebarProps {
  activeTab: 'live' | 'history' | 'settings';
  setActiveTab: (tab: 'live' | 'history' | 'settings') => void;
  isTracking: boolean;
  toggleTracking: () => void;
  serialConnected: boolean;
  bluetoothConnected: boolean;
  connectSerial: () => Promise<void>;
  disconnectSerial: () => void;
  connectBluetooth: () => Promise<void>;
  disconnectBluetooth: () => void;
  isSimulatorMode: boolean;
  toggleSimulator: () => void;
  currentPoint: GPSPoint | null;
  savedTracks: Track[];
  geofences: Geofence[];
  addGeofence: (geofence: Geofence) => void;
  removeGeofence: (id: string) => void;
}

const Sidebar = ({
  activeTab,
  setActiveTab,
  isTracking,
  toggleTracking,
  serialConnected,
  bluetoothConnected,
  connectSerial,
  disconnectSerial,
  connectBluetooth,
  disconnectBluetooth,
  isSimulatorMode,
  toggleSimulator,
  currentPoint,
  savedTracks,
  geofences,
  removeGeofence
}: SidebarProps) => {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [newGeofenceName, setNewGeofenceName] = useState('');
  const [editingGeofence, setEditingGeofence] = useState<string | null>(null);

  return (
    <div className="w-80 bg-white shadow-lg flex flex-col h-screen">
      <div className="p-4 bg-green-600 text-white">
        <h1 className="text-xl font-bold">LeafTrace Lite</h1>
        <p className="text-sm">Offline GPS Tracker</p>
      </div>
      
      <div className="flex border-b">
        <button
          className={`flex-1 py-3 ${activeTab === 'live' ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-600'}`}
          onClick={() => setActiveTab('live')}
        >
          Live
        </button>
        <button
          className={`flex-1 py-3 ${activeTab === 'history' ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-600'}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button
          className={`flex-1 py-3 ${activeTab === 'settings' ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-600'}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'live' && (
          <div className="p-4">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Connection</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>USB GPS (Serial)</span>
                  {serialConnected ? (
                    <button 
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm"
                      onClick={disconnectSerial}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button 
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm"
                      onClick={connectSerial}
                      disabled={bluetoothConnected || isSimulatorMode}
                    >
                      Connect
                    </button>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Bluetooth GPS</span>
                  {bluetoothConnected ? (
                    <button 
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm"
                      onClick={disconnectBluetooth}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button 
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm"
                      onClick={connectBluetooth}
                      disabled={serialConnected || isSimulatorMode}
                    >
                      Connect
                    </button>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Simulator Mode</span>
                  <button 
                    className={`px-3 py-1 ${isSimulatorMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'} rounded-md text-sm`}
                    onClick={toggleSimulator}
                    disabled={serialConnected || bluetoothConnected}
                  >
                    {isSimulatorMode ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Current Position</h2>
              {currentPoint ? (
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Latitude:</div>
                    <div className="font-mono">{currentPoint.latitude.toFixed(6)}°</div>
                    <div>Longitude:</div>
                    <div className="font-mono">{currentPoint.longitude.toFixed(6)}°</div>
                    {currentPoint.altitude !== undefined && (
                      <>
                        <div>Altitude:</div>
                        <div className="font-mono">{currentPoint.altitude.toFixed(1)} m</div>
                      </>
                    )}
                    {currentPoint.speed !== undefined && (
                      <>
                        <div>Speed:</div>
                        <div className="font-mono">{currentPoint.speed.toFixed(1)} km/h</div>
                      </>
                    )}
                    {currentPoint.heading !== undefined && (
                      <>
                        <div>Heading:</div>
                        <div className="font-mono">{currentPoint.heading.toFixed(0)}°</div>
                      </>
                    )}
                    {currentPoint.satellites !== undefined && (
                      <>
                        <div>Satellites:</div>
                        <div className="font-mono">{currentPoint.satellites}</div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 italic">No position data available</div>
              )}
            </div>
            
            <div className="mb-6">
              <button
                className={`w-full py-3 rounded-md font-medium ${
                  isTracking
                    ? 'bg-red-600 text-white'
                    : 'bg-green-600 text-white'
                }`}
                onClick={toggleTracking}
                disabled={!serialConnected && !bluetoothConnected && !isSimulatorMode}
              >
                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">Saved Tracks</h2>
            {savedTracks.length === 0 ? (
              <div className="text-gray-500 italic">No saved tracks</div>
            ) : (
              <div className="space-y-2">
                {savedTracks.map(track => (
                  <div 
                    key={track.id}
                    className={`p-3 rounded-md cursor-pointer ${
                      selectedTrack === track.id ? 'bg-green-100 border border-green-300' : 'bg-gray-50'
                    }`}
                    onClick={() => setSelectedTrack(track.id)}
                  >
                    <div className="font-medium">{track.name}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(track.date).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {track.points.length} points
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="p-4">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Geofences</h2>
              <p className="text-sm text-gray-500 mb-2">
                Draw on the map to create new geofences
              </p>
              
              {geofences.length === 0 ? (
                <div className="text-gray-500 italic">No geofences defined</div>
              ) : (
                <div className="space-y-2">
                  {geofences.map(geofence => (
                    <div 
                      key={geofence.id}
                      className="p-3 bg-gray-50 rounded-md flex items-center"
                    >
                      <div 
                        className="w-4 h-4 rounded-full mr-2" 
                        style={{ backgroundColor: geofence.color }}
                      />
                      <div className="flex-1">
                        {editingGeofence === geofence.id ? (
                          <input
                            type="text"
                            className="w-full border rounded px-2 py-1"
                            value={newGeofenceName}
                            onChange={(e) => setNewGeofenceName(e.target.value)}
                            onBlur={() => {
                              setEditingGeofence(null);
                              // Update geofence name logic would go here
                            }}
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="font-medium"
                            onClick={() => {
                              setEditingGeofence(geofence.id);
                              setNewGeofenceName(geofence.name);
                            }}
                          >
                            {geofence.name}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          {geofence.type}
                        </div>
                      </div>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeGeofence(geofence.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">App Settings</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Offline Map Tiles</span>
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                    Download
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Clear All Data</span>
                  <button className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm">
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;