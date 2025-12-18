export default class Dish {
  constructor(id, name, imgUrl, macronutrients, ingredients, calories, vegetarian, vegan, gluten_free) {
    this.id = id;
    this.name = name;
    this.imgUrl = imgUrl;
    this.macronutrients = macronutrients;
    this.ingredients = ingredients;
    this.calories = calories;
    this.vegetarian = vegetarian;
    this.vegan = vegan;
    this.gluten_free = gluten_free;
  }

getName() {
  return this.name;
}

  // Reconstruye una instancia de Dish desde un objeto plano (p.ej. desde JSON / route params)
  static from(obj) {
    if (!obj) return null;
    if (obj instanceof Dish) return obj;
    return new Dish(
      obj.id,
      obj.name,
      obj.imgUrl,
      obj.macronutrients,
      obj.ingredients,
      obj.calories,
      obj.vegetarian,
      obj.vegan,
      obj.gluten_free
    );
  }

}

