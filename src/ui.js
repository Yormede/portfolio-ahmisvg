import { sfx } from "./audio.js";
const ZT = {
  mobility: ["MOBILITE", "Hackathon : graphes pietons, isochrones 5 min, maille Filosofi. Score relatif, jamais preuve d\u2019usage."],
  homelab: ["HOMELAB", "yormede : CT104 heberge ce site, CT100 Narbonne intouchable, CT102 et CT103 ecole. Preuve locale, jamais prod."],
  gateway: ["GATEWAY", "Routeur MCP multi-LLM : quotas, tracabilite, routage. Base pour agents de recherche."],
  time: ["TIME", "T-DEV-700 : Next et Nest, Docker, CI. Preprod CT102, prod CT103. Fonctionnel dense, persistance JSONB."],
  bridge: ["BRIDGE", "Parcours etudiants France : CVEC, logement, demarches. Pedagogie claire, FR et EN."],
  research: ["RESEARCH", "Deep researcher : 43 references, 157 observations. Couverture et exhaustivite : deux choses differentes."],
  shadow: ["JARDIN DE L\u2019OMBRE", "Discret dehors, solide dedans. Hash verifies, limites ecrites, constance. Clin d\u2019oeil a Cid Kageno."],
  door: ["PORTE DE LA THESE", "Trois serrures : Mobilite, Homelab, Gateway. La porte s\u2019ouvre sur le contact."],
  spawn: ["DIVE STATION", "ZQSD ou WASD pour marcher, souris pour regarder, Shift pour sprinter. Suis les anneaux."]
};
export function initUI(hooks) {
  const veil = document.getElementById("veil");
  const startBtn = document.getElementById("startBtn");
  const locksLabel = document.getElementById("locksLabel");
  const fpsLabel = document.getElementById("fpsLabel");
  const toastEl = document.getElementById("toast");
  const zoneTitle = document.getElementById("zoneTitle");
  const zoneText = document.getElementById("zoneText");
  const sfxBtn = document.getElementById("sfxBtn");
  const shadowBtn = document.getElementById("shadowBtn");
  let toastTimer = 0;
  function toast(msg) { if (!toastEl) return; toastEl.textContent = msg; toastEl.classList.add("on"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove("on"), 3200); }
  function setLocks(n, total) { if (locksLabel) locksLabel.textContent = "Serrures : " + "\u25CF".repeat(n) + "\u25CB".repeat(Math.max(0, total - n)); }
  function showZone(id) { const z = ZT[id]; if (!z || !zoneTitle) return; zoneTitle.textContent = z[0]; zoneText.textContent = z[1]; }
  function setFps(n, q) { if (fpsLabel) fpsLabel.textContent = n + " fps \u00B7 " + q; }
  if (startBtn) startBtn.addEventListener("click", () => { sfx.click(); if (veil) { veil.classList.add("hide"); setTimeout(() => veil.remove(), 900); } hooks.onStart(); });
  if (sfxBtn) sfxBtn.addEventListener("click", () => { const on = sfx.toggle(); sfxBtn.textContent = on ? "SFX : ON" : "SFX : OFF"; sfxBtn.setAttribute("aria-pressed", on); if (on) sfx.click(); });
  function setShadowBtn(on) { if (!shadowBtn) return; shadowBtn.textContent = on ? "Ombre : ON" : "Ombre : OFF"; shadowBtn.setAttribute("aria-pressed", on); }
  if (shadowBtn) shadowBtn.addEventListener("click", () => hooks.onShadow());
  let seq = []; addEventListener("keydown", (e) => { seq.push(e.key.toLowerCase()); seq = seq.slice(-6); if (seq.join("") === "shadow") hooks.onShadow(); });
  const qBtns = { auto: document.getElementById("qAuto"), high: document.getElementById("qHigh"), low: document.getElementById("qLow") };
  function markQ(q) { for (const k of Object.keys(qBtns)) { const b = qBtns[k]; if (b) b.setAttribute("aria-pressed", k === q); } }
  for (const k of Object.keys(qBtns)) { const b = qBtns[k]; if (b) b.addEventListener("click", () => { sfx.click(); markQ(k); hooks.onQuality(k); }); }
  markQ("auto");
  document.querySelectorAll("[data-teleport]").forEach((b) => b.addEventListener("click", () => { sfx.click(); hooks.onTeleport(b.getAttribute("data-teleport")); document.getElementById("jeu").scrollIntoView({ behavior: "smooth" }); }));
  const helpBtn = document.getElementById("helpBtn"); const help = document.getElementById("help");
  if (helpBtn && help) helpBtn.addEventListener("click", () => { sfx.click(); help.classList.toggle("on"); });
  return { toast, setLocks, showZone, setFps, setShadowBtn };
}
