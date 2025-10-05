import { useState, useCallback, useEffect } from 'react';
import { GPSPoint } from '../types/gps';
import { parseNMEA, nmeaToGpsPoint } from '../utils/nmea';

// Bluetooth GATT service and characteristic UUIDs for common GPS devices
const UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const UART_RX_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const UART_TX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

export function useBluetoothData() {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [bluetoothConnected, setBluetoothConnected] = useState(false);
  const [bluetoothData, setBluetoothData] = useState<GPSPoint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buffer, setBuffer] = useState<string>('');

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      disconnectBluetooth();
    };
  }, []);

  // Handle incoming NMEA data from Bluetooth
  const handleNmeaData = useCallback((value: DataView) => {
    const decoder = new TextDecoder('utf-8');
    const chunk = decoder.decode(value);
    const newBuffer = buffer + chunk;
    setBuffer(newBuffer);

    // Process complete NMEA sentences
    const sentences = newBuffer.split('\r\n');
    if (sentences.length > 1) {
      // Keep the last incomplete sentence in buffer
      setBuffer(sentences[sentences.length - 1]);

      // Process complete sentences
      for (let i = 0; i < sentences.length - 1; i++) {
        const sentence = sentences[i].trim();
        if (sentence) {
          const nmeaData = parseNMEA(sentence);
          if (nmeaData) {
            const gpsPoint = nmeaToGpsPoint(nmeaData);
            if (gpsPoint) {
              setBluetoothData(gpsPoint);
            }
          }
        }
      }
    }
  }, [buffer]);

  // Connect to a Bluetooth device
  const connectBluetooth = useCallback(async () => {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth API not supported in this browser');
      }

      // Request device with UART service
      const selectedDevice = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [UART_SERVICE_UUID] },
          { namePrefix: 'GPS' },
          { namePrefix: 'BT' }
        ],
        optionalServices: [UART_SERVICE_UUID]
      });

      setDevice(selectedDevice);

      // Set up disconnect listener
      selectedDevice.addEventListener('gattserverdisconnected', () => {
        setBluetoothConnected(false);
        setDevice(null);
        setCharacteristic(null);
      });

      // Connect to GATT server
      const server = await selectedDevice.gatt?.connect();
      if (!server) {
        throw new Error('Failed to connect to GATT server');
      }

      // Get UART service
      const service = await server.getPrimaryService(UART_SERVICE_UUID);

      // Get TX characteristic (device -> app)
      const txCharacteristic = await service.getCharacteristic(UART_TX_CHARACTERISTIC_UUID);

      // Start notifications
      await txCharacteristic.startNotifications();
      txCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
        if (value) {
          handleNmeaData(value);
        }
      });

      setCharacteristic(txCharacteristic);
      setBluetoothConnected(true);
      setError(null);

    } catch (err) {
      console.error('Error connecting to Bluetooth device:', err);
      setError(err instanceof Error ? err.message : 'Unknown error connecting to Bluetooth device');
      setBluetoothConnected(false);
    }
  }, [handleNmeaData]);

  // Disconnect from the Bluetooth device
  const disconnectBluetooth = useCallback(async () => {
    try {
      if (characteristic) {
        try {
          await characteristic.stopNotifications();
        } catch (e) {
          console.warn('Error stopping notifications:', e);
        }
        setCharacteristic(null);
      }

      if (device?.gatt?.connected) {
        device.gatt.disconnect();
      }
      
      setDevice(null);
      setBluetoothConnected(false);
    } catch (err) {
      console.error('Error disconnecting from Bluetooth device:', err);
    }
  }, [device, characteristic]);

  return {
    connectBluetooth,
    disconnectBluetooth,
    bluetoothConnected,
    bluetoothData,
    error
  };
}