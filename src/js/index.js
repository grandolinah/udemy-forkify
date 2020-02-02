import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, clearLoader, renderLoader } from './views/base';

/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};
window.state = state;


/** 
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
  // 1) Get query from view
  const query = searchView.getInput();

  if (query) {
    // 2) New search object and add to state
    state.search = new Search(query);

    // 3) Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try {
      // 4) Search for recipes
      await state.search.getResults();

      // 5) Render results on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (err) {
      alert('Something wrong with the search...');
      clearLoader();
    }
  }
}

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');

  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

/** 
 * RECIPE CONTROLLER
 */

const controlRecipe = async () => {
  // get ID from the url
  const id = window.location.hash.replace('#', '');

  if (id) {
    // prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    //highlight active recipe
    if (state.search) {
      searchView.highlightSelected(id);
    }

    // create new recipe object
    state.recipe = new Recipe(id);

    try {
      // get recipe data and parse ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // calculate serving and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      // render recipe
      clearLoader();
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
      );
    } catch (err) {
      console.log(err);
      alert('Error processing recipe.');
    }
  }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


/** 
 * LIST CONTROLLER
 */

const controlList = () => {
  // create a new list if there is none yet
  if (!state.list) state.list = new List();

  // add each ingredient to the list
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    console.log(state.list)
    listView.renderItem(item);
  });
};

// handle delete and update list item events
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  // handle the delete button
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    // delete from state
    state.list.deleteItem(id);

    // delete from UI
    listView.deleteItem(id);

    // handle the count update
  } else if (e.target.matches('.shopping__count-value')) {
    const val = +e.target.value;

    state.list.updateCount(id, val);
  }
});

/** 
 * LIKE CONTROLLER
 */

// testing
state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumLikes());

const controlLike = () => {
  if (!state.likes) state.likes = new Likes();

  const currentId = state.recipe.id;

  // User has not yet liked current recipe
  if (!state.likes.isLiked(currentId)) {
    // add like to the state
    const newLike = state.likes.addLike(
      currentId,
      state.recipe.title,
      state.recipe.author,
      state.recipe.image
    )
    // toggle the like button
    likesView.toggleLikeBtn(true);

    // add like to the UI list
    likesView.renderLike(newLike);

    // User has liked current recipe
  } else {

    // remove like to the state
    state.likes.deleteLike(currentId);

    // toggle the like button
    likesView.toggleLikeBtn(false);

    // remove like to the UI list
    likesView.deleteLike(currentId);
  }

  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// handling recipe button clicks
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    // decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    // increase button is clicked
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn--add, recipe__btn--add *')) {
    // add ingredients to the shopping list
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    // like controller
    controlLike();
  }
});
