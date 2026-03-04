import React, { useState, useRef, useImperativeHandle, forwardRef, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
  FlatList,
  Dimensions,
  PanResponder,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import style from '../../views/stylesheet'

const { height } = Dimensions.get("window");

export const SearchMenu = forwardRef(({
  data = [],
  data2 = [],
  viewButtons = false,
  dataButton = 'Data 1',
  dataButton2 = 'Data 2',
  title = 'Disponibles',
  searchFields = ['nombre', 'name'],
  onSelectItem = () => { },
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
  const [selectedData, setSelectedData] = useState(data);
  const [showCreateButton, setShowCreateButton] = useState(true);

  const navigation = useNavigation();
  const [isDark, setIsDark] = useState(false);

  // Cargar preferencia cada vez que entramos
  useFocusEffect(
    useCallback(() => {
      const loadTheme = async () => {
        const savedTheme = await AsyncStorage.getItem("darkMode");
        setIsDark(savedTheme === "true");
      };
      loadTheme();
    }, [])
  );

  const slideAnim = useRef(new Animated.Value(windowHeight)).current;

  // Sincronizar selectedData cuando data cambia
  useEffect(() => {
    setSelectedData(data);
    console.log('📊 SearchMenu actualizado con', data.length, 'items');
  }, [data]);

  // Sincronizar selectedData cuando data cambia
  useEffect(() => {
    setSelectedData(data);
    console.log('📊 SearchMenu actualizado con', data.length, 'items');
  }, [data]);

  {/*}pan responder para arrastrar el sheet*/ }
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
    if (!q) return selectedData;
    return selectedData.filter(item =>
      searchFields.some(f => String(item[f] ?? '').toLowerCase().includes(q))
    );
  }, [selectedData, searchText, searchFields]);

  const renderDefaultItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleSelect(item)}>
      <View style={[styles.itemContainer, isDark && styles.darkItemBorder]}>
        <Text style={[styles.itemName, isDark && styles.darkText]}>{item.nombre || item.name || 'Sin nombre'}</Text>
        {Object.entries(item).map(([k, v]) => (
          k !== 'id' && k !== 'nombre' && k !== 'name' ? (
            <Text key={k} style={[styles.itemDetails, isDark && styles.darkTextSecondary]}>{`${k}: ${v}`}</Text>
          ) : null
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderCategoryButtons = (viewButtons) => {

    if (!viewButtons) return null;

    return (
      <View>
        <View style={[style.middleRowElementsContainer]}>

          <TouchableOpacity
            style={[style.grayButton, isDark && { backgroundColor: '#333', borderColor: '#444' }]}
            onPress={() => { setSelectedData(data); setShowCreateButton(true) }}
          >

            <Text style={[isDark && { color: '#fff' }]}>{dataButton}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[style.grayButton, isDark && { backgroundColor: '#333', borderColor: '#444' }]}
            onPress={() => { setSelectedData(data2); setShowCreateButton(false) }}
          >

            <Text style={[isDark && { color: '#fff' }]}>{dataButton2}</Text>
          </TouchableOpacity>

        </View>

        <View style={style.dayButtons}>
          {renderCreateButton(showCreateButton)}
        </View>

      </View>
    );
  };

  const renderCreateButton = (showCreateButton) => {
    if (showCreateButton) return null;

    return (
      <TouchableOpacity
        style={[style.createDishButton, isDark && { borderColor: '#444' }]}
        onPress={() => navigation.navigate('CreateDishMenu')}
      >
        <Text style={[isDark && { color: '#fff' }]}>+ Crear plato</Text>
      </TouchableOpacity>
    )
  };

  return (
    <>
      {visible && (
        <Animated.View
          style={[styles.bottomSheet, isDark && styles.darkBottomSheet, { top: slideAnim }]}
          {...panResponder.panHandlers}
        >
          <View style={[styles.dragIndicator, isDark && { backgroundColor: '#444' }]} />
          <Text style={[styles.sheetTitle, isDark && styles.darkText]}>{title}</Text>

          <TextInput
            style={[styles.searchInput, isDark && styles.darkInput]}
            placeholder={searchPlaceholder}
            placeholderTextColor={isDark ? "#666" : "#999"}
            value={searchText}
            onChangeText={setSearchText}
          />

          <View style={{ paddingBottom: 100 }}>

            {renderCategoryButtons(viewButtons)}

            <FlatList
              data={filteredData}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderCustomItem || renderDefaultItem}
              keyboardShouldPersistTaps="handled"
              numColumns={numColumns}
              columnWrapperStyle={columnWrapperStyle}
              contentContainerStyle={contentContainerStyle}
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
    bottom: 0,
    marginBottom: 0,
    height: height * 0.8,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 0,
    elevation: 10
  },
  darkBottomSheet: {
    backgroundColor: "#1e1e1e",
  },
  darkText: { color: "#fff" },
  darkTextSecondary: { color: "#aaa" },
  darkInput: {
    backgroundColor: "#2a2a2a",
    borderColor: "#000",
    color: "#fff",
  },
  darkItemBorder: {
    borderBottomColor: "#000",
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