import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { deleteListing } from '../services/api';

export default function ListingDetailScreen({ route, navigation }) {
  const listing = route.params.listing;
  const [userStr, setUserStr] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUserStr(JSON.parse(stored));
      } catch (e) {
        setUserStr(null);
      }
    }
  }, []);

  const isOwner = userStr && listing.seller_id === userStr.id;
  const canEdit = userStr && (isOwner || userStr.role === 'broker');

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await deleteListing(listing.id);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Delete failed', 'You may not be allowed to delete this listing');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listing Details</Text>
      <Text style={styles.label}>Title</Text>
      <Text style={styles.value}>{listing.title}</Text>
      <Text style={styles.label}>Price</Text>
      <Text style={styles.value}>${listing.price}</Text>
      <Text style={styles.label}>Location</Text>
      <Text style={styles.value}>{listing.location || 'Not set'}</Text>
      <Text style={styles.label}>Description</Text>
      <Text style={styles.value}>{listing.description || 'No description'}</Text>
      <View style={styles.buttonRow}>
        {canEdit && (
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('CreateListing', { listing })}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
        )}
        {canEdit && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.mapButton} onPress={() => navigation.navigate('Map', { listing })}>
          <Text style={styles.buttonText}>View on Map</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back to Listings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 24 },
  label: { fontSize: 14, color: '#666', marginTop: 16, marginBottom: 6 },
  value: { fontSize: 16, marginBottom: 10 },
  buttonRow: { flexDirection: 'row', marginTop: 30 },
  editButton: { backgroundColor: '#075e54', padding: 12, borderRadius: 8, marginRight: 10, flex: 1, alignItems: 'center' },
  deleteButton: { backgroundColor: '#dc3545', padding: 12, borderRadius: 8, flex: 1, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  backButton: { marginTop: 24, alignItems: 'center' },
  backButtonText: { color: '#075e54', fontWeight: '600' },
});