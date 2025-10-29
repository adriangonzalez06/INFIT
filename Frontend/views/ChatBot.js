import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';

const NombreDelComponente = () => {

 
  return (
    <View style={styles.container}>
    
      <Text style={styles.title}>In-Fit-AI</Text>

      <Text style={styles.botBubble}>This is a bot message</Text>
      <Text style={styles.userBubble}>This is a user message</Text>

      
      <TextInput
      style={styles.input}
      placeholder="Pregunta algo..."
      autoCapitalize="none"
      />

    </View>
  );
};

export default NombreDelComponente;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    color: '#111114',
    backgroundColor: '#fff',
    width: 250,
    alignSelf: 'center',
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
  },
  botBubble: {
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    color: '#ffffffff',
    backgroundColor: '#d46767ff',
    alignSelf: 'center',
  },
  userBubble: {
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    color: '#000000ff',
    backgroundColor: '#ccc',
    alignSelf: 'center',
  }

});