
// Feed.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import * as ImagePicker from "expo-image-picker";
import colors from "./colors";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { primary } = colors;
const { white } = colors;



export default function Feed() {

  const [username, setUsername] = useState(null);
  const [avatarUri, setAvatarUri] = useState(null);
  const [posts, setPosts] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUser();
      const loadTheme = async () => {
        const savedTheme = await AsyncStorage.getItem("darkMode");
        setDarkMode(savedTheme === "true");
      };
      loadTheme();
    }, [])
  );

  const loadUser = async () => {
    try {
      let name = await AsyncStorage.getItem('userName');
      let avatar = await AsyncStorage.getItem('userAvatar');

      if (!name) {
        // Try Firebase as fallback
        const auth = getAuth();
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          name = firebaseUser.displayName || firebaseUser.email;
          // If we had a way to get the photoURL from firebaseUser, we could try that too
          if (firebaseUser.photoURL) avatar = firebaseUser.photoURL;
        }
      }

      if (name) {
        setUsername(name);
        setAvatarUri(avatar);

        // Only set initial posts if list is empty
        if (posts.length === 0) {
          setPosts([
            {
              id: "1",
              username: name,
              avatarUri: avatar,
              title: `¡Bienvenido al feed!`,
              content: "Comparte tus progresos, rutinas o cualquier cosa relacionada con tu entrenamiento.",
              createdAt: Date.now() - 1000 * 60 * 60,
              imageUri: undefined,
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Error al obtener username:", error);
    }
  };



  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso requerido",
        "Necesitamos acceso a tus fotos para adjuntar una imagen."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onPublish = async () => {
    if (!title.trim()) {
      Alert.alert("Falta el título", "Por favor, escribe un título.");
      return;
    }
    setSubmitting(true);

    let currentUsername = username;
    let currentAvatarUri = avatarUri;

    // Double check user info if missing
    if (!currentUsername) {
      const storedName = await AsyncStorage.getItem('userName');
      const storedAvatar = await AsyncStorage.getItem('userAvatar');
      if (storedName) {
        currentUsername = storedName;
        currentAvatarUri = storedAvatar;
        setUsername(storedName);
        setAvatarUri(storedAvatar);
      } else {
        const auth = getAuth();
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          currentUsername = firebaseUser.displayName || firebaseUser.email;
          currentAvatarUri = firebaseUser.photoURL;
          setUsername(currentUsername);
          setAvatarUri(currentAvatarUri);
        }
      }
    }

    const newPost = {
      id: Math.random().toString(36).slice(2),
      username: currentUsername || "Usuario",
      avatarUri: currentAvatarUri,
      title: title.trim(),
      content: content.trim(),
      imageUri,
      createdAt: Date.now(),
    };

    setPosts((prev) => [newPost, ...prev]);

    setTitle("");
    setContent("");
    setImageUri(undefined);
    setSubmitting(false);
    setVisible(false);
  };

  const removeImage = () => setImageUri(undefined);

  const renderItem = ({ item }) => (
    <View style={[styles.card, darkMode && styles.darkCard]}>
      {/* Header: User Info */}
      <View style={styles.cardHeader}>
        <Image
          source={item.avatarUri ? { uri: item.avatarUri } : require('../assets/avatar.png')}
          style={[styles.userAvatar, darkMode && { borderColor: '#000' }]}
        />
        <View style={styles.headerTextContainer}>
          <Text style={[styles.usernameText, darkMode && styles.darkText]}>{item.username}</Text>
          <Text style={[styles.cardMeta, darkMode && styles.darkTextSecondary]}>{new Date(item.createdAt).toLocaleDateString()} · {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <TouchableOpacity style={styles.moreOptions}>
          <Ionicons name="ellipsis-horizontal" size={20} color={darkMode ? "#aaa" : "#666"} />
        </TouchableOpacity>
      </View>

      {/* Body: Content */}
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, darkMode && styles.darkText]}>{item.title}</Text>
        {!!item.content && <Text style={[styles.cardContent, darkMode && styles.darkTextSecondary]}>{item.content}</Text>}
      </View>

      {!!item.imageUri && (
        <Image source={{ uri: item.imageUri }} style={styles.cardImage} resizeMode="cover" />
      )}

      {/* Footer: Interactions */}
      <View style={[styles.cardFooter, darkMode && styles.darkCardFooter]}>
        <TouchableOpacity style={styles.interactionBtn}>
          <Ionicons name="heart-outline" size={22} color={darkMode ? "#aaa" : "#444"} />
          <Text style={[styles.interactionText, darkMode && styles.darkTextSecondary]}>Me gusta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.interactionBtn}>
          <Ionicons name="chatbubble-outline" size={20} color={darkMode ? "#aaa" : "#444"} />
          <Text style={[styles.interactionText, darkMode && styles.darkTextSecondary]}>Comentar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.interactionBtn}>
          <Ionicons name="share-social-outline" size={20} color={darkMode ? "#aaa" : "#444"} />
          <Text style={[styles.interactionText, darkMode && styles.darkTextSecondary]}>Compartir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Botón que abre el modal de nueva publicación */}
      <TouchableOpacity style={[styles.primaryBtn, darkMode && styles.darkPrimaryBtn]} onPress={() => setVisible(true)}>
        <Text style={styles.primaryBtnText}>+</Text>
      </TouchableOpacity>

      {/* Modal con el formulario */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >

        <TouchableOpacity
          activeOpacity={1}
          style={styles.overlay}
          onPress={() => setVisible(false)}
        >

          <TouchableOpacity activeOpacity={1} style={[styles.modalContent, darkMode && styles.darkModalContent]} onPress={() => { }}>
            <Text style={[styles.modalTitle, darkMode && styles.darkModalTitle]}>Crear publicación</Text>

            <TextInput
              placeholder="Título"
              placeholderTextColor={darkMode ? "#888" : "#999"}
              value={title}
              onChangeText={setTitle}
              style={[styles.input, darkMode && styles.darkInput]}
            />
            <TextInput
              placeholder="Contenido (opcional)"
              placeholderTextColor={darkMode ? "#888" : "#999"}
              value={content}
              onChangeText={setContent}
              style={[styles.input, styles.inputMultiline, darkMode && styles.darkInput]}
              multiline
            />

            <View style={styles.imageRow}>
              <TouchableOpacity style={styles.botonimg} onPress={pickImage}>
                <Text style={styles.botonimoText}>
                  {imageUri ? "Cambiar imagen" : "Adjuntar imagen"}
                </Text>
              </TouchableOpacity>

              {imageUri && (
                <TouchableOpacity onPress={removeImage} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>Quitar</Text>
                </TouchableOpacity>
              )}
            </View>

            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            )}

            <TouchableOpacity
              style={[styles.publicarbtn, submitting && { opacity: 0.6, pointerEvents: "none" }]}
              onPress={onPublish}
              disabled={submitting}
            >
              <Text style={styles.publicar}>
                {submitting ? "Publicando..." : "Publicar"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setVisible(false)}>
              <Text style={[styles.cancelBtnText, darkMode && styles.darkTextSecondary]}>Cancelar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Lista de publicaciones (fuera del modal) */}
      <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Publicaciones</Text>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  darkContainer: { backgroundColor: "#121212" },

  // Botón principal
  primaryBtn: {
    backgroundColor: primary,
    borderRadius: 45,
    paddingVertical: 12,
    height: 65,
    width: 65,
    position: "absolute",
    right: 20,
    bottom: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginTop: 45,
    zIndex: 10,
  },
  darkPrimaryBtn: {
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 24,

  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  darkModalContent: {
    backgroundColor: "#1e1e1e",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12, color: primary },
  darkModalTitle: { color: "#fff" },

  // Inputs y acciones del formulario
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },
  darkInput: {
    backgroundColor: "#2a2a2a",
    borderColor: "#444",
    color: "#fff",
  },
  inputMultiline: { minHeight: 80, textAlignVertical: "top" },
  imageRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  botonimg: {
    backgroundColor: primary,
    borderRadius: 6,
    paddingVertical: 8,
    width: 140,
    height: 45,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  botonimoText: { color: "#fff", fontWeight: "600" },
  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginLeft: 8,
  },
  darkRemoveBtn: {
    backgroundColor: "#333",
  },
  removeBtnText: { color: "#333" },
  darkRemoveBtnText: { color: "#ccc" },
  previewImage: { width: "100%", height: 180, borderRadius: 12, marginBottom: 12 },

  // Lista
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 20,
    marginTop: 40,
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },


  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 2,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  darkCard: {
    backgroundColor: "#1e1e1e",
    borderColor: "#000",
    shadowColor: "#000",
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#eee',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  usernameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  moreOptions: {
    padding: 4,
  },
  cardBody: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: '#1a1a1a',
    marginBottom: 4,
    lineHeight: 24,
  },
  cardContent: {
    fontSize: 15,
    color: "#444",
    lineHeight: 20,
  },
  darkText: { color: "#fff" },
  darkTextSecondary: { color: "#aaa" },
  cardImage: {
    width: "100%",
    height: 250,
    marginVertical: 4,
  },
  cardMeta: { fontSize: 12, color: "#888", marginTop: 2 },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 4,
    justifyContent: 'space-around',
  },
  interactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  interactionText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
  },
  darkCardFooter: {
    borderTopColor: "#000",
  },

  // Cancel
  cancelBtn: {
    marginTop: 10,
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  cancelBtnText: {
    color: "#666",
    fontWeight: "600",
  },

  publicar: {
    color: white,
    fontWeight: "600",
  },

  publicarbtn: {
    backgroundColor: primary,
    borderRadius: 8,
    paddingVertical: 12,
    height: 45,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",

  }
});
