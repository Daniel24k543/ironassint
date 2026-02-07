// hooks/useHealthSensors.js - Custom hook para métricas de salud
import { useState, useEffect, useRef } from 'react';
import { Accelerometer, Gyroscope, Magnetometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { Platform, Alert } from 'react-native';

export const useHealthSensors = () => {
  const [heartRate, setHeartRate] = useState(null);
  const [isHeartRateActive, setIsHeartRateActive] = useState(false);
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0 });
  const [effortLevel, setEffortLevel] = useState(0);
  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  
  const lastLocationRef = useRef(null);
  const effortHistoryRef = useRef([]);
  const heartRateSimulatorRef = useRef(null);

  useEffect(() => {
    initializeSensors();
    return () => {
      cleanup();
    };
  }, []);

  const initializeSensors = async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos de Ubicación',
          'Esta app necesita acceso a tu ubicación para rastrear entrenamientos.',
          [{ text: 'OK' }]
        );
      }

      // Initialize accelerometer
      Accelerometer.setUpdateInterval(1000);
      const accelerometerSubscription = Accelerometer.addListener(handleAccelerometerUpdate);

      // Initialize gyroscope
      Gyroscope.setUpdateInterval(1000);
      const gyroscopeSubscription = Gyroscope.addListener(handleGyroscopeUpdate);

      // Start simulated heart rate (in real app, this would come from connected device)
      startHeartRateMonitoring();

    } catch (error) {
      console.error('Error initializing sensors:', error);
      setError('Error inicializando sensores: ' + error.message);
    }
  };

  const handleAccelerometerUpdate = (data) => {
    setAccelerometerData(data);
    calculateEffortLevel(data);
  };

  const handleGyroscopeUpdate = (data) => {
    setGyroscopeData(data);
  };

  const calculateEffortLevel = (accelerometerData) => {
    // Calculate movement intensity based on accelerometer
    const { x, y, z } = accelerometerData;
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    
    // Normalize to effort level (0-100)
    const normalizedEffort = Math.min(Math.max((magnitude - 0.5) * 50, 0), 100);
    
    // Add to history for chart
    const now = Date.now();
    effortHistoryRef.current.push({
      timestamp: now,
      effort: normalizedEffort
    });
    
    // Keep only last 5 minutes of data
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    effortHistoryRef.current = effortHistoryRef.current.filter(
      entry => entry.timestamp > fiveMinutesAgo
    );
    
    setEffortLevel(normalizedEffort);
  };

  const startHeartRateMonitoring = () => {
    // Simulated heart rate (in real app, read from connected BLE device)
    // This simulates realistic heart rate with some variation
    let baseRate = 75;
    
    setIsHeartRateActive(true);
    
    heartRateSimulatorRef.current = setInterval(() => {
      // Simulate heart rate based on effort level
      const effortFactor = effortLevel / 100;
      const variableRate = baseRate + (effortFactor * 50) + (Math.random() * 10 - 5);
      const clampedRate = Math.max(60, Math.min(180, Math.round(variableRate)));
      
      setHeartRate(clampedRate);
    }, 2000); // Update every 2 seconds
  };

  const stopHeartRateMonitoring = () => {
    setIsHeartRateActive(false);
    if (heartRateSimulatorRef.current) {
      clearInterval(heartRateSimulatorRef.current);
      heartRateSimulatorRef.current = null;
    }
  };

  const startRunningSession = async () => {
    if (!hasLocationPermission) {
      Alert.alert('Error', 'Se necesitan permisos de ubicación para rastrear el running');
      return;
    }

    try {
      setIsRunning(true);
      setDistance(0);
      lastLocationRef.current = null;

      // Get initial location
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      setLocation(initialLocation);
      lastLocationRef.current = initialLocation;

      // Start watching location
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (newLocation) => {
          setLocation(newLocation);
          updateDistance(newLocation);
        }
      );

      return () => {
        locationSubscription.remove();
      };
    } catch (error) {
      console.error('Error starting running session:', error);
      setError('Error iniciando sesión de running: ' + error.message);
      setIsRunning(false);
    }
  };

  const stopRunningSession = () => {
    setIsRunning(false);
  };

  const updateDistance = (newLocation) => {
    if (!lastLocationRef.current) {
      lastLocationRef.current = newLocation;
      return;
    }

    const lastLoc = lastLocationRef.current.coords;
    const newLoc = newLocation.coords;
    
    // Calculate distance using Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = toRad(newLoc.latitude - lastLoc.latitude);
    const dLon = toRad(newLoc.longitude - lastLoc.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lastLoc.latitude)) * Math.cos(toRad(newLoc.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceInKm = R * c;
    
    setDistance(prev => prev + distanceInKm);
    lastLocationRef.current = newLocation;
  };

  const toRad = (value) => {
    return value * Math.PI / 180;
  };

  const getEffortHistory = () => {
    return effortHistoryRef.current;
  };

  const cleanup = () => {
    if (heartRateSimulatorRef.current) {
      clearInterval(heartRateSimulatorRef.current);
    }
    
    // Unsubscribe from sensors
    Accelerometer.removeAllListeners?.();
    Gyroscope.removeAllListeners?.();
  };

  return {
    // Heart Rate
    heartRate,
    isHeartRateActive,
    startHeartRateMonitoring,
    stopHeartRateMonitoring,
    
    // Motion Sensors
    accelerometerData,
    gyroscopeData,
    effortLevel,
    getEffortHistory,
    
    // Location & Running
    location,
    distance,
    hasLocationPermission,
    isRunning,
    startRunningSession,
    stopRunningSession,
    
    // General
    error,
    initializeSensors
  };
};