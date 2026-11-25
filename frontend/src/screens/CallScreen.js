import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function CallScreen({ route, navigation }) {
  const targetUser = route.params?.user;
  const [callState, setCallState] = useState('idle'); // idle, calling, incoming, active
  const [isVideo, setIsVideo] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const startCall = (withVideo) => {
    setIsVideo(withVideo);
    setCallState('calling');
    // Simulate incoming call on other device after 2 seconds
    setTimeout(() => {
      setCallState('incoming');
    }, 2000);
  };

  const acceptCall = () => {
    setCallState('active');
  };

  const rejectCall = () => {
    setCallState('idle');
    Alert.alert('Call', 'Call was rejected');
  };

  const endCall = () => {
    setCallState('idle');
    navigation.goBack();
  };

  const toggleVideo = () => setIsVideo(!isVideo);
  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <View style={styles.container}>
      {callState === 'idle' && (
        <View style={styles.center}>
          <Text style={styles.title}>Audio / Video Call</Text>
          {targetUser && <Text style={styles.subtitle}>Calling {targetUser.username}</Text>}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={() => startCall(true)}>
              <Text style={styles.buttonText}>Video Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => startCall(false)}>
              <Text style={styles.buttonText}>Audio Call</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
      {callState === 'incoming' && (
        <View style={styles.center}>
          <Text style={styles.title}>Incoming Call</Text>
          <Text style={styles.subtitle}>{targetUser ? targetUser.username : 'Unknown'} is calling</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.buttonAccept} onPress={acceptCall}>
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonReject} onPress={rejectCall}>
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {callState === 'calling' && (
        <View style={styles.center}>
          <Text style={styles.title}>Calling...</Text>
          <TouchableOpacity style={styles.button} onPress={endCall}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      {callState === 'active' && (
        <View style={styles.callActive}>
          <View style={styles.videoContainer}>
            <View style={styles.remoteVideo}>
              <Text style={styles.remoteLabel}>Remote</Text>
              <View ref={remoteVideoRef} style={styles.videoView} />
            </View>
            <View style={styles.localVideo}>
              <Text style={styles.localLabel}>You</Text>
              <View ref={localVideoRef} style={styles.videoView} />
            </View>
          </View>
          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
              <Text style={styles.controlText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={toggleVideo}>
              <Text style={styles.controlText}>{isVideo ? 'Stop Video' : 'Start Video'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButtonEnd} onPress={endCall}>
              <Text style={styles.controlTextEnd}>End Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  subtitle: { fontSize: 16, color: '#ccc', marginBottom: 24 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  button: { backgroundColor: '#075e54', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonAccept: { backgroundColor: '#25d366', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginRight: 12 },
  buttonReject: { backgroundColor: '#dc3545', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  back: { marginTop: 20 },
  backText: { color: '#075e54', fontWeight: '600' },
  callActive: { flex: 1, width: width },
  videoContainer: { flex: 1, width: width },
  remoteVideo: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  localVideo: { position: 'absolute', bottom: 20, right: 20, width: 120, height: 160, borderWidth: 2, borderColor: '#fff' },
  videoView: { width: '100%', height: '100%', backgroundColor: '#333' },
  remoteLabel: { color: '#fff', position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6 },
  localLabel: { color: '#fff', position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6 },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 20, padding: 20, backgroundColor: 'rgba(0,0,0,0.8)' },
  controlButton: { padding: 12, borderRadius: 8, backgroundColor: '#333' },
  controlButtonEnd: { padding: 12, borderRadius: 8, backgroundColor: '#dc3545' },
  controlText: { color: '#fff', fontWeight: '600' },
  controlTextEnd: { color: '#fff', fontWeight: 'bold' },
});