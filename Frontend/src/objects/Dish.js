import Ingredient from './Ingredient';

export default class Dish {

  constructor(id, name, imgUrl, ingredientsWithGrams, vegetarian, vegan, gluten_free, calories = 0) {
    this.id = id;
    this.name = name;
    this.imgUrl = imgUrl;
    this.ingredients = Array.isArray(ingredientsWithGrams) ? ingredientsWithGrams : [];
    this.vegetarian = vegetarian;
    this.vegan = vegan;
    this.gluten_free = gluten_free;
    this.calories = calories; // calorías directas (fallback cuando no hay datos de ingredientes)
  }

  getIngredientsWithGrams() {
    return this.ingredients;
  }

  getAllIngredients() {
    return this.ingredients.map(i => i.ingredient);
  }

  getName() {
    return this.name;
  }

  // Reconstruye una instancia de Dish desde un objeto plano (p.ej. desde JSON / route params)
  static from(obj) {
    if (!obj) return null;

    const IngredientClass = require('./Ingredient').default;

    const ingredientsWithGrams = (obj.ingredients || []).map(item => {
      // Caso 1: Formato correcto { ingredient: {...}, grams: X }
      if (item.ingredient) {
        const ing = item.ingredient instanceof IngredientClass
          ? item.ingredient
          : new Ingredient(
            item.ingredient.id,
            item.ingredient.name,
            item.ingredient.calories,
            item.ingredient.fiber,
            item.ingredient.carbohydrates,
            item.ingredient.fat,
            item.ingredient.protein,
            item.ingredient.imgUrl
          );

        return { ingredient: ing, grams: item.grams };
      }

      // Caso 2: Formato incorrecto → item ES el ingrediente
      const ing = item instanceof IngredientClass
        ? item
        : new IngredientClass(
          item.id,
          item.name,
          item.calories,
          item.fiber,
          item.carbohydrates,
          item.fat,
          item.protein,
          item.imgUrl
        );

      return { ingredient: ing, grams: item.grams ?? 0 };
    });

    return new Dish(
      obj.id,
      obj.name,
      obj.imgUrl,
      ingredientsWithGrams,
      obj.vegetarian,
      obj.vegan,
      obj.gluten_free
    );
  }

  getUrl() {
    return this.imgUrl;
  }

  setUrl(url) {
    this.imgUrl = url;
  }

  addIngredient(ingredientWithGrams) {
    this.ingredients.push(ingredientWithGrams);
  }

  getTotalCalories() {
    if (!Array.isArray(this.ingredients) || this.ingredients.length === 0) {
      return this.calories || 0;
    }
    const fromIngredients = this.ingredients.reduce((total, item) => {
      if (!item || !item.ingredient) return total;
      const cal = item.ingredient.calories || 0;
      const g = item.grams || 0;
      return total + (cal * g) / 100;
    }, 0);
    // Si los ingredientes no aportan datos (grams todos 0), usar calorías directas
    return fromIngredients > 0 ? fromIngredients : (this.calories || 0);
  }
}

