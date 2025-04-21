// Importiere die View-Komponenten und das Datenmodell
import { ListView } from "./listview.js";
import { ArticleView } from "./articleview.js";
import { TagView } from "./tagview.js";
import { PoppyModel } from "./model.js";

// Hauptcontroller der Anwendung (Controller im MVC-Muster)
class PoppyListController {
    constructor() {
        // Initialisiere das Model und die Views
        this.model = new PoppyModel();
        this.listView = new ListView();
        this.articleView = new ArticleView();
        this.tagView = new TagView();

        // Registriere alle Views als Observer beim Model
        this.model.addObserver(this.listView);
        this.model.addObserver(this.articleView);
        this.model.addObserver(this.tagView);
    }

    // Initialisierung der App nach dem Laden
    async init() {
        await this.model.loadFromJson(); // Daten laden
        this.updateListsView(); // Listenansicht rendern
        this.listView.renderEmptyListDetails(); // Rechte Seite leer
        this.setActiveTab("listtab"); // Standard-Tab aktivieren
        this.setupNavigation(); // Event-Handler setzen
    }

    // Navigationselemente mit Klickverhalten versehen
    setupNavigation() {
        document.querySelector(".listtab")?.addEventListener("click", () => this.openListTab());
        document.querySelector(".itemtab")?.addEventListener("click", () => this.openItemTab());
        document.querySelector(".tagstab")?.addEventListener("click", () => this.openTagTab());
        document.querySelector(".usertab")?.addEventListener("click", () => alert("🔒 Bereich nicht verfügbar"));
        document.querySelector(".bi-person-circle")?.addEventListener("click", () => alert("🔒 Noch nicht implementiert"));
        document.getElementById("createList")?.addEventListener("click", () => this.createList());
    }

    // Setzt die aktive Registerkarte (Tab visuell markieren)
    setActiveTab(tabClassName) {
        document.querySelectorAll(".nav-link").forEach(el => el.classList.remove("active"));
        document.querySelector(`.${tabClassName}`)?.classList.add("active");
    }

    // Blendeffekt für flüssige Ansicht beim Umschalten
    applyFadeTransition() {
        const targets = [document.getElementById("lists-overview"), document.getElementById("list-detail")];
        targets.forEach(el => {
            if (!el) return;
            el.classList.remove("show");
            el.classList.add("fade-transition");
            setTimeout(() => el.classList.add("show"), 350);
        });
    }

    // Öffnet die Listenansicht
    openListTab() {
        this.setActiveTab("listtab");
        this.applyFadeTransition();
        this.updateListsView();
        this.listView.renderEmptyListDetails();
    }

    // Öffnet die Artikelansicht
    openItemTab() {
        this.setActiveTab("itemtab");
        this.applyFadeTransition();
        this.updateItemView();
    }

    // Öffnet die Tagansicht
    openTagTab() {
        this.setActiveTab("tagstab");
        this.applyFadeTransition();
        this.tagView.renderTagMenu();
        this.tagView.renderTags(this.model.tags);
    }

    // Aktualisiert die Liste in der Ansicht
    updateListsView() {
        this.listView.renderLists(this.model.lists);
        const header = document.getElementById("mainSectHeader");
        if (header) header.textContent = "Aktuelle Liste";
    }

    // Aktualisiert die Artikelliste
    updateItemView() {
        this.articleView.renderArticles(this.model.articles);
        this.articleView.renderArticleMenu?.();
    }

    // Neue Liste aus dem Modal erstellen
    createList() {
        const input = document.getElementById("listNameInput");
        const name = input?.value.trim();
        if (!name) {
            alert("Bitte Namen eingeben!");
            return;
        }

        this.model.addList(name);
        input.value = "";
        this.updateListsView();

        const modalEl = document.getElementById("addListsModal");
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
    }

    // Artikel löschen
    deleteArticle(article, articleList) {
        this.model.deleteArticle(article);
        this.articleView.renderArticles(articleList);
    }

    // Artikel umbenennen
    changeArticleName(article, newName, articleList) {
        this.model.changeArticleName(article, newName);
        this.articleView.renderArticles(articleList);
    }
    // Tag umbenennen
    changeTagName(tag, newName, oldName) {
        this.model.setTagName(tag, newName, oldName);
        this.tagView.renderTags(this.model.tags);
    }

    // Artikel nach Tag filtern
    filterBy(tagName) {
        const filtered = this.model.getItemForTag(tagName);
        this.articleView.renderArticles(filtered);
    }

