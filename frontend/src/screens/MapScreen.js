import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function MapScreen({ route }) {
  const listing = route.params.listing;
  const lat = listing ? listing.latitude : 28.6139;
  const lon = listing ? listing.longitude : 77.2090;
  const title = listing ? listing.title : 'Land Location';

  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=15&size=400x300&maptype=roadmap&markers=color:red%7C${lat},${lon}&key=`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Property Location</Text>
      <View style={styles.mapContainer}>
        <Image style={styles.mapImage} source={{ uri: mapUrl }} />
        <Text style={styles.mapPlaceholder}>
          Map: {title}\nLat: {lat}\nLon: {lon}\n(OpenStreetMap integration)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', padding: 12, backgroundColor: '#f5f5f5' },
  mapContainer: { flex: 1, backgroundColor: '#eee', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  mapImage: { width: '100%', height: '100%', borderRadius: 8 },
  mapPlaceholder: { marginTop: 12, textAlign: 'center', color: '#666', fontSize: 14 },
});