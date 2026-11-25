import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { getUsers, getMessages, sendMessage } from '../services/api';

export default function MessagesScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    const interval = setInterval(() => loadMessages(selectedUser.id), 3000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load users');
    }
  };

  const openChat = (user) => {
    setSelectedUser(user);
    loadMessages(user.id);
  };

  const loadMessages = async (userId) => {
    try {
      const res = await getMessages(userId);
      setMessages(res.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load messages');
    }
  };

  const handleSend = async () => {
    if (!content.trim()) return;
    try {
      await sendMessage({ receiver_id: selectedUser.id, content });
      setContent('');
      loadMessages(selectedUser.id);
    } catch (e) {
      Alert.alert('Send failed', 'Could not send message');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <Text style={styles.subtitle}>Select a contact</Text>
      <FlatList
        data={users}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userRow} onPress={() => openChat(item)}>
            <Text style={styles.userName}>{item.username}</Text>
            <Text style={styles.userRole}>{item.role}</Text>
          </TouchableOpacity>
        )}
      />
      {selectedUser && (
        <View style={styles.chatContainer}>
          <Text style={styles.chatTitle}>Chat with {selectedUser.username}</Text>
          <FlatList
            data={messages}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <View style={[styles.message, item.senderIsMe ? styles.messageMe : styles.messageThem]}>
                <Text style={styles.messageText}>{item.content}</Text>
              </View>
            )}
          />
          <View style={styles.inputRow}>
            <TextInput style={styles.input} placeholder="Type a message" value={content} onChangeText={setContent} />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.callButton} onPress={() => navigation.navigate('Call', { user: selectedUser })}>
            <Text style={styles.callButtonText}>Start Call</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 16 },
  userRow: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  userName: { fontSize: 16, fontWeight: '600' },
  userRole: { fontSize: 12, color: '#999' },
  chatContainer: { backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' },
  chatTitle: { fontSize: 18, fontWeight: 'bold', padding: 14, backgroundColor: '#e7f3f2', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  message: { padding: 10, borderRadius: 8, maxWidth: '75%', marginVertical: 4 },
  messageMe: { backgroundColor: '#dcf8c6', alignSelf: 'flex-end', marginLeft: 'auto' },
  messageThem: { backgroundColor: '#fff', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#ddd' },
  messageText: { fontSize: 14 },
  inputRow: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#ddd' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginRight: 8 },
  sendButton: { backgroundColor: '#075e54', padding: 10, borderRadius: 8, alignItems: 'center' },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
  callButton: { backgroundColor: '#25d366', padding: 12, borderRadius: 8, alignItems: 'center', margin: 10 },
  callButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});