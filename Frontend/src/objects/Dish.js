import Ingredient from './Ingredient';

export default class Dish {

  constructor(id, name, imgUrl, ingredientsWithGrams, vegetarian, vegan, gluten_free) {
    this.id = id;
    this.name = name;
    this.imgUrl = imgUrl;
    this.ingredients = ingredientsWithGrams; // ← SIEMPRE este formato
    this.vegetarian = vegetarian;
    this.vegan = vegan;
    this.gluten_free = gluten_free;
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
            item.ingredient.imgUrl,
            item.ingredient.calories,
            item.ingredient.fiber,
            item.ingredient.carbohydrates,
            item.ingredient.fat,
            item.ingredient.protein
          );

      return { ingredient: ing, grams: item.grams };
    }

    // Caso 2: Formato incorrecto → item ES el ingrediente
    const ing = item instanceof IngredientClass
      ? item
      : new IngredientClass(
          item.id,
          item.name,
          item.imgUrl,
          item.calories,
          item.fiber,
          item.carbohydrates,
          item.fat,
          item.protein
        );

    return { ingredient: ing, grams: item.grams ?? 0 };
  });

  return new Dish(
    obj.id,
    obj.name,
    obj.imgUrl,
    ingredientsWithGrams,
    obj.calories,
    obj.fiber,
    obj.carbohydrates,
    obj.protein,
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

}

