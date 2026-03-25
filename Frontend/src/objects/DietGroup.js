export default class DietGroup {
  constructor(id, name, recipes, canEdit) {
    this.id = id;
    this.name = name;
    this.recipes = recipes;
    this.canEdit = canEdit || false;
  }
}