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
  Modal,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from "react-native";
import AppModal from './AppModal';
import { useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import * as ImagePicker from "expo-image-picker";
import colors from "./colors";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';

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
  runTransaction,
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
  const [likingPosts, setLikingPosts] = useState({}); // Tracking para evitar spam
  const [fbUid, setFbUid] = useState(null); // Firebase UID como backup

  // Form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);
  const [appModal, setAppModal] = useState({ visible: false, type: 'info', title: '', message: '', onConfirm: null });
  const showAppModal = (type, title, message, onCon = null) => setAppModal({ visible: true, type, title, message, onConfirm: onCon });
  const hideAppModal = () => setAppModal(m => ({ ...m, visible: false }));

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
      let uid = await AsyncStorage.getItem('userDocId'); // Intentamos primero el ID real del backend
      if (!uid) uid = await AsyncStorage.getItem('userId');
      let name = await AsyncStorage.getItem('userName');
      let email = await AsyncStorage.getItem('userEmail');
      let avatar = null;

      // Fallback a Firebase Auth
      const auth = getAuth();
      const fbUser = auth.currentUser;
      if (fbUser && !uid) {
        uid = fbUser.uid;
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
      if (fbUser) setFbUid(fbUser.uid);
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
      showAppModal('warning', 'Permiso requerido', 'Necesitamos acceso a tus fotos para adjuntar una imagen.');
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
      showAppModal('warning', 'Falta el título', 'Por favor, escribe un título para tu publicación.');
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
      showAppModal('error', 'Error al publicar', 'No se pudo publicar la entrada. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle Like ───────────────────────────────────────────────────────────
  const toggleLike = async (postId) => {
    if (!userId || likingPosts[postId]) return;

    // Bloqueamos la interacción para este post
    setLikingPosts(prev => ({ ...prev, [postId]: true }));

    try {
      const postRef = doc(db, 'publicaciones', postId);

      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) return;

        const data = postDoc.data();
        const likes = data.likes || [];
        const hasLiked = likes.includes(userId);

        if (hasLiked) {
          // Si ya tiene like, lo quitamos y decrementamos
          transaction.update(postRef, {
            likes: arrayRemove(userId),
            likesCount: Math.max(0, (data.likesCount || 0) - 1)
          });
        } else {
          // Si no tiene like, lo ponemos e incrementamos
          transaction.update(postRef, {
            likes: arrayUnion(userId),
            likesCount: (data.likesCount || 0) + 1
          });
        }
      });
    } catch (e) {
      console.error('Error al dar like:', e);
    } finally {
      // Desbloqueamos
      setLikingPosts(prev => ({ ...prev, [postId]: false }));
    }
  };

  // ── Eliminar publicación (cascade: borra comentarios primero) ─────────────
  const deletePost = (postId) => {
    showAppModal('confirm', 'Eliminar publicación', '¿Estás seguro? Esta acción no se puede deshacer.', async () => {
      try {
        const comentariosRef = collection(db, 'publicaciones', postId, 'comentarios');
        const comentariosSnap = await getDocs(comentariosRef);
        const deletePromises = comentariosSnap.docs.map(c => deleteDoc(c.ref));
        await Promise.all(deletePromises);
        await deleteDoc(doc(db, 'publicaciones', postId));
      } catch (e) {
        console.error('Error al eliminar publicación:', e);
        showAppModal('error', 'Error al eliminar', 'No se pudo eliminar la publicación. Inténtalo de nuevo.');
      }
    });
  };

  // ── Menú de opciones del post (solo dueño) ────────────────────────────────
  const openPostOptions = (post) => {
    const isOwner = post.userId === userId || (fbUid && post.userId === fbUid);
    if (!isOwner) return;
    showAppModal('confirm', 'Opciones', '¿Qué quieres hacer con esta publicación?', () => deletePost(post.id));
  };

  // ── Abrir comentarios ─────────────────────────────────────────────────────
  const openComments = (postId) => {
    setSelectedPostId(postId);
    setCommentVisible(true);
  };

  const removeImage = () => setImageUri(undefined);

  const handleImportRoutine = async (routineData) => {
    try {
      const resp = await AsyncStorage.getItem('rutinas');
      let currentRutinas = resp ? JSON.parse(resp) : { grupo1: [] };

      // Evitar duplicados por nombre
      if ((currentRutinas.grupo1 || []).some(r => r.nombre === routineData.nombre)) {
        showAppModal('warning', 'Ya tienes esta rutina', 'Parece que ya has importado una rutina con el mismo nombre.');
        return;
      }

      // Crear copia nueva con ID único
      const newRoutine = {
        ...routineData,
        id: Date.now().toString(),
        color: routineData.color || '#264653'
      };

      if (!currentRutinas.grupo1) currentRutinas.grupo1 = [];
      currentRutinas.grupo1.push(newRoutine);
      await AsyncStorage.setItem('rutinas', JSON.stringify(currentRutinas));

      // Opcional: Guardar también en Firestore si el usuario está logueado
      const userDocId = await AsyncStorage.getItem('userDocId');
      if (userDocId) {
        try {
          await axios.post(`${BACKEND_URL}/api/routines/${userDocId}`, {
            name: newRoutine.nombre,
            exercises: newRoutine.ejercicios
          });
        } catch (e) {
          console.warn('Error saving imported routine to Firestore:', e.message);
        }
      }

      showAppModal('success', '¡Rutina importada!', 'Has añadido la rutina a tu lista de personalizadas.');
    } catch (e) {
      console.error('Error importing routine:', e);
      showAppModal('error', 'Error', 'No se pudo importar la rutina.');
    }
  };

  // ── Render tarjeta ────────────────────────────────────────────────────────
  const renderItem = ({ item }) => {
    const isOwner = item.userId === userId || (fbUid && item.userId === fbUid);
    const hasLiked = (item.likes || []).includes(userId) || (fbUid && (item.likes || []).includes(fbUid));
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
          {isOwner && (
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

        {/* Renderizado especial para rutinas */}
        {item.type === 'routine' && item.routineData && (
          <View style={[styles.routineShareCard, darkMode && styles.darkRoutineShareCard]}>
            <View style={styles.routineShareHeader}>
              <View style={[styles.routineIconContainer, { backgroundColor: item.routineData.color || primary }]}>
                <Ionicons name="barbell" size={24} color="#fff" />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.routineShareName, darkMode && styles.darkText]} numberOfLines={1}>{item.routineData.nombre}</Text>
                <Text style={styles.routineShareSub}>{item.routineData.ejercicios?.length || 0} ejercicios · {item.routineData.dificultad}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.importBtn}
              onPress={() => handleImportRoutine(item.routineData)}
            >
              <Ionicons name="download-outline" size={18} color="#fff" />
              <Text style={styles.importBtnText}>Importar Rutina</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer: likes y comentarios (sin compartir) */}
        <View style={[styles.cardFooter, darkMode && styles.darkCardFooter]}>

          {/* Like */}
          <TouchableOpacity
            style={[styles.interactionBtn, likingPosts[item.id] && { opacity: 0.7 }]}
            onPress={() => toggleLike(item.id)}
            disabled={likingPosts[item.id]}
          >
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
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <StatusBar style={darkMode ? "light" : "dark"} />

      <View style={[styles.header, darkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, darkMode && styles.darkText]}>Publicaciones</Text>
      </View>

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
      <AppModal
        visible={appModal.visible}
        type={appModal.type}
        title={appModal.title}
        message={appModal.message}
        confirmText={appModal.type === 'confirm' ? 'Eliminar' : 'Entendido'}
        cancelText="Cancelar"
        onConfirm={() => { hideAppModal(); appModal.onConfirm && appModal.onConfirm(); }}
        onCancel={hideAppModal}
        darkMode={darkMode}
      />
    </SafeAreaView >
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente de comentarios (en tiempo real, misma pantalla)
// ─────────────────────────────────────────────────────────────────────────────
function ComentariosModal({ visible, postId, userId, username, avatarUrl, darkMode, onClose }) {
  const [comentarios, setComentarios] = useState([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cmModal, setCmModal] = useState({ visible: false, type: 'error', title: '', message: '' });
  const showCmModal = (type, title, message) => setCmModal({ visible: true, type, title, message });
  const hideCmModal = () => setCmModal(m => ({ ...m, visible: false }));

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
      showCmModal('error', 'Error al comentar', 'No se pudo enviar el comentario. Inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
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
      <AppModal
        visible={cmModal.visible}
        type={cmModal.type}
        title={cmModal.title}
        message={cmModal.message}
        confirmText="Entendido"
        onConfirm={hideCmModal}
        darkMode={darkMode}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  darkContainer: { backgroundColor: colors.bg_dark },
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
  darkRemoveBtnText: { color: "#ccc" },
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

  // ── Compartir Rutina ────────────────────────────────────────────────────
  routineShareCard: {
    backgroundColor: '#F8F9FA',
    margin: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  darkRoutineShareCard: {
    backgroundColor: '#252525',
    borderColor: '#333',
  },
  routineShareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  routineIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routineShareName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  routineShareSub: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  importBtn: {
    backgroundColor: '#ef2b2d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  importBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

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