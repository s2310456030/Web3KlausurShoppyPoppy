// Importiere die Klasse für Listenobjekte und den Controller
import { listController } from "./listController.js";

// View-Klasse zur Darstellung von Listen im UI
export class ListView {
    constructor() {
        // HTML-Container für Listenübersicht (linke Seite)
        this.listOfLists = document.querySelector("#lists-overview");

        // HTML-Container für Listendetails (rechte Seite)
        this.listDetails = document.querySelector("#list-detail");

        // Lokale Kopie der Listen
        this.lists = [];
    }

    // Observer-Methode (reagiert auf Änderungen vom Model – aktuell nicht implementiert)
    update(eventType, data) {}

    // Rendert alle vorhandenen Listen links in der Übersicht
    renderLists(lists) {
        this.listOfLists.classList.add("p-3");
        this.listOfLists.innerHTML = lists.length === 0
            ? "<p class='text-muted'>Keine Listen vorhanden</p>"
            : "<h2>Shoppinglisten</h2>";

        // Jede Liste als klickbares Element anzeigen
        lists.forEach(list => {
            const listElement = document.createElement("div");
            listElement.classList.add("list", "p-2", "border", "rounded", "mb-2", "alllists");
            listElement.innerHTML = `
                <h5>${list.getName()}</h5>
                ${list.completed ? '<i class="bi bi-check-all"></i>' : ""}
            `;

            // Beim Klick: Details der Liste anzeigen
            listElement.addEventListener("click", () => {
                this.renderListDetails(list);
                document.querySelectorAll(".list").forEach(el => el.classList.remove("activeList"));
                listElement.classList.add("activeList");
            });

            this.listOfLists.appendChild(listElement);
        });

        // Button zum Anlegen einer neuen Liste einfügen
        const addListBtn = document.createElement("div");
        addListBtn.innerHTML = `
            <button class="btn btn-success mt-3 w-100" id="addList" data-bs-toggle="modal"
                data-bs-target="#addListsModal">Neue Liste anlegen</button>
        `;
        this.listOfLists.appendChild(addListBtn);
    }

    // Zeigt Hinweis, wenn keine Liste ausgewählt ist
    renderEmptyListDetails() {
        this.listDetails.innerHTML = "<div class='noListSelected'>Keine Liste ausgewählt</div>";
    }

