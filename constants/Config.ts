// Configuration constants for Iron Assistant

export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'https://ironassint-production.up.railway.app/api' : 'https://ironassint-production.up.railway.app/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

export const FIREBASE_CONFIG = {
  apiKey: "demo-api-key",
  authDomain: "iron-assistant-dev.firebaseapp.com", 
  projectId: "iron-assistant-dev",
  storageBucket: "iron-assistant-dev.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

export const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: __DEV__ 
    ? 'pk_test_demo_key' 
    : 'pk_live_your_live_key'
};

export const OPENAI_CONFIG = {
  API_KEY: 'demo-openai-key' // This should come from your backend
};

export const APP_CONFIG = {
  VERSION: '1.0.0',
  ENVIRONMENT: __DEV__ ? 'development' : 'production',
  LOG_LEVEL: __DEV__ ? 'debug' : 'info'
};