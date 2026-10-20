import { heightAt } from "./world.js";
export function createPlayer(scene, THREE, world, sfx, hooks) {
  const group = new THREE.Group();
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.42), new THREE.MeshStandardMaterial({ color: 0xffd98a, emissive: 0x7a5200, emissiveIntensity: 1.1, roughness: 0.25, metalness: 0.4, flatShading: true }));
  group.add(core);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.05, 6, 24), new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.8 }));
  halo.rotation.x = Math.PI / 2.3; group.add(halo);
  const glow = new THREE.PointLight(0xffd98a, 8, 12); group.add(glow);
  const tn = 36; const tPos = new Float32Array(tn * 3);
  const tGeo = new THREE.BufferGeometry(); tGeo.setAttribute("position", new THREE.BufferAttribute(tPos, 3));
  const trail = new THREE.Points(tGeo, new THREE.PointsMaterial({ color: 0x5eead4, size: 0.16, transparent: true, opacity: 0.7 }));
  trail.frustumCulled = false; scene.add(trail);
  let ti = 0; let trailT = 0;
  const pos = new THREE.Vector3(0, 0, 30); pos.y = heightAt(0, 30) + 0.9;
  group.position.copy(pos); scene.add(group);
  const keys = {}; let camYaw = 0; let camPitch = 0.42; let camDist = 7.5;
  let joyX = 0; let joyY = 0; let joyId = null; let joyOX = 0; let joyOY = 0; let lookId = null; let lookX = 0;
  let frozen = false; let stepT = 0;
  addEventListener("keydown", (e) => { keys[e.code] = true; if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault(); });
  addEventListener("keyup", (e) => { keys[e.code] = false; });
  const cv = document.getElementById("sea");
  let dragging = false; let lastPX = 0; let lastPY = 0;
  cv.addEventListener("pointerdown", (e) => { if (e.pointerType === "touch") return; dragging = true; lastPX = e.clientX; lastPY = e.clientY; });
  addEventListener("pointermove", (e) => { if (!dragging || e.pointerType === "touch") return; camYaw -= (e.clientX - lastPX) * 0.0052; camPitch += (e.clientY - lastPY) * 0.003; camPitch = Math.max(0.15, Math.min(1.1, camPitch)); lastPX = e.clientX; lastPY = e.clientY; });
  addEventListener("pointerup", () => { dragging = false; });
  addEventListener("wheel", (e) => { camDist = Math.max(5, Math.min(11, camDist + e.deltaY * 0.005)); }, { passive: true });
  const joyEl = document.getElementById("joy"); const knob = document.getElementById("knob");
  function touchPos(e) { const t = e.changedTouches[0]; return { x: t.clientX, y: t.clientY, id: t.identifier }; }
  addEventListener("touchstart", (e) => { for (const t of e.changedTouches) { if (t.clientX < innerWidth / 2 && joyId === null) { joyId = t.identifier; joyOX = t.clientX; joyOY = t.clientY; if (joyEl) { joyEl.style.left = joyOX + "px"; joyEl.style.top = joyOY + "px"; joyEl.style.display = "block"; } } else if (lookId === null) { lookId = t.identifier; lookX = t.clientX; } } }, { passive: true });
  addEventListener("touchmove", (e) => { for (const t of e.changedTouches) { if (t.identifier === joyId) { joyX = Math.max(-1, Math.min(1, (t.clientX - joyOX) / 55)); joyY = Math.max(-1, Math.min(1, (t.clientY - joyOY) / 55)); if (knob) knob.style.transform = "translate(" + joyX * 34 + "px," + joyY * 34 + "px)"; } else if (t.identifier === lookId) { camYaw -= (t.clientX - lookX) * 0.007; lookX = t.clientX; } } }, { passive: true });
  addEventListener("touchend", (e) => { for (const t of e.changedTouches) { if (t.identifier === joyId) { joyId = null; joyX = 0; joyY = 0; if (joyEl) joyEl.style.display = "none"; if (knob) knob.style.transform = "translate(0,0)"; } if (t.identifier === lookId) lookId = null; } }, { passive: true });
  function collide(px, pz) {
    const r = 0.6;
    for (const c of world.colliders) {
      if (px > c.x0 - r && px < c.x1 + r && pz > c.z0 - r && pz < c.z1 + r) {
        const dx0 = px - (c.x0 - r); const dx1 = (c.x1 + r) - px; const dz0 = pz - (c.z0 - r); const dz1 = (c.z1 + r) - pz;
        const m = Math.min(dx0, dx1, dz0, dz1);
        if (m === dx0) px = c.x0 - r; else if (m === dx1) px = c.x1 + r; else if (m === dz0) pz = c.z0 - r; else pz = c.z1 + r;
      }
    }
    return [px, pz];
  }
  function teleport(id) {
    const z = world.zones.find((q) => q.id === id); if (!z) return;
    pos.set(z.x, heightAt(z.x, z.z + 1.5) + 0.9, z.z + 1.5);
    camYaw = Math.atan2(pos.x - z.x, pos.z - z.z);
  }
  function update(dt, camera, t, reduced) {
    let ix = 0; let iz = 0;
    if (!frozen) {
      if (keys["KeyW"] || keys["KeyZ"] || keys["ArrowUp"]) iz -= 1;
      if (keys["KeyS"] || keys["ArrowDown"]) iz += 1;
      if (keys["KeyA"] || keys["KeyQ"] || keys["ArrowLeft"]) ix -= 1;
      if (keys["KeyD"] || keys["ArrowRight"]) ix += 1;
      ix += joyX; iz += joyY;
    }
    const moving = (ix !== 0 || iz !== 0);
    const sprint = keys["ShiftLeft"] || keys["ShiftRight"];
    const speed = sprint ? 10 : 6;
    if (moving) {
      const len = Math.hypot(ix, iz) || 1; ix /= len; iz /= len;
      const sy = Math.sin(camYaw); const cy = Math.cos(camYaw);
      let nx = pos.x + (ix * cy + iz * sy) * speed * dt;
      let nz = pos.z + (-ix * sy + iz * cy) * speed * dt;
      const rr = Math.hypot(nx, nz);
      if (rr > 58) { nx *= 58 / rr; nz *= 58 / rr; }
      const fixed = collide(nx, nz); pos.x = fixed[0]; pos.z = fixed[1];
      stepT += dt;
      if (stepT > 0.34) { stepT = 0; sfx.step(); }
    }
    const bob = reduced ? 0 : Math.sin(t * 3.2) * 0.12;
    pos.y = heightAt(pos.x, pos.z) + 0.9 + bob;
    group.position.copy(pos);
    if (!reduced) { core.rotation.y += dt * 2.2; halo.rotation.z += dt * 1.4; }
    trailT += dt;
    if (trailT > 0.09 && moving) { trailT = 0; tPos[ti * 3] = pos.x; tPos[ti * 3 + 1] = pos.y; tPos[ti * 3 + 2] = pos.z; ti = (ti + 1) % tn; tGeo.attributes.position.needsUpdate = true; }
    for (const z of world.zones) {
      const d = Math.hypot(pos.x - z.x, pos.z - z.z);
      if (d < z.r && !z._inside) { z._inside = true; hooks.onZone(z); }
      else if (d >= z.r + 0.8) z._inside = false;
    }
    const cd = camDist; const ch = Math.sin(camPitch) * cd; const hd = Math.cos(camPitch) * cd;
    const tx = pos.x + Math.sin(camYaw) * hd; const tz = pos.z + Math.cos(camYaw) * hd;
    const ty = pos.y + ch;
    camera.position.x += (tx - camera.position.x) * Math.min(1, dt * 7);
    camera.position.y += (ty - camera.position.y) * Math.min(1, dt * 7);
    camera.position.z += (tz - camera.position.z) * Math.min(1, dt * 7);
    camera.lookAt(pos.x, pos.y + 1.2, pos.z);
    return moving;
  }
  function setFrozen(f) { frozen = f; }
  return { group, pos, update, teleport, setFrozen, getCamYaw: () => camYaw };
}

