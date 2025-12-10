export default class RecipeGroup {
  constructor(id_group, name, recipes, canEdit) {
    this.id_group = id_group;
    this.name = name;
    this.recipes = recipes;
    this.canEdit = canEdit || false;
  }
}