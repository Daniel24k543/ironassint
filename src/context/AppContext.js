import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Estados iniciales
const initialState = {
  user: null,
  isLoggedIn: false,
  isLoading: true,
  workouts: [],
  streaks: 0,
  emotionalState: 'neutral',
  heartRate: 0,
  bluetoothConnected: false,
  aiConversation: [],
  rewards: 0,
  shopItems: [],
  feed: [],
};

// Tipos de acciones
export const ACTION_TYPES = {
  SET_USER: 'SET_USER',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  ADD_WORKOUT: 'ADD_WORKOUT',
  UPDATE_STREAKS: 'UPDATE_STREAKS',
  UPDATE_EMOTIONAL_STATE: 'UPDATE_EMOTIONAL_STATE',
  UPDATE_HEART_RATE: 'UPDATE_HEART_RATE',
  TOGGLE_BLUETOOTH: 'TOGGLE_BLUETOOTH',
  ADD_AI_MESSAGE: 'ADD_AI_MESSAGE',
  ADD_REWARDS: 'ADD_REWARDS',
  SET_SHOP_ITEMS: 'SET_SHOP_ITEMS',
  SET_FEED: 'SET_FEED',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_USER:
      return { ...state, user: action.payload };
    case ACTION_TYPES.LOGIN:
      return { ...state, isLoggedIn: true, user: action.payload };
    case ACTION_TYPES.LOGOUT:
      return { ...state, isLoggedIn: false, user: null };
    case ACTION_TYPES.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ACTION_TYPES.ADD_WORKOUT:
      return { 
        ...state, 
        workouts: [...state.workouts, action.payload],
        streaks: state.streaks + 1 
      };
    case ACTION_TYPES.UPDATE_STREAKS:
      return { ...state, streaks: action.payload };
    case ACTION_TYPES.UPDATE_EMOTIONAL_STATE:
      return { ...state, emotionalState: action.payload };
    case ACTION_TYPES.UPDATE_HEART_RATE:
      return { ...state, heartRate: action.payload };
    case ACTION_TYPES.TOGGLE_BLUETOOTH:
      return { ...state, bluetoothConnected: action.payload };
    case ACTION_TYPES.ADD_AI_MESSAGE:
      return { 
        ...state, 
        aiConversation: [...state.aiConversation, action.payload] 
      };
    case ACTION_TYPES.ADD_REWARDS:
      return { ...state, rewards: state.rewards + action.payload };
    case ACTION_TYPES.SET_SHOP_ITEMS:
      return { ...state, shopItems: action.payload };
    case ACTION_TYPES.SET_FEED:
      return { ...state, feed: action.payload };
    default:
      return state;
  }
};

// Contexto
const AppContext = createContext();

// Provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Cargar datos persistidos al iniciar
  useEffect(() => {
    loadPersistedData();
  }, []);

  const loadPersistedData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const streaks = await AsyncStorage.getItem('streaks');
      const workouts = await AsyncStorage.getItem('workouts');
      
      if (userData) {
        const user = JSON.parse(userData);
        dispatch({ type: ACTION_TYPES.SET_USER, payload: user });
        dispatch({ type: ACTION_TYPES.LOGIN, payload: user });
      }
      
      if (streaks) {
        dispatch({ type: ACTION_TYPES.UPDATE_STREAKS, payload: parseInt(streaks) });
      }
      
      if (workouts) {
        const workoutData = JSON.parse(workouts);
        workoutData.forEach(workout => {
          dispatch({ type: ACTION_TYPES.ADD_WORKOUT, payload: workout });
        });
      }
    } catch (error) {
      console.log('Error loading persisted data:', error);
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Funciones helper
  const saveUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.log('Error saving user data:', error);
    }
  };

  const saveStreaks = async (streaks) => {
    try {
      await AsyncStorage.setItem('streaks', streaks.toString());
    } catch (error) {
      console.log('Error saving streaks:', error);
    }
  };

  const value = {
    state,
    dispatch,
    actions: {
      login: (userData) => {
        dispatch({ type: ACTION_TYPES.LOGIN, payload: userData });
        saveUserData(userData);
      },
      logout: () => {
        dispatch({ type: ACTION_TYPES.LOGOUT });
        AsyncStorage.clear();
      },
      addWorkout: (workout) => {
        dispatch({ type: ACTION_TYPES.ADD_WORKOUT, payload: workout });
        saveStreaks(state.streaks + 1);
      },
      updateEmotionalState: (state) => {
        dispatch({ type: ACTION_TYPES.UPDATE_EMOTIONAL_STATE, payload: state });
      },
      updateHeartRate: (rate) => {
        dispatch({ type: ACTION_TYPES.UPDATE_HEART_RATE, payload: rate });
      },
      toggleBluetooth: (connected) => {
        dispatch({ type: ACTION_TYPES.TOGGLE_BLUETOOTH, payload: connected });
      },
      addAIMessage: (message) => {
        dispatch({ type: ACTION_TYPES.ADD_AI_MESSAGE, payload: message });
      },
      addRewards: (amount) => {
        dispatch({ type: ACTION_TYPES.ADD_REWARDS, payload: amount });
      },
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook personalizado
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};