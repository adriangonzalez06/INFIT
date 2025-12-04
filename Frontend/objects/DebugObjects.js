import { Receta } from "./Recipe";
import { Dish } from "./Dish";

export function DebugObjects() {

  {/* recetas de prueba*/}
  var r1 = new Receta(1, "Dieta Balanceada", "url1", [plato1, plato2, plato3]);
  var r2 = new Receta(2, "Dieta Vegana", "url2", [plato2, plato3, plato6],);
  var r3 = new Receta(3, "Dieta Cetogénica", "url3", [plato4, plato5]);
  var r4 = new Receta(4, "Dieta Mediterránea", "url4", [plato5, plato1, plato6]);
  var r5 = new Receta(5, "Dieta Alta en Proteínas", "url5", [plato3]);
  var r6 = new Receta(6, "Dieta Baja en Carbohidratos", "url6", [plato5]);

  {/*platos placeholder, leer los datos de la base de datos*/}
  var plato1 = new Plato(1, "Ensalada", require('../assets/images/images_dish/dish_01.jpg'), 400, ["ingrediente1", "ingrediente2"], 500, true, true, false);
  var plato2 = new Plato(2, "Carne", "url2", 550, ["ingrediente1", "ingrediente2"], 550, false, false, true);
  var plato3 = new Plato(3, "Postre", "url3", 550, ["ingrediente1", "ingrediente2"], 550, true, false, false);
  var plato4 = new Plato(4, "Pescado", "url4", 600, ["ingrediente1", "ingrediente2"], 600, false, false, false);
  var plato5 = new Plato(5, "Sopa", "url5", 300, ["ingrediente1", "ingrediente2"], 300, true, true, true);
  var plato6 = new Plato(6, "Pasta", "url6", 700, ["ingrediente1", "ingrediente2"], 700, false, true, false);

}