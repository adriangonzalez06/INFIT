// Feed.js — Feed de publicaciones con Firestore en tiempo real
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import * as ImagePicker from "expo-image-picker";
import colors from "./colors";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

// Firestore
import { db } from '../firebaseConfig';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';

import { BACKEND_URL } from '../src/config';

const { primary } = colors;
const { white } = colors;

// ── Helper: sube imagen a Cloudinary usando la firma del backend ─────────────
async function uploadToCloudinary(localUri) {
  try {
    const { data } = await axios.post(`${BACKEND_URL}/cloudinary/signature`);
    const { signature, timestamp, cloudName, apiKey, folder } = data;

    const form = new FormData();
    form.append('file', { uri: localUri, type: 'image/jpeg', name: 'post.jpg' });
    form.append('signature', signature);
    form.append('timestamp', String(timestamp));
    form.append('api_key', apiKey);
    form.append('folder', folder);

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data.secure_url;
  } catch (e) {
    console.error('Error al subir imagen a Cloudinary:', e?.message || e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Feed() {

  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [avatarUri, setAvatarUri] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);

  // Comments
  const [commentVisible, setCommentVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  // ── Cargar usuario al entrar en la pantalla ────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      loadUser();
      AsyncStorage.getItem("darkMode").then(v => setDarkMode(v === "true"));
    }, [])
  );

  const loadUser = async () => {
    try {
      let uid = await AsyncStorage.getItem('userId');
      let name = await AsyncStorage.getItem('userName');
      let email = await AsyncStorage.getItem('userEmail');
      let avatar = null;

      // Fallback a Firebase Auth
      if (!uid) {
        const auth = getAuth();
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          uid = firebaseUser.uid;
          name = name || firebaseUser.displayName || firebaseUser.email;
          email = email || firebaseUser.email;
        }
      }

      // Cargar foto de perfil desde el backend (igual que profile.js)
      if (email) {
        try {
          const resp = await axios.get(
            `${BACKEND_URL}/api/usuarios/buscar/email/${encodeURIComponent(email)}`,
            { timeout: 5000 }
          );
          if (resp.data?.photo) avatar = resp.data.photo;
          if (resp.data?.nombre && !name) name = resp.data.nombre;
        } catch (e) {
          console.warn('[Feed] No se pudo cargar foto del backend:', e?.message);
        }
      }

      if (uid) setUserId(uid);
      if (name) setUsername(name);
      if (avatar) setAvatarUri(avatar);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
    }
  };

  // ── Suscripción en tiempo real a Firestore ────────────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, 'publicaciones'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPosts(data);
      setLoading(false);
    }, (err) => {
      console.error('Error en onSnapshot:', err);
      setLoading(false);
    });

    // Limpia el canal cuando el componente se desmonta
    return () => unsubscribe();
  }, []);

  // ── Seleccionar imagen de la galería ─────────────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tus fotos para adjuntar una imagen.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  // ── Publicar ──────────────────────────────────────────────────────────────
  const onPublish = async () => {
    if (!title.trim()) {
      Alert.alert("Falta el título", "Por favor, escribe un título.");
      return;
    }
    setSubmitting(true);

    // Asegurar datos del usuario
    let uid = userId;
    let name = username;
    let avatar = avatarUri;

    if (!uid || !name) {
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        uid = uid || firebaseUser.uid;
        name = name || firebaseUser.displayName || firebaseUser.email || 'Usuario';
        avatar = avatar || firebaseUser.photoURL || null;
        setUserId(uid); setUsername(name); setAvatarUri(avatar);
      }
    }

    try {
      // 1. Subir imagen a Cloudinary si hay una seleccionada
      let imageUrl = null;
      if (imageUri) {
        imageUrl = await uploadToCloudinary(imageUri);
      }

      // 2. Guardar publicación en Firestore (dispara onSnapshot a todos)
      await addDoc(collection(db, 'publicaciones'), {
        userId: uid || 'anon',
        username: name || 'Usuario',
        avatarUrl: avatar || null,
        titulo: title.trim(),
        contenido: content.trim(),
        imageUrl,
        createdAt: serverTimestamp(),
        likes: [],
        likesCount: 0,
        comentariosCount: 0,
      });

      // 3. Limpiar formulario
      setTitle(""); setContent(""); setImageUri(undefined);
      setVisible(false);
    } catch (e) {
      console.error('Error al publicar:', e);
      Alert.alert("Error", "No se pudo publicar. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle Like ───────────────────────────────────────────────────────────
  const toggleLike = async (postId, currentLikes) => {
    if (!userId) return;
    const hasLiked = (currentLikes || []).includes(userId);
    try {
      await updateDoc(doc(db, 'publicaciones', postId), {
        likes: hasLiked ? arrayRemove(userId) : arrayUnion(userId),
        likesCount: increment(hasLiked ? -1 : 1),
      });
    } catch (e) {
      console.error('Error al dar like:', e);
    }
  };

  // ── Eliminar publicación (cascade: borra comentarios primero) ─────────────
  const deletePost = async (postId) => {
    Alert.alert(
      'Eliminar publicación',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. Borrar todos los comentarios de la subcolección
              const comentariosRef = collection(db, 'publicaciones', postId, 'comentarios');
              const comentariosSnap = await getDocs(comentariosRef);
              const deletePromises = comentariosSnap.docs.map(c => deleteDoc(c.ref));
              await Promise.all(deletePromises);

              // 2. Borrar el documento padre
              await deleteDoc(doc(db, 'publicaciones', postId));
            } catch (e) {
              console.error('Error al eliminar publicación:', e);
              Alert.alert('Error', 'No se pudo eliminar la publicación.');
            }
          },
        },
      ]
    );
  };

  // ── Menú de opciones del post (solo dueño) ────────────────────────────────
  const openPostOptions = (post) => {
    if (post.userId !== userId) return; // solo el dueño ve opciones
    Alert.alert(
      'Opciones',
      null,
      [
        { text: 'Eliminar publicación', style: 'destructive', onPress: () => deletePost(post.id) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  // ── Abrir comentarios ─────────────────────────────────────────────────────
  const openComments = (postId) => {
    setSelectedPostId(postId);
    setCommentVisible(true);
  };

  const removeImage = () => setImageUri(undefined);

  // ── Render tarjeta ────────────────────────────────────────────────────────
  const renderItem = ({ item }) => {
    const hasLiked = (item.likes || []).includes(userId);
    const createdAt = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);

    return (
      <View style={[styles.card, darkMode && styles.darkCard]}>

        {/* Header: usuario */}
        <View style={styles.cardHeader}>
          <Image
            source={item.avatarUrl ? { uri: item.avatarUrl } : require('../assets/avatar.png')}
            style={styles.userAvatar}
          />
          <View style={styles.headerTextContainer}>
            <Text style={[styles.usernameText, darkMode && styles.darkText]}>{item.username}</Text>
            <Text style={[styles.cardMeta, darkMode && styles.darkTextSecondary]}>
              {createdAt.toLocaleDateString()} · {createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          {/* Solo visible para el dueño del post */}
          {item.userId === userId && (
            <TouchableOpacity style={styles.moreOptions} onPress={() => openPostOptions(item)}>
              <Ionicons name="ellipsis-horizontal" size={20} color={darkMode ? "#aaa" : "#666"} />
            </TouchableOpacity>
          )}
        </View>

        {/* Body: contenido */}
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, darkMode && styles.darkText]}>{item.titulo}</Text>
          {!!item.contenido && (
            <Text style={[styles.cardContent, darkMode && styles.darkTextSecondary]}>{item.contenido}</Text>
          )}
        </View>

        {/* Imagen */}
        {!!item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
        )}

        {/* Footer: likes y comentarios (sin compartir) */}
        <View style={[styles.cardFooter, darkMode && styles.darkCardFooter]}>

          {/* Like */}
          <TouchableOpacity style={styles.interactionBtn} onPress={() => toggleLike(item.id, item.likes)}>
            <Ionicons
              name={hasLiked ? "heart" : "heart-outline"}
              size={22}
              color={hasLiked ? "#e53935" : (darkMode ? "#aaa" : "#444")}
            />
            <Text style={[
              styles.interactionText,
              darkMode && styles.darkTextSecondary,
              hasLiked && styles.likedText,
            ]}>
              {item.likesCount ?? 0}
            </Text>
          </TouchableOpacity>

          {/* Comentarios */}
          <TouchableOpacity style={styles.interactionBtn} onPress={() => openComments(item.id)}>
            <Ionicons name="chatbubble-outline" size={20} color={darkMode ? "#aaa" : "#444"} />
            <Text style={[styles.interactionText, darkMode && styles.darkTextSecondary]}>
              {item.comentariosCount ?? 0}
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>

      {/* Botón flotante nueva publicación */}
      <TouchableOpacity style={[styles.primaryBtn, darkMode && styles.darkPrimaryBtn]} onPress={() => setVisible(true)}>
        <Text style={styles.primaryBtnText}>+</Text>
      </TouchableOpacity>

      {/* ── Modal: nueva publicación ── */}
      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <TouchableOpacity activeOpacity={1} style={styles.overlay} onPress={() => setVisible(false)}>
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
              style={[styles.publicarbtn, submitting && { opacity: 0.6 }]}
              onPress={onPublish}
              disabled={submitting}
            >
              {submitting
                ? <ActivityIndicator color={white} />
                : <Text style={styles.publicar}>Publicar</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setVisible(false)}>
              <Text style={[styles.cancelBtnText, darkMode && styles.darkTextSecondary]}>Cancelar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── Modal: comentarios ── */}
      {selectedPostId && (
        <ComentariosModal
          visible={commentVisible}
          postId={selectedPostId}
          userId={userId}
          username={username}
          avatarUrl={avatarUri}
          darkMode={darkMode}
          onClose={() => { setCommentVisible(false); setSelectedPostId(null); }}
        />
      )}

      {/* Lista de publicaciones */}
      <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Publicaciones</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={primary} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente de comentarios (en tiempo real, misma pantalla)
// ─────────────────────────────────────────────────────────────────────────────
function ComentariosModal({ visible, postId, userId, username, avatarUrl, darkMode, onClose }) {
  const [comentarios, setComentarios] = useState([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Suscribirse a la subcolección de comentarios en tiempo real
  useEffect(() => {
    if (!postId || !visible) return;

    const q = query(
      collection(db, 'publicaciones', postId, 'comentarios'),
      orderBy('createdAt', 'asc'),
    );
    const unsub = onSnapshot(q, (snap) => {
      setComentarios(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [postId, visible]);

  const enviarComentario = async () => {
    if (!texto.trim() || !userId) return;
    setEnviando(true);
    try {
      const postRef = doc(db, 'publicaciones', postId);
      // Añadir comentario en la subcolección
      await addDoc(collection(db, 'publicaciones', postId, 'comentarios'), {
        userId,
        username: username || 'Usuario',
        avatarUrl: avatarUrl || null,
        texto: texto.trim(),
        createdAt: serverTimestamp(),
      });
      // Incrementar contador en el post padre
      await updateDoc(postRef, { comentariosCount: increment(1) });
      setTexto('');
    } catch (e) {
      console.error('Error al comentar:', e);
      Alert.alert('Error', 'No se pudo enviar el comentario.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} style={styles.overlay} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={[styles.commentSheet, darkMode && styles.darkModalContent]} onPress={() => { }}>

          {/* Cabecera */}
          <View style={styles.commentHeader}>
            <Text style={[styles.modalTitle, darkMode && styles.darkModalTitle]}>Comentarios</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={darkMode ? "#fff" : "#333"} />
            </TouchableOpacity>
          </View>

          {/* Lista de comentarios */}
          <FlatList
            data={comentarios}
            keyExtractor={(c) => c.id}
            style={styles.commentList}
            ListEmptyComponent={
              <Text style={[styles.emptyText, darkMode && styles.darkTextSecondary]}>
                Sé el primero en comentar 💬
              </Text>
            }
            renderItem={({ item }) => {
              const at = item.createdAt?.toDate ? item.createdAt.toDate() : new Date();
              return (
                <View style={styles.commentItem}>
                  <Image
                    source={item.avatarUrl ? { uri: item.avatarUrl } : require('../assets/avatar.png')}
                    style={styles.commentAvatar}
                  />
                  <View style={[styles.commentBubble, darkMode && styles.darkCommentBubble]}>
                    <Text style={[styles.commentUsername, darkMode && styles.darkText]}>{item.username}</Text>
                    <Text style={[styles.commentText, darkMode && styles.darkTextSecondary]}>{item.texto}</Text>
                    <Text style={styles.commentTime}>
                      {at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              );
            }}
          />

          {/* Input nuevo comentario */}
          <View style={[styles.commentInputRow, darkMode && styles.darkCommentInputRow]}>
            <TextInput
              style={[styles.commentInput, darkMode && styles.darkInput]}
              placeholder="Escribe un comentario..."
              placeholderTextColor={darkMode ? "#888" : "#999"}
              value={texto}
              onChangeText={setTexto}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!texto.trim() || enviando) && { opacity: 0.5 }]}
              onPress={enviarComentario}
              disabled={!texto.trim() || enviando}
            >
              {enviando
                ? <ActivityIndicator color="#fff" size="small" />
                : <Ionicons name="send" size={18} color="#fff" />
              }
            </TouchableOpacity>
          </View>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  darkContainer: { backgroundColor: "#121212" },

  // ── Botón flotante ──────────────────────────────────────────────────────
  primaryBtn: {
    backgroundColor: primary,
    borderRadius: 45,
    height: 65,
    width: 65,
    position: "absolute",
    right: 20,
    bottom: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  darkPrimaryBtn: {
    shadowOpacity: 0.6,
    elevation: 10,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 28 },

  // ── Modal publicación ───────────────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  darkModalContent: { backgroundColor: "#1e1e1e" },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 14, color: primary },
  darkModalTitle: { color: "#fff" },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: "#fafafa",
    fontSize: 15,
  },
  darkInput: { backgroundColor: "#2a2a2a", borderColor: "#444", color: "#fff" },
  inputMultiline: { minHeight: 80, textAlignVertical: "top" },
  imageRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  botonimg: {
    backgroundColor: primary,
    borderRadius: 8,
    paddingVertical: 10,
    width: 145,
    alignItems: "center",
  },
  botonimoText: { color: "#fff", fontWeight: "600" },
  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  removeBtnText: { color: "#333" },
  previewImage: { width: "100%", height: 180, borderRadius: 12, marginBottom: 12 },
  publicarbtn: {
    backgroundColor: primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 4,
  },
  publicar: { color: white, fontWeight: "700", fontSize: 16 },
  cancelBtn: { marginTop: 8, alignSelf: "center", paddingVertical: 8 },
  cancelBtnText: { color: "#666", fontWeight: "600" },

  // ── Lista ───────────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 16,
    marginTop: 12,
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },

  // ── Tarjeta ─────────────────────────────────────────────────────────────
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  darkCard: { backgroundColor: "#1e1e1e", borderColor: "#333" },

  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  userAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1, borderColor: '#eee',
  },
  headerTextContainer: { flex: 1, marginLeft: 10 },
  usernameText: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  moreOptions: { padding: 4 },

  cardBody: { paddingHorizontal: 12, paddingBottom: 12 },
  cardTitle: { fontSize: 17, fontWeight: "700", color: '#1a1a1a', marginBottom: 4, lineHeight: 24 },
  cardContent: { fontSize: 15, color: "#555", lineHeight: 21 },
  cardImage: { width: "100%", height: 250 },
  cardMeta: { fontSize: 12, color: "#999", marginTop: 2 },

  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  darkCardFooter: { borderTopColor: "#333" },
  interactionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16 },
  interactionText: { marginLeft: 6, fontSize: 14, fontWeight: '600', color: '#444' },
  likedText: { color: '#e53935' },

  // ── Textos dark ─────────────────────────────────────────────────────────
  darkText: { color: "#fff" },
  darkTextSecondary: { color: "#aaa" },

  // ── Modal comentarios ───────────────────────────────────────────────────
  commentSheet: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    maxHeight: '85%',
    flex: 0,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentList: { maxHeight: 320, marginBottom: 8 },
  commentItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8, marginTop: 2 },
  commentBubble: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 10,
    flex: 1,
  },
  darkCommentBubble: { backgroundColor: '#2a2a2a' },
  commentUsername: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  commentText: { fontSize: 14, color: '#444', lineHeight: 20 },
  commentTime: { fontSize: 11, color: '#aaa', marginTop: 4, alignSelf: 'flex-end' },
  emptyText: { textAlign: 'center', color: '#aaa', marginVertical: 20, fontSize: 14 },

  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    gap: 8,
  },
  darkCommentInputRow: { borderTopColor: '#333' },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  sendBtn: {
    backgroundColor: primary,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});