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
}