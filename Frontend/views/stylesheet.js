import { StyleSheet } from "react-native";

export default StyleSheet.create({

  //general styles
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef2b2d',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  grupoContainer: {
    marginBottom: 30,
  },
  grupoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#ef2b2d',
  },

  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#111114',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#ef2b2d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },


  // Alimentacion Screen Styles
  recetaTexto: {
    fontSize: 14,
    color: '#111114',
    textAlign: 'center',
  },
  recetaTextoTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111114',
    textAlign: 'center',
    margin: 10,
  },
  recetasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recetaCard: {
    width: 140,
    height: 100,
    borderColor: '#5c5c5cff',
    borderRadius: 9,
    borderWidth: 1,
    padding: 10,
    marginRight: 12,
    backgroundColor: '#fff',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 7, height: 7 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android shadow
    elevation: 5,
  },
  shadow: {
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android shadow
    elevation: 5,
  },
  addCard: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ef2b2d',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginRight: 12,
  },
  seeMoreCard: {
    width: 120,
    height: 100,
    backgroundColor: '#f8f8f8ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#494949ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
//pantalla rutina styles
  rutinaContainer: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ef2b2d',
  },
  ejercicioItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ejercicioTexto: {
    fontSize: 16,
    color: '#111',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buscadorContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '85%',
    maxHeight: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },

  ejercicioItemModal: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cerrar: {
    marginTop: 10,
    alignSelf: 'center',
  },
  cerrarTexto: {
    color: '#ef2b2d',
    fontWeight: '600',
  },

// Changing Password and Forgot Password Screen Styles
    changingPassTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  changingPassSubtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#555',
  },
  boton: {
    backgroundColor: '#ef2b2d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },

// Daily Challenge Screen Styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardDark: {
    backgroundColor: '#222',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ef2b2d',
    marginBottom: 10,
    textAlign: 'center',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  badge: {
    width: 100,
    height: 100,
    marginBottom: 15,
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: '#ef2b2d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  completedText: {
    fontSize: 18,
    color: '#28a745',
    marginTop: 10,
    textAlign: 'center',
  },
  expandButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#ef2b2d',
  },
  expandButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  extraContent: {
    marginTop: 15,
    paddingHorizontal: 10,
  },
  description: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
  },
});
