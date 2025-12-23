export default class Dish {


  constructor(id, name, imgUrl, ingredientsWithGrams, calories, fiber, carbohydrates, protein, vegetarian, vegan, gluten_free) {
    this.id = id;
    this.name = name;
    this.imgUrl = imgUrl;
    this.ingredients = ingredientsWithGrams;
    this.calories = calories;
    this.fiber = fiber;
    this.carbohydrates = carbohydrates;
    this.protein = protein;
    this.vegetarian = vegetarian;
    this.vegan = vegan;
    this.gluten_free = gluten_free;
  }

getName() {
  return this.name;
}

//calcular los totales
getAllIngredients() {
  return this.ingredients;
}

  // Reconstruye una instancia de Dish desde un objeto plano (p.ej. desde JSON / route params)
static from(obj) {
  const IngredientClass = require('./Ingredient').default;

  const ingredientsWithGrams = (obj.ingredients || []).map(item => {
    // Caso 1: Formato correcto { ingredient: {...}, grams: X }
    if (item.ingredient) {
      const ing = item.ingredient instanceof IngredientClass
        ? item.ingredient
        : new IngredientClass(
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



}

