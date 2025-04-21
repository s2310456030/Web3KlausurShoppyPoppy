// Importiere den zentralen Controller für die App
import { listController } from "./listController.js";

// View zur Anzeige und Verwaltung von Tags
export class TagView {
    constructor() {
        // Linker Container (Sidebar), wo das Tag-Menü angezeigt wird
        this.tagMenu = document.querySelector("#lists-overview");

        // Rechter Container (Detailbereich), wo alle Tags gerendert werden
        this.tagContainer = document.querySelector("#list-detail");

        // Interne Liste der Tags
        this.tags = [];
    }

    /**
     * Observer-Methode: Wird aufgerufen, wenn sich im Modell etwas ändert.
     * Reagiert auf bestimmte Eventtypen vom Model.
     */
    update(eventType, data) {
        if (eventType === "dataLoaded") {
            // Initiale Daten vom Model laden
            this.tags = data.tags || [];
            this.renderTags(this.tags);
        } else if (eventType === "tagAdded") {
            // Neuer Tag wurde hinzugefügt
            this.tags.push(data);
            this.renderTags(this.tags);
        } else if (eventType === "tagDeleted") {
            // Ein Tag wurde entfernt
            this.tags = this.tags.filter(tag => tag.tagname !== data.tagname);
            this.renderTags(this.tags);
        }
    }

    /**
     * Rendert das Menü auf der linken Seite mit einem Eingabefeld
     * zur Erstellung neuer Tags.
     */
    renderTagMenu() {
        if (!this.tagMenu) {
            console.error("❌ Tag-Sidebar (lists-overview) nicht gefunden.");
            return;
        }

        // HTML-Struktur für das Tag-Menü setzen
        this.tagMenu.innerHTML = `
            <div class="article-menu">
                <h2>Tag-Übersicht</h2>
                <input type="text" class="form-control mb-2" placeholder="Neuer Tag-Name" id="tagCreationName">
                <button id="addTagBtn" class="btn btn-success w-100">Neuen Tag anlegen</button>
            </div>
        `;

        // Event: Wenn der Button geklickt wird, neuen Tag über Controller hinzufügen
        const addTagBtn = document.getElementById("addTagBtn");
        addTagBtn.addEventListener("click", () => {
            const name = document.getElementById("tagCreationName").value.trim();
            if (name === "") {
                alert("⚠️ Bitte einen Namen für den Tag eingeben!");
                return;
            }
            listController.addTag(name);
        });
    }

    /**
     * Zeigt alle vorhandenen Tags als Liste an.
     * Jeder Tag kann umbenannt oder gelöscht werden.
     */
    renderTags(tags) {
        if (!Array.isArray(tags)) {
            console.error("❌ Fehler: 'tags' ist kein Array:", tags);
            return;
        }

        if (!this.tagContainer) {
            console.error("❌ Tag-Container (list-detail) nicht vorhanden.");
            return;
        }

        // Überschrift setzen
        const header = document.getElementById("mainSectHeader");
        if (header) header.textContent = "Alle Tags";

        // Detailbereich leeren
        this.tagContainer.innerHTML = "";

        if (tags.length === 0) {
            // Hinweis, wenn keine Tags existieren
            this.tagContainer.innerHTML = "<p class='text-muted'>Keine Tags vorhanden</p>";
            return;
        }

        // UL-Element zum Auflisten der Tags erstellen
        const tagList = document.createElement("ul");
        tagList.classList.add("list-group");

        // Jeden Tag als Listenelement mit Edit- und Delete-Funktion anzeigen
        tags.forEach((tag, index) => {
            const tagName = tag.tagname;

            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

            // Tag-Name als Inputfeld + Delete-Button
            listItem.innerHTML = `
                <div>
                    <label for="tagInput${index}">Bezeichnung:</label>   
                    <input type="text" class="form-control tag-name-edit" id="tagInput${index}" value="${tagName}" placeholder="${tagName}">
                </div>
                <div>
                    <i class="bi bi-trash3 btn btn-danger delete-tag" data-id="${index}"></i>
                </div>
            `;

            tagList.appendChild(listItem);
        });

        // Tagliste dem Container anhängen
        this.tagContainer.appendChild(tagList);

        // Umbenennungs-Events für jedes Inputfeld
        document.querySelectorAll(".tag-name-edit").forEach((input, index) => {
            input.addEventListener("change", event => {
                const newName = event.target.value.trim();
                const oldName = event.target.placeholder.trim();

                if (newName === "") {
                    alert("⚠️ Der Tag-Name darf nicht leer sein!");
                    return;
                }

                // Name über den Controller ändern
                listController.changeTagName(tags[index], newName, oldName);
            });
        });

        // Löschen-Events für jeden Tag
        document.querySelectorAll(".delete-tag").forEach(btn => {
            btn.addEventListener("click", event => {
                const tagIndex = event.target.getAttribute("data-id");
                const tagToDelete = tags[tagIndex];
                listController.deleteTag(tagToDelete);
            });
        });
    }
}
