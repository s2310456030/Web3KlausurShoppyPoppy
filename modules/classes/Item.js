import Article from "./Article.js";

export default class Item extends Article {
    tags;
    completed;
    count;
    static id_counter = 0;

    constructor(name, symbol, count, completed = false, tags) {
        super(name, symbol, tags);
        this.count = count;         // Anzahl des Items in der Liste
        this.completed = completed; // Abgehakt?
    }

    // Erbt und überschreibt setter, falls notwendig
    setName(name){
        super.setName(name);
        this.name = name;
    }

    getName() {
        return super.getName();
    }

    getCount(){
        return this.count;
    }

    setCount(count){
        this.count = count;
    }

    getSymbol(){
        return super.getSymbol();
    }

    isCompleted() {
        return this.completed;
    }

    setCompleted(status) {
        this.completed = status;
    }

    getTags() {
        return super.getTags();
    }
}
