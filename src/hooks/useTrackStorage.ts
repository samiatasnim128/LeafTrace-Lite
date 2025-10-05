import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Track, GPSPoint } from '../types/gps';
import * as db from '../services/db';

export function useTrackStorage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Load tracks from IndexedDB on component mount
  useEffect(() => {
    const loadTracks = async () => {
      try {
        const loadedTracks = await db.getTracks();
        setTracks(loadedTracks);
      } catch (error) {
        console.error('Failed to load tracks:', error);
      }
    };

    loadTracks();
  }, []);

  // Start a new track recording
  const startRecording = useCallback((name: string = 'Unnamed Track') => {
    const newTrack: Track = {
      id: uuidv4(),
      name,
      date: new Date(),
      points: [],
      distance: 0,
      duration: 0
    };
    
    setCurrentTrack(newTrack);
    setIsRecording(true);
    
    return newTrack;
  }, []);

  // Add a point to the current track
  const addPoint = useCallback((point: GPSPoint) => {
    if (!isRecording || !currentTrack) return;
    
    setCurrentTrack(prev => {
      if (!prev) return null;
      
      const updatedPoints = [...prev.points, point];
      
      // Calculate distance if we have at least two points
      let updatedDistance = prev.distance;
      if (updatedPoints.length >= 2) {
        const lastPoint = updatedPoints[updatedPoints.length - 2];
        const newPoint = updatedPoints[updatedPoints.length - 1];
        
        // Haversine formula for distance calculation
        const R = 6371e3; // Earth radius in meters
        const φ1 = lastPoint.latitude * Math.PI / 180;
        const φ2 = newPoint.latitude * Math.PI / 180;
        const Δφ = (newPoint.latitude - lastPoint.latitude) * Math.PI / 180;
        const Δλ = (newPoint.longitude - lastPoint.longitude) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        updatedDistance += distance;
      }
      
      // Calculate duration
      const duration = point.timestamp 
        ? (point.timestamp.getTime() - prev.date.getTime()) / 1000 
        : prev.duration;
      
      return {
        ...prev,
        points: updatedPoints,
        distance: updatedDistance,
        duration
      };
    });
  }, [isRecording, currentTrack]);

  // Stop recording and save the track
  const stopRecording = useCallback(async () => {
    if (!currentTrack) return null;
    
    try {
      await db.saveTracks(currentTrack);
      setTracks(prev => [...prev, currentTrack]);
      setIsRecording(false);
      
      const savedTrack = { ...currentTrack };
      setCurrentTrack(null);
      
      return savedTrack;
    } catch (error) {
      console.error('Failed to save track:', error);
      return null;
    }
  }, [currentTrack]);

  // Delete a track
  const deleteTrack = useCallback(async (id: string) => {
    try {
      await db.deleteTrack(id);
      setTracks(prev => prev.filter(track => track.id !== id));
      return true;
    } catch (error) {
      console.error('Failed to delete track:', error);
      return false;
    }
  }, []);

  // Update a track's name
  const updateTrackName = useCallback(async (id: string, name: string) => {
    try {
      const track = await db.getTrack(id);
      if (!track) return false;
      
      const updatedTrack = { ...track, name };
      await db.saveTracks(updatedTrack);
      
      setTracks(prev => 
        prev.map(t => t.id === id ? updatedTrack : t)
      );
      
      return true;
    } catch (error) {
      console.error('Failed to update track name:', error);
      return false;
    }
  }, []);

  return {
    tracks,
    currentTrack,
    isRecording,
    startRecording,
    addPoint,
    stopRecording,
    deleteTrack,
    updateTrackName
  };
}