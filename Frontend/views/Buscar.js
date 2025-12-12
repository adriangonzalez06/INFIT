
// Feed.js
import React, { useState } from "react";
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
import * as ImagePicker from "expo-image-picker";
import colors from "./colors";

const { primary } = colors;
const { white } = colors;

export default function Feed() {
  const [posts, setPosts] = useState([
    {
      id: "1",
      title: "Bienvenido al feed $username!",
      content: "Esta es una publicación ejemplo",
      createdAt: Date.now() - 1000 * 60 * 60,
      imageUri: undefined,
    },
  ]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);

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

  const onPublish = () => {
    if (!title.trim()) {
      Alert.alert("Falta el título", "Por favor, escribe un título.");
      return;
    }
    setSubmitting(true);

    const newPost = {
      id: Math.random().toString(36).slice(2),
      title: title.trim(),
      content: content.trim(),
      imageUri,
      createdAt: Date.now(),
    };

    setPosts((prev) => [newPost, ...prev]);

    // Reset formulario
    setTitle("");
    setContent("");
    setImageUri(undefined);
    setSubmitting(false);
    setVisible(false);
    
  };

  const removeImage = () => setImageUri(undefined);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      {!!item.content && <Text style={styles.cardContent}>{item.content}</Text>}
      {!!item.imageUri && (
        <Image source={{ uri: item.imageUri }} style={styles.cardImage} resizeMode="cover" />
      )}
      <Text style={styles.cardMeta}>{new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Botón que abre el modal de nueva publicación */}
      <TouchableOpacity style={styles.primaryBtn} onPress={() => setVisible(true)}>
        <Text style={styles.primaryBtnText}>+</Text>
      </TouchableOpacity>

      {/* Modal con el formulario */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        {/* Overlay para cerrar tocando fuera */}
        <TouchableOpacity
          activeOpacity={1}
          style={styles.overlay}
          onPress={() => setVisible(false)}
        >
          {/* Evita que el toque del contenido cierre el modal */}
          <TouchableOpacity activeOpacity={1} style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Crear publicación</Text>

            <TextInput
              placeholder="Título"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />
            <TextInput
              placeholder="Contenido (opcional)"
              value={content}
              onChangeText={setContent}
              style={[styles.input, styles.inputMultiline]}
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
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Lista de publicaciones (fuera del modal) */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Publicaciones</Text>

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
    marginTop:45,
    zIndex: 10,
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
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12, color: primary },

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
  removeBtnText: { color: "#333" },
  previewImage: { width: "100%", height: 180, borderRadius: 12, marginBottom: 12 },

  // Lista
  sectionTitle: { fontSize: 25, fontWeight: "600", marginBottom: 12, marginTop: 14, color: primary },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  cardContent: { fontSize: 14, color: "#444", marginBottom: 8 },
  cardImage: { width: "100%", height: 200, borderRadius: 8, marginBottom: 8 },
  cardMeta: { fontSize: 12, color: "#666" },

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
