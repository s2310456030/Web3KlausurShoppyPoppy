export default class Listing {
    #id;
    #name;
    completed;
    items;
    users;
    static id_counter = 1;

    constructor(name) {
        this.#id = Listing.id_counter++;
        this.#name = name;
        this.items = [];
        this.completed = false;
        this.users = [];
    }

    // Fügt ein Item hinzu
    addItem(item) {
        this.items.push(item);
    }

    // Setzt den Namen der Liste
    setListName(name){
        this.#name = name;
    }

    // Entfernt ein Item anhand des Namens
    removeItem(itemName) {
        this.items = this.items.filter(item => item.getName() !== itemName);
    }

    // Markiert die Liste als abgeschlossen
    completeList() {
        this.completed = true;
    }

    // Prüft, ob alle Items abgehakt sind
    isCompleted(){
        for (let i = 0; i < this.items.length; i++){
            if (!this.items[i].completed){
                return false;
            }
        }
        return true;
    }

    // Öffnet (reaktiviert) eine Liste
    openList() {
        this.completed = false;
    }

    // Gibt alle Items zurück
    getItems() {
        return this.items;
    }

    // Gibt den Listennamen zurück
    getName (){
        return this.#name;
    }
}
