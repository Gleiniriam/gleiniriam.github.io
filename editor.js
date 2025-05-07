// Éléments DOM
const editorTitle = document.getElementById("editor-title")
const saveArticleBtn = document.getElementById("save-article-btn")
const articleImage = document.getElementById("article-image")
const articleTitle = document.getElementById("article-title")
const articleDescription = document.getElementById("article-description")
const articleCategory = document.getElementById("article-category")
const articleContent = document.getElementById("article-content")

// Variables pour stocker l'état
let isEditMode = false
let editArticleId = null
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
      // Essayer de charger depuis localStorage comme fallback
      const storedArticles = localStorage.getItem("articles")
      if (storedArticles) {
        articles = JSON.parse(storedArticles)
      } else {
        articles = []
      }
    }
  } catch (error) {
    console.error("Erreur lors du chargement des articles:", error)
    // Essayer de charger depuis localStorage comme fallback
    const storedArticles = localStorage.getItem("articles")
    if (storedArticles) {
      articles = JSON.parse(storedArticles)
    } else {
      articles = []
    }
  }

  // Vérifier si nous sommes en mode édition
  editArticleId = localStorage.getItem("editArticleId")
  isEditMode = !!editArticleId

  if (isEditMode) {
    editorTitle.textContent = "Modifier l'actualité"
    loadArticleData(editArticleId)
  } else {
    editorTitle.textContent = "Nouvelle actualité"
    // Valeurs par défaut pour un nouvel article
    articleImage.value = "https://placehold.co/800x200/gray/white"
  }

  setupEventListeners()
}

// Charger les données de l'article à modifier
function loadArticleData(articleId) {
  const article = articles.find((a) => a.id === articleId)

  if (article) {
    articleImage.value = article.image
    articleTitle.value = article.title
    articleDescription.value = article.description
    articleCategory.value = article.category
    articleContent.value = article.content
  }
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
  saveArticleBtn.addEventListener("click", saveArticle)
}

// Sauvegarder l'article
function saveArticle() {
  // Valider les champs obligatoires
  if (!articleTitle.value.trim()) {
    alert("Le titre est obligatoire")
    articleTitle.focus()
    return
  }

  if (!articleCategory.value) {
    alert("Veuillez sélectionner une catégorie")
    articleCategory.focus()
    return
  }

  // Préparer les données de l'article
  const now = new Date()
  const formattedDate = "Il y a quelques instants"

  const articleData = {
    id: isEditMode ? editArticleId : Date.now().toString(),
    title: articleTitle.value.trim(),
    description: articleDescription.value.trim(),
    content: articleContent.value.trim(),
    image: articleImage.value.trim() || "https://placehold.co/800x200/gray/white",
    category: articleCategory.value,
    date: formattedDate,
  }

  if (isEditMode) {
    // Mettre à jour l'article existant
    const index = articles.findIndex((a) => a.id === editArticleId)
    if (index !== -1) {
      articles[index] = articleData
    }
  } else {
    // Ajouter un nouvel article
    articles.unshift(articleData)
  }

  // Sauvegarder les articles dans localStorage
  localStorage.setItem("articles", JSON.stringify(articles))

  // Nettoyer le localStorage
  localStorage.removeItem("editArticleId")

  // Rediriger vers la page d'accueil
  window.location.href = "./index.html"
}

// Initialiser la page au chargement
document.addEventListener("DOMContentLoaded", initPage)
