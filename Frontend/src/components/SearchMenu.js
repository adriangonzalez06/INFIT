import React, { useState, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
  FlatList,
  Dimensions,
  PanResponder,
  StyleSheet
} from 'react-native';
import style from '../../views/stylesheet'

  const { height } = Dimensions.get("window");


export const SearchMenu = forwardRef(({
  data = [],
  title = 'Disponibles',
  searchFields = ['nombre', 'name'],
  onSelectItem = () => {},
  renderCustomItem = null,
  searchPlaceholder = 'Buscar...',
  height: propHeight,
  numColumns = 0,
  columnWrapperStyle = null,
  contentContainerStyle = null
}, ref) => {

  const windowHeight = propHeight || Dimensions.get('window').height;
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [tipo, setTipo] = useState(null);

  const slideAnim = useRef(new Animated.Value(windowHeight)).current;

  // pan responder para arrastrar el sheet
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(windowHeight * 0.2 + gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          cerrarMenu();
        } else {
          Animated.timing(slideAnim, {
            toValue: windowHeight * 0.2,
            duration: 150,
            useNativeDriver: false
          }).start();
        }
      }
    })
  ).current;

  const abrirMenu = (menuTipo = null) => {
    setTipo(menuTipo);
    setSearchText('');
    setVisible(true);
    Animated.timing(slideAnim, {
      toValue: windowHeight * 0.2,
      duration: 250,
      useNativeDriver: false
    }).start();
  };

  const cerrarMenu = () => {
    Animated.timing(slideAnim, {
      toValue: windowHeight,
      duration: 200,
      useNativeDriver: false
    }).start(() => {
      setVisible(false);
      setTipo(null);
    });
  };

  useImperativeHandle(ref, () => ({
    abrirMenu,
    cerrarMenu
  }));

  const handleSelect = (item) => {
    onSelectItem(item);
    cerrarMenu();
  };

  const filteredData = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return data;
    return data.filter(item =>
      searchFields.some(f => String(item[f] ?? '').toLowerCase().includes(q))
    );
  }, [data, searchText, searchFields]);

  const renderDefaultItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleSelect(item)}>
      <View style={styles.itemContainer}>
        <Text style={styles.itemName}>{item.nombre || item.name || 'Sin nombre'}</Text>
        {Object.entries(item).map(([k, v]) => (
          k !== 'id' && k !== 'nombre' && k !== 'name' ? (
            <Text key={k} style={styles.itemDetails}>{`${k}: ${v}`}</Text>
          ) : null
        ))}
      </View>
    </TouchableOpacity>
  );


  return (
    <>
      {visible && (
        <Animated.View
          style={[styles.bottomSheet, { top: slideAnim }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dragIndicator} />
          <Text style={styles.sheetTitle}>{title}</Text>

          <TextInput
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            value={searchText}
            onChangeText={setSearchText}
          />

          <View style={{paddingBottom: 200}}>
            <FlatList
              data={filteredData}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderCustomItem || renderDefaultItem}
              keyboardShouldPersistTaps="handled"
              numColumns= {numColumns}
            />
          </View>

        </Animated.View>
      )}
    </>
  );
});


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  header: { fontSize: 28, fontWeight: "bold", color: "#333" },
  subHeader: { fontSize: 16, color: "#666", marginBottom: 20 },
  mainButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center"
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  bottomSheet: {
    flex: 1,
    position: "absolute",
    left: 0,
    right: 0,
    height: height * 0.8, // más grande
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    elevation: 10
  },
  dragIndicator: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10
  },
  sheetTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16
  },
  cardContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#fff",
    elevation: 4
  },
  imageContainer: {
    flex: 1,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center"
  },
  imagePlaceholder: {
    fontSize: 40,
    color: "#999"
  },
  infoContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    justifyContent: "center"
  },
  publisher: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4
  },
  routineName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6
  },
  description: {
    fontSize: 14,
    color: "#555"
  }
});

export default SearchMenu;