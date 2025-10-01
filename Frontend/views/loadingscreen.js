import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';


export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
        <Image
        style={styles.image}
        source={require('./assets/logos/logo_red_bg.svg')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e44c4cff',
    alignItems: 'center',
    justifyContent: 'center',
  },
    image: {
    flex: 1,
    width: '50%',
    resizeMode: 'contain',
  },
});