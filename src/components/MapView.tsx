import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { GPSPoint, Geofence } from '../types/gps';

// Import Leaflet Draw plugin
import 'leaflet-draw';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  trackPoints: GPSPoint[];
  currentPoint: GPSPoint | null;
  geofences: Geofence[];
  isEditing: boolean;
  onGeofenceCreated: (geofence: Geofence) => void;
}

const MapView = ({ 
  trackPoints, 
  currentPoint, 
  geofences, 
  isEditing, 
  onGeofenceCreated 
}: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const trackLayerRef = useRef<L.Polyline | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const geofenceLayersRef = useRef<Record<string, L.Layer>>({});
  const drawControlRef = useRef<L.Control.Draw | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map').setView([51.505, -0.09], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      
      // Initialize track layer
      trackLayerRef.current = L.polyline([], { 
        color: '#3388ff', 
        weight: 4,
        opacity: 0.7 
      }).addTo(map);
      
      // Initialize current position marker
      markerRef.current = L.marker([0, 0], {
        icon: L.divIcon({
          className: 'current-position-marker',
          html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      });
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle draw control for geofencing
  useEffect(() => {
    if (!mapRef.current) return;
    
    if (isEditing) {
      // Add draw control if in editing mode
      if (!drawControlRef.current) {
        const drawControl = new L.Control.Draw({
          draw: {
            polyline: false,
            marker: false,
            circlemarker: false,
            circle: true,
            polygon: true,
            rectangle: true
          },
          edit: {
            featureGroup: L.featureGroup([]),
            edit: false
          }
        });
        
        mapRef.current.addControl(drawControl);
        drawControlRef.current = drawControl;
        
        // Handle created geofences
        mapRef.current.on(L.Draw.Event.CREATED, (event: any) => {
          const layer = event.layer;
          const type = event.layerType;
          let coordinates: number[][] | [number, number, number];
          let geofenceId = Date.now().toString();
          
          if (type === 'circle') {
            const center = layer.getLatLng();
            const radius = layer.getRadius();
            coordinates = [center.lat, center.lng, radius];
          } else if (type === 'polygon' || type === 'rectangle') {
            coordinates = layer.getLatLngs()[0].map((latlng: L.LatLng) => [latlng.lat, latlng.lng]);
          } else {
            return;
          }
          
          const geofence: Geofence = {
            id: geofenceId,
            name: `Geofence ${geofenceId.slice(-4)}`,
            type: type as 'circle' | 'polygon' | 'rectangle',
            coordinates,
            color: '#ff3300'
          };
          
          onGeofenceCreated(geofence);
        });
      }
    } else {
      // Remove draw control if not in editing mode
      if (drawControlRef.current) {
        mapRef.current.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }
    }
  }, [isEditing, onGeofenceCreated]);

  // Update track on map
  useEffect(() => {
    if (!mapRef.current || !trackLayerRef.current) return;
    
    const latLngs = trackPoints.map(point => L.latLng(point.latitude, point.longitude));
    trackLayerRef.current.setLatLngs(latLngs);
    
    // Fit map to track if we have points
    if (latLngs.length > 0) {
      mapRef.current.fitBounds(trackLayerRef.current.getBounds(), {
        padding: [50, 50],
        maxZoom: 16
      });
    }
  }, [trackPoints]);

  // Update current position marker
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !currentPoint) return;
    
    const position = L.latLng(currentPoint.latitude, currentPoint.longitude);
    markerRef.current.setLatLng(position).addTo(mapRef.current);
    
    // Center map on current position if tracking
    mapRef.current.panTo(position);
  }, [currentPoint]);

  // Update geofences on map
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Remove old geofence layers
    Object.values(geofenceLayersRef.current).forEach(layer => {
      if (mapRef.current) mapRef.current.removeLayer(layer);
    });
    geofenceLayersRef.current = {};
    
    // Add new geofence layers
    geofences.forEach(geofence => {
      let layer: L.Layer;
      
      if (geofence.type === 'circle') {
        const [lat, lng, radius] = geofence.coordinates as [number, number, number];
        layer = L.circle([lat, lng], {
          radius,
          color: geofence.color,
          fillOpacity: 0.2
        });
      } else {
        const latLngs = (geofence.coordinates as number[][]).map(
          ([lat, lng]) => L.latLng(lat, lng)
        );
        
        if (geofence.type === 'polygon') {
          layer = L.polygon(latLngs, {
            color: geofence.color,
            fillOpacity: 0.2
          });
        } else { // rectangle
          layer = L.rectangle(L.latLngBounds(latLngs), {
            color: geofence.color,
            fillOpacity: 0.2
          });
        }
      }
      
      layer.bindTooltip(geofence.name);
      layer.addTo(mapRef.current);
      geofenceLayersRef.current[geofence.id] = layer;
    });
  }, [geofences]);

  return <div id="map" className="h-full w-full" />;
};

export default MapView;