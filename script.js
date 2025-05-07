// Éléments DOM
const newsFeedElement = document.getElementById("news-feed")
const newArticleBtn = document.getElementById("new-article-btn")
const authModal = document.getElementById("auth-modal")
const authModalTitle = document.getElementById("auth-modal-title")
const pinInput = document.getElementById("pin-input")
const pinError = document.getElementById("pin-error")
const authConfirmBtn = document.getElementById("auth-confirm")
const authCancelBtn = document.getElementById("auth-cancel")
const authCloseBtn = document.getElementById("auth-close")
const newsModal = document.getElementById("news-modal")
const newsCloseBtn = document.getElementById("news-close")
const newsModalBackdrop = document.getElementById("news-modal-backdrop")
const newsCategory = document.getElementById("news-category")
const newsDateText = document.getElementById("news-date-text")
const newsTitle = document.getElementById("news-title")
const newsDescription = document.getElementById("news-description")
const newsImage = document.getElementById("news-image")
const newsContent = document.getElementById("news-content")
const emptyStateElement = document.getElementById("empty-state")

// Code PIN pour l'authentification
const ADMIN_PIN = "123456"

// Variables pour stocker l'état
let currentAuthAction = null
let currentArticleId = null
let articles = []

// Initialiser la page
async function initPage() {
  try {
    // Charger les articles depuis le fichier JSON
    const response = await fetch("./articles.json")
    if (response.ok) {
      articles = await response.json()
    } else {
      console.error("Impossible de charger articles.json")
      articles = []
    }
  } catch (error) {
    console.error("Erreur lors du chargement des articles:", error)
    articles = []
  }

  renderArticles(articles)
  setupEventListeners()
}

// Afficher les articles
function renderArticles(articles) {
  newsFeedElement.innerHTML = ""

  // Afficher un message si aucun article n'est disponible
  if (articles.length === 0) {
    const emptyState = document.createElement("div")
    emptyState.className = "empty-state"
    emptyState.innerHTML = `
      <div class="empty-state-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      </div>
      <h3>Aucune actualité</h3>
      <p>Cliquez sur "Nouvelle actualité" pour créer votre première publication.</p>
    `
    newsFeedElement.appendChild(emptyState)
    return
  }

  articles.forEach((article) => {
    const articleElement = document.createElement("div")
    articleElement.className = "article-card"
    articleElement.innerHTML = `
      <img src="${article.image}" alt="${article.title}" class="article-image">
      <div class="article-header">
        <div class="article-meta">
          <span class="badge">${article.category}</span>
        </div>
        <h2 class="article-title">${article.title}</h2>
        <p class="article-description">${article.description}</p>
      </div>
      <div class="article-footer">
        <span class="date">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          ${article.date}
        </span>
        <div class="article-actions">
          <span class="edit-link" data-id="${article.id}">Modifier</span>
          <span class="delete-link" data-id="${article.id}">Supprimer</span>
        </div>
      </div>
    `

    // Ajouter un événement pour ouvrir la modale d'article
    articleElement.addEventListener("click", (e) => {
      // Ne pas ouvrir la modale si on a cliqué sur les liens de modification ou suppression
      if (!e.target.classList.contains("edit-link") && !e.target.classList.contains("delete-link")) {
        openNewsModal(article)
      }
    })

    newsFeedElement.appendChild(articleElement)
  })

  // Ajouter des événements pour les liens de modification et suppression
  document.querySelectorAll(".edit-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.stopPropagation()
      const articleId = e.target.dataset.id
      openAuthModal("edit", articleId)
    })
  })

  document.querySelectorAll(".delete-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.stopPropagation()
      const articleId = e.target.dataset.id
      openAuthModal("delete", articleId)
    })
  })
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
  // Bouton pour créer un nouvel article
  newArticleBtn.addEventListener("click", () => {
    openAuthModal("create")
  })

  // Boutons de la modale d'authentification
  authConfirmBtn.addEventListener("click", handleAuthConfirm)
  authCancelBtn.addEventListener("click", closeAuthModal)
  authCloseBtn.addEventListener("click", closeAuthModal)

  // Bouton pour fermer la modale d'article
  newsCloseBtn.addEventListener("click", closeNewsModal)

  // Fermer les modales en cliquant sur l'overlay
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeAllModals()
      }
    })
  })

  // Gérer l'entrée du code PIN
  pinInput.addEventListener("input", (e) => {
    // Limiter à 6 chiffres
    e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6)
  })

  // Soumettre le formulaire en appuyant sur Entrée
  pinInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleAuthConfirm()
    }
  })
}

// Ouvrir la modale d'authentification
function openAuthModal(action, articleId = null) {
  currentAuthAction = action
  currentArticleId = articleId

  // Définir le titre de la modale en fonction de l'action
  switch (action) {
    case "create":
      authModalTitle.textContent = "Créer une nouvelle actualité"
      break
    case "edit":
      authModalTitle.textContent = "Modifier l'actualité"
      break
    case "delete":
      authModalTitle.textContent = "Supprimer l'actualité"
      break
    default:
      authModalTitle.textContent = "Authentification requise"
  }

  // Réinitialiser le champ de saisie et les messages d'erreur
  pinInput.value = ""
  pinError.textContent = ""

  // Afficher la modale
  authModal.classList.add("active")
  pinInput.focus()
}

// Fermer la modale d'authentification
function closeAuthModal() {
  authModal.classList.remove("active")
  currentAuthAction = null
  currentArticleId = null
}

// Gérer la confirmation d'authentification
function handleAuthConfirm() {
  const pin = pinInput.value

  if (pin === ADMIN_PIN) {
    closeAuthModal()

    // Exécuter l'action appropriée
    switch (currentAuthAction) {
      case "create":
        window.location.href = "./editor.html"
        break
      case "edit":
        localStorage.setItem("editArticleId", currentArticleId)
        window.location.href = "./editor.html"
        break
      case "delete":
        deleteArticle(currentArticleId)
        break
    }
  } else {
    pinError.textContent = "Code PIN incorrect"
  }
}

// Supprimer un article
function deleteArticle(articleId) {
  articles = articles.filter((article) => article.id !== articleId)

  // Sauvegarder les articles dans localStorage (puisqu'on ne peut pas écrire dans le fichier JSON)
  localStorage.setItem("articles", JSON.stringify(articles))

  // Rafraîchir la liste des articles
  renderArticles(articles)
}

// Ouvrir la modale d'article
function openNewsModal(article) {
  // Définir le contenu de la modale
  newsCategory.textContent = article.category
  newsDateText.textContent = article.date
  newsTitle.textContent = article.title
  newsDescription.textContent = article.description
  newsImage.src = article.image
  newsImage.alt = article.title

  // Définir le contenu détaillé
  newsContent.innerHTML = article.content
    .split("\n")
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("")

  // Définir l'image de fond
  newsModalBackdrop.style.cssText = `
    background-image: url(${article.image});
    background-size: cover;
    background-position: center;
    filter: blur(20px) brightness(0.5);
  `

  // Afficher la modale
  newsModal.classList.add("active")
}

// Fermer la modale d'article
function closeNewsModal() {
  newsModal.classList.remove("active")
}

// Fermer toutes les modales
function closeAllModals() {
  closeAuthModal()
  closeNewsModal()
}

// Initialiser la page au chargement
document.addEventListener("DOMContentLoaded", initPage)
