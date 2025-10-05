# LeafTrace Lite

LeafTrace Lite is an offline GPS tracking web application designed for wildlife monitoring. It runs entirely client-side in the browser with no external API dependencies.

## Features

- **Live GPS Tracking**: Connect to GPS devices via USB (Web Serial API) or Bluetooth (Web Bluetooth API)
- **Offline Operation**: Works without internet connection as a Progressive Web App (PWA)
- **Geofencing**: Create and manage geofences to monitor when tracked subjects enter or exit defined areas
- **Track Management**: Save, view, and manage tracking sessions
- **NMEA Simulator**: Test functionality without physical GPS hardware
- **Cross-Platform**: Works on any device with a compatible browser

## Technologies Used

- React + TypeScript
- Vite
- Tailwind CSS
- Leaflet + leaflet-draw
- IndexedDB (via idb library)
- Web Serial API
- Web Bluetooth API
- Progressive Web App (PWA)

## Getting Started

### Prerequisites

- Node.js and npm
- A browser that supports Web Serial API and Web Bluetooth API (Chrome, Edge, or Opera)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/samiatasnim128/LeafTrace-Lite.git
   ```

2. Navigate to the project directory:
   ```
   cd LeafTrace-Lite
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Usage

### Connecting GPS Devices

#### USB GPS Devices
1. Plug your GPS device into a USB port
2. Click "Connect Serial" in the sidebar
3. Select your device from the port selection dialog

#### Bluetooth GPS Devices
1. Ensure your Bluetooth GPS device is powered on and in pairing mode
2. Click "Connect Bluetooth" in the sidebar
3. Select your device from the device selection dialog

### Using the Simulator
If you don't have a physical GPS device:
1. Click the "Simulator" tab in the sidebar
2. Choose between "Generate Route" or "Load NMEA File"
3. Click "Start Simulation"

### Creating Geofences
1. Click the "Geofences" tab in the sidebar
2. Use the drawing tools to create circles, rectangles, or polygons
3. Name your geofence and save it

### Recording Tracks
1. Connect a GPS device or start the simulator
2. Click "Start Recording" to begin a new track
3. Click "Stop Recording" when finished
4. View saved tracks in the "Tracks" tab

## Browser Compatibility

- **Fully Compatible**: Chrome, Edge, Opera
- **Limited Compatibility**: Firefox, Safari (Web Serial and Web Bluetooth APIs not supported)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React, TypeScript, and Tailwind CSS
- Maps powered by Leaflet
- Offline storage via IndexedDB