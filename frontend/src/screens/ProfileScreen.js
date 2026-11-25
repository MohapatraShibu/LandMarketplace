import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getMe } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const res = await getMe();
      setUser(res.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load profile');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user && (
        <View style={styles.card}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{user.username}</Text>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{user.role}</Text>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{user.phone || 'Not set'}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.button} onPress={() => {
        localStorage.removeItem('token');
        navigation.replace('Login');
      }}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f5f5f5' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 24 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  label: { fontSize: 14, color: '#666', marginTop: 16, marginBottom: 6 },
  value: { fontSize: 16, marginBottom: 10 },
  button: { backgroundColor: '#075e54', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});