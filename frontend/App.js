import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import { getApiBaseUrl } from './src/config/api';

export default function App() {
  // Navigation & Authentication state
  const [userToken, setUserToken] = useState(null);
  const [username, setUsername] = useState('');
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());

  // Handle successful login
  const handleLoginSuccess = (token, user, currentUrl) => {
    setUserToken(token);
    setUsername(user);
    if (currentUrl) {
      setApiUrl(currentUrl);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setUserToken(null);
    setUsername('');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {userToken ? (
        <DashboardScreen
          userToken={userToken}
          username={username}
          apiUrl={apiUrl}
          onLogout={handleLogout}
        />
      ) : (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});
