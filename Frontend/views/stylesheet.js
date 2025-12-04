import { StyleSheet } from "react-native";
import colors from './colors.js';

export default StyleSheet.create({

  //general styles
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: colors.bg_gray,
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

  text: {
    fontSize: 16,
    color: colors.dark_gray,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.medium_gray,
  },

  
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.dark_gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: colors.dark_gray,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.medium_gray,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: colors.white,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: '600',
  },


  // Alimentacion Screen Styles
  recetaTexto: {
    fontSize: 20,
    color: colors.white,
    position: 'absolute',
    left: 10,
    bottom: 10,
  },
  recetaTextoTitulo: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.white,
    position: 'absolute',
    bottom: 40,
    left: 10,
  },
  recetasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recetaCard: {
    width: 250,
    height: 150,
    borderColor: colors.light_gray,
    color: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 25,
    backgroundColor: colors.white,
    alignSelf: 'center',
    marginBottom: 10,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    // iOS shadow
    shadowColor: colors.black,
    shadowOffset: { width: 7, height: 7 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android shadow
    elevation: 5,
  },
  shadow: {
    // iOS shadow
    shadowColor: colors.black,
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
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: 25,
  },
  seeMoreCard: {
    width: 105,
    height: 105,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.medium_gray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    alignSelf: 'center',
  },

// Receta Screen Styles
  platoContainer: {
    borderWidth: 1,
    borderColor: colors.light_gray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    width: '100%',
    backgroundColor: colors.white,
    textAlign: 'left',
    flexDirection: 'row',
  },

  platoImage: {
    width: '40%',
    height: '100%',
    borderRadius: 10,
    marginRight: 10,
  },
  dishTitle: {
    fontSize: 20,
    color: colors.dark_gray,
  },
  dishSubtitle: {
    fontSize: 16,
    color: colors.medium_gray,
  },
  dishText: {
    fontSize: 14,
    color: colors.dark_gray,
    textAlign: 'left',
    marginBottom: 5,
  },
//pantalla rutina styles
  rutinaContainer: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: colors.light_gray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  ejercicioItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.medium_gray,
  },
  ejercicioTexto: {
    fontSize: 16,
    color: colors.dark_gray,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.dark_gray,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.dark_gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buscadorContainer: {
    backgroundColor: colors.light_gray,
    padding: 20,
    borderRadius: 12,
    width: '85%',
    maxHeight: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.light_gray,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: colors.white,
  },

  ejercicioItemModal: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.medium_gray,
  },
  cerrar: {
    marginTop: 10,
    alignSelf: 'center',
  },
  cerrarTexto: {
    color: colors.primary,
    fontWeight: '600',
  },

// Changing Password and Forgot Password Screen Styles
    changingPassTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.dark_gray,
  },
  changingPassSubtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: colors.dark_gray,
  },
  boton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  botonTexto: {
    color: colors.white,
    fontWeight: 'bold',
  },

// Daily Challenge Screen Styles
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardDark: {
    backgroundColor: colors.dark_gray,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark_gray,
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
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  completedText: {
    fontSize: 18,
    color: colors.medium_green,
    marginTop: 10,
    textAlign: 'center',
  },
  expandButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  expandButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  extraContent: {
    marginTop: 15,
    paddingHorizontal: 10,
  },
  description: {
    fontSize: 15,
    color: colors.dark_gray,
    textAlign: 'center',
  },
});
