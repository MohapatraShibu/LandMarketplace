import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createListing, updateListing } from '../services/api';

export default function CreateListingScreen({ route, navigation }) {
  const listing = route.params?.listing;
  const [title, setTitle] = useState(listing ? listing.title : '');
  const [description, setDescription] = useState(listing ? listing.description : '');
  const [price, setPrice] = useState(listing ? String(listing.price) : '');
  const [location, setLocation] = useState(listing ? listing.location : '');

  const handleSave = async () => {
    const data = { title, description, price: parseFloat(price), location };
    try {
      if (listing) {
        await updateListing(listing.id, data);
      } else {
        await createListing(data);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Save failed', 'Please check your inputs');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{listing ? 'Edit Listing' : 'Create Listing'}</Text>
      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
      <TextInput style={styles.input} placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>{listing ? 'Update' : 'Create'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, marginBottom: 16, borderRadius: 8 },
  button: { backgroundColor: '#075e54', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  back: { marginTop: 16, alignItems: 'center' },
  backText: { color: '#666', fontSize: 14 },
});