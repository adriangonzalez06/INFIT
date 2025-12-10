export default class Dish {
  constructor(id_plato, nombre, fotoUrl, macronutrientes, ingredientes, aporte_calorico, vegetariano, vegano, sin_gluten) {
    this.id_plato = id_plato;
    this.nombre = nombre;
    this.fotoUrl = fotoUrl;
    this.macronutrientes = macronutrientes;
    this.ingredientes = ingredientes;
    this.aporte_calorico = aporte_calorico;
    this.vegetariano = vegetariano;
    this.vegano = vegano;
    this.sin_gluten = sin_gluten;
  }
}