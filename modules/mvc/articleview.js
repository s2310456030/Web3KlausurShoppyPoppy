// Importiere den zentralen Controller
import { listController } from "./listController.js";

// View zur Darstellung und Verwaltung von Artikeln
export class ArticleView {
    constructor() {
        // Linker Bereich für Menü (Tagfilter, Artikel hinzufügen)
        this.listOfLists = document.querySelector("#lists-overview");

        // Rechter Bereich für Artikelliste (Detailansicht)
        this.listDetails = document.querySelector("#list-detail");

        // Interne Artikelliste (optional, z. B. zum Filtern)
        this.articles = [];
    }

    /**
     * Observer-Methode: wird vom Modell bei Änderungen aufgerufen.
     */
    update(eventType, data) {
        if (eventType === "dataLoaded") {
            this.articles = data.articles || [];
            this.renderArticles(this.articles);
        } else if (eventType === "articleDeleted") {
            this.articles = this.articles.filter(article => article.getName() !== data.getName());
            this.renderArticles(this.articles);
        }
    }

    /**
     * Rendert die Artikel in der rechten Detailansicht als Akkordeon.
     */
    renderArticles(items) {
        if (!Array.isArray(items)) {
            console.error("Fehler: 'items' ist kein Array oder undefined:", items);
            return;
        }

        const header = document.getElementById("mainSectHeader");
        header.innerHTML = "Alle Artikel";

        const articlesContainer = this.listDetails;
        if (!articlesContainer) {
            console.error("Element mit ID 'articles-overview' nicht gefunden.");
            return;
        }

        articlesContainer.innerHTML = "";

        if (items.length === 0) {
            articlesContainer.innerHTML = "<p class='text-muted'>Keine Artikel vorhanden</p>";
            return;
        }

        // Akkordeon-Container vorbereiten
        const accordion = document.createElement("div");
        accordion.classList.add("accordion");
        accordion.id = "articlesAccordion";

        // Jeden Artikel als einzelnes Akkordeon-Element darstellen
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const name = item.getName();
            const tags = item.getTags();

            const accordionItem = document.createElement("div");
            accordionItem.classList.add("accordion-item");

            // Dropdown für Tags vorbereiten (momentan nicht im HTML verwendet)
            let tagOptions = `<option value="">Kein Tag</option>`;
            const selectedTag = item.getTags();

            listController.model.tags.forEach(tag => {
                const isSelected =
                    (selectedTag && selectedTag.getTagName && selectedTag.getTagName() === tag.getTagName())
                        ? "selected" : "";
                tagOptions += `<option value="${tag.getTagName()}" ${isSelected}>${tag.getTagName()}</option>`;
            });

            // HTML für Artikel-Eintrag
            accordionItem.innerHTML = `
                <h2 class="accordion-header" id="heading-${i}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                        data-bs-target="#collapse-${i}" aria-expanded="false" aria-controls="collapse-${i}">
                        <div class="itemLeftSide">
                            <div class="articleIcon">
                                <img src="" alt="${name}" style="width: 2rem; height: 2rem; object-fit: contain;" />
                            </div>
                            <div class="article-info">
                                <h4 class="mb-0">${name}</h4>
                            </div>
                        </div>
                    </button>
                </h2>
                <div id="collapse-${i}" class="accordion-collapse collapse" aria-labelledby="heading-${i}" 
                    data-bs-parent="#articlesAccordion">
                    <div class="accordion-body d-flex justify-content-between align-items-center twoFlex">
                        <div class="padding-sm">
                            <label for="${i}ItemName">Name:</label>
                            <input type="text" class="itemNameEditor" id="${i}ItemName" value="${items[i].name}">
                        </div>
                        <div class="article-actions d-flex align-items-center">
                            <i class="bi bi-trash3 btn btn-danger delete-article" data-id="${i}"></i>
                        </div>
                    </div>
                </div>
            `;

            // Eventlistener für Edit und Tag-Auswahl dynamisch setzen
            setTimeout(() => {
                const itemTagEdit = document.getElementById(`tagSelect${i}`);
                if (itemTagEdit) {
                    itemTagEdit.addEventListener("change", () => {
                        const newTag = itemTagEdit.value;
                        listController.changeTagOfItem(item, newTag, items);
                    });
                }

                const itemNameEdit = document.getElementById(`${i}ItemName`);
                if (itemNameEdit) {
                    itemNameEdit.addEventListener("change", () => {
                        const newArticleName = itemNameEdit.value;
                        listController.changeArticleName(item, newArticleName, items);
                    });
                }
            }, 0);

            accordion.appendChild(accordionItem);
        }

