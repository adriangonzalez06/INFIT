export default class Ingredient {

    constructor(id, name, imgUrl, calories, fiber, carbohydrates, fat, protein) {
        this.id = id;
        this.name = name;
        this.imgUrl = imgUrl;
        this.calories = calories;
        this.fiber = fiber;
        this.carbohydrates = carbohydrates;
        this.fat = fat;
        this.protein = protein;
        this.defaultGrams = 100;
        this.grams = this.defaultGrams;

    }

    getName() {
        return this.name;
    }


    // Reconstruye una instancia de Ingredient desde un objeto plano (p.ej. desde JSON / route params)
    static from(obj) {
        if (!obj) return null;
        if (obj instanceof Ingredient) return obj;
        return new Dish(
            obj.id,
            obj.name,
            obj.imgUrl,
            obj.calories,
            obj.fiber,
            obj.carbohydrates,
            obj.calories,
            obj.fat,
            obj.protein,
        );
    }

}