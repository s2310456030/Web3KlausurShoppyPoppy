export default class User {
    #username;
    #userid;
    #userStatus;
    #lists;

    constructor(username, userid, userStatus = 0) {
        // Benutzername, ID und Status (z.B. Admin, aktiv, etc.)
        this.#userid = userid;
        this.#userStatus = userStatus;
        this.#username = username;
        this.#lists = [];
    }

    // Fügt eine Liste dem Benutzer hinzu
    addList(list) {
        this.#lists.push(list);
    }

    // Entfernt eine Liste anhand ihrer ID
    removeList(listId) {
        this.#lists = this.#lists.filter(list => list.id !== listId);
    }
}
