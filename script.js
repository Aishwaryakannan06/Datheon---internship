const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const modal = document.getElementById("projectModal");
const toast = document.getElementById("toast");

function setTheme(theme) {
  root.dataset.theme = theme;
  const isLight = theme === "light";
  themeIcon.textContent = isLight ? "☾" : "☼";
  themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  try { localStorage.setItem("aishwarya-portfolio-theme", theme); } catch (_) {}
}
let savedTheme = null;
try { savedTheme = localStorage.getItem("aishwarya-portfolio-theme"); } catch (_) {}
setTheme(savedTheme || "dark");
themeToggle.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
});
navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
}));

document.getElementById("year").textContent = new Date().getFullYear();

const projectInfo = {
  neradi: {
    eyebrow: "01 / DIGITAL AGRICULTURE",
    title: "NERADI",
    description: "NERADI is an e-commerce platform concept designed to connect farmers directly with customers by reducing intermediaries. It aims to support transparent pricing, produce traceability, and improved market access for farmers while helping customers understand where their food comes from.",
    note: "Focus areas: e-commerce, digital agriculture, and UI/UX design. This entry describes the concept; add a demo link when a working prototype is available."
  },
  ai: {
    eyebrow: "02 / GENERATIVE AI RESEARCH",
    title: "AI Image Generation Using Generative AI",
    description: "A research presentation exploring how Generative AI models create images from text prompts and other inputs, with an emphasis on applications in digital creativity and content production.",
    note: "Achievement: First Prize at Sri Muthukumaran Institute of Technology, Chennai, on 27 January 2026. Add presentation slides or a project link if you want to share them publicly."
  },
  portfolio: {
    eyebrow: "03 / WEB DEVELOPMENT",
    title: "Personal Developer Portfolio",
    description: "This responsive portfolio is being developed as part of a practical web development learning journey. It brings together background, skills, projects, experience, and achievements in one place.",
    note: "Technologies: semantic HTML, responsive CSS, and JavaScript. Next steps: test across devices, replace profile placeholders, and deploy the website."
  }
};
document.querySelectorAll(".project-details").forEach(button => button.addEventListener("click", () => {
  const data = projectInfo[button.dataset.project];
  if (!data) return;
  document.getElementById("modalEyebrow").textContent = data.eyebrow;
  document.getElementById("modalTitle").textContent = data.title;
  document.getElementById("modalDescription").textContent = data.description;
  document.getElementById("modalNote").textContent = data.note;
  modal.showModal();
  document.body.classList.add("modal-open");
}));
function closeModal() {
  modal.close();
  document.body.classList.remove("modal-open");
}
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalDone").addEventListener("click", closeModal);
modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
modal.addEventListener("close", () => document.body.classList.remove("modal-open"));

let toastTimeout;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2600);
}
document.querySelectorAll(".placeholder-link").forEach(link => link.addEventListener("click", event => {
  event.preventDefault();
  const service = link.dataset.placeholder === "linkedin" ? "LinkedIn" : "GitHub";
  showToast(`Add your ${service} profile URL in index.html before publishing.`);
}));

// Close the mobile menu when the viewport becomes desktop-sized.
window.addEventListener("resize", () => {
  if (window.innerWidth > 700) {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});
