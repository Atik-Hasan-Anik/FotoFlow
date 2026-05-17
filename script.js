document.addEventListener("DOMContentLoaded", function () {
  const THEME_KEY = "theme";
  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const gallery = document.getElementById("gallery");
  const searchInput = document.getElementById("search-input");
  const modal = document.getElementById("image-modal");
  const modalClose = document.getElementById("modal-close");
  const modalCloseAlt = document.getElementById("modal-close-alt");
  const modalShare = document.getElementById("modal-share");
  const modalDownload = document.getElementById("modal-download");
  const modalImage = document.getElementById("modal-image");
  const modalTitle = document.getElementById("modal-title");
  const modalLocation = document.getElementById("modal-location");
  const modalCategory = document.getElementById("modal-category");
  const modalLikes = document.getElementById("modal-likes");
  const modalDescription = document.getElementById("modal-description");

  const categories = ["Landscape", "Portrait", "Travel", "Food", "Architecture", "Nature", "Cityscape", "Minimal"];
  const locations = ["Paris", "Tokyo", "New York", "London", "Barcelona", "Bali", "Seoul", "Cape Town"];
  const photographers = ["Ava", "Liam", "Olivia", "Noah", "Emma", "Mason", "Sophia", "Ethan"];
  const moods = [
    "soft morning light",
    "moody evening tones",
    "cinematic depth",
    "crisp architecture",
    "vibrant city energy",
    "serene landscape mood",
    "stylish portrait detail",
    "rich texture and contrast",
  ];

  const cards = [];
  const imageData = new Map();

  function getSavedTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (error) {
      return null;
    }
  }

  function applyTheme(theme) {
    if (!theme) return;
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      const isDark = theme === "dark";
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.classList.toggle("is-dark", isDark);
    }
  }

  function initializeTheme() {
    const saved = getSavedTheme();
    if (saved) {
      applyTheme(saved);
      return;
    }
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  function toggleTheme() {
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (error) {
      // ignore storage errors
    }
  }

  function getDetails(index) {
    const category = categories[index % categories.length];
    const location = locations[index % locations.length];
    const photographer = photographers[index % photographers.length];
    const mood = moods[index % moods.length];
    return {
      id: index + 1,
      category,
      location,
      photographer,
      title: `${category} shot in ${location}`,
      description: `This image captures ${mood} in ${location}. It is a ${category.toLowerCase()} composition with clean framing and rich color.`,
      likes: 120 + ((index * 11) % 88),
      imageUrl: `https://picsum.photos/seed/fotoflow-${index}/500/${420 + ((index * 37) % 280)}`,
      alt: `${category} photograph taken in ${location}`,
      tags: [category, location, photographer, mood].join(" ").toLowerCase(),
    };
  }

  function createCard(details) {
    const card = document.createElement("article");
    card.className = "card hidden";
    card.dataset.id = details.id;
    card.dataset.search = `${details.title} ${details.category} ${details.location} ${details.photographer} ${details.tags}`.toLowerCase();

    const img = document.createElement("img");
    img.src = details.imageUrl;
    img.alt = details.alt;
    img.loading = "lazy";
    img.decoding = "async";

    const meta = document.createElement("div");
    meta.className = "meta";

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = details.title;

    const author = document.createElement("div");
    author.className = "author";
    author.textContent = `by ${details.photographer}`;

    const detailsRow = document.createElement("div");
    detailsRow.className = "details";

    const location = document.createElement("span");
    location.textContent = details.location;
    const category = document.createElement("span");
    category.textContent = details.category;
    const likeCount = document.createElement("span");
    likeCount.className = "likes-count";
    likeCount.textContent = `${details.likes} likes`;

    detailsRow.appendChild(location);
    detailsRow.appendChild(category);
    detailsRow.appendChild(likeCount);

    const likeButton = document.createElement("button");
    likeButton.type = "button";
    likeButton.className = `btn-like${details.liked ? " liked" : ""}`;
    likeButton.dataset.id = details.id;
    likeButton.textContent = details.liked ? "Liked" : "Like";
    likeButton.addEventListener("click", handleLike);

    meta.appendChild(title);
    meta.appendChild(author);
    meta.appendChild(detailsRow);
    meta.appendChild(likeButton);

    card.appendChild(img);
    card.appendChild(meta);
    return card;
  }

  function updateLikeDisplay(details) {
    const card = gallery.querySelector(`.card[data-id="${details.id}"]`);
    if (card) {
      const likeCount = card.querySelector(".likes-count");
      const likeButton = card.querySelector(".btn-like");
      if (likeCount) {
        likeCount.textContent = `${details.likes} likes`;
      }
      if (likeButton) {
        likeButton.textContent = details.liked ? "Liked" : "Like";
        likeButton.classList.toggle("liked", details.liked);
      }
    }
    if (modal && modal.dataset.imageId === String(details.id)) {
      modalLikes.textContent = `${details.likes} likes`;
    }
  }

  function animateLike(card) {
    if (!card) return;
    const heart = document.createElement("span");
    heart.className = "like-burst";
    heart.textContent = "❤";
    card.appendChild(heart);
    heart.addEventListener("animationend", () => {
      heart.remove();
    }, { once: true });
  }

  function handleLike(event) {
    event.stopPropagation();
    const id = Number(event.currentTarget.dataset.id);
    const details = imageData.get(id);
    if (!details) return;

    const card = event.currentTarget.closest(".card");
    if (!details.liked) {
      details.likes += 1;
      details.liked = true;
      animateLike(card);
    } else {
      details.likes = Math.max(details.likes - 1, 0);
      details.liked = false;
    }

    updateLikeDisplay(details);
  }

  function buildGallery(amount) {
    if (!gallery) return;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < amount; i += 1) {
      const details = getDetails(i);
      details.liked = false;
      imageData.set(details.id, details);
      const card = createCard(details);
      cards.push(card);
      fragment.appendChild(card);
    }
    gallery.appendChild(fragment);
    requestAnimationFrame(() => {
      gallery.querySelectorAll(".card.hidden").forEach((card) => card.classList.remove("hidden"));
    });
  }

  function filterGallery(query) {
    if (!gallery) return;
    const normalized = query.trim().toLowerCase();
    cards.forEach((card) => {
      card.style.display = normalized && !card.dataset.search.includes(normalized) ? "none" : "inline-block";
    });
  }

  function openModal(details) {
    if (!modal) return;
    modalImage.src = details.imageUrl;
    modalImage.alt = details.alt;
    modalTitle.textContent = details.title;
    modalLocation.textContent = details.location;
    modalCategory.textContent = details.category;
    modalLikes.textContent = `${details.likes} likes`;
    modalDescription.textContent = details.description;
    modal.dataset.imageUrl = details.imageUrl;
    modal.dataset.imageId = details.id;
    modal.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function downloadCurrentImage() {
    if (!modal || !modal.dataset.imageUrl) return;
    const link = document.createElement("a");
    link.href = modal.dataset.imageUrl;
    link.download = "fotoflow-image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function shareCurrentImage() {
    if (!modal || !modal.dataset.imageUrl) return;
    const url = modal.dataset.imageUrl;
    const data = {
      title: modalTitle.textContent,
      text: modalDescription.textContent,
      url,
    };
    if (navigator.share) {
      navigator.share(data).catch(() => {
        navigator.clipboard.writeText(url).then(() => window.alert("Link copied to clipboard."));
      });
      return;
    }
    navigator.clipboard.writeText(url).then(() => window.alert("Link copied to clipboard."));
  }

  initializeTheme();
  buildGallery(64);

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  if (searchInput) {
    searchInput.addEventListener("input", function (event) {
      filterGallery(event.target.value || "");
    });
  }

  if (gallery) {
    gallery.addEventListener("click", function (event) {
      const card = event.target.closest(".card");
      if (!card) return;
      const id = Number(card.dataset.id);
      const details = imageData.get(id);
      if (!details) return;
      openModal(details);
    });
  }

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }

  if (modalCloseAlt) {
    modalCloseAlt.addEventListener("click", closeModal);
  }

  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  if (modalDownload) {
    modalDownload.addEventListener("click", downloadCurrentImage);
  }

  if (modalShare) {
    modalShare.addEventListener("click", shareCurrentImage);
  }
});