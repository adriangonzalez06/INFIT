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

  // Agregar plato a un día específico
  addDishToDay(dayIndex, dish) {
    if (dayIndex < 0 || dayIndex > 6) {
      throw new Error('El índice del día debe estar entre 0 y 6');
    }
    this.weeklyDishes[dayIndex].push(dish);
  }

  // Agregar plato a un día por nombre
  addDishToDayName(dayName, dish) {
    const dayIndex = DAYS_OF_WEEK.findIndex(day => day.toLowerCase() === dayName.toLowerCase());
    if (dayIndex === -1) {
      throw new Error(`Día no válido: ${dayName}`);
    }
    this.weeklyDishes[dayIndex].push(dish);
  }

}