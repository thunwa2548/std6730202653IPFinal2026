import { Platform } from 'react-native';

// Default to the live university cloud server where the backend is currently running:
let currentApiUrl = 'http://119.59.102.161:3060';

export const getApiBaseUrl = () => currentApiUrl;

export const setApiBaseUrl = (newUrl) => {
  if (newUrl && newUrl.trim() !== '') {
    currentApiUrl = newUrl.trim().replace(/\/+$/, '');
  }
};

export let API_BASE_URL = currentApiUrl;

export const API_PRESETS = [
  { label: 'PuTTY / University Server (Live Cloud)', url: 'http://119.59.102.161:3060' },
  { label: 'Localhost (Port 3060)', url: 'http://localhost:3060' },
  { label: 'Localhost (Port 5000)', url: 'http://localhost:5000' },
  { label: 'Android Emulator (Port 3060)', url: 'http://10.0.2.2:3060' },
  { label: 'Android Emulator (Port 5000)', url: 'http://10.0.2.2:5000' }
];