    // Rendert die Detailansicht einer einzelnen Liste rechts
    renderListDetails(list) {
        if (!list || !Array.isArray(list.items)) return;

        const items = list.getItems();
        const listname = list.getName();

        let itemsHTML = "";

        // HTML-Elemente für jedes Item der Liste erzeugen
        if (items.length > 0) {
            items.forEach((item, i) => {
                const name = item.getName();
                const checked = item.isCompleted() ? "checked" : "";
                const count = item.getCount();

                itemsHTML += `
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="heading-${i}">
                            <button class="accordion-button collapsed d-flex justify-content-between itemInList" type="button"
                                data-bs-toggle="collapse" data-bs-target="#collapse-${i}" aria-expanded="false" aria-controls="collapse-${i}">
                                <input class="form-check-input ms-2" type="checkbox" id="item-${i}" ${checked}>
                                <span class="ms-2">${name}</span>
                                <p class="itemNumber ms-auto" id="itemCountDisplay-${i}">x${count}</p>
                            </button>
                        </h2>
                        <div id="collapse-${i}" class="accordion-collapse collapse" aria-labelledby="heading-${i}" data-bs-parent="#list-items">
                            <div class="accordion-body">
                                <div class="body-item">
                                    <label for="${i}numEdit">Menge:</label>
                                    <input type="number" class="itemCount" id="${i}numEdit" min="1" max="99999" value="${count}">
                                    <button class="btn btn-sm btn-primary mt-2 saveAmountBtn" data-index="${i}">Menge speichern</button>
                                </div>
                                <div class="body-item mt-2">
                                    <button class="btn btn-danger deleteBtn w-100 d-flex align-items-center gap-2" id="${i}delete">
                                        <i class="bi bi-trash3"></i> Artikel aus Liste löschen
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            itemsHTML = "<li class='list-group-item text-muted'>Keine Items vorhanden</li>";
        }

        // Buttons abhängig vom Status der Liste einblenden
        const closeButtonHTML = (!list.completed && items.length > 0)
            ? `<button id="completeListBtn" class="btn btn-success mt-3 w-100" disabled>Liste abschließen</button>` : "";
        const openButtonHTML = (list.completed && items.length > 0)
            ? `<button id="openListBtn" class="btn btn-success mt-3 w-100">Liste öffnen</button>` : "";
        const shareButtonHTML = `
            <button id="shareListBtn" class="btn btn-outline-primary mt-2 w-100" data-bs-toggle="modal" data-bs-target="#shareListModal">
                Liste teilen
            </button>`;

        // Vollständige HTML-Struktur der Detailansicht setzen
        this.listDetails.innerHTML = `
            <div class="list-detail p-3 border rounded">
                <div class="ListHeader d-flex justify-content-between align-items-center">
                    <h3>${listname}</h3>
                    <div>
                        <i class="bi bi-pencil btn btn-success list-edit" id="${list.id}-edit-btn" data-bs-toggle="modal" data-bs-target="#editModal"></i>
                    </div>
                </div>
                <p>Status: ${list.completed ? "Abgeschlossen" : "Offen"}</p>
                <div class="itemInListHeader">
                    <h4>Items:</h4>
                    <button class="btn btn-outline-success addItemInListBtn d-flex align-items-center gap-2" data-bs-toggle="modal"
                        data-bs-target="#addExistingItemModal"> Artikel hinzufügen </button>
                </div>
                <div class="accordion" id="list-items">${itemsHTML}</div>
                ${shareButtonHTML}
                ${closeButtonHTML}
                ${openButtonHTML}
            </div>
        `;

        // Klick auf "Artikel hinzufügen"-Button
        document.querySelector(".addItemInListBtn")?.addEventListener("click", () => {
            listController.addItemToList(list);
        });

        // Checkbox-Logik zum Abhaken von Items
        items.forEach((item, i) => {
            const checkbox = document.getElementById(`item-${i}`);
            checkbox?.addEventListener("change", () => {
                if (list.completed) {
                    checkbox.checked = true;
                    alert("Liste ist geschlossen!");
                } else {
                    item.setCompleted(checkbox.checked);
                    this.updateCompleteButton(list);
                }

                // Teilen einer Liste per E-Mail
                const confirmShareBtn = document.getElementById("confirmShareBtn");
                const shareEmailInput = document.getElementById("shareEmailInput");
                const emailError = document.getElementById("emailError");

                confirmShareBtn?.addEventListener("click", () => {
                    const email = shareEmailInput?.value.trim();
                    if (!email.includes("@")) {
                        emailError.classList.remove("d-none");
                        return;
                    }

                    emailError.classList.add("d-none");
                    alert(`📤 Liste "${list.getName()}" wurde an ${email} geteilt.`);

                    const modalEl = document.getElementById("shareListModal");
                    const modalInstance = bootstrap.Modal.getInstance(modalEl);
                    modalInstance?.hide();
                    shareEmailInput.value = "";
                });
            });
        });

        // Button "Menge speichern" bei Artikeln
        document.querySelectorAll(".saveAmountBtn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const index = e.target.dataset.index;
                const input = document.getElementById(`${index}numEdit`);
                const newVal = parseInt(input.value);
                if (!isNaN(newVal)) {
                    const item = list.getItems()[index];
                    item.setCount(newVal);
                    const display = document.getElementById(`itemCountDisplay-${index}`);
                    if (display) display.textContent = `x${newVal}`;
                    console.log(`✅ Menge für '${item.getName()}' aktualisiert auf`, newVal);
                }
            });
        });

        // Buttons für "Liste abschließen" / "öffnen" / "bearbeiten"
        document.getElementById("completeListBtn")?.addEventListener("click", () => {
            listController.closeList(list);
        });

        document.getElementById("openListBtn")?.addEventListener("click", () => {
            listController.openList(list);
        });

        document.getElementById(`${list.id}-edit-btn`)?.addEventListener("click", () => {
            listController.editList(list);
        });

        this.updateCompleteButton(list);
        listController.addDeleteEventListeners(list);
    }

    // Aktiviert den "Liste abschließen"-Button nur, wenn alle Items abgehakt sind
    updateCompleteButton(list) {
        const allChecked = list.items.every(item => item.isCompleted());
        const closeButton = document.getElementById("completeListBtn");
        if (closeButton) closeButton.disabled = !allChecked;
    }

    // Füllt das Bearbeitungs-Modal mit Standardtexten
    renderListEditing() {
        document.getElementById("editModalHeader").innerHTML = "Liste Bearbeiten";
        document.getElementById("editInputModal").innerHTML = "Neuer Name der Liste";
        document.getElementById("editingInput").value = "";
    }

    // Füllt das Modal mit vorhandenen Artikeln zur Auswahl
    renderAddExistingItemModal(list, articles) {
        const select = document.getElementById("existingArticleSelect");
        if (!select) return;

        select.innerHTML = "";
        articles.forEach(article => {
            const option = document.createElement("option");
            option.value = article.name;
            option.textContent = article.name;
            select.appendChild(option);
        });

        document.getElementById("confirmAddExistingItem")?.addEventListener("click", () => {
            listController.addExistingItemToList(list);
        });
    }

}
