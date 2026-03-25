export default class Ingredient {

    constructor(id, name, calories, fiber, carbohydrates, fat, protein, imgUrl) {
        this.id = id;
        this.name = name;
        this.calories = calories;
        this.fiber = fiber;
        this.carbohydrates = carbohydrates;
        this.fat = fat;
        this.protein = protein;
        this.imgUrl = imgUrl;
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
        return new Ingredient(
            obj.id,
            obj.name,
            obj.calories,
            obj.fiber,
            obj.carbohydrates,
            obj.fat,
            obj.protein,
            obj.imgUrl
        );
    }

}