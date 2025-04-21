// Importiere Klassen für Datenobjekte und das Observer-Subject
import Listing from "../classes/List.js";
import Item from "../classes/Item.js";
import Article from "../classes/Article.js";
import Tag from "../classes/Tag.js";
import Subject from "./subject.js";

// Das Datenmodell der App: verwaltet Listen, Artikel, Items und Tags
export class PoppyModel extends Subject {
    constructor() {
        super();
        this.lists = [];      // Alle Einkaufslisten
        this.articles = [];   // Alle Artikel
        this.items = [];      // Alle Listeneinträge (Items)
        this.tags = [];       // Alle Tags
        this.users = [];      // (Reserviert für zukünftige Nutzer)
    }

    /**
     * Lädt die Datenstruktur aus einer externen JSON-Datei.
     */
    async loadFromJson() {
        try {
            const response = await fetch("./modules/mvc/lists.json");
            if (!response.ok) {
                throw new Error(`HTTP-Fehler: ${response.status}`);
            }

            const data = await response.json();

            // Leere Datenarrays vor dem Befüllen
            this.lists = [];
            this.articles = [];
            this.items = [];
            this.tags = [];

            // Artikel erzeugen
            for (let art of data.articles) {
                let article = new Article(art.name, art.symbol, art.tags || []);
                this.articles.push(article);
            }

            // Tags erzeugen
            for (let t of data.tags) {
                let tag = new Tag(t.tagname);
                this.tags.push(tag);
            }

            // Listen erzeugen und Items verknüpfen
            for (let l of data.lists) {
                let list = new Listing(l.name);
                list.items = [];

                if (l.items && Array.isArray(l.items)) {
                    for (let i of l.items) {
                        // Artikelreferenz aus Artikelliste holen
                        let article = this.articles.find(a => a.name === i.name);
                        if (!article) {
                            console.warn(`Artikel "${i.name}" nicht in articles gefunden!`);
                            continue;
                        }

                        // Neues Item aus Artikeldaten erstellen
                        let item = new Item(
                            article.name,
                            article.symbol,
                            i.count,
                            i.completed || false,
                            article.getTags()
                        );

                        list.addItem(item);
                        this.items.push(item);
                    }
                } else {
                    console.warn(`Keine Items für Liste "${l.name}" gefunden oder nicht als Array definiert.`);
                }

                this.lists.push(list);
            }

        } catch (err) {
            console.error("Fehler beim Laden der Listen und Artikel:", err);
        }

        // Observer informieren
        this.notify("dataLoaded", { lists: this.lists, articles: this.articles });
    }

    /**
     * Entfernt ein Item aus einer bestimmten Liste.
     */
    removeArticle(list, item) {
        list.removeItem(item.name);
    }

    /**
     * Füllt das Dropdown für die Artikeltags mit Standardwerten.
     */
    populateTagSelect() {
        let tagSelect = document.getElementById("itemTags");
        tagSelect.innerHTML = "";

        let existingTags = ["Lebensmittel", "Getränke", "Hygiene", "Obst", "Gemüse"];

        existingTags.forEach(tag => {
            let option = document.createElement("option");
            option.value = tag;
            option.textContent = tag;
            tagSelect.appendChild(option);
        });
    }

    /**
     * Gibt Artikel zurück, die mit einem bestimmten Tag verknüpft sind.
     */
    getItemForTag(tag) {
        if (!tag || tag === "all") {
            return this.articles;
        }

        return this.articles.filter(article =>
            article.tags && article.tags.includes(tag)
        );
    }

    /**
     * Ändert den Namen eines Artikels.
     */
    changeArticleName(item, newArticleName) {
        item.setName(newArticleName);
    }

    /**
     * Holt ein neues Item basierend auf Auswahl im Modal und fügt es zur Liste hinzu.
     */
    getNewItemData(list) {
        const articleName = document.getElementById("existingArticleSelect")?.value?.trim();
        const count = parseInt(document.getElementById("existingItemCount")?.value, 10);

        if (!articleName || isNaN(count) || count < 1) {
            return null;
        }

        const existingArticle = this.articles.find(article => article.getName() === articleName);
        if (!existingArticle) {
            console.warn("Artikel nicht gefunden:", articleName);
            return null;
        }

        const existingItem = list.getItems().find(item => item.getName() === articleName);
        if (existingItem) {
            alert(`Der Artikel "${articleName}" existiert bereits in der Liste.`);
            return null;
        }

        const newItem = new Item(
            existingArticle.getName(),
            existingArticle.getSymbol(),
            count,
            false,
            existingArticle.getTags()
        );

        list.addItem(newItem);
        list.openList();

        return newItem;
    }

    /**
     * Erstellt ein neues Article-Objekt aus dem Modal-Formular.
     */
    getNewArticleData() {
        this.populateTagSelect(this.tags);

        let articleName = document.getElementById("itemName").value.trim();
        let articleSymbol = document.getElementById("itemSymbol").value.trim();
        let articleTag = document.getElementById("itemTags").value.trim();

        if (!articleName) {
            alert("⚠️ Der Artikelname darf nicht leer sein!");
            return null;
        }

        if (!articleSymbol) {
            articleSymbol = "📦";
        }

        let newArticle = new Article(articleName, articleSymbol, articleTag);
        this.articles.push(newArticle);

        return newArticle;
    }
    /**
     * Setzt den neuen Namen eines Tags und passt Artikel entsprechend an.
     */
    setTagName(tag, newTagName, oldTagName) {
        newTagName = newTagName.trim();

        if (!tag || newTagName === "") {
            console.error("Fehler: Ungültiger Tag oder leerer neuer Name.");
            return;
        }

        tag.tagname = newTagName;

        this.articles.forEach(article => {
            let articleTagName = article.tags[0];
            if (articleTagName === oldTagName) {
                article.setTag(newTagName);
            }
        });
    }

    /**
     * Entfernt einen Tag, wenn er nicht in Benutzung ist.
     */
    removeTag(tag) {
        const isTagUsed = this.articles.some(article => article.tags[0] === tag.tagname);
        if (isTagUsed) {
            return false;
        }

        this.tags = this.tags.filter(t => t !== tag);
        return true;
    }

    /**
     * Löscht einen Artikel, sofern er nicht in einer Liste verwendet wird.
     */
    deleteArticle(item) {
        if (!item) {
            console.error("Fehler: Ungültiger Artikel.");
            return;
        }

        const isUsed = this.lists.some(list =>
            list.getItems().some(listItem => listItem.getName() === item.getName())
        );

        if (isUsed) {
            alert("⚠️ Artikel kann nicht gelöscht werden, da er in einer Liste verwendet wird.");
            return;
        }

        const index = this.articles.findIndex(article => article.getName() === item.getName());
        if (index !== -1) {
            this.articles.splice(index, 1);
            this.notify("articleDeleted", item);
        } else {
            console.warn("Artikel nicht gefunden.");
        }
    }

    /**
     * Fügt einen neuen Tag der Liste hinzu.
     */
    addTag(tagname) {
        let newTag = new Tag(`${tagname}`);
        this.tags.push(newTag);
    }

    /**
     * Fügt eine neue Liste hinzu und informiert die Observer.
     */
    addList(name) {
        const newList = new Listing(name);
        this.lists.push(newList);
        this.notify("listAdded", newList);
    }
}
