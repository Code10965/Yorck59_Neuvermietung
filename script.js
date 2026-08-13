// ---------- Crossfade für Hero-Hintergrund & Foto-Galerie ----------
// Jede Gruppe von Bildern (data-interval = Wartezeit in ms) rotiert
// selbstständig durch, indem abwechselnd die Klasse "active" gesetzt wird.
function setupCrossfadeGroups() {
  document.querySelectorAll(".crossfade-group").forEach((group) => {
    const images = Array.from(group.querySelectorAll(".crossfade-img"));
    if (images.length < 2) return;

    const intervalMs = parseInt(group.dataset.interval, 10) || 6000;
    let index = 0;

    setInterval(() => {
      images[index].classList.remove("active");
      index = (index + 1) % images.length;
      images[index].classList.add("active");
    }, intervalMs);
  });
}

// ---------- Sanftes Einblenden von Abschnitten beim Scrollen ----------
// Sobald ein Abschnitt (data-reveal) zu ~20% sichtbar ist, bekommt er
// die Klasse "visible" - der Rest (Verzögerung pro Kind-Element) steht in styles.css.
function setupScrollReveal() {
  const targets = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.20 }
  );

  targets.forEach((el) => observer.observe(el));
}

// ---------- Hero-Inhalt kurz nach dem Laden einblenden ----------
function setupHeroReveal() {
  const heroContent = document.getElementById("hero-content");
  if (!heroContent) return;
  setTimeout(() => heroContent.classList.add("loaded"), 100);
}

// ---------- E-Mail-Adresse per Klick kopieren ----------
function setupCopyButton() {
  const button = document.getElementById("copy-btn");
  if (!button) return;

  const email = ["dein_neues_zuhause_berlin", "web.de"].join("@");
  const originalLabel = button.textContent;

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      button.textContent = "Kopiert ✓";
      setTimeout(() => {
        button.textContent = originalLabel;
      }, 2000);
    } catch (err) {
      // Zwischenablage nicht verfügbar - kein Absturz, einfach nichts tun.
    }
  });
}

// ---------- Medien (Name -> Bilder-Galerie ODER einzelnes Video) ----------
// Vorher gab es zwei getrennte Objekte (galleries + videos), die openGallery()
// erst per if/else auseinanderhalten musste. Jetzt trägt jeder Eintrag seinen
// Typ selbst - eine einzige "Source of Truth" pro Name.
const media = {
  Garten: {
    type: "images",
    items: [
      "Garten/Garden_1.jpg",
      "Garten/Garden_2.jpg",
      "Garten/Garden_3.jpg",
      "Garten/Garden_4.jpg"
    ]
  },
  Vorne: {
    type: "images",
    items: [
      "Vorne/Living_front_4.jpg",
      "Vorne/Living_front_1.jpg",
      "Vorne/Living_front_2.jpg",
      "Vorne/Living_front_3.jpg",
      "Vorne/Living_front_5.jpg"
    ]
  },
  Hinten: {
    type: "images",
    items: [
      "Hinten/Living_back_1.jpg",
      "Hinten/Living_back_2.jpg",
      "Hinten/Living_back_3.jpg",
      "Hinten/Living_back_4.jpg",
      "Hinten/Living_back_5.jpg"
    ]
  },
  Bad: {
    type: "images",
    items: ["Bad/Bath_1.jpg", "Bad/Bath_2.jpg"]
  },
  "Grundriss Vorne": {
    type: "images",
    items: ["Grundriss/Grundriss_vorne.jpg"]
  },
  "Grundriss Hinten": {
    type: "images",
    items: ["Grundriss/Grundriss_hinten.jpg"]
  },
  "Grundriss Gesamt": {
    type: "images",
    items: ["Grundriss/Grundriss_gesamt.jpg"]
  },
  "Video vorne": {
    type: "video",
    src: "Video vorne/Video_vorne.mp4"
  },
  "Video hinten": {
    type: "video",
    src: "Video hinten/Video_hinten.mp4"
  }
};

// ---------- Wiederholt genutzte Lightbox-Elemente einmalig holen ----------
const lightboxEl = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxVideo = document.getElementById("lightbox-video");
const lightboxPrevBtn = document.querySelector(".lightbox-prev");
const lightboxNextBtn = document.querySelector(".lightbox-next");

// ---------- Vorschaubild (erstes Foto jeder Galerie) in den photo-frame setzen ----------
function setupPhotoThumbnails() {
  document.querySelectorAll(".photo-frame[data-gallery]").forEach((frame) => {
    const entry = media[frame.dataset.gallery];
    if (entry && entry.type === "images" && entry.items.length > 0) {
      frame.style.backgroundImage = `url('${entry.items[0]}')`;
    }
  });
}

// ---------- Lightbox: Öffnen, Schließen, Vor/Zurück ----------
let currentGallery = [];
let currentIndex = 0;

function openGallery(name) {
  const entry = media[name];
  if (!entry) return;

  if (entry.type === "video") {
    openVideo(entry);
  } else {
    openImages(entry);
  }
}

function openImages(entry) {
  currentGallery = entry.items;
  currentIndex = 0;
  if (currentGallery.length === 0) return;

  showImageMode();
  lightboxImg.src = currentGallery[currentIndex];
  lightboxEl.classList.add("active");
}

function openVideo(entry) {
  showVideoMode();
  lightboxVideo.src = entry.src;
  lightboxEl.classList.add("active");
  lightboxVideo.play().catch(() => {
    // Autoplay ggf. vom Browser blockiert - kein Absturz, Nutzer startet manuell.
  });
}

function closeGallery() {
  lightboxEl.classList.remove("active");
  lightboxVideo.pause();
  lightboxVideo.src = "";
}

function showImageMode() {
  lightboxImg.style.display = "block";
  lightboxVideo.style.display = "none";
  lightboxVideo.pause();

  // Bei nur einem Bild (z.B. Grundriss) machen Vor/Zurück-Pfeile keinen Sinn
  const hasMultiple = currentGallery.length > 1;
  lightboxPrevBtn.style.display = hasMultiple ? "flex" : "none";
  lightboxNextBtn.style.display = hasMultiple ? "flex" : "none";
}

function showVideoMode() {
  lightboxImg.style.display = "none";
  lightboxVideo.style.display = "block";
  lightboxPrevBtn.style.display = "none";
  lightboxNextBtn.style.display = "none";
}

function showNext() {
  currentIndex = (currentIndex + 1) % currentGallery.length;
  lightboxImg.src = currentGallery[currentIndex];
}

function showPrev() {
  currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
  lightboxImg.src = currentGallery[currentIndex];
}

// Klick auf den dunklen Hintergrund (nicht auf das Bild selbst) schließt die Lightbox
function setupLightboxDismiss() {
  if (!lightboxEl) return;

  lightboxEl.addEventListener("click", (e) => {
    if (e.target.id === "lightbox") {
      closeGallery();
    }
  });

  // Escape-Taste schließt die Lightbox
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeGallery();
    }
  });
}

// ---------- Alles beim Laden der Seite starten ----------
document.addEventListener("DOMContentLoaded", () => {
  setupCrossfadeGroups();
  setupScrollReveal();
  setupHeroReveal();
  setupCopyButton();
  setupPhotoThumbnails();
  setupLightboxDismiss();
});