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
// Sobald ein Abschnitt (data-reveal) zu ~12% sichtbar ist, bekommt er
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
    { threshold: 0.12 }
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

// ---------- Foto-Galerien (Name -> Liste der Bildpfade) ----------
const galleries = {
  Garten: [
    "Garten/Garden_1.jpg",
    "Garten/Garden_2.jpg",
    "Garten/Garden_3.jpg",
    "Garten/Garden_4.jpg"
  ],
  Vorne: [
    "Vorne/Living_front_1.jpg",
    "Vorne/Living_front_2.jpg",
    "Vorne/Living_front_3.jpg",
    "Vorne/Living_front_4.jpg",
    "Vorne/Living_front_5.jpg"
  ],
  Hinten: [
    "Hinten/Living_back_1.jpg",
    "Hinten/Living_back_2.jpg",
    "Hinten/Living_back_3.jpg",
    "Hinten/Living_back_4.jpg",
    "Hinten/Living_back_5.jpg"
  ],
  Bad: [
    "Bad/Bath_1.jpg",
    "Bad/Bath_2.jpg"
  ],
  "Grundriss Vorne": [
    "Grundriss/Grundriss_vorne.jpg"
  ],
  "Grundriss Hinten": [
    "Grundriss/Grundriss_hinten.jpg"
  ],
  "Grundriss Gesamt": [
    "Grundriss/Grundriss_gesamt.jpg"
  ]
};

// ---------- Videos (Name -> einzelne Videodatei) ----------
const videos = {
  "Video vorne": "Video vorne/Video_vorne.mp4",
  "Video hinten": "Video hinten/Video_hinten.mp4"
};

// ---------- Vorschaubild (erstes Foto jeder Galerie) in den photo-frame setzen ----------
function setupPhotoThumbnails() {
  document.querySelectorAll(".photo-frame[data-gallery]").forEach((frame) => {
    const name = frame.dataset.gallery;
    const images = galleries[name];
    if (images && images.length > 0) {
      frame.style.backgroundImage = `url('${images[0]}')`;
    }
  });
}

// ---------- Lightbox: Öffnen, Schließen, Vor/Zurück ----------
let currentGallery = [];
let currentIndex = 0;

function openGallery(name) {
  // Videos haben nur eine Datei, keine Vor/Zurück-Navigation
  if (videos[name]) {
    openVideo(name);
    return;
  }

  currentGallery = galleries[name] || [];
  currentIndex = 0;
  if (currentGallery.length === 0) return;

  showImageMode();
  document.getElementById("lightbox-img").src = currentGallery[currentIndex];
  document.getElementById("lightbox").classList.add("active");
}

function openVideo(name) {
  const src = videos[name];
  if (!src) return;

  showVideoMode();
  const videoEl = document.getElementById("lightbox-video");
  videoEl.src = src;
  document.getElementById("lightbox").classList.add("active");
  videoEl.play().catch(() => {
    // Autoplay ggf. vom Browser blockiert - kein Absturz, Nutzer startet manuell.
  });
}

function closeGallery() {
  document.getElementById("lightbox").classList.remove("active");
  const videoEl = document.getElementById("lightbox-video");
  videoEl.pause();
  videoEl.src = "";
}

function showImageMode() {
  document.getElementById("lightbox-img").style.display = "block";
  document.getElementById("lightbox-video").style.display = "none";
  document.getElementById("lightbox-video").pause();

  // Bei nur einem Bild (z.B. Grundriss) machen Vor/Zurück-Pfeile keinen Sinn
  const hasMultiple = currentGallery.length > 1;
  document.querySelector(".lightbox-prev").style.display = hasMultiple ? "flex" : "none";
  document.querySelector(".lightbox-next").style.display = hasMultiple ? "flex" : "none";
}

function showVideoMode() {
  document.getElementById("lightbox-img").style.display = "none";
  document.getElementById("lightbox-video").style.display = "block";
  document.querySelector(".lightbox-prev").style.display = "none";
  document.querySelector(".lightbox-next").style.display = "none";
}

function showNext() {
  currentIndex = (currentIndex + 1) % currentGallery.length;
  document.getElementById("lightbox-img").src = currentGallery[currentIndex];
}

function showPrev() {
  currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
  document.getElementById("lightbox-img").src = currentGallery[currentIndex];
}

// Klick auf den dunklen Hintergrund (nicht auf das Bild selbst) schließt die Lightbox
function setupLightboxDismiss() {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  lightbox.addEventListener("click", (e) => {
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