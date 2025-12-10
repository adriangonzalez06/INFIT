export default class Recipe {
  constructor(id_receta, nombre, description, fotoUrl, platos) {
    this.id_receta = id_receta;
    this.nombre = nombre;
    this.description = description;
    this.fotoUrl = fotoUrl;
    this.platos = platos;
  }
}