import axios from 'axios';
// get recipe by id
//`https://forkify-api.herokuapp.com/api/get?rId=${id}`
// get recipe by query
//`https://forkify-api.herokuapp.com/api/search?q=${query}`

export default class Search {
  constructor(query) {
    this.query = query;
  }

  async getResults() {
    // fetch is not fully supported thats why we use axious
    try {
      const res = await axios(`https://forkify-api.herokuapp.com/api/search?q=${this.query}`);
      this.result = res.data.recipes;
    } catch (err) {
      alert(err);
    }
  }
}
