import React from 'react';

const Documentation: React.FC = () => {
  return (
    <div className="documentation p-4 overflow-y-auto max-h-[calc(100vh-120px)]">
      <h2 className="text-2xl font-bold mb-4">LeafTrace Lite Documentation</h2>
      
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Getting Started</h3>
        <p className="mb-2">
          LeafTrace Lite is an offline GPS tracking application that runs entirely in your browser.
          It supports three methods of GPS data input:
        </p>
        <ul className="list-disc pl-5 mb-4">
          <li>USB GPS devices via Web Serial API</li>
          <li>Bluetooth GPS devices via Web Bluetooth API</li>
          <li>NMEA file simulation for testing without hardware</li>
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Connecting USB GPS Devices</h3>
        <p className="mb-2">
          LeafTrace Lite supports any USB GPS device that outputs standard NMEA sentences.
          Follow these steps to connect your USB GPS device:
        </p>
        <ol className="list-decimal pl-5 mb-4">
          <li>Plug your GPS device into a USB port on your computer</li>
          <li>Click the "Connect Serial" button in the sidebar</li>
          <li>Select your GPS device from the port selection dialog</li>
          <li>If prompted, select the appropriate baud rate (typically 4800 or 9600)</li>
        </ol>
        
        <p className="mb-2 font-semibold">Compatible USB GPS Devices:</p>
        <ul className="list-disc pl-5 mb-4">
          <li>GlobalSat BU-353S4 USB GPS Receiver</li>
          <li>U-blox NEO-6M/7M/8M USB GPS modules</li>
          <li>Columbus V-800/V-900 GPS data loggers</li>
          <li>Any GPS device with a USB interface that outputs NMEA 0183 sentences</li>
        </ul>
        
        <p className="mb-2 text-sm bg-gray-100 p-2 rounded">
          <strong>Note:</strong> The Web Serial API requires a secure context (HTTPS) except on localhost.
          Chrome, Edge, and Opera support the Web Serial API, but Firefox and Safari do not currently support it.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Connecting Bluetooth GPS Devices</h3>
        <p className="mb-2">
          LeafTrace Lite supports Bluetooth GPS devices that implement the Bluetooth GATT protocol.
          Follow these steps to connect your Bluetooth GPS device:
        </p>
        <ol className="list-decimal pl-5 mb-4">
          <li>Ensure your Bluetooth GPS device is powered on and in pairing mode</li>
          <li>Click the "Connect Bluetooth" button in the sidebar</li>
          <li>Select your GPS device from the device selection dialog</li>
          <li>Wait for the connection to be established</li>
        </ol>
        
        <p className="mb-2 font-semibold">Compatible Bluetooth GPS Devices:</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Dual XGPS150/160 Bluetooth GPS Receivers</li>
          <li>Bad Elf GPS Pro/Pro+/Surveyor</li>
          <li>Garmin GLO/GLO 2 GPS Receivers</li>
          <li>Any Bluetooth GPS device that supports GATT and provides NMEA data</li>
        </ul>
        
        <p className="mb-2 text-sm bg-gray-100 p-2 rounded">
          <strong>Note:</strong> The Web Bluetooth API requires a secure context (HTTPS) except on localhost.
          Chrome, Edge, and Opera support the Web Bluetooth API, but Firefox and Safari do not currently support it.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Using the NMEA Simulator</h3>
        <p className="mb-2">
          If you don't have a physical GPS device, you can use the built-in NMEA simulator:
        </p>
        <ol className="list-decimal pl-5 mb-4">
          <li>Click the "Simulator" tab in the sidebar</li>
          <li>Choose between "Generate Route" (creates a simulated path) or "Load NMEA File"</li>
          <li>If loading a file, click "Browse" and select a .nmea or .txt file containing NMEA sentences</li>
          <li>Click "Start Simulation" to begin</li>
        </ol>
        
        <p className="mb-2 font-semibold">NMEA File Format:</p>
        <p className="mb-2">
          NMEA files should contain standard NMEA 0183 sentences, with one sentence per line.
          The simulator supports GGA, RMC, and VTG sentence types.
        </p>
        <pre className="bg-gray-100 p-2 rounded text-xs mb-4">
          $GPGGA,092750.000,5321.6802,N,00630.3372,W,1,8,1.03,61.7,M,55.2,M,,*76
          $GPRMC,092750.000,A,5321.6802,N,00630.3372,W,0.02,31.66,280511,,,A*43
          $GPVTG,31.66,T,,M,0.02,N,0.04,K,A*25
        </pre>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Troubleshooting</h3>
        
        <p className="mb-2 font-semibold">USB Connection Issues:</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Ensure your browser supports the Web Serial API (Chrome, Edge, Opera)</li>
          <li>Try a different USB port</li>
          <li>Check if your device requires drivers and install them if needed</li>
          <li>Try different baud rate settings (common rates: 4800, 9600, 38400)</li>
        </ul>
        
        <p className="mb-2 font-semibold">Bluetooth Connection Issues:</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Ensure your browser supports the Web Bluetooth API (Chrome, Edge, Opera)</li>
          <li>Make sure your device is in pairing mode</li>
          <li>Try restarting your Bluetooth device</li>
          <li>Check if your device requires a specific app for initial setup</li>
        </ul>
        
        <p className="mb-2 font-semibold">No GPS Data:</p>
        <ul className="list-disc pl-5 mb-4">
          <li>If using a physical GPS device, ensure it has a clear view of the sky</li>
          <li>Wait for the device to acquire a GPS fix (may take a few minutes)</li>
          <li>Check the connection status in the sidebar</li>
          <li>Try the simulator to verify the application is working correctly</li>
        </ul>
      </section>
    </div>
  );
};

export default Documentation;