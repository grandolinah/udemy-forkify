import axios from 'axios';
// get recipe by id
//`https://forkify-api.herokuapp.com/api/get?rId=${id}`
// get recipe by query
//`https://forkify-api.herokuapp.com/api/search?q=${query}`

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.image = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (err) {
      alert('Something went wrong.');
    }
  }

  calcTime() {
    // every 3 ingerdients takes 15 min
    const numIng = this.ingredients.length;
    const periods = Math.ceil(numIng * 3);
    this.time = periods * 15;
  }

  calcServings() {
    this.servings = 4;
  }

  parseIngredients() {
    const unitLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
    const unitShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];

    const newIngredients = this.ingredients.map(el => {
      // uniform units
      let ingredient = el.toLowerCase();

      unitLong.forEach((unit, i) => {

        ingredient = ingredient.replace(unit, unitShort[i]);
      });

      // remove parentheses
      ingredient = ingredient.replace(/ (\(.*?\)) /, ' ');

      // parse ingrediants into count, unit and ingredient
      const arrIng = ingredient.split(' ');
      const unitIndex = arrIng.findIndex(el2 => unitShort.includes(el2));
      let objIng = {}

      if (unitIndex > -1) {
        // there is a unit
        const arrCount = arrIng.slice(0, unitIndex);
        let count;

        if (arrCount.lenght === 1) {
          count = eval(arrIng[0].replace('-', '+'));
        } else {
          // ex  [4, 1/2] --> eval('4+1/2') --> 4.5

          count = eval(arrIng.slice(0, unitIndex).join('+'));
        }

        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(' ')
        }
      } else if (+arrIng[0]) {
        // there is no unit but the first element is a number
        objIng = {
          count: +arrIng[0],
          unit: '',
          ingredient: arrIng.slice(1).join(' ')
        }
      } else if (unitIndex === -1) {
        // there is no unit
        objIng = {
          count: 1,
          unit: '',
          ingredient
        }
      }

      console.log(objIng)

      return ingredient;
    });

    this.ingredients = newIngredients;
  }
}