        articlesContainer.appendChild(accordion);

        // Eventlistener für Löschen-Buttons (mit Bestätigung)
        document.querySelectorAll(".delete-article").forEach(btn => {
            btn.addEventListener("click", (event) => {
                const itemId = event.target.getAttribute("data-id");
                const itemToDelete = items[itemId];
                this.showDeleteConfirmationModal(itemToDelete, items);
            });
        });
    }

    /**
     * Zeigt ein Bootstrap-Modal zur Bestätigung vor dem Löschen eines Artikels.
     */
    showDeleteConfirmationModal(item, items) {
        const modalHTML = `
            <div class="modal fade" id="confirmDeleteModal" tabindex="-1" role="dialog" aria-labelledby="confirmDeleteModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Bestätigung erforderlich</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"></button>
                        </div>
                        <div class="modal-body">
                            <p>⚠️ Möchten Sie den Artikel <strong>"${item.getName()}"</strong> wirklich löschen?</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
                            <button type="button" class="btn btn-danger" id="confirmDelete">Löschen</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Existierendes Modal entfernen (wenn vorhanden)
        const existingModal = document.getElementById("confirmDeleteModal");
        if (existingModal) existingModal.remove();

        // Modal zum DOM hinzufügen
        document.body.insertAdjacentHTML("beforeend", modalHTML);

        const deleteModal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"), {
            backdrop: "static",
            keyboard: false
        });

        // Beim Klick auf "Löschen": Artikel löschen
        document.getElementById("confirmDelete").addEventListener("click", () => {
            listController.deleteArticle(item, items);
            deleteModal.hide();
        });

        // Modal anzeigen
        deleteModal.show();
    }

    /**
     * Rendert die Seitenleiste links mit Tag-Filtern und einem Button zum Artikel hinzufügen.
     */
    renderArticleMenu() {
        const articleSidebar = this.listOfLists;

        if (!articleSidebar) {
            console.error("Element mit ID 'article-sidebar' nicht gefunden.");
            return;
        }

        const tags = listController.model.tags;

        articleSidebar.innerHTML = `
            <div class="article-menu">
                <h2>Artikelübersicht</h2>

                <button type="button" id="addNewArticleBtn" class="newArticleBtn btn btn-success w-100 mt-2" 
                    data-bs-toggle="modal" data-bs-target="#addItemModal">Neuen Artikel anlegen</button>

                <h5 class="margin-top-med">Filtern nach Tags:</h5>
                <div id="tagFilterContainer" class="tag-filters">
                    <div class="form-check d-flex align-items-center">
                        <input class="form-check-input tag-radio me-2" type="radio" name="tagFilterGroup" id="tag-all" value="all" checked>
                        <label class="form-check-label" for="tag-all">Alle Artikel</label>
                    </div>

                    ${tags.length > 0 ? tags.map(tag => `
                        <div class="form-check d-flex align-items-center">
                            <input class="form-check-input tag-radio me-2" type="radio" name="tagFilterGroup" id="tag-${tag.tagname}" value="${tag.tagname}">
                            <label class="form-check-label" for="tag-${tag.tagname}">${tag.tagname}</label>
                        </div>
                    `).join("") : "<p class='text-muted'>Keine Tags verfügbar</p>"}
                </div>

                <div class="btn btn-outline-success filterBtn mt-2" id="filterBtn">
                    <i class="bi bi-funnel"></i> Filtern
                </div>
            </div>
        `;

        // Button zum Artikel anlegen
        document.getElementById("addNewArticleBtn").addEventListener("click", () => {
            listController.addArticleToModel();
        });

        // Tag-Filter anwenden
        document.getElementById("filterBtn").addEventListener("click", () => {
            const selectedRadio = document.querySelector('input[name="tagFilterGroup"]:checked');
            const filterTag = selectedRadio.value;
            listController.filterBy(filterTag);
        });
    }
}
