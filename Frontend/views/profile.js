
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  Alert,
  Linking,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { BACKEND_URL } from '../src/config';
import AppModal from './AppModal';
import colors from './colors';



async function ensureCameraPermission() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}



export async function openCameraForAvatar() {
  const ok = await ensureCameraPermission();
  if (!ok) {
    showModal('warning', 'Permiso requerido', 'Activa el permiso de cámara en Ajustes para tomar una foto de perfil.');
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0];
}

// 3) Abrir galería usando el Photo Picker del sistema (no pide storage)
export async function openGalleryForAvatar() {
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0];
}


// 4) Pequeño Action Sheet
export async function chooseAvatarSource() {
  return new Promise(resolve => {
    Alert.alert(
      'Foto de perfil',
      'Elige un origen',
      [
        { text: 'Cámara', onPress: () => resolve('camera') },
        { text: 'Galería', onPress: () => resolve('gallery') },
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve('cancel') },
      ],
      { cancelable: true }
    );
  });
}



export default function ProfileScreen() {
  const navigation = useNavigation();


  const [avatarScale] = useState(new Animated.Value(0));     // zoom
  const [avatarOpacity] = useState(new Animated.Value(0));   // fade imagen
  const [bgOpacity] = useState(new Animated.Value(0));       // fade fondo



  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [recentRoutines, setRecentRoutines] = useState([]);
  const [modal, setModal] = useState({ visible: false, type: 'error', title: '', message: '' });
  const showModal = (type, title, message) => setModal({ visible: true, type, title, message });
  const hideModal = () => setModal(m => ({ ...m, visible: false }));

  // Cargar preferencia de modo oscuro cada vez que la pantalla gana foco
  useFocusEffect(
    useCallback(() => {
      const loadTheme = async () => {
        const savedTheme = await ReactNativeAsyncStorage.getItem("darkMode");
        setDarkMode(savedTheme === "true");
      };
      loadTheme();
    }, [])
  );

  // Cargar rutinas recientes cada vez que se muestra la pantalla
  useFocusEffect(
    useCallback(() => {
      ReactNativeAsyncStorage.getItem('recentRoutines').then(raw => {
        if (raw) setRecentRoutines(JSON.parse(raw));
        else setRecentRoutines([]);
      }).catch(() => { });
    }, [])
  );

  // Estados para modal y campos de edición
  const [modalVisible, setModalVisible] = useState(false);
  const [pesoInput, setPesoInput] = useState('');
  const [alturaInput, setAlturaInput] = useState('');

  //Estado para el modal y foto de perfil ampliable
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          let nombreUser = 'Usuario';
          let emailUser = firebaseUser.email || 'email@example.com';
          let pesoGuardado = '80';
          let alturaGuardada = '1.9';
          let documentId = null;  // ID real del documento en Firestore

          // Obtener datos del backend buscando por email (como WelcomeScreen)
          try {
            const resp = await axios.get(
              `${BACKEND_URL}/api/usuarios/buscar/email/${encodeURIComponent(firebaseUser.email)}`,
              { timeout: 5000 }
            );

            if (resp.data) {
              nombreUser = resp.data.nombre || nombreUser;
              emailUser = resp.data.email || emailUser;
              pesoGuardado = resp.data.weight || resp.data.peso || pesoGuardado;
              alturaGuardada = resp.data.height || resp.data.altura || alturaGuardada;
              documentId = resp.data.id || firebaseUser.uid;  // Obtener el ID real del documento

              // Guardar datos en localStorage
              await ReactNativeAsyncStorage.setItem('userName', nombreUser);
              await ReactNativeAsyncStorage.setItem('userEmail', emailUser);
              await ReactNativeAsyncStorage.setItem('userWeight', String(pesoGuardado));
              await ReactNativeAsyncStorage.setItem('userHeight', String(alturaGuardada));
              await ReactNativeAsyncStorage.setItem('userDocId', documentId);  // Guardar el ID real

              if (resp.data.photoURL) {
                await ReactNativeAsyncStorage.setItem('userAvatar', resp.data.photoURL);
              }

              // Actualizar el estado con el avatar del backend si existe
              const backendAvatar = resp.data.photo ? { uri: resp.data.photo } : require('../assets/avatar.png');

              setUser({
                nombre: nombreUser,
                email: emailUser,
                avatar: backendAvatar,
                peso: pesoGuardado ? parseFloat(String(pesoGuardado)) : 80,
                altura: alturaGuardada ? parseFloat(String(alturaGuardada)) : 1.9,
              });
            }
          } catch (e) {
            console.warn('No se pudo obtener datos del backend:', e?.message);
            documentId = firebaseUser.uid;
            // Si falla el backend, inicializamos con datos mínimos
            setUser({
              nombre: firebaseUser.displayName || 'Usuario',
              email: firebaseUser.email,
              avatar: require('../assets/avatar.png'),
              peso: 80,
              altura: 1.9,
              registros: [],
            });
          }

          setUserId(documentId || firebaseUser.uid);
        } catch (error) {
          console.error('Error cargando perfil:', error);
          setUser({
            nombre: 'Usuario',
            email: 'email@example.com',
            avatar: require('../assets/avatar.png'),
            peso: 80,
            altura: 1.9,
          });
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const openEditModal = () => {
    if (!user) return;
    setPesoInput(String(user.peso));
    setAlturaInput(String(user.altura));
    setModalVisible(true);
  };

  const openAvatarModal = () => {
    setShowAvatarModal(true);

    // estados iniciales
    avatarScale.setValue(0.85);     // empieza un poco pequeño
    avatarOpacity.setValue(0);      // fade in imagen
    bgOpacity.setValue(0);          // fade in fondo

    Animated.parallel([
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 300,              // un pelín más largo para fondo
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(avatarOpacity, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(avatarScale, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic), // sin rebote, suave
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeAvatarModal = () => {
    Animated.parallel([
      Animated.timing(bgOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(avatarOpacity, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(avatarScale, {
        toValue: 0.85,               // vuelve a pequeño
        duration: 160,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => setShowAvatarModal(false));
  };

  const saveEdits = async () => {
    const newPeso = parseFloat(pesoInput.replace(',', '.'));
    const newAltura = parseFloat(alturaInput.replace(',', '.'));

    if (isNaN(newPeso) || isNaN(newAltura)) {
      showModal('warning', 'Datos inválidos', 'Por favor ingresa números válidos para peso y altura.');
      return;
    }

    if (newPeso < 20 || newPeso > 300) {
      showModal('warning', 'Peso no válido', 'El peso debe estar entre 20 kg y 300 kg. Por favor revisa el valor introducido.');
      return;
    }

    if (newAltura < 0.5 || newAltura > 2.5) {
      showModal('warning', 'Altura no válida', 'La altura debe estar entre 0.5 m y 2.5 m. Por favor revisa el valor introducido.');
      return;
    }

    if (!userId) {
      showModal('error', 'Sesión no encontrada', 'No se pudo obtener tu ID de usuario. Vuelve a iniciar sesión.');
      return;
    }

    setIsSaving(true);
    try {
      const url = `${BACKEND_URL}/api/usuarios/${userId}`;

      console.log('Enviando petición a:', url);
      console.log('Datos:', { weight: newPeso, height: newAltura });

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weight: newPeso,
          height: newAltura,
        }),
      });

      console.log('Respuesta del servidor:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error del backend:', errorData);
        throw new Error(`Error ${response.status}: ${errorData}`);
      }

      setUser((prev) =>
        prev ? { ...prev, peso: newPeso, altura: newAltura } : prev
      );

      await ReactNativeAsyncStorage.setItem('userWeight', String(newPeso));
      await ReactNativeAsyncStorage.setItem('userHeight', String(newAltura));

      console.log('Peso y altura actualizados exitosamente');
      setModalVisible(false);
      showModal('success', '¡Cambios guardados!', 'Tu peso y altura se han actualizado correctamente.');
    } catch (e) {
      console.error('Error guardando peso/altura:', e);
      showModal('error', 'Error al guardar', `No se pudieron guardar los cambios: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#ef2b2d" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Error cargando perfil</Text>
      </View>
    );
  }

  const imc = (user.altura > 0) ? (user.peso / (user.altura * user.altura)).toFixed(1) : '0';

  return (
    <SafeAreaView style={[styles.mainContainer, darkMode && styles.darkContainer]}>
      <StatusBar style={darkMode ? "light" : "dark"} backgroundColor={darkMode ? colors.bg_dark : "#fff"} translucent={false} />

      {/* Cabecera normal (fuera del ScrollView para consistencia) */}
      <View style={[styles.headerContent, darkMode && styles.darkHeaderContent]}>
        <View style={{ width: 44 }} />
        <Text style={[styles.headerTitle, darkMode && styles.darkText]}>Perfil</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Ajustes')} style={styles.headerRightBtn}>
          <Ionicons name="settings-outline" size={24} color={darkMode ? "#fff" : "#333"} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.container, darkMode && styles.darkContainer]}>


        <View style={styles.profileSection}>
          <TouchableOpacity activeOpacity={0.9} onLongPress={openAvatarModal}>
            <Image
              source={user.avatar}
              style={styles.avatarPerfil}
            />
          </TouchableOpacity>
          <Text style={[styles.nombre, darkMode && styles.darkText]}>{user.nombre}</Text>
        </View>

        <View style={styles.statsContainer}>
          <Stat label="Peso" value={`${user.peso} kg`} darkMode={darkMode} />
          <Stat label="Altura" value={`${user.altura} m`} darkMode={darkMode} />
          <Stat label="IMC" value={imc} darkMode={darkMode} />
        </View>

        {/* Botón para abrir modal */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={openEditModal}
        >
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>

        {/* Modal para editar peso y altura */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={[styles.modalOverlay, darkMode && { backgroundColor: 'rgba(0,0,0,0.75)' }]}>
            <View style={[styles.modalContent, darkMode && { backgroundColor: '#1e1e1e' }]}>
              <Text style={[styles.modalTitle, darkMode && { color: '#fff' }]}>Editar datos</Text>

              <Text style={[{ fontSize: 12, color: darkMode ? '#aaa' : '#888', marginBottom: 4 }]}>Peso (20 – 300 kg)</Text>
              <TextInput
                style={[styles.input, darkMode && { backgroundColor: '#2a2a2a', borderColor: '#444', color: '#fff' }]}
                value={pesoInput}
                onChangeText={setPesoInput}
                keyboardType="numeric"
                placeholder="Peso (kg)"
                placeholderTextColor={darkMode ? '#666' : '#999'}
              />
              <Text style={[{ fontSize: 12, color: darkMode ? '#aaa' : '#888', marginBottom: 4 }]}>Altura (0.5 – 2.5 m)</Text>
              <TextInput
                style={[styles.input, darkMode && { backgroundColor: '#2a2a2a', borderColor: '#444', color: '#fff' }]}
                value={alturaInput}
                onChangeText={setAlturaInput}
                keyboardType="numeric"
                placeholder="Altura (m)"
                placeholderTextColor={darkMode ? '#666' : '#999'}
              />

              <TouchableOpacity
                style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
                onPress={saveEdits}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>{isSaving ? 'Guardando...' : 'Guardar'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: darkMode ? '#333' : '#ddd', marginTop: 8 }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.saveButtonText, { color: darkMode ? '#ccc' : '#333' }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showAvatarModal}
          transparent
          animationType="none"
          onRequestClose={closeAvatarModal}
        >
          {/* Capa de fondo animada */}
          <Animated.View
            style={[
              styles.blurBackground,
              { opacity: bgOpacity },
            ]}
          />

          {/* Capa invisible para cerrar al tocar fuera */}
          <TouchableOpacity
            activeOpacity={1}
            style={StyleSheet.absoluteFillObject}
            onPress={closeAvatarModal}
          />

          <View style={styles.modalFullCenter} pointerEvents="box-none">
            {/* Imagen ampliada */}
            <Animated.Image
              source={user.avatar}
              style={[
                styles.avatarZoom,
                {
                  opacity: avatarOpacity,
                  transform: [{ scale: avatarScale }],
                },
              ]}
            />

            {/* Botón "Modificar foto" */}
            <Animated.View
              style={{
                opacity: avatarOpacity,
                transform: [{ scale: avatarScale }],
                marginTop: 24,
              }}
            >
              <TouchableOpacity
                style={styles.modifyButton}
                onPress={async () => {
                  closeAvatarModal();

                  // Guardia: asegurarse de que tenemos userId antes de empezar
                  if (!userId) {
                    showModal('error', 'Sesión no encontrada', 'No se encontró tu ID de usuario. Vuelve a iniciar sesión.');
                    return;
                  }

                  const choice = await chooseAvatarSource();
                  if (choice === 'cancel') return;

                  const asset = choice === 'camera'
                    ? await openCameraForAvatar()
                    : await openGalleryForAvatar();

                  if (!asset) return;

                  setIsSaving(true);
                  try {
                    // 1) Pedir firma segura al backend
                    let sig;
                    try {
                      const sigResp = await axios.post(
                        `${BACKEND_URL}/cloudinary/signature`,
                        {},
                        { timeout: 8000 }
                      );
                      sig = sigResp.data;
                    } catch (sigErr) {
                      console.error('[Avatar] Error obteniendo firma Cloudinary:', sigErr?.message || sigErr);
                      showModal('error', 'Error de conexión', 'No se pudo conectar con el servidor. ¿Está el backend arrancado?');
                      return;
                    }

                    // 2) Subir imagen a Cloudinary
                    const form = new FormData();
                    form.append('file', {
                      uri: asset.uri,
                      type: asset.mimeType || asset.type || 'image/jpeg',
                      name: asset.fileName || 'avatar.jpg',
                    });
                    form.append('api_key', sig.apiKey);
                    form.append('timestamp', String(sig.timestamp));
                    form.append('signature', sig.signature);
                    form.append('folder', sig.folder);

                    let cloudinaryUrl;
                    try {
                      const upResp = await axios.post(
                        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
                        form,
                        { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 30000 }
                      );
                      cloudinaryUrl = upResp.data?.secure_url;
                      if (!cloudinaryUrl) throw new Error('Cloudinary no devolvió URL');
                    } catch (upErr) {
                      console.error('[Avatar] Error subiendo a Cloudinary:', upErr?.response?.data || upErr?.message || upErr);
                      showModal('error', 'Error al subir imagen', 'No se pudo subir la imagen a Cloudinary. Revisa tus credenciales en el .env del backend.');
                      return;
                    }

                    // 3) Actualizar visualmente en la app
                    setUser(prev => prev ? { ...prev, avatar: { uri: cloudinaryUrl } } : prev);

                    // 4) Guardar URL en Firestore via backend
                    try {
                      await axios.put(
                        `${BACKEND_URL}/api/usuarios/${userId}`,
                        { photoURL: cloudinaryUrl },
                        { timeout: 8000 }
                      );
                    } catch (saveErr) {
                      console.error('[Avatar] Error guardando URL en backend:', saveErr?.response?.data || saveErr?.message || saveErr);
                      showModal('warning', 'Foto subida', 'La foto se subió pero no se pudo guardar en la base de datos. Inténtalo de nuevo.');
                    }

                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                <Text style={styles.modifyButtonText}>Modificar foto</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

        <Text style={[styles.sectionTitle, darkMode && styles.darkTextSecondary]}>Rutinas recientes</Text>
        {recentRoutines.length === 0 ? (
          <TouchableOpacity onPress={() => navigation.navigate('Rutinas')} style={[styles.emptyRoutinesBox, darkMode && { borderColor: '#333', backgroundColor: '#1a1a1a' }]}>
            <Ionicons name="barbell-outline" size={28} color="#ef2b2d" />
            <Text style={[styles.emptyRoutinesText, darkMode && { color: '#aaa' }]}>No has abierto ninguna rutina todavía.</Text>
            <Text style={styles.emptyRoutinesLink}>Ir a Rutinas →</Text>
          </TouchableOpacity>
        ) : (
          recentRoutines.map((r, i) => {
            const when = new Date(r.openedAt);
            const fechaStr = when.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const horaStr = when.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            return (
              <TouchableOpacity
                key={r.id + i}
                style={[styles.recentRutinaBox, { borderLeftColor: r.color || '#ef2b2d' }, darkMode && styles.darkRecentRutinaBox]}
                onPress={() => navigation.navigate('Rutinas')}
                activeOpacity={0.75}
              >
                <View style={styles.recentRutinaRow}>
                  <Ionicons name="barbell" size={20} color={r.color || '#ef2b2d'} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.recentRutinaNombre, darkMode && styles.darkText]}>{r.nombre}</Text>
                    <Text style={[styles.recentRutinaDetalle, darkMode && { color: '#aaa' }]}>{r.dificultad}</Text>
                  </View>
                  <Text style={styles.recentRutinaFecha}>{fechaStr} {horaStr}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}


        <AppModal
          visible={modal.visible}
          type={modal.type}
          title={modal.title}
          message={modal.message}
          confirmText="Entendido"
          onConfirm={hideModal}
          darkMode={darkMode}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, darkMode }) {

  return (
    <View style={styles.statBox}>
      <Text style={[styles.statLabel, darkMode && styles.darkTextSecondary]}>{label}</Text>
      <Text style={[styles.statValue, darkMode && styles.darkText]}>{value}</Text>
    </View>
  );
}


const styles = StyleSheet.create({

  modalFullCenter: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },

  avatarZoom: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 3,
    borderColor: '#fff',
  },

  modifyButton: {
    backgroundColor: '#ef2b2d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  modifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingBottom: 60,
    backgroundColor: colors.bg_gray,
  },
  darkContainer: {
    backgroundColor: colors.bg_dark,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 50 : 25,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  darkHeaderContent: {
    backgroundColor: colors.bg_dark,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.dark_gray || '#333',
  },
  headerRightBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatarPerfil: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ef2b2d',
    marginBottom: 10,
  },
  nombre: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  darkText: {
    color: '#fff',
  },
  darkTextSecondary: {
    color: '#aaa',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  editButton: {
    backgroundColor: '#ef2b2d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: 20,

  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#ef2b2d',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
    paddingHorizontal: 20,
  },
  registroBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowRadius: 5,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#ef2b2d',
  },
  darkRegistroBox: {
    backgroundColor: '#1e1e1e',
    shadowColor: '#000',
    elevation: 0,
  },
  registroTipo: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  registroDetalle: {
    fontSize: 14,
    marginTop: 4,
    color: '#555',
  },
  registroFecha: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },

  // ── Rutinas recientes ──────────────────────────────────────────────────────
  recentRutinaBox: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  darkRecentRutinaBox: {
    backgroundColor: '#1e1e1e',
    shadowOpacity: 0,
    elevation: 0,
  },
  recentRutinaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentRutinaNombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },
  recentRutinaDetalle: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  recentRutinaFecha: {
    fontSize: 11,
    color: '#bbb',
    marginLeft: 8,
    textAlign: 'right',
    flexShrink: 0,
  },
  emptyRoutinesBox: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'center',
    gap: 6,
  },
  emptyRoutinesText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  emptyRoutinesLink: {
    fontSize: 14,
    color: '#ef2b2d',
    fontWeight: '600',
  },

  boton: {
    backgroundColor: '#ef2b2d',
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

});
