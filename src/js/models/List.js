import uniqid from 'uniqid';

export default class List {
    constructor() {
        this.items = [];
    }

    addItem(count, unit, ingredient) {
        const item = {
            id: uniqid(),
            count,
            unit,
            ingredient
        }
        this.items.push(item);
        return item;
    }
    
    deleteItem(id) {
        const index = this.items.findIndex(el => el.id === id)
        // [2, 4, 6] - SPLICE(1,1) - return 4 - and mutates array, CUTS -> [2, 6] -- (2ND arg is to how many elements we cut)
        // [2, 4, 6] - SLICE(1,1) - return 4 - DOES NOT mutates array, COPIES -> [2, 4, 6] -- (2nd is to specify the end of the array part to copy /not inluded/)
        this.items.splice(index, 1);
    }

    updateCount(id, newCount) {
        this.items.find(el => el.id === id).count = newCount;
    }
}