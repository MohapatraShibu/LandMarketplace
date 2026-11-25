import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert } from 'react-native';
import { getListings, getMe } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [listings, setListings] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const me = await getMe();
      setUser(me.data);
      localStorage.setItem('user', JSON.stringify(me.data));
      const res = await getListings();
      setListings(res.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const isOwner = (listing) => user && listing.seller_id === user.id;
  const canEdit = (listing) => user && (isOwner(listing) || user.role === 'broker');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Hello, {user ? user.username : ''}</Text>
        <Text style={styles.role}>Role: {user ? user.role : ''}</Text>
      </View>
      <TouchableOpacity style={styles.callButton} onPress={() => navigation.navigate('Call')}>
        <Text style={styles.callButtonText}>Start Audio/Video Call</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Available Land Listings</Text>
      <FlatList
        data={listings}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ListingDetail', { listing: item })}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardPrice}>${item.price}</Text>
            <Text style={styles.cardLocation}>{item.location || 'Location not set'}</Text>
            <Text style={styles.cardSeller}>Seller: {item.seller_name || 'Unknown'}</Text>
          </TouchableOpacity>
        )}
      />
      {user && (user.role === 'seller' || user.role === 'broker') && (
        <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreateListing')}>
          <Text style={styles.createButtonText}>Create New Listing</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.messagesButton} onPress={() => navigation.navigate('Messages')}>
        <Text style={styles.messagesButtonText}>Messages</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigation.replace('Login');
      }}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { marginBottom: 16 },
  welcome: { fontSize: 22, fontWeight: 'bold' },
  role: { fontSize: 14, color: '#666', marginTop: 4 },
  callButton: { backgroundColor: '#25d366', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  callButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardPrice: { fontSize: 14, color: '#075e54', fontWeight: '600', marginBottom: 4 },
  cardLocation: { fontSize: 14, color: '#666', marginBottom: 4 },
  cardSeller: { fontSize: 12, color: '#999' },
  createButton: { backgroundColor: '#075e54', padding: 14, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  createButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  messagesButton: { backgroundColor: '#075e54', padding: 14, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  messagesButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutButton: { padding: 14, alignItems: 'center', marginTop: 16 },
  logoutButtonText: { color: '#666', fontSize: 14 },
});