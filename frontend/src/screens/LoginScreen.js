import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { getApiBaseUrl, setApiBaseUrl, API_PRESETS } from '../config/api';

// Cross-platform Alert helper (Web uses window.alert, Mobile uses Alert.alert)
const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverUrl, setServerUrl] = useState(getApiBaseUrl());
  const [showServerConfig, setShowServerConfig] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      showAlert('Validation Error', 'Please enter both username and password.');
      return;
    }

    setLoading(true);
    const targetUrl = serverUrl.trim().replace(/\/+$/, '');
    setApiBaseUrl(targetUrl);

    try {
      console.log('Sending login request to:', `${targetUrl}/api/login`);
      const response = await fetch(`${targetUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Successful login
        onLoginSuccess(data.token || 'mock-jwt-token', username.trim(), targetUrl);
      } else {
        // Status 401 or other non-200 responses
        showAlert('Login Failed', data.message || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login Network Error:', error);
      showAlert(
        'Connection Error',
        `Unable to reach backend at ${targetUrl}.\n\nEnsure backend is running (port 3060) and your API URL is configured correctly below.\n\nError: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const selectPreset = (url) => {
    setServerUrl(url);
    setApiBaseUrl(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header & Logo */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>👥</Text>
            </View>
            <Text style={styles.title}>HR Manager</Text>
            <Text style={styles.subtitle}>Salary Analytics & Employee Portal</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>
              Use your admin credentials to access the system
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                autoCorrect={false}
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Server URL Config Accordion */}
          <View style={styles.serverConfigContainer}>
            <TouchableOpacity
              style={styles.serverConfigToggle}
              onPress={() => setShowServerConfig(!showServerConfig)}
              activeOpacity={0.7}
            >
              <Text style={styles.serverConfigToggleText}>
                ⚙️ Backend Server URL: <Text style={styles.serverActiveUrl}>{serverUrl}</Text>
              </Text>
              <Text style={styles.toggleArrow}>{showServerConfig ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {showServerConfig && (
              <View style={styles.serverConfigContent}>
                <Text style={styles.serverInputLabel}>Custom API Base URL:</Text>
                <TextInput
                  style={styles.serverInput}
                  value={serverUrl}
                  onChangeText={(val) => {
                    setServerUrl(val);
                    setApiBaseUrl(val);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="http://119.59.102.161:3060"
                />

                <Text style={styles.presetsLabel}>Quick Presets:</Text>
                <View style={styles.presetList}>
                  {API_PRESETS.map((p, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.presetChip,
                        serverUrl === p.url && styles.presetChipActive
                      ]}
                      onPress={() => selectPreset(p.url)}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          serverUrl === p.url && styles.presetChipTextActive
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  loginButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  serverConfigContainer: {
    marginTop: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  serverConfigToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  serverConfigToggleText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  serverActiveUrl: {
    color: '#2563eb',
    fontWeight: '600',
  },
  toggleArrow: {
    fontSize: 11,
    color: '#94a3b8',
    marginLeft: 6,
  },
  serverConfigContent: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  serverInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  serverInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 10,
  },
  presetsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  presetList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  presetChipActive: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  presetChipText: {
    fontSize: 11,
    color: '#475569',
  },
  presetChipTextActive: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
});
