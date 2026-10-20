import * as THREE from "three";
import { buildWorld } from "./world.js";
import { createPlayer } from "./player.js";
import { sfx } from "./audio.js";
import { initUI } from "./ui.js";
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.getElementById("sea");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x070b16);
const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 600);
camera.position.set(0, 8, 44);
const world = buildWorld(scene);
let started = false; let shadowOn = false;
const locks = new Set();
const player = createPlayer(scene, THREE, world, sfx, { onZone });
const ui = initUI({ onStart, onShadow, onQuality, onTeleport });
ui.setLocks(0, 3);
function onZone(z) {
  ui.showZone(z.id);
  if (z.lockKey && !locks.has(z.lockKey)) {
    locks.add(z.lockKey); sfx.lock(locks.size); world.setLocks(locks.size); ui.setLocks(locks.size, 3);
    ui.toast("Serrure " + locks.size + " sur 3 : " + z.id + ".");
    if (locks.size >= 3) { world.openDoor(); sfx.win(); ui.toast("Les trois serrures c\u00E8dent. La porte de la th\u00E8se s\u2019ouvre."); }
  } else if (z.id === "door") {
    if (locks.size >= 3) { ui.toast("Contact d\u00E9bloqu\u00E9 : voir la section contact plus bas."); sfx.win(); }
    else { ui.toast("Porte verrouill\u00E9e : explore Mobilite, Homelab et Gateway."); sfx.deny(); }
  } else if (z.id === "shadow") { sfx.shadow(); }
}
function onStart() { started = true; player.setFrozen(false); ui.showZone("spawn"); }
function onShadow() { shadowOn = !shadowOn; world.setShadow(shadowOn); ui.setShadowBtn(shadowOn); document.body.classList.toggle("shadow", shadowOn); if (shadowOn) { sfx.shadow(); ui.showZone("shadow"); ui.toast("Jardin de l\u2019ombre r\u00E9v\u00E9l\u00E9."); } }
function onTeleport(id) { player.teleport(id); }
let qMode = "auto"; let qLevel = reduced ? "low" : "high";
function applyQ() { const dpr = Math.min(devicePixelRatio || 1, qLevel === "high" ? 2 : (qLevel === "balanced" ? 1.5 : 1)); renderer.setPixelRatio(dpr); world.setSea(qLevel !== "low"); size(); }
function onQuality(q) { qMode = q; qLevel = q === "auto" ? "high" : q; applyQ(); }
function size() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener("resize", size);
const params = new URLSearchParams(location.search);
const shotName = params.get("shot");
const shotLocks = parseInt(params.get("locks") || "0", 10);
const SHOTS = { spawn: [0, 30, 0], overview: [40, 40, 40], mobility: [-30, 2, -30], time: [30, 2, 30], bridge: [-26, -20, -26], gateway: [26, -20, 26], research: [0, -28, 0], homelab: [0, 12, 0], shadow: [-42, -34, -42], door: [0, -43.5, 0] };
if (shotName && SHOTS[shotName]) { started = true; player.setFrozen(true); const sp = SHOTS[shotName]; player.pos.set(sp[0], 6, sp[1]); const veil = document.getElementById("veil"); if (veil) veil.remove(); if (shotName === "shadow") onShadow(); for (let i = 0; i < shotLocks && i < 3; i++) { const k = ["mob", "lab", "gate"][i]; if (!locks.has(k)) locks.add(k); } if (locks.size) { world.setLocks(locks.size); ui.setLocks(locks.size, 3); if (locks.size >= 3) world.openDoor(); } ui.showZone(shotName); } else { player.setFrozen(true); }
if (reduced && !shotName) { qLevel = "low"; }
applyQ(); size();
let last = performance.now(); let ema = 60; let lowT = 0; let hiT = 0; let fpsT = 0; let frames = 0;
window.__ready = false;
function loop(t) {
  requestAnimationFrame(loop);
  let dt = (t - last) / 1000; last = t;
  if (dt > 0.05) dt = 0.05; if (dt <= 0) dt = 0.001;
  const fps = 1 / dt; ema = ema * 0.92 + Math.min(fps, 120) * 0.08;
  if (qMode === "auto" && !reduced) {
    if (ema < 45) { lowT += dt; hiT = 0; } else if (ema > 57) { hiT += dt; lowT = 0; } else { lowT = 0; hiT = 0; }
    if (lowT > 2.5) { lowT = 0; if (qLevel === "high") { qLevel = "balanced"; applyQ(); } else if (qLevel === "balanced") { qLevel = "low"; applyQ(); } }
    if (hiT > 10) { hiT = 0; if (qLevel === "low") { qLevel = "balanced"; applyQ(); } else if (qLevel === "balanced") { qLevel = "high"; applyQ(); } }
  }
  player.update(dt, camera, t / 1000, reduced);
  world.update(dt, t / 1000, qLevel);
  renderer.render(scene, camera);
  frames++; fpsT += dt;
  if (fpsT > 0.5) { fpsT = 0; ui.setFps(Math.round(ema), qLevel); }
  if (!window.__ready && frames > 8) { window.__ready = true; }
}
requestAnimationFrame(loop);
