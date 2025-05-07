// Données mockées pour les articles
const MOCK_ARTICLES = [
    {
      id: "1",
      title: "Guide de démarrage pour les nouveaux utilisateurs",
      description: "Apprenez à utiliser toutes les fonctionnalités de notre plateforme",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      image: "https://placehold.co/800x200/gray/white",
      category: "Tutoriel",
      date: "Il y a 2 heures",
    },
    {
      id: "2",
      title: "Les dernières tendances technologiques en 2023",
      description: "Découvrez les innovations qui façonnent notre avenir numérique",
      content:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      image: "https://placehold.co/800x200/gray/white",
      category: "Technologie",
      date: "Il y a 1 jour",
    },
    {
      id: "3",
      title: "Comment optimiser votre productivité au travail",
      description: "Astuces et méthodes pour mieux gérer votre temps et vos projets",
      content:
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      image: "https://placehold.co/800x200/gray/white",
      category: "Productivité",
      date: "Il y a 3 jours",
    },
  ];
  
  // Code PIN pour l'authentification
  const ADMIN_PIN = "123456";
  
  // Éléments DOM
  const newsFeedElement = document.getElementById("news-feed");
  const newArticleBtn = document.getElementById("new-article-btn");
  const authModal = document.getElementById("auth-modal");
  const authModalTitle = document.getElementById("auth-modal-title");
  const pinInput = document.getElementById("pin-input");
  const pinError = document.getElementById("pin-error");
  const authConfirmBtn = document.getElementById("auth-confirm");
  const authCancelBtn = document.getElementById("auth-cancel");
  const authCloseBtn = document.getElementById("auth-close");
  const newsModal = document.getElementById("news-modal");
  const newsCloseBtn = document.getElementById("news-close");
  const newsModalBackdrop = document.getElementById("news-modal-backdrop");
  const newsCategory = document.getElementById("news-category");
  const newsDateText = document.getElementById("news-date-text");
  const newsTitle = document.getElementById("news-title");
  const newsDescription = document.getElementById("news-description");
  const newsImage = document.getElementById("news-image");
  const newsContent = document.getElementById("news-content");
  
  // Variables pour stocker l'état
  let currentAuthAction = null;
  let currentArticleId = null;
  
  // Initialiser la page
  function initPage() {
    // Charger les articles depuis localStorage ou utiliser les articles mockés
    let articles = JSON.parse(localStorage.getItem("articles")) || MOCK_ARTICLES;
    
    // Si c'est la première fois, sauvegarder les articles mockés dans localStorage
    if (!localStorage.getItem("articles")) {
      localStorage.setItem("articles", JSON.stringify(MOCK_ARTICLES));
    }
    
    renderArticles(articles);
    setupEventListeners();
  }
  
  // Afficher les articles
  function renderArticles(articles) {
    newsFeedElement.innerHTML = "";
    
    articles.forEach(article => {
      const articleElement = document.createElement("div");
      articleElement.className = "article-card";
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
      `;
      
      // Ajouter un événement pour ouvrir la modale d'article
      articleElement.addEventListener("click", (e) => {
        // Ne pas ouvrir la modale si on a cliqué sur les liens de modification ou suppression
        if (!e.target.classList.contains("edit-link") && !e.target.classList.contains("delete-link")) {
          openNewsModal(article);
        }
      });
      
      newsFeedElement.appendChild(articleElement);
    });
    
    // Ajouter des événements pour les liens de modification et suppression
    document.querySelectorAll(".edit-link").forEach(link => {
      link.addEventListener("click", (e) => {
        e.stopPropagation();
        const articleId = e.target.dataset.id;
        openAuthModal("edit", articleId);
      });
    });
    
    document.querySelectorAll(".delete-link").forEach(link => {
      link.addEventListener("click", (e) => {
        e.stopPropagation();
        const articleId = e.target.dataset.id;
        openAuthModal("delete", articleId);
      });
    });
  }
  
  // Configurer les écouteurs d'événements
  function setupEventListeners() {
    // Bouton pour créer un nouvel article
    newArticleBtn.addEventListener("click", () => {
      openAuthModal("create");
    });
    
    // Boutons de la modale d'authentification
    authConfirmBtn.addEventListener("click", handleAuthConfirm);
    authCancelBtn.addEventListener("click", closeAuthModal);
    authCloseBtn.addEventListener("click", closeAuthModal);
    
    // Bouton pour fermer la modale d'article
    newsCloseBtn.addEventListener("click", closeNewsModal);
    
    // Fermer les modales en cliquant sur l'overlay
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          closeAllModals();
        }
      });
    });
    
    // Gérer l'entrée du code PIN
    pinInput.addEventListener("input", (e) => {
      // Limiter à 6 chiffres
      e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    });
    
    // Soumettre le formulaire en appuyant sur Entrée
    pinInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleAuthConfirm();
      }
    });
  }
  
  // Ouvrir la modale d'authentification
  function openAuthModal(action, articleId = null) {
    currentAuthAction = action;
    currentArticleId = articleId;
    
    // Définir le titre de la modale en fonction de l'action
    switch (action) {
      case "create":
        authModalTitle.textContent = "Créer une nouvelle actualité";
        break;
      case "edit":
        authModalTitle.textContent = "Modifier l'actualité";
        break;
      case "delete":
        authModalTitle.textContent = "Supprimer l'actualité";
        break;
      default:
        authModalTitle.textContent = "Authentification requise";
    }
    
    // Réinitialiser le champ de saisie et les messages d'erreur
    pinInput.value = "";
    pinError.textContent = "";
    
    // Afficher la modale
    authModal.classList.add("active");
    pinInput.focus();
  }
  
  // Fermer la modale d'authentification
  function closeAuthModal() {
    authModal.classList.remove("active");
    currentAuthAction = null;
    currentArticleId = null;
  }
  
  // Gérer la confirmation d'authentification
  function handleAuthConfirm() {
    const pin = pinInput.value;
    
    if (pin === ADMIN_PIN) {
      closeAuthModal();
      
      // Exécuter l'action appropriée
      switch (currentAuthAction) {
        case "create":
          window.location.href = "editor.html";
          break;
        case "edit":
          localStorage.setItem("editArticleId", currentArticleId);
          window.location.href = "editor.html";
          break;
        case "delete":
          deleteArticle(currentArticleId);
          break;
      }
    } else {
      pinError.textContent = "Code PIN incorrect";
    }
  }
  
  // Supprimer un article
  function deleteArticle(articleId) {
    let articles = JSON.parse(localStorage.getItem("articles")) || [];
    articles = articles.filter(article => article.id !== articleId);
    localStorage.setItem("articles", JSON.stringify(articles));
    
    // Rafraîchir la liste des articles
    renderArticles(articles);
  }
  
  // Ouvrir la modale d'article
  function openNewsModal(article) {
    // Définir le contenu de la modale
    newsCategory.textContent = article.category;
    newsDateText.textContent = article.date;
    newsTitle.textContent = article.title;
    newsDescription.textContent = article.description;
    newsImage.src = article.image;
    newsImage.alt = article.title;
    
    // Définir le contenu détaillé
    newsContent.innerHTML = article.content.split("\n").map(paragraph => `<p>${paragraph}</p>`).join("");
    
    // Définir l'image de fond
    newsModalBackdrop.style.cssText = `
      background-image: url(${article.image});
      background-size: cover;
      background-position: center;
      filter: blur(20px) brightness(0.5);
    `;
    
    // Afficher la modale
    newsModal.classList.add("active");
  }
  
  // Fermer la modale d'article
  function closeNewsModal() {
    newsModal.classList.remove("active");
  }
  
  // Fermer toutes les modales
  function closeAllModals() {
    closeAuthModal();
    closeNewsModal();
  }
  
  // Initialiser la page au chargement
  document.addEventListener("DOMContentLoaded", initPage);