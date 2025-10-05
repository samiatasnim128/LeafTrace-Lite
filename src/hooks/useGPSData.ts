import { useState, useCallback, useEffect } from 'react';
import { GPSPoint } from '../types/gps';
import { parseNMEA, nmeaToGpsPoint } from '../utils/nmea';

export function useGPSData() {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [reader, setReader] = useState<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const [serialConnected, setSerialConnected] = useState(false);
  const [serialData, setSerialData] = useState<GPSPoint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buffer, setBuffer] = useState<string>('');

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      disconnectSerial();
    };
  }, []);

  // Connect to a serial port
  const connectSerial = useCallback(async () => {
    try {
      if (!navigator.serial) {
        throw new Error('Web Serial API not supported in this browser');
      }

      // Request port access
      const selectedPort = await navigator.serial.requestPort({
        filters: [] // No filters, let user select any device
      });

      // Open the port with appropriate settings for GPS devices
      await selectedPort.open({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        bufferSize: 4096
      });

      setPort(selectedPort);
      setSerialConnected(true);
      setError(null);

      // Start reading data
      const portReader = selectedPort.readable.getReader();
      setReader(portReader);

      // Process incoming data
      const processData = async () => {
        try {
          while (true) {
            const { value, done } = await portReader.read();
            if (done) {
              break;
            }

            // Convert bytes to string and add to buffer
            const chunk = new TextDecoder().decode(value);
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
                      setSerialData(gpsPoint);
                    }
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error('Error reading from serial port:', err);
          setError('Error reading data from GPS device');
          disconnectSerial();
        } finally {
          portReader.releaseLock();
        }
      };

      processData();
    } catch (err) {
      console.error('Error connecting to serial port:', err);
      setError(err instanceof Error ? err.message : 'Unknown error connecting to GPS device');
      setSerialConnected(false);
    }
  }, [buffer]);

  // Disconnect from the serial port
  const disconnectSerial = useCallback(async () => {
    try {
      if (reader) {
        await reader.cancel();
        setReader(null);
      }

      if (port) {
        await port.close();
        setPort(null);
      }
    } catch (err) {
      console.error('Error disconnecting from serial port:', err);
    } finally {
      setSerialConnected(false);
    }
  }, [port, reader]);

  return {
    connectSerial,
    disconnectSerial,
    serialConnected,
    serialData,
    error
  };
}