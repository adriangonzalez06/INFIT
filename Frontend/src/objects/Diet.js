import Ingredient from "./Ingredient";
import Dish from "./Dish";

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednseday',
  'Thursday',
  'Friday',
  'Satunday',
  'Sunday'
];

export default class Diet {
  constructor(id, name, description, imgUrl, weeklyDishes = []) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.imgUrl = imgUrl;
    // Array de 7 días, cada día contiene un array de Dishes
    //verifica si weeklyDishes tiene 7 elementos, si no, inicializa con arrays vacíos
    this.weeklyDishes = weeklyDishes.length === 7 
      ? weeklyDishes 
      : Array(7).fill(null).map(() => []);
  }

  // Obtener platos de un día específico
  getDishesForDay(dayIndex) {
    if (dayIndex < 0 || dayIndex > 6) {
      throw new Error('El índice del día debe estar entre 0 y 6');
    }
    return this.weeklyDishes[dayIndex];
  }

  // Reconstruir Diet desde un objeto plano (p.ej. route params / JSON) al pasar objetos por route paramsse convierten a planos
static from(obj) {

  if (!obj) {
    return new Diet(null, null, null, null, []);
  }

  const diet = new Diet(
    obj.id,
    obj.name,
    obj.description,
    obj.imgUrl,
    obj.weeklyDishes
      ? obj.weeklyDishes.map(day =>
          (day || []).map(dishObj => {
            const ingredients = (dishObj.ingredients || []).map(item => {
              const ingr = new Ingredient(
                item.ingredient?.id,
                item.ingredient?.name,
                item.ingredient?.imgUrl,
                item.ingredient?.calories,
                item.ingredient?.fiber,
                item.ingredient?.carbohydrates,
                item.ingredient?.fat,
                item.ingredient?.protein
              );
              return { ingredient: ingr, grams: item.grams || 0 };
            });

            return new Dish(
              dishObj.id,
              dishObj.name,
              dishObj.imgUrl,
              ingredients,
              dishObj.vegetarian,
              dishObj.vegan,
              dishObj.gluten_free
            );
          })
        )
      : []
  );

  return diet;
}



  getAllDishes() {
    return this.weeklyDishes;
  }

  // Agregar plato a un día específico
  addDishToDay(dayIndex, dish) {
    if (dayIndex < 0 || dayIndex > 6) {
      throw new Error('El índice del día debe estar entre 0 y 6');
    }
    this.weeklyDishes[dayIndex].push(dish);
  }

  //eliminar plato
  deleteDishFromDay(dayIndex, deletingDish) {
    if (dayIndex < 0 || dayIndex > 6) {
      throw new Error('El índice del día debe estar entre 0 y 6');
    }
    this.weeklyDishes[dayIndex] = this.weeklyDishes[dayIndex].filter((dish) => dish !== deletingDish);
  }

  getId() {
    return this.id;
  }

  setId(id) {
    this.id = id;
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }

  getDesc() {
    return this.description;
  }

  setDesc(desc) {
    this.description = desc;
  }

  getUrl() {
    return this.imgUrl;
  }

  setUrl(url) {
    url = this.imgUrl;
  }

}