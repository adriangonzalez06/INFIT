
import Ingredient from "./Ingredient";
import Dish from "./Dish";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednseday",
  "Thursday",
  "Friday",
  "Satunday",
  "Sunday"
];

export default class Diet {
  constructor(id, name, description, imgUrl, weeklyDishes = []) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.imgUrl = imgUrl;

    // Asegurar un array de 7 días
    this.weeklyDishes =
      Array.isArray(weeklyDishes) && weeklyDishes.length === 7
        ? weeklyDishes
        : Array(7).fill(null).map(() => []);
  }

  getDishesForDay(dayIndex) {
    if (dayIndex < 0 || dayIndex > 6) {
      throw new Error("El índice del día debe estar entre 0 y 6");
    }
    return this.weeklyDishes[dayIndex];
  }

  // Reconstrucción desde un objeto plano
  static from(obj) {
    if (!obj) return new Diet(null, null, null, null, []);

    let rawWeekly = obj.weeklyDishes;
    let daysArray = [];

    if (Array.isArray(rawWeekly)) {
      daysArray = rawWeekly;
    } else if (rawWeekly && typeof rawWeekly === "object") {
      daysArray = Array.from({ length: 7 }, (_, i) =>
        rawWeekly[i.toString()] || rawWeekly[i] || []
      );
    } else {
      daysArray = Array(7).fill(null).map(() => []);
    }

    const weekly = daysArray.map(day =>
      (Array.isArray(day) ? day : []).map(dishObj => {
        const rawIng = dishObj?.ingredients;

        const ingredients = Array.isArray(rawIng)
          ? rawIng
            .map(item => {
              if (typeof item === "string") {
                return {
                  ingredient: new Ingredient(null, item, 0, 0, 0, 0, 0, null),
                  grams: 0
                };
              }

              if (item && item.ingredient) {
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

              return null;
            })
            .filter(Boolean)
          : [];

        return new Dish(
          dishObj.id,
          dishObj.name,
          dishObj.imgUrl,
          ingredients,
          dishObj.vegetarian,
          dishObj.vegan,
          dishObj.gluten_free,
          dishObj.calories || dishObj.kcal || 0,
          dishObj.fiber || 0,
          dishObj.carbs || dishObj.carbohydrates || 0,
          dishObj.fat || 0,
          dishObj.protein || 0
        );
      })
    );

    return new Diet(
      obj.id,
      obj.name,
      obj.description,
      obj.imgUrl,
      weekly
    );
  }

  getAllDishes() {
    return this.weeklyDishes;
  }

  addDishToDay(dayIndex, dish) {
    if (dayIndex < 0 || dayIndex > 6) {
      throw new Error("El índice del día debe estar entre 0 y 6");
    }
    this.weeklyDishes[dayIndex].push(dish);
  }

  deleteDishFromDay(dayIndex, deletingDish) {
    if (dayIndex < 0 || dayIndex > 6) {
      throw new Error("El índice del día debe estar entre 0 y 6");
    }
    this.weeklyDishes[dayIndex] = this.weeklyDishes[dayIndex].filter(
      dish => dish !== deletingDish
    );
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
    this.imgUrl = url;
  }
}
