// ---------- E-Mail-Kontakt-Element (Bild + Kopieren-Button) ----------
// Wird auf allen drei Seiten (Startseite, Impressum, Datenschutz) über einen
// leeren Platzhalter <div data-email-contact> eingebunden - Markup und
// Verhalten leben nur einmal hier, nicht als Kopie in jeder HTML-Datei.
//
// data-email-contact="dark"  -> helle Schrift, für die dunkle Kontakt-Section
// data-email-contact (leer)  -> dunkle Schrift, für Impressum/Datenschutz
const CONTACT_EMAIL = ["dein_neues_zuhause_berlin", "web.de"].join("@");

export function renderEmailContacts() {
  const placeholders = document.querySelectorAll("[data-email-contact]");
  if (placeholders.length === 0) return;

  placeholders.forEach((placeholder) => {
    const isDarkBackground = placeholder.dataset.emailContact === "dark";
    const boxClass = isDarkBackground ? "contact-email" : "email-box";
    const textColor = isDarkBackground ? "#FFFFFF" : "#1C1C1A";

    placeholder.innerHTML = `
      <div class="contact-row">
        <div class="${boxClass}">
          <canvas class="email-canvas" data-color="${textColor}" aria-label="E-Mail-Adresse als Bild, gegen automatisiertes Auslesen geschützt"></canvas>
        </div>
        <button class="copy-btn" type="button">Adresse kopieren</button>
      </div>
    `;
  });

  drawEmailCanvases();
  setupCopyButtons();
}

// Zeichnet die Adresse auf jedes .email-canvas - Text wird nie als HTML
// geschrieben, sondern erst hier im Browser zusammengesetzt und gerendert.
function drawEmailCanvases() {
  document.querySelectorAll(".email-canvas").forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    const fontSize = 15;
    const font = `${fontSize}px 'JetBrains Mono', monospace`;

    // Für scharfe Darstellung auf hochauflösenden (Retina-)Displays
    const dpr = window.devicePixelRatio || 1;
    ctx.font = font;
    const textWidth = ctx.measureText(CONTACT_EMAIL).width;

    canvas.width = (textWidth + 4) * dpr;
    canvas.height = (fontSize + 8) * dpr;
    canvas.style.width = (textWidth + 4) + "px";
    canvas.style.height = (fontSize + 8) + "px";

    ctx.scale(dpr, dpr);
    ctx.font = font;
    ctx.fillStyle = canvas.dataset.color || "#1C1C1A";
    ctx.textBaseline = "middle";
    ctx.fillText(CONTACT_EMAIL, 2, (fontSize + 8) / 2);
  });
}

// Ein Handler für alle Kopieren-Buttons, egal auf welcher Seite.
function setupCopyButtons() {
  document.querySelectorAll(".copy-btn").forEach((button) => {
    const originalLabel = button.textContent;

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(CONTACT_EMAIL);
        button.textContent = "Kopiert ✓";
        setTimeout(() => {
          button.textContent = originalLabel;
        }, 2000);
      } catch (err) {
        // Zwischenablage nicht verfügbar - kein Absturz, einfach nichts tun.
      }
    });
  });
}