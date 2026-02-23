import Ingredient from './Ingredient';

export default class Dish {

  constructor(id, name, imgUrl, ingredientsWithGrams, vegetarian, vegan, gluten_free, calories = 0, fiber = 0, carbs = 0, fat = 0, protein = 0) {
    this.id = id;
    this.name = name;
    this.imgUrl = imgUrl;
    this.ingredients = ingredientsWithGrams; // ← SIEMPRE este formato
    this.vegetarian = vegetarian;
    this.vegan = vegan;
    this.gluten_free = gluten_free;
    this.calories = calories; // Calorías totales del plato (fallback cuando no hay ingredientes)
    this.fiber = fiber;
    this.carbs = carbs;
    this.fat = fat;
    this.protein = protein;
  }

  getIngredientsWithGrams() {
    return this.ingredients;
  }

  getAllIngredients() {
    if (!this.ingredients || !Array.isArray(this.ingredients)) {
      return [];
    }
    return this.ingredients
      .filter(i => i && i.ingredient)
      .map(i => i.ingredient);
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
    obj.gluten_free,
    obj.calories || obj.kcal || 0,
    obj.fiber || 0,
    obj.carbs || obj.carbohydrates || 0,
    obj.fat || 0,
    obj.protein || 0
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
    // Si hay ingredientes con datos, calcular desde ellos
    if (this.ingredients && Array.isArray(this.ingredients) && this.ingredients.length > 0) {
      const calculatedCalories = this.ingredients.reduce((total, item) => {
        if (!item || !item.ingredient) return total;
        const { calories = 0 } = item.ingredient;
        const { grams = 0 } = item;
        return total + ((calories * grams) / 100);
      }, 0);
      // Si el cálculo da un resultado > 0, usarlo
      if (calculatedCalories > 0) return calculatedCalories;
    }
    
    // Si no hay ingredientes o el cálculo da 0, usar las calorías del constructor
    return this.calories || 0;
  }
}

