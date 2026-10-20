import * as THREE from "three";
export function heightAt(x, z) {
  const r = Math.hypot(x, z);
  const base = 2.0 * Math.max(0, 1 - (r / 62) * (r / 62));
  const bumps = 0.35 * Math.sin(x * 0.16) * Math.cos(z * 0.14) * Math.max(0, 1 - r / 55);
  return base + bumps;
}
function makeLabel(text, sub) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 160;
  const g = c.getContext("2d");
  g.fillStyle = "rgba(7,11,22,0.92)"; g.fillRect(0, 0, 512, 160);
  g.strokeStyle = "#ffd98a"; g.lineWidth = 6; g.strokeRect(8, 8, 496, 144);
  g.fillStyle = "#ffd98a"; g.font = "bold 56px Inter,system-ui,sans-serif"; g.textAlign = "center";
  g.fillText(text, 256, 78);
  g.fillStyle = "#9fb2ff"; g.font = "28px Inter,system-ui,sans-serif";
  g.fillText(sub, 256, 122);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.9), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide }));
  return m;
}
export function buildWorld(scene) {
  const colliders = []; const zones = []; const anim = { packets: [], rings: [], fireflies: null, sea: null, hands: null, key: null };
  const addBox = (x, z, w, d) => colliders.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });
  scene.fog = new THREE.Fog(0x0a1030, 60, 220);
  scene.add(new THREE.HemisphereLight(0x8fa2ff, 0x0a0f24, 1.05));
  const sun = new THREE.DirectionalLight(0xffe6b0, 1.6); sun.position.set(40, 60, 20); scene.add(sun);
  const moon = new THREE.DirectionalLight(0x6f7fff, 0.5); moon.position.set(-30, 40, -40); scene.add(moon);
  const groundGeo = new THREE.CircleGeometry(62, 72, 0, Math.PI * 2);
  const gp = groundGeo.attributes.position;
  groundGeo.rotateX(-Math.PI / 2);
  for (let i = 0; i < gp.count; i++) { const vx = gp.getX(i); const vz = gp.getZ(i); gp.setY(i, heightAt(vx, vz)); }
  groundGeo.computeVertexNormals();
  const ground = new THREE.Mesh(groundGeo, new THREE.MeshStandardMaterial({ color: 0x18224d, roughness: 0.95, metalness: 0.05 }));
  scene.add(ground);
  const seaGeo = new THREE.PlaneGeometry(500, 500, 44, 44); seaGeo.rotateX(-Math.PI / 2);
  const sea = new THREE.Mesh(seaGeo, new THREE.MeshStandardMaterial({ color: 0x0b2a5e, roughness: 0.35, metalness: 0.55, transparent: true, opacity: 0.94 }));
  sea.position.y = -1.4; scene.add(sea); anim.sea = sea;
  const starGeo = new THREE.BufferGeometry(); const sn = 700; const sp = new Float32Array(sn * 3);
  for (let i = 0; i < sn; i++) { const a = Math.random() * Math.PI * 2; const e = 0.25 + Math.random() * 1.2; const r = 300; sp[i*3] = Math.cos(a) * Math.cos(e) * r; sp[i*3+1] = Math.sin(e) * r; sp[i*3+2] = Math.sin(a) * Math.cos(e) * r; }
  starGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xcdd8ff, size: 1.4, sizeAttenuation: false, transparent: true, opacity: 0.8 })));
  const spawnY = heightAt(0, 36);
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(7, 7.4, 0.5, 40), new THREE.MeshStandardMaterial({ color: 0x27336e, roughness: 0.4, metalness: 0.5 }));
  plat.position.set(0, spawnY + 0.1, 36); scene.add(plat);
  const glassC = document.createElement("canvas"); glassC.width = 256; glassC.height = 256;
  const gg = glassC.getContext("2d");
  for (let i = 0; i < 12; i++) { gg.fillStyle = i % 2 ? "#1b2650" : "#2b3a8f"; gg.beginPath(); gg.moveTo(128, 128); gg.arc(128, 128, 120, (i / 12) * Math.PI * 2, ((i + 1) / 12) * Math.PI * 2); gg.fill(); }
  gg.strokeStyle = "#ffd98a"; gg.lineWidth = 8; gg.beginPath(); gg.arc(128, 128, 118, 0, Math.PI * 2); gg.stroke();
  gg.fillStyle = "#ffd98a"; gg.font = "bold 90px serif"; gg.textAlign = "center"; gg.fillText("A", 128, 165);
  const glassT = new THREE.CanvasTexture(glassC); glassT.colorSpace = THREE.SRGBColorSpace;
  const glass = new THREE.Mesh(new THREE.CircleGeometry(5.4, 40), new THREE.MeshBasicMaterial({ map: glassT, transparent: true, opacity: 0.95 }));
  glass.rotation.x = -Math.PI / 2; glass.position.set(0, spawnY + 0.38, 36); scene.add(glass);
  const pilMat = new THREE.MeshStandardMaterial({ color: 0x3a467f, roughness: 0.5, metalness: 0.4 });
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; const px = Math.cos(a) * 8.6; const pz = 36 + Math.sin(a) * 8.6; const py = heightAt(px, pz); const pil = new THREE.Mesh(new THREE.BoxGeometry(0.9, 3.6, 0.9), pilMat); pil.position.set(px, py + 1.8, pz); scene.add(pil); const cap = new THREE.Mesh(new THREE.OctahedronGeometry(0.55), new THREE.MeshStandardMaterial({ color: 0xffd98a, emissive: 0x664400, roughness: 0.3, flatShading: true })); cap.position.set(px, py + 4.1, pz); scene.add(cap); }
  const spawnLabel = makeLabel("DIVE STATION", "zetetic — point de depart"); spawnLabel.position.set(0, spawnY + 6.4, 36); scene.add(spawnLabel);
  const stone = new THREE.MeshStandardMaterial({ color: 0x4a568f, roughness: 0.8, metalness: 0.15, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: 0x141b3a, roughness: 0.7, metalness: 0.3, flatShading: true });
  const gold = new THREE.MeshStandardMaterial({ color: 0xffd98a, emissive: 0x6b4a00, emissiveIntensity: 0.7, roughness: 0.35, metalness: 0.6, flatShading: true });
  const violet = new THREE.MeshStandardMaterial({ color: 0x8b6cff, emissive: 0x3a1fa0, emissiveIntensity: 0.8, roughness: 0.4, flatShading: true });
  const teal = new THREE.MeshStandardMaterial({ color: 0x5eead4, emissive: 0x0d5c52, emissiveIntensity: 0.8, roughness: 0.4, flatShading: true });
  function pavilion(x, z, id, title, sub, lockKey, ringDz) {
    const y = heightAt(x, z);
    const base = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 8), stone); base.position.set(x, y + 0.3, z); scene.add(base);
    addBox(x, z + 1.2, 7.5, 4.5);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(7.4, 2.4, 4), dark); roof.position.set(x, y + 5.4, z); roof.rotation.y = Math.PI / 4; scene.add(roof);
    for (let i = 0; i < 4; i++) { const px = x + (i < 2 ? -4.4 : 4.4); const pz = z + (i % 2 ? -3.4 : 3.4); const py = heightAt(px, pz); const post = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 4.4, 6), stone); post.position.set(px, py + 2.2, pz); scene.add(post); }
    const lab = makeLabel(title, sub); lab.position.set(x, y + 8.2, z); scene.add(lab);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.12, 8, 40), new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.55 }));
    const ringZ = z + (ringDz === undefined ? -7.2 : ringDz); ring.rotation.x = -Math.PI / 2; ring.position.set(x, y + 0.75, ringZ); scene.add(ring); anim.rings.push(ring);
    zones.push({ id, x, z: ringZ, r: 3.4, lockKey: lockKey || null, visited: false });
    return y;
  }
  const yMob = pavilion(-30, 6, "mobility", "MOBILITE", "hackathon — graphes & isochrones", "mob");
  const grid = new THREE.GridHelper(8, 8, 0x5eead4, 0x2a3568); grid.position.set(-30, yMob + 0.65, 7.2); scene.add(grid);
  for (let i = 0; i < 3; i++) { const rail = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.14, 0.3), teal); rail.position.set(-30, yMob + 0.72, 5.6 + i * 1.1); scene.add(rail); }
  for (let i = 0; i < 5; i++) { const h = 0.8 + i * 0.55 + (i === 2 ? 1.1 : 0); const bar = new THREE.Mesh(new THREE.BoxGeometry(0.7, h, 0.7), i === 2 ? gold : violet); bar.position.set(-32.6 + i * 1.3, yMob + 0.6 + h / 2, 8.6); scene.add(bar); }
  for (let i = 0; i < 3; i++) { const iso = new THREE.Mesh(new THREE.TorusGeometry(1.2 + i * 0.9, 0.06, 6, 40), new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.7 })); iso.rotation.x = -Math.PI / 2; iso.position.set(-27, yMob + 0.7, 4.2); scene.add(iso); }
  const yTime = pavilion(30, 6, "time", "TIME", "t-dev-700 — preprod + prod", null);
  const tower = new THREE.Mesh(new THREE.BoxGeometry(2.6, 7.5, 2.6), stone); tower.position.set(30, yTime + 4.3, 7.4); scene.add(tower); addBox(30, 7.4, 3, 3);
  const face = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.25, 24), new THREE.MeshStandardMaterial({ color: 0xeaf0ff, roughness: 0.5 }));
  face.rotation.x = Math.PI / 2; face.position.set(30, yTime + 6.4, 6.0); scene.add(face);
  const handMat = new THREE.MeshBasicMaterial({ color: 0x141b3a });
  const hourH = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.9, 0.1), handMat); hourH.geometry.translate(0, 0.4, 0); hourH.position.set(30, yTime + 6.4, 5.85); scene.add(hourH);
  const minH = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.3, 0.1), handMat); minH.geometry.translate(0, 0.55, 0); minH.position.set(30, yTime + 6.4, 5.83); scene.add(minH);
  anim.hands = { hourH, minH };
  const yBri = pavilion(-26, -24, "bridge", "BRIDGE", "france-student-bridge — parcours & demarches", null);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(9, 0.35, 2.2), new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.8, flatShading: true }));
  deck.position.set(-26, yBri + 1.6, -22.6); deck.rotation.z = 0.06; scene.add(deck);
  for (let i = -1; i <= 1; i += 2) { for (let j = 0; j < 4; j++) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.6, 0.3), dark); post.position.set(-29.5 + j * 2.3, yBri + 2.2, -22.6 + i * 1.1); scene.add(post); const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 7.4, 5), gold); cable.rotation.z = Math.PI / 2; cable.position.set(-26, yBri + 3.4, -22.6 + i * 1.1); scene.add(cable); } }
  const yGat = pavilion(26, -24, "gateway", "GATEWAY", "ai-service-gateway — MCP multi-LLM", "gate");
  for (let i = -1; i <= 1; i += 2) { const pil = new THREE.Mesh(new THREE.BoxGeometry(0.9, 5.2, 0.9), violet); pil.position.set(26 + i * 3.2, yGat + 3.2, -22.6); scene.add(pil); }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.8, 1.1), violet); lintel.position.set(26, yGat + 6.1, -22.6); scene.add(lintel);
  const lintel2 = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.45, 0.8), dark); lintel2.position.set(26, yGat + 5.1, -22.6); scene.add(lintel2);
  const packGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
  const packMat = new THREE.MeshBasicMaterial({ color: 0x5eead4 });
  for (let i = 0; i < 10; i++) { const p = new THREE.Mesh(packGeo, packMat); p.position.set(22 + Math.random() * 8, yGat + 4.2 + Math.random() * 1.4, -22.6 + (Math.random() - 0.5)); p.userData.o = Math.random() * 10; scene.add(p); anim.packets.push(p); }
  const yRes = pavilion(0, -32, "research", "RESEARCH", "deep-researcher — 43 refs, 157 observations", null);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(2.6, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x3a467f, roughness: 0.35, metalness: 0.5, flatShading: true }));
  dome.position.set(0, yRes + 0.6, -30.6); scene.add(dome); addBox(0, -30.6, 5.6, 5.6);
  const bookCols = [0xc9485e, 0x3f8f5f, 0x3f6dc9, 0xc9a13f, 0x8b6cff];
  for (let i = 0; i < 12; i++) { const bx = -3.4 + (i % 4) * 1.1; const bz = -30.2 + Math.floor(i / 4) * 0.9; const bh = 0.9 + (i % 3) * 0.5; const book = new THREE.Mesh(new THREE.BoxGeometry(0.8, bh, 0.7), new THREE.MeshStandardMaterial({ color: bookCols[i % 5], roughness: 0.7, flatShading: true })); book.position.set(bx, yRes + 0.6 + bh / 2, bz); scene.add(book); }
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; const ref = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.6, 0.35), stone); ref.position.set(Math.cos(a) * 4.6, yRes + 1.4, -30.6 + Math.sin(a) * 4.6); scene.add(ref); }
  const yLab = pavilion(0, 8, "homelab", "HOMELAB", "yormede — docker perso & tunnels", "lab", 7);
  const rack = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.6, 1.4), new THREE.MeshStandardMaterial({ color: 0x0d1328, roughness: 0.5, metalness: 0.6 }));
  rack.position.set(0, yLab + 2.4, 9.4); scene.add(rack); addBox(0, 9.4, 3.8, 1.8);
  for (let i = 0; i < 5; i++) { const slot = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.32), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x5eead4 : 0x8b6cff })); slot.position.set(0, yLab + 1.2 + i * 0.62, 8.68); slot.rotation.y = Math.PI; scene.add(slot); }
  const ctCols = [0xc9a13f, 0x3f8f5f, 0x3f6dc9]; const ctNames = ["CT100", "CT102", "CT104"];
  for (let i = 0; i < 3; i++) { const cb = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 2.2), new THREE.MeshStandardMaterial({ color: ctCols[i], roughness: 0.6, flatShading: true })); cb.position.set(-3.4 + i * 3.4, yLab + 1.35, 9.6); scene.add(cb); const cl = makeLabel(ctNames[i], i === 0 ? "narbonne — ne pas toucher" : (i === 1 ? "time manager ecole" : "portfolio ici")); cl.scale.setScalar(0.55); cl.position.set(-3.4 + i * 3.4, yLab + 2.9, 9.6); scene.add(cl); }
  addBox(-3.4, 9.6, 8.6, 2.6);
  const shY = heightAt(-42, -38);
  const grove = new THREE.Mesh(new THREE.CircleGeometry(9, 28), new THREE.MeshStandardMaterial({ color: 0x120a2e, roughness: 1 }));
  grove.rotation.x = -Math.PI / 2; grove.position.set(-42, shY + 0.06, -38); scene.add(grove);
  for (let i = -1; i <= 1; i += 2) { const pil = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.4, 0.8), violet); pil.position.set(-42 + i * 3.4, shY + 2.7, -38); scene.add(pil); }
  const toriiTop = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.7, 1), violet); toriiTop.position.set(-42, shY + 5.7, -38); scene.add(toriiTop);
  const torii2 = new THREE.Mesh(new THREE.BoxGeometry(7, 0.4, 0.7), dark); torii2.position.set(-42, shY + 4.7, -38); scene.add(torii2);
  const slabC = document.createElement("canvas"); slabC.width = 512; slabC.height = 256;
  const sg = slabC.getContext("2d"); sg.fillStyle = "#0d0718"; sg.fillRect(0, 0, 512, 256);
  sg.strokeStyle = "#8b6cff"; sg.lineWidth = 6; sg.strokeRect(10, 10, 492, 236);
  sg.fillStyle = "#cdbfff"; sg.font = "30px Inter,system-ui,sans-serif"; sg.textAlign = "center";
  sg.fillText("Discret dehors. Solide dedans.", 256, 80);
  sg.fillText("L\u2019ombre prouve en silence :", 256, 130);
  sg.fillText("hash, limites, constance.", 256, 178);
  sg.fillStyle = "#8b6cff"; sg.font = "bold 26px Inter,system-ui,sans-serif"; sg.fillText("Cid Kageno, Eminence in Shadow", 256, 220);
  const slabT = new THREE.CanvasTexture(slabC); slabT.colorSpace = THREE.SRGBColorSpace;
  const slab = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.2), new THREE.MeshBasicMaterial({ map: slabT, transparent: true }));
  slab.position.set(-42, shY + 2.2, -36.2); slab.rotation.y = Math.PI; scene.add(slab);
  const shLabel = makeLabel("JARDIN DE L\u2019OMBRE", "code SHADOW, signes subtils"); shLabel.position.set(-42, shY + 7.4, -38); scene.add(shLabel);
  const shRing = new THREE.Mesh(new THREE.TorusGeometry(3, 0.12, 8, 40), new THREE.MeshBasicMaterial({ color: 0x8b6cff, transparent: true, opacity: 0.6 }));
  shRing.rotation.x = -Math.PI / 2; shRing.position.set(-42, shY + 0.75, -34.5); scene.add(shRing); anim.rings.push(shRing);
  zones.push({ id: "shadow", x: -42, z: -34.5, r: 3.2, lockKey: null, visited: false });
  const shLight = new THREE.PointLight(0x8b6cff, 0, 30); shLight.position.set(-42, shY + 4, -37); scene.add(shLight);
  const fgN = 60; const fgPos = new Float32Array(fgN * 3);
  for (let i = 0; i < fgN; i++) { fgPos[i*3] = -42 + (Math.random() - 0.5) * 14; fgPos[i*3+1] = shY + 0.5 + Math.random() * 3.5; fgPos[i*3+2] = -38 + (Math.random() - 0.5) * 14; }
  const fgGeo = new THREE.BufferGeometry(); fgGeo.setAttribute("position", new THREE.BufferAttribute(fgPos, 3));
  const fireflies = new THREE.Points(fgGeo, new THREE.PointsMaterial({ color: 0xa78bfa, size: 0.22, transparent: true, opacity: 0 }));
  scene.add(fireflies); anim.fireflies = fireflies;
  const dY = heightAt(0, -46);
  const frame1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 8, 1.2), stone); frame1.position.set(-3.4, dY + 4, -46); scene.add(frame1);
  const frame2 = frame1.clone(); frame2.position.x = 3.4; scene.add(frame2);
  const lintelD = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 1.2), stone); lintelD.position.set(0, dY + 8.4, -46); scene.add(lintelD);
  addBox(-3.4, -46, 1.4, 1.4); addBox(3.4, -46, 1.4, 1.4);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x2b3a8f, roughness: 0.45, metalness: 0.45, flatShading: true });
  const leafL = new THREE.Mesh(new THREE.BoxGeometry(2.7, 7.4, 0.5), doorMat); leafL.position.set(-1.4, dY + 3.7, -46); scene.add(leafL);
  const leafR = new THREE.Mesh(new THREE.BoxGeometry(2.7, 7.4, 0.5), doorMat); leafR.position.set(1.4, dY + 3.7, -46); scene.add(leafR);
  const keyBig = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.18, 8, 24), gold); keyBig.position.set(0, dY + 10.2, -46); scene.add(keyBig); anim.key = keyBig; const doorGlow = new THREE.PointLight(0xffd98a, 30, 26); doorGlow.position.set(0, dY + 9, -44); scene.add(doorGlow);
  const lockMeshes = [];
  for (let i = 0; i < 3; i++) { const lm = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.12, 8, 20), new THREE.MeshBasicMaterial({ color: 0x3a467f })); lm.position.set(-1.8 + i * 1.8, dY + 5.4, -45.6); scene.add(lm); lockMeshes.push(lm); }
  const doorLabel = makeLabel("PORTE DE LA THESE", "3 serrures, explore les mondes"); doorLabel.position.set(0, dY + 12.2, -46); scene.add(doorLabel);
  zones.push({ id: "door", x: 0, z: -42.5, r: 3.6, lockKey: null, visited: false }); const leafCol = { x0: -2.9, x1: 2.9, z0: -46.6, z1: -45.4 }; colliders.push(leafCol);
  const trunkG = new THREE.CylinderGeometry(0.22, 0.3, 1.6, 5); const leafG = new THREE.ConeGeometry(1.4, 3.2, 6);
  const trunkM = new THREE.MeshStandardMaterial({ color: 0x4a3421, roughness: 0.9, flatShading: true });
  const leafM = new THREE.MeshStandardMaterial({ color: 0x1f6b4a, roughness: 0.85, flatShading: true });
  const treeSpots = [[12, 24], [-14, 26], [18, -6], [-18, -8], [10, -14], [-10, -12], [36, -8], [-38, -14], [14, -34], [-14, -40], [-34, -30], [38, 20], [-8, 22], [8, 30]];
  for (const ts of treeSpots) { const ty = heightAt(ts[0], ts[1]); const tr = new THREE.Mesh(trunkG, trunkM); tr.position.set(ts[0], ty + 0.8, ts[1]); scene.add(tr); const lf = new THREE.Mesh(leafG, leafM); lf.position.set(ts[0], ty + 3.2, ts[1]); lf.rotation.y = (ts[0] * 7 + ts[1] * 13) % 6; scene.add(lf); }
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.4; const lx = Math.cos(a) * 15; const lz = 4 + Math.sin(a) * 15; const ly = heightAt(lx, lz); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 3, 5), dark); pole.position.set(lx, ly + 1.5, lz); scene.add(pole); const bulb = new THREE.Mesh(new THREE.OctahedronGeometry(0.28), new THREE.MeshBasicMaterial({ color: 0xffd98a })); bulb.position.set(lx, ly + 3.2, lz); scene.add(bulb); const pl = new THREE.PointLight(0xffd98a, 6, 14); pl.position.set(lx, ly + 3.2, lz); scene.add(pl); }
  let shadowOn = false; let doorOpen = false; let doorT = 0;
  function setShadow(on) { shadowOn = on; shLight.intensity = on ? 40 : 0; fireflies.material.opacity = on ? 0.95 : 0; }
  function setLocks(n) { for (let i = 0; i < 3; i++) lockMeshes[i].material.color.set(n > i ? 0xffd98a : 0x3a467f); }
  function openDoor() { doorOpen = true; const i = colliders.indexOf(leafCol); if (i >= 0) colliders.splice(i, 1); }
  const seaPos = seaGeo.attributes.position;
  const seaBase = seaPos.array.slice();
  let seaOn = true;
  function update(dt, t, quality) {
    for (const r of anim.rings) { r.rotation.z += dt * 0.5; const s = 1 + Math.sin(t * 2 + r.position.x) * 0.04; r.scale.set(s, s, 1); }
    if (anim.key) anim.key.rotation.z += dt * 0.7;
    if (anim.hands) { anim.hands.minH.rotation.z = -t * 0.2; anim.hands.hourH.rotation.z = -t * 0.03; }
    for (const p of anim.packets) { p.position.x += dt * 2.2; if (p.position.x > 30.5) p.position.x = 21.5; p.rotation.x += dt * 2; p.rotation.y += dt; }
    if (anim.fireflies && anim.fireflies.material.opacity > 0) { const fp = anim.fireflies.geometry.attributes.position; for (let i = 0; i < fp.count; i++) fp.setY(i, fp.getY(i) + Math.sin(t * 2 + i) * dt * 0.35); fp.needsUpdate = true; }
    if (seaOn && quality !== "low") { for (let i = 0; i < seaPos.count; i++) { const bx = seaBase[i * 3]; const bz = seaBase[i * 3 + 2]; seaPos.setY(i, Math.sin(bx * 0.08 + t * 1.1) * 0.5 + Math.cos(bz * 0.06 + t * 0.8) * 0.5); } seaPos.needsUpdate = true; seaGeo.computeVertexNormals(); }
    if (doorOpen && doorT < 1) { doorT = Math.min(1, doorT + dt * 0.5); leafL.position.x = -1.4 - doorT * 2.4; leafR.position.x = 1.4 + doorT * 2.4; }
  }
  function setSea(on) { seaOn = on; }
  return { colliders, zones, update, setShadow, setLocks, openDoor, setSea, isDoorOpen: () => doorOpen };
}
