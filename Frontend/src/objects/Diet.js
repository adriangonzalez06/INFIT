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
    // Si no hay instancia crea una instancia
    if (!obj) return new Diet();
    // Si ya es instancia
    if (obj instanceof Diet) return obj;
    const src = obj.diet ?? obj;
    // Asegurar weeklyDishes y convertir platos a instancias de Dish si vienen como objetos planos
    const weekly = (src.weeklyDishes || Array(7).fill(null).map(() => [])).map(day =>
      (day || []).map(d => require('./Dish').default.from ? require('./Dish').default.from(d) : d)
    );
    return new Diet(src.id, src.name, src.description, src.imgUrl, weekly);
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

}