import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from './colors';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { id: '1', text: '¡Hola! Soy tu asistente de INFIT 😊 ¿En qué puedo ayudarte hoy?', from: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const flatListRef = useRef();

  // Cargar preferencia cada vez que entramos
  useFocusEffect(
    useCallback(() => {
      const loadTheme = async () => {
        const savedTheme = await AsyncStorage.getItem("darkMode");
        setDarkMode(savedTheme === "true");
      };
      loadTheme();
    }, [])
  );

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now().toString(), text: input, from: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    // Simulated Bot AI Response
    setTimeout(() => {
      const botReply = {
        id: (Date.now() + 1).toString(),
        text: 'Estoy procesando tu consulta... 👾 (Funcionalidad de IA en desarrollo)',
        from: 'bot'
      };
      setMessages(prev => [...prev, botReply]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1000);
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.from === 'user' ? styles.userBubble : [styles.botBubble, darkMode && styles.darkBotBubble]
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.from === 'user' ? styles.userText : [styles.botText, darkMode && styles.darkText]
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.header, darkMode && styles.darkHeader]}>
          <Text style={[styles.headerTitle, darkMode && styles.darkText]}>Asistente INFIT</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.chatListContent}
          style={styles.chatList}
        />

        <View style={[styles.inputContainer, darkMode && styles.darkHeader]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={darkMode ? "#666" : "#999"}
            style={[styles.input, darkMode && styles.darkInput]}
            multiline
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg_gray || '#F5F5F7',
  },
  darkContainer: {
    backgroundColor: colors.bg_dark,
  },
  inner: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkHeader: {
    backgroundColor: colors.bg_dark,
    borderBottomColor: '#333',
    borderTopColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.dark_gray || '#333',
  },
  darkText: {
    color: '#fff',
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: colors.primary || '#ef2b2d',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#E9E9EB',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  darkBotBubble: {
    backgroundColor: '#4a4a4a',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFF',
  },
  botText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    maxHeight: 100,
    color: '#333',
  },
  darkInput: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary || '#ef2b2d',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
});

export default Chatbot;