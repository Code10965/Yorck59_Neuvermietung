// ---------- Menü: Scroll-Indikator-Linie + Wimpel-Dropdown ----------
// Aktiv nur auf Seiten mit [data-nav-links] (aktuell nur die Startseite) -
// setupNav() bricht sonst früh ab, kein Fehler auf Impressum/Datenschutz.
// Gleiches Prinzip wie bei gallery.js: leerer Platzhalter im HTML, die
// eigentlichen Einträge (Ziel + Name) leben als "Source of Truth" hier.
const links = [
  { href: "#section-overview", label: "Überblick" },
  { href: "#section-neighborhood", label: "Lage" },
  { href: "#section-photos", label: "Fotos" },
  { href: "#section-floorplan", label: "Grundriss" },
  { href: "#section-features", label: "Details" },
  { href: "#section-contact", label: "Kontakt" }
];

export function setupNav() {
  const nav = document.getElementById("site-nav");
  const linkContainer = document.querySelector("[data-nav-links]");
  const toggle = document.getElementById("nav-toggle");
  const dropdown = document.getElementById("nav-dropdown");
  if (!nav || !linkContainer || !toggle || !dropdown) return; // Seite ohne Menü

  renderLinks(linkContainer);
  setupScrollTrack(nav, dropdown);
  setupToggle(nav, toggle, dropdown);
}

function renderLinks(container) {
  container.innerHTML = links
    .map((link) => `<a class="nav-link" href="${link.href}">${link.label}</a>`)
    .join("");
}

// ---------- Position der Kugel + Öffnungsrichtung des Panels ----------
// Die Kugel wandert proportional zur Scroll-Position an der rechten Kante
// mit (wie ein eigener kleiner Scroll-Anzeiger). Zusätzlich wird bei jedem
// Scroll geprüft, ob unterhalb der Kugel im sichtbaren Bereich noch genug
// Platz fürs Panel ist - reicht er nicht, klappt das Panel stattdessen nach
// oben auf (Klasse "nav-up", siehe styles.css).
const HIT_HEIGHT = 44; // muss zur Höhe von .nav-ball in styles.css passen. Das
                        // Schrumpfen beim Scrollen läuft dort über
                        // transform: scale() statt über width/height, daher
                        // bleibt die Layout-Box (und damit dieser Wert) in
                        // beiden Zuständen unverändert bei 44px.
const GAP = 14; // Abstand zwischen der KUGEL (nicht der Klickfläche!) und dem
                 // Panel - dasselbe Maß für "nach oben" und "nach unten".
const EDGE_MARGIN = 20; // Sicherheitsabstand zum Viewport-Rand
const TOP_THRESHOLD = 80; // ab wann "ganz oben" nicht mehr gilt (Logo ausblenden)
const BOTTOM_THRESHOLD = 40; // wie nah am Seitenende "ganz unten" zählt (Kugel wieder groß)

function setupScrollTrack(nav, dropdown) {
  let ticking = false;

  const updateTrack = () => {
    const trackTopMin = 20; // gleicher Abstand wie bisher
    const trackTopMax = window.innerHeight - 64; // Platz für Kugel (44px) + Rand unten
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = scrollable > 0 ? window.scrollY / scrollable : 0;
    const trackTop = trackTopMin + fraction * (trackTopMax - trackTopMin);
    nav.style.setProperty("--nav-track-top", `${trackTop}px`);

    // Logo nur ganz oben auf der Seite zeigen (Hero-Bereich), unabhängig
    // vom Dropdown-Zustand.
    nav.classList.toggle("nav-at-top", window.scrollY < TOP_THRESHOLD);

    // Kugel wird ganz unten (Kontakt-Sektion) noch einmal groß - derselbe
    // Trick wie bei "nav-at-top", nur am anderen Seitenende. scrollHeight
    // minus innerHeight minus aktuelle Scroll-Position ergibt den Abstand
    // zum tatsächlichen unteren Rand der Seite.
    const distanceToBottom =
      document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
    nav.classList.toggle("nav-at-bottom", distanceToBottom < BOTTOM_THRESHOLD);

    // Die Linie sitzt (per align-items: center) mittig in der Klickfläche -
    // für einen wirklich gleichen Abstand in beide Richtungen rechnen wir
    // ab dieser Mitte, nicht ab der Kante der (höheren) Klickfläche.
    const lineCenter = trackTop + HIT_HEIGHT / 2;

    // dropdown.offsetHeight funktioniert auch im unsichtbaren Zustand (nur
    // scaleY(0)/opacity:0, nicht display:none) - daher ohne Öffnen messbar.
    const dropdownHeight = dropdown.offsetHeight;
    const spaceBelow = window.innerHeight - (lineCenter + GAP) - EDGE_MARGIN;
    const opensUp = spaceBelow < dropdownHeight;
    nav.classList.toggle("nav-up", opensUp);

    const edge = opensUp
      ? window.innerHeight - lineCenter + GAP
      : lineCenter + GAP;
    nav.style.setProperty("--nav-dropdown-edge", `${edge}px`);
  };

  updateTrack(); // korrekte Startposition, auch falls die Seite mit
                  // wiederhergestellter Scroll-Position neu lädt

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateTrack();
        ticking = false;
      });
    },
    { passive: true }
  );

  // Bei Größenänderung (z.B. Drehung des Handys) neu berechnen, damit die
  // Untergrenze des Tracks zur neuen Fensterhöhe passt
  window.addEventListener("resize", updateTrack);
}

// ---------- Dropdown öffnen/schließen ----------
// Bewusst komplett JS-gesteuert statt über CSS :hover: bei reinem :hover
// hätte ein Klick auf die Kugel (zum expliziten Schließen) keine sichtbare
// Wirkung gehabt, solange die Maus noch darüber steht - :hover hätte das
// Panel trotz entfernter "open"-Klasse weiter offen gehalten. Jetzt ist die
// "open"-Klasse auf <nav> die einzige Quelle der Wahrheit: mouseenter setzt
// sie, mouseleave entfernt sie, und ein Klick auf die Kugel schließt IMMER
// (nicht nur ein reines Toggle) - dadurch schließt X-Klicken zuverlässig,
// selbst während die Maus weiter über der Kugel schwebt.
function setupToggle(nav, toggle, dropdown) {
  toggle.addEventListener("click", () => {
    if (nav.classList.contains("open")) {
      closeDropdown(nav, toggle);
    } else {
      openDropdown(nav, toggle);
    }
  });

  // Maus betritt Kugel ODER Panel (nav ist gemeinsamer Vorfahre beider) -> auf
  nav.addEventListener("mouseenter", () => openDropdown(nav, toggle));
  // Maus verlässt den gesamten Bereich (Kugel + Panel) -> zu
  nav.addEventListener("mouseleave", () => closeDropdown(nav, toggle));

  dropdown.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => closeDropdown(nav, toggle));
  });

  // Klick außerhalb von Kugel/Panel schließt das Dropdown (z.B. auf
  // Touch-Geräten, wo es kein "Maus verlässt den Bereich" gibt)
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) closeDropdown(nav, toggle);
  });

  // Escape-Taste schließt das Dropdown (analog zur Lightbox)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdown(nav, toggle);
  });
}

function openDropdown(nav, toggle) {
  nav.classList.add("open");
  toggle.setAttribute("aria-expanded", "true");
}

function closeDropdown(nav, toggle) {
  nav.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.blur(); // beendet auch den :focus-within-Zustand
}