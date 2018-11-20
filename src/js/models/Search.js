import axios from 'axios';
import { key, proxy } from '../config';

export default class Search {
    constructor(query) {
        this.query = query;
    }
    async getResult() {
        
        try {
            const res = await axios(`${proxy}https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
            this.result = res.data.recipes;
            // console.log(this.result);
        } catch(error) {
            alert(error);
        }
    }
}

// URL search: https://www.food2fork.com/api/search
// API key: a2c409e7e1d5199197e6895973ad24e2