import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { register } from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await register({ username, email, password, role, phone });
      Alert.alert('Success', 'Account created. Please login.');
      navigation.navigate('Login');
    } catch (e) {
      Alert.alert('Register failed', e.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} />
      <View style={styles.roleRow}>
        <Text style={styles.roleLabel}>Role:</Text>
        <TouchableOpacity style={[styles.roleButton, role === 'buyer' && styles.roleActive]} onPress={() => setRole('buyer')}>
          <Text style={[styles.roleText, role === 'buyer' && styles.roleActiveText]}>Buyer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.roleButton, role === 'seller' && styles.roleActive]} onPress={() => setRole('seller')}>
          <Text style={[styles.roleText, role === 'seller' && styles.roleActiveText]}>Seller</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.roleButton, role === 'broker' && styles.roleActive]} onPress={() => setRole('broker')}>
          <Text style={[styles.roleText, role === 'broker' && styles.roleActiveText]}>Broker</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator size="small" color="#fff" style={styles.loadingIndicator} /> : null}
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Register'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center', color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, marginBottom: 12, borderRadius: 8, fontSize: 16 },
  roleRow: { flexDirection: 'row', marginBottom: 16, flexWrap: 'wrap' },
  roleLabel: { marginRight: 8, fontSize: 14, color: '#666' },
  roleButton: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#075e54', borderRadius: 8, marginRight: 8, marginBottom: 8, backgroundColor: '#fff' },
  roleActive: { backgroundColor: '#075e54', borderColor: '#075e54' },
  roleText: { color: '#075e54', fontWeight: '600', fontSize: 14 },
  roleActiveText: { color: '#fff' },
  button: { backgroundColor: '#075e54', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  loadingIndicator: { marginRight: 8 },
  link: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#075e54', fontWeight: '600', fontSize: 14 },
});