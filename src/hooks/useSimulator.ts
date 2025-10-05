import { useState, useEffect, useCallback } from 'react';
import { nmeaSimulator } from '../services/simulator';
import { parseNMEA } from '../utils/nmea';
import { GPSPoint, NMEAData } from '../types/gps';

export function useSimulator() {
  const [isActive, setIsActive] = useState(false);
  const [currentData, setCurrentData] = useState<NMEAData | null>(null);
  const [currentPosition, setCurrentPosition] = useState<GPSPoint | null>(null);
  const [customNmeaFile, setCustomNmeaFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle NMEA data from simulator
  const handleNmeaData = useCallback((data: string) => {
    try {
      const parsedData = parseNMEA(data);
      if (parsedData) {
        setCurrentData(parsedData);
        
        // Convert NMEA data to GPSPoint if it contains position
        if (parsedData.latitude !== undefined && parsedData.longitude !== undefined) {
          const point: GPSPoint = {
            latitude: parsedData.latitude,
            longitude: parsedData.longitude,
            altitude: parsedData.altitude,
            speed: parsedData.speed,
            heading: parsedData.course,
            timestamp: new Date()
          };
          setCurrentPosition(point);
        }
      }
    } catch (err) {
      console.error('Error parsing NMEA data:', err);
      setError('Failed to parse NMEA data');
    }
  }, []);

  // Set up event listener when simulator is active
  useEffect(() => {
    if (isActive) {
      nmeaSimulator.on('data', handleNmeaData);
    }
    
    return () => {
      nmeaSimulator.off('data', handleNmeaData);
    };
  }, [isActive, handleNmeaData]);

  // Start simulator
  const startSimulator = useCallback(async (options?: {
    interval?: number;
    startPosition?: [number, number];
    route?: [number, number][];
  }) => {
    try {
      setError(null);
      
      // If custom NMEA file is provided, load it
      if (customNmeaFile) {
        const text = await customNmeaFile.text();
        nmeaSimulator.loadNmeaFile(text);
      }
      
      nmeaSimulator.start(options);
      setIsActive(true);
      return true;
    } catch (err) {
      console.error('Failed to start simulator:', err);
      setError('Failed to start simulator');
      return false;
    }
  }, [customNmeaFile]);

  // Stop simulator
  const stopSimulator = useCallback(() => {
    nmeaSimulator.stop();
    setIsActive(false);
    setCurrentData(null);
    setCurrentPosition(null);
  }, []);

  // Load custom NMEA file
  const loadNmeaFile = useCallback(async (file: File) => {
    try {
      setCustomNmeaFile(file);
      return true;
    } catch (err) {
      console.error('Failed to load NMEA file:', err);
      setError('Failed to load NMEA file');
      return false;
    }
  }, []);

  return {
    isActive,
    currentData,
    currentPosition,
    error,
    startSimulator,
    stopSimulator,
    loadNmeaFile
  };
}