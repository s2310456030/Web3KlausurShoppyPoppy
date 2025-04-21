// Die Subject-Klasse stellt das Subjekt im Observer-Pattern dar.
// Sie verwaltet eine Liste von Beobachtern, die über Änderungen benachrichtigt werden.
export default class Subject {
    constructor() {
        // Array, in dem alle registrierten Beobachter gespeichert werden
        this.observers = [];
    }

    /**
     * Fügt einen Observer zur Liste hinzu.
     * Der Observer muss eine update()-Methode besitzen.
     */
    addObserver(observer) {
        this.observers.push(observer);
    }

    /**
     * Entfernt einen Observer aus der Liste.
     */
    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    /**
     * Benachrichtigt alle registrierten Observer über ein Ereignis.
     * Übergibt dabei den Ereignistyp und beliebige Daten.
     */
    notify(eventType, data) {
        console.log(`Notification: "${eventType}" mit Daten:`, data);

        this.observers.forEach(observer => {
            // Nur Observer mit update()-Methode verarbeiten
            if (typeof observer.update === "function") {
                observer.update(eventType, data);
            } else {
                console.error("Fehler: Observer ohne update-Methode gefunden:", observer);
            }
        });
    }
}
