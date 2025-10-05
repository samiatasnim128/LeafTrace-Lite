import { useState, useCallback } from 'react';
import L from 'leaflet';
import { Geofence, GPSPoint } from '../types/gps';

export function useGeofencing() {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [alerts, setAlerts] = useState<{id: string, name: string}[]>([]);

  // Add a new geofence
  const addGeofence = useCallback((geofence: Geofence) => {
    setGeofences(prev => [...prev, geofence]);
  }, []);

  // Remove a geofence by ID
  const removeGeofence = useCallback((id: string) => {
    setGeofences(prev => prev.filter(g => g.id !== id));
  }, []);

  // Update a geofence
  const updateGeofence = useCallback((id: string, updates: Partial<Geofence>) => {
    setGeofences(prev => 
      prev.map(g => g.id === id ? { ...g, ...updates } : g)
    );
  }, []);

  // Check if a point is inside any geofence
  const checkGeofenceAlerts = useCallback((point: GPSPoint) => {
    const newAlerts: {id: string, name: string}[] = [];
    
    geofences.forEach(geofence => {
      let isInside = false;
      
      if (geofence.type === 'circle') {
        const [centerLat, centerLng, radius] = geofence.coordinates as [number, number, number];
        const distance = L.latLng(centerLat, centerLng).distanceTo(L.latLng(point.latitude, point.longitude));
        isInside = distance <= radius;
      } 
      else if (geofence.type === 'polygon' || geofence.type === 'rectangle') {
        const latLngs = (geofence.coordinates as number[][]).map(
          ([lat, lng]) => L.latLng(lat, lng)
        );
        const polygon = L.polygon(latLngs);
        isInside = polygon.contains(L.latLng(point.latitude, point.longitude));
      }
      
      if (isInside) {
        newAlerts.push({
          id: geofence.id,
          name: geofence.name
        });
      }
    });
    
    setAlerts(newAlerts);
    return newAlerts;
  }, [geofences]);

  return {
    geofences,
    alerts,
    addGeofence,
    removeGeofence,
    updateGeofence,
    checkGeofenceAlerts
  };
}