import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NombreDelComponente = () => {
  return (
    <View style={styles.container}>
      <Text>Hola desde NombreDelComponente</Text>
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
});
