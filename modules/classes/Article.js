export default class Article {
    id;
    name;
    tags;
    static id_counter = 0;

    constructor(name, symbol, tags) {
        // Einzigartige ID generieren
        this.id = Article.id_counter++;
        this.name = name;
        this.symbol = symbol;
        this.tags = tags;
    }

    setName(name){
        this.name = name;
    }

    getName() {
        return this.name;
    }

    getSymbol() {
        return this.symbol;
    }

    // Überschreibt das erste Tag
    setTag(newTag) {
        console.log(`🛠 Artikel: Tag geändert auf "${newTag}"`);
        this.tags[0] = newTag;
    }

    // Fügt ein weiteres Tag hinzu
    addTag(tag) {
        this.tags.push(tag);
    }

    // Entfernt ein Tag anhand des Namens
    removeTag(tagName) {
        this.tags = this.tags.filter(tag => tag.tagname !== tagName);
    }

    getTags() {
        return this.tags;
    }
}
