import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
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
  addDoc,
  updateDoc,
  doc,
  getDocs,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;

interface ChatScreenProps {
  route: ChatScreenRouteProp;
  navigation: ChatScreenNavigationProp;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
}

export default function ChatScreen({ route, navigation }: ChatScreenProps) {
  const { userId, userName } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({
      title: userName,
    });
  }, [userName]);

  useEffect(() => {
    if (!currentUserId) return;

    const findOrCreateChat = async () => {
      const db = getFirestore();
      
      // Buscar chat existente
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', currentUserId)
      );
      
      const querySnapshot = await getDocs(q);
      const existingChat = querySnapshot.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(userId);
      });

      if (existingChat) {
        setChatId(existingChat.id);
        subscribeToMessages(existingChat.id);
      } else {
        // Crear nuevo chat
        const newChatRef = await addDoc(chatsRef, {
          participants: [currentUserId, userId],
          createdAt: new Date().toISOString(),
          lastMessageTime: new Date().toISOString(),
        });
        
        setChatId(newChatRef.id);
        subscribeToMessages(newChatRef.id);
      }
    };

    findOrCreateChat();
  }, [currentUserId, userId]);

  const subscribeToMessages = (chatId: string) => {
    const db = getFirestore();
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList: Message[] = [];
      snapshot.forEach((doc) => {
        messageList.push({
          id: doc.id,
          ...doc.data(),
        } as Message);
      });
      setMessages(messageList);
      setLoading(false);
    });

    return unsubscribe;
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !chatId || !currentUserId) return;

    const db = getFirestore();
    const messageData = {
      text: newMessage.trim(),
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
    };

    try {
      // Agregar mensaje
      await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
      
      // Actualizar último mensaje del chat
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: newMessage.trim(),
        lastMessageTime: new Date().toISOString(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === currentUserId;

    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        <Text style={[
          styles.messageText,
          isCurrentUser ? styles.currentUserText : styles.otherUserText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.messageTime,
          isCurrentUser ? styles.currentUserTime : styles.otherUserTime
        ]}>
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        inverted
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Escribe un mensaje..."
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSend}
          disabled={!newMessage.trim()}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={newMessage.trim() ? "#007AFF" : "#999"} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  messagesList: {
    paddingHorizontal: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 10,
    borderRadius: 15,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 5,
  },
  currentUserText: {
    color: 'white',
  },
  otherUserText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  currentUserTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherUserTime: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
  },
});