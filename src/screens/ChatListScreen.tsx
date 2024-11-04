import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type ChatListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

interface ChatListScreenProps {
  navigation: ChatListScreenNavigationProp;
}

interface ChatPreview {
  id: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  otherUserId: string;
  otherUserName: string;
  otherUserPhoto?: string;
}

export default function ChatListScreen({ navigation }: ChatListScreenProps) {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!currentUserId) return;

    const db = getFirestore();
    const chatsRef = collection(db, 'chats');
    
    // Buscar chats donde el usuario actual es participante
    const q = query(
      chatsRef,
      where('participants', 'array-contains', currentUserId),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatPreviews: ChatPreview[] = [];
      
      for (const doc of snapshot.docs) {
        const chatData = doc.data();
        
        // Obtener el ID del otro usuario
        const otherUserId = chatData.participants.find(
          (id: string) => id !== currentUserId
        );

        // Obtener información del otro usuario
        const userDoc = await getDocs(
          query(collection(db, 'users'), where('id', '==', otherUserId))
        );

        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          
          chatPreviews.push({
            id: doc.id,
            lastMessage: chatData.lastMessage || '',
            lastMessageTime: chatData.lastMessageTime || '',
            unreadCount: chatData.unreadCount?.[currentUserId] || 0,
            otherUserId,
            otherUserName: userData.userName || 'Usuario',
            otherUserPhoto: userData.photoURL,
          });
        }
      }

      setChats(chatPreviews);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => navigation.navigate('Chat', {
              userId: item.otherUserId,
              userName: item.otherUserName,
            })}
          >
            <View style={styles.avatarContainer}>
              {item.otherUserPhoto ? (
                <Image
                  source={{ uri: item.otherUserPhoto }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={24} color="#666" />
                </View>
              )}
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>
                    {item.unreadCount}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.chatInfo}>
              <View style={styles.chatHeader}>
                <Text style={styles.userName}>{item.otherUserName}</Text>
                <Text style={styles.timeText}>
                  {formatTime(item.lastMessageTime)}
                </Text>
              </View>
              <Text
                style={[
                  styles.lastMessage,
                  item.unreadCount > 0 && styles.unreadMessage
                ]}
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>No tienes conversaciones</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadMessage: {
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});