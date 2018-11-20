import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app 
 * - Search obj 
 * - Current recipe obj
 * - Shopping list obj
 * - liked recipes
 */
const state = {};



/** 
 * //////// Search controller /////////
*/
const controlSearch = async () => {

    // 1. get query from view
    const query = searchView.getInput();

    if (query) {
        // 2. New search obj creation and save it in state
        state.search = new Search(query);

        // 3. Prepare UI for result
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchParent);

        // 4. Search for recipe
        try {
            await state.search.getResult();

            // 5. render results
            clearLoader(); 
            searchView.renderResults(state.search.result);  

        } catch(error) {
            alert('Error occured during search request :(');
            clearLoader();
        }
        
    }
}

elements.searchForm.addEventListener("submit", e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener("click", e => {
    const btn = e.target.closest('.btn-inline')

    if (btn) {
        const goToPage = parseInt(btn.dataset.goto);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});



/** 
 * //////// Recipe controller /////////
*/
// getting ID from URL
const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');

    if (id) {
        // prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // highlight selected list-recipe
        if (state.search) searchView.highlightSelected(id);

        // create new Recipe Obj
        state.recipe = new Recipe(id);

        try {
            // get Recipe data and parse ingredients
            await state.recipe.getRecipe();
    
            state.recipe.parseIngredients();

            // calc service and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // render Recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
                );
        } catch(error) {
            alert('Error processing recipe :(');
        }  
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));



/**
 * /////////// List Controller callback /////////////
 */
const controlList = () => {

    // Create a list if there is none yet
    if(!state.list) {
        state.list = new List;
    } else {
        // clear shopping list UI
        state.list.items;
        listView.clearList();
        state.list = new List;
    }
    // add each ingredients to the list and to UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    })
};



// handling DELETE & update list
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // handle delete from model & UI 
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // delete from state
        state.list.deleteItem(id);

        // delete from UI
        listView.deleteItem(id);

        // handle update
    } else if (e.target.matches('.shopping__count-value')) {
        
        if (e.target.value > 0) {
            const val = parseFloat(e.target.value, 10);
            state.list.updateCount(id, val);
        }  
    }   
});



/**
 * //////////// LIKE controller //////////////
 */
// TESTING




const controlLikes = () => {
    if (!state.likes) state.likes = new Likes();
    const currentId = state.recipe.id;
    
    // current recipe NOT liked
    if (!state.likes.isLiked(currentId)){

        // add like to state
        const newLike = state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img,   
        );
        // toggle heart
        likesView.toggleLikeBtn(true);
        // add to UI
        likesView.renderLike(newLike);

    // current recipe liked
    } else {

        // remove like from state
        state.likes.deleteLike(currentId);
        // toggle heart
        likesView.toggleLikeBtn(false);
        // remove from UI
        likesView.deleteLike(currentId);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Retore liked recipes when page reloads
window.addEventListener('load', () => {
    state.likes = new Likes();
    // read from local storage
    state.likes.readStorage();
    //toggle button
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    // render / RELOAD existing likeS
    state.likes.likes.forEach(el => likesView.renderLike(el));

});


// handling recipe 'INCRESE' / 'DECREASE' button clicks
elements.recipe.addEventListener("click", e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')){
        // decrease servings
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')){
        // increase servings
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);

    // ADD RECIPE TO SHOPPING LIST    
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        controlList();

    // Add LIKES EVENT HANDLER
    } else if (e.target.matches('.recipe__love, .recipe__love *')){
        
        // like controller
        controlLikes();
    }
});



