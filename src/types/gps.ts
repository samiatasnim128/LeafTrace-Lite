export interface GPSPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
  accuracy?: number;
  satellites?: number;
}

export interface Track {
  id: string;
  name: string;
  points: GPSPoint[];
  date: string;
}

export interface Geofence {
  id: string;
  name: string;
  type: 'circle' | 'polygon' | 'rectangle';
  coordinates: number[][] | [number, number, number]; // For polygon: [[lat, lng], ...], for circle: [lat, lng, radius]
  color: string;
}

export interface NMEAData {
  type: string;
  data: Record<string, any>;
  raw: string;
}