    // Modal zum Erstellen eines neuen Artikels
    addArticleToModel() {
        this.model.populateTagSelect();
        let btn = document.getElementById("confirmAddItem");
        if (!btn) return;

        btn.replaceWith(btn.cloneNode(true));
        const newBtn = document.getElementById("confirmAddItem");

        newBtn.addEventListener("click", () => {
            const newArticle = this.model.getNewArticleData();
            if (newArticle) {
                this.articleView.renderArticles(this.model.articles);

                const modalEl = document.getElementById("addItemModal");
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) modalInstance.hide();
            }
        });
    }

    // Sucht einen Artikel in der globalen Artikelliste
    findArticle(list, item) {
        const articleName = item.getName();
        const article = this.model.articles.find(article => article.getName() === articleName);
        if (!article) {
            console.warn(`Artikel "${articleName}" nicht in der globalen Artikelliste gefunden!`);
            return { getSymbol: () => "❓" };
        }
        return article;
    }

    // Neuen Tag hinzufügen
    addTag(nameOfNewTag) {
        this.model.addTag(nameOfNewTag);
        this.tagView.renderTags(this.model.tags);
    }

    // Tag löschen (nur wenn nicht verwendet)
    deleteTag(tag) {
        if (!tag) return;
        const success = this.model.removeTag(tag);
        if (!success) {
            alert(`⚠️ Der Tag "${tag.tagname}" wird noch verwendet und kann nicht gelöscht werden.`);
            return;
        }
        this.tagView.renderTags(this.model.tags);
    }

    // Artikel aus Liste entfernen
    removeArticleFromList(list, item) {
        this.model.removeArticle(list, item);
        this.updateListsView();
        this.listView.renderListDetails(list);
    }

    // Event-Listener für Löschen-Buttons neu setzen
    addDeleteEventListeners(list) {
        document.querySelectorAll(".deleteBtn").forEach((deleteBtn, index) => {
            deleteBtn.replaceWith(deleteBtn.cloneNode(true));
            const freshBtn = document.querySelectorAll(".deleteBtn")[index];

            freshBtn.addEventListener("click", async () => {
                const confirmDelete = confirm("Willst du dieses Item wirklich löschen?");
                if (!confirmDelete) return;

                const itemToDelete = list.getItems()[index];
                this.removeArticleFromList(list, itemToDelete);
                this.listView.renderListDetails(list);

                setTimeout(() => this.addDeleteEventListeners(list), 100);
            });
        });
    }

    // Simuliert einen Klick auf eine Liste (z. B. nach Änderungen)
    simulateClickOnList(list) {
        setTimeout(() => {
            const listElements = document.querySelectorAll(".list");
            const target = [...listElements].find(el => el.textContent.trim().includes(list.getName()));
            target?.click();
        }, 100);
    }

    // Zeigt Modal zum Artikel-Hinzufügen für eine Liste
    addItemToList(list) {
        this.listView.renderAddExistingItemModal(list, this.model.articles);

        const confirmBtn = document.getElementById("confirmAddItem");
        if (!confirmBtn) return;

        confirmBtn.replaceWith(confirmBtn.cloneNode(true));
        const newConfirmBtn = document.getElementById("confirmAddItem");

        newConfirmBtn.addEventListener("click", () => {
            const newItem = this.model.getNewItemData(list);
            if (newItem) {
                this.updateListsView();
                this.simulateClickOnList(list);
            } else {
                console.warn("Kein gültiger Artikel zur Liste hinzugefügt.");
            }
        });
    }

    // Fügt bestehenden Artikel ohne Modal zur Liste hinzu
    addExistingItemToList(list) {
        const newItem = this.model.getNewItemData(list);
        if (newItem) {
            this.updateListsView();
            this.simulateClickOnList(list);
        } else {
            console.warn("⚠️ Kein gültiger Artikel wurde hinzugefügt.");
        }
    }

    // Liste als abgeschlossen markieren
    closeList(list) {
        list.completeList();
        this.updateListsView();
        this.simulateClickOnList(list);
    }

    // Liste bearbeiten (Name ändern)
    editList(list) {
        this.listView.renderListEditing();

        const editBtn = document.getElementById("editBtn");
        const editingInput = document.getElementById("editingInput");
        editBtn.textContent = "Name ändern";
        if (!editBtn || !editingInput) {
            console.error("Bearbeiten-Modal ist unvollständig.");
            return;
        }

        editBtn.onclick = () => {
            const newVal = editingInput.value.trim();
            if (newVal === "") {
                alert("Bitte neuen Namen eingeben!");
                return;
            }

            list.setListName(newVal);
            this.updateListsView();
            this.simulateClickOnList(list);
        };
    }
}

// Instanz des Controllers exportieren
export const listController = new PoppyListController();
