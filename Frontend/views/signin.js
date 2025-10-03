import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import { Image } from 'expo-image';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';


export default function App() {

  return (
    
    <View style={styles.container}>
      <StatusBar style="auto" />

        {/*//logo*/}
          <Image
            style={styles.logo}
            source={require('./assets/logos/logo_white_bg.svg')}
          />

      <SafeAreaProvider>
        <SafeAreaView>

          {/*input boxes*/}
          <TextInput
            style={styles.input}
            placeholder="Nombre de usuario o e-mail"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
          />
          <Text
            style={styles.subtitle}>----- O inicia sesión con -----
          </Text>


        </SafeAreaView>
      </SafeAreaProvider>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeeeeeff',
    alignItems: 'center',
    justifyContent: 'center',

  },
    logo: {
    flex: 1,
    width: '10%',
    resizeMode: 'contain',
  },
    input: {
    margin: 12,
    padding: 10,
    width: 300,
    fontSize: 12,
    borderWidth: 1,
    borderColor:'#fff',
    borderRadius: 8,
    color: '#cfcfcfff',
    backgroundColor:'#fff',
  },
    subtitle: {
      color: '#8a8a8aff',
      textAlign: 'center',
    }
});