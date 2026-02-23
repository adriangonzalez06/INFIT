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

    // weeklyDishes puede llegar como array O como objeto {0:[...], 1:[...], ...}
    // (Firestore serializa los arrays anidados como objetos con claves string)
    let rawWeekly = obj.weeklyDishes;
    let daysArray = [];

    if (Array.isArray(rawWeekly)) {
      daysArray = rawWeekly;
    } else if (rawWeekly && typeof rawWeekly === 'object') {
      // Convertir {0:[...], 1:[...], 6:[...]} a array de 7 elementos
      daysArray = Array.from({ length: 7 }, (_, i) => rawWeekly[i.toString()] || rawWeekly[i] || []);
    }

    const diet = new Diet(
      obj.id,
      obj.name,
      obj.description,
      obj.imgUrl,
      daysArray.map(day =>
        (Array.isArray(day) ? day : []).map(dishObj => {
          // ingredients puede llegar como:
          //   A) [{ingredient: {...}, grams: X}]  ← formato interno correcto
          //   B) ["string1", "string2"]            ← strings de Firestore
          //   C) un número (legacy bug)            ← ignorar
          const rawIng = dishObj.ingredients;
          const ingredients = Array.isArray(rawIng)
            ? rawIng.map(item => {
              if (typeof item === 'string') {
                // Caso B: string → ingredient plano sin datos nutricionales
                return {
                  ingredient: new Ingredient(null, item, 0, 0, 0, 0, 0, null),
                  grams: 0
                };
              }
              if (item && item.ingredient) {
                // Caso A: formato correcto {ingredient, grams}
                const ing = new Ingredient(
                  item.ingredient?.id,
                  item.ingredient?.name,
                  item.ingredient?.calories,
                  item.ingredient?.fiber,
                  item.ingredient?.carbohydrates,
                  item.ingredient?.fat,
                  item.ingredient?.protein,
                  item.ingredient?.imgUrl
                );
                return { ingredient: ing, grams: item.grams || 0 };
              }
              // Caso C u otro formato desconocido → ignorar
              return null;
            }).filter(Boolean)
            : [];

          return new Dish(
            dishObj.id,
            dishObj.name,
            dishObj.imgUrl,
            ingredients,
            dishObj.vegetarian,
            dishObj.vegan,
            dishObj.gluten_free,
            dishObj.calories || 0
          );
        })
      )
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