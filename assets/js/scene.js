/* ==========================================================================
   A.C. PERSONAL TRAINER — Scena 3D (Three.js)
   Manubrio in oro, anelli ispirati allo scudo del logo, polvere d'oro.
   ========================================================================== */
import * as THREE from 'three';
import { RoomEnvironment } from '../vendor/three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('webgl');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmall = () => window.innerWidth < 760;
const isTouch = window.matchMedia('(hover: none)').matches;

// Resolution budget: retina screens don't need MSAA, and the pixel ratio is capped
// (and lowered at runtime if the device can't keep up — see adaptQuality()).
const MAX_DPR = Math.min(window.devicePixelRatio || 1, isTouch ? 1.5 : 1.6);
let dpr = MAX_DPR;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: (window.devicePixelRatio || 1) < 1.5, alpha: true, powerPreference: 'high-performance', stencil: false });
} catch (err) {
  window.dispatchEvent(new Event('ac:scene-failed'));
  throw err;
}
renderer.setPixelRatio(dpr);
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 9);

// Reflections
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.9;

/* ---------- Lights ---------- */
scene.add(new THREE.AmbientLight(0xfff1d6, 0.15));
const key = new THREE.DirectionalLight(0xffe2a8, 2.4);
key.position.set(4, 5, 6);
scene.add(key);
const rim = new THREE.PointLight(0xff3324, 30, 20, 2);
rim.position.set(-3, -1.5, -3);
scene.add(rim);
const mouseLight = new THREE.PointLight(0xffd27a, 18, 14, 2);
mouseLight.position.set(0, 0, 4);
scene.add(mouseLight);

/* ---------- Materials ---------- */
function makeKnurlTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#777';
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = '#fff';
  g.lineWidth = 2;
  for (let i = -128; i < 256; i += 8) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 128, 128); g.stroke();
    g.beginPath(); g.moveTo(i + 128, 0); g.lineTo(i, 128); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(10, 2);
  return t;
}
const knurl = makeKnurlTexture();

const gold = new THREE.MeshStandardMaterial({ color: 0xd8a648, metalness: 1, roughness: 0.18 });
const goldDark = new THREE.MeshStandardMaterial({ color: 0x9c7128, metalness: 1, roughness: 0.38 });
const steel = new THREE.MeshStandardMaterial({ color: 0xc9c3b8, metalness: 1, roughness: 0.32, bumpMap: knurl, bumpScale: 0.6, roughnessMap: knurl });
const crimson = new THREE.MeshStandardMaterial({ color: 0x8f1d1a, metalness: 0.4, roughness: 0.25, emissive: 0x2a0503 });

/* ---------- Dumbbell ---------- */
function plateGeometry(R, t) {
  const h = t / 2, pts = [
    [0.1, -h - 0.015], [0.2, -h - 0.015], [0.23, -h + 0.02], [R * 0.74, -h + 0.02], [R * 0.8, -h],
    [R - 0.035, -h], [R, -h + 0.035], [R, h - 0.035], [R - 0.035, h],
    [R * 0.8, h], [R * 0.74, h - 0.02], [0.23, h - 0.02], [0.2, h + 0.015], [0.1, h + 0.015]
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(pts, 96);
  g.computeVertexNormals();
  return g;
}

const dumbbell = new THREE.Group();
const parts = []; // pieces that fly apart in the "exploded" view
function track(mesh, side, k) { mesh.userData.explode = { baseY: mesh.position.y, side, k }; parts.push(mesh); }
const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 1.5, 48), steel);
dumbbell.add(handle);

const plates = [
  { R: 0.66, t: 0.16 },
  { R: 0.56, t: 0.14 },
  { R: 0.46, t: 0.12 }
];
[-1, 1].forEach((side) => {
  let y = 0.78;
  // inner collar
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 48), goldDark);
  collar.position.y = side * (y - 0.04);
  dumbbell.add(collar);
  track(collar, side, 0.25);
  plates.forEach(({ R, t }, i) => {
    const p = new THREE.Mesh(plateGeometry(R, t), gold);
    y += t / 2;
    p.position.y = side * y;
    y += t / 2 + 0.012;
    dumbbell.add(p);
    track(p, side, 0.65 + i * 0.5);
    if (i === 0) {
      // crimson inlay ring, like the shield in the logo
      const ring = new THREE.Mesh(new THREE.TorusGeometry(R * 0.6, 0.022, 16, 96), crimson);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = p.position.y - side * (t / 2 - 0.01); // inner face
      dumbbell.add(ring);
      track(ring, side, 0.65);
    }
  });
  // end sleeve + cap
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.18, 48), steel);
  sleeve.position.y = side * (y + 0.08);
  dumbbell.add(sleeve);
  track(sleeve, side, 2.2);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.06, 48), gold);
  cap.position.y = side * (y + 0.2);
  cap.rotation.x = side > 0 ? 0 : Math.PI;
  dumbbell.add(cap);
  track(cap, side, 2.7);
});
dumbbell.rotation.z = Math.PI / 2;

const hero = new THREE.Group();
const dbPivot = new THREE.Group();
dbPivot.add(dumbbell);
hero.add(dbPivot);
scene.add(hero);

/* ---------- Shield rings ---------- */
const rings = new THREE.Group();
const ringMat = new THREE.MeshStandardMaterial({ color: 0xd4a64a, metalness: 1, roughness: 0.3, transparent: true, opacity: 0.9 });
const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.014, 12, 220), ringMat);
const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.006, 8, 220), ringMat);
rings.add(ringA, ringB);

// studs around the shield (like the bronze rivets)
const studGeo = new THREE.SphereGeometry(0.035, 16, 12);
const studs = new THREE.InstancedMesh(studGeo, gold, 36);
const m4 = new THREE.Matrix4();
for (let i = 0; i < 36; i++) {
  const a = (i / 36) * Math.PI * 2;
  m4.makeTranslation(Math.cos(a) * 2.4, Math.sin(a) * 2.4, 0);
  studs.setMatrixAt(i, m4);
}
rings.add(studs);

// laurel-like dashes
const dashGeo = new THREE.BoxGeometry(0.16, 0.02, 0.02);
const dashMat = new THREE.MeshStandardMaterial({ color: 0x9c7128, metalness: 1, roughness: 0.4, transparent: true, opacity: 0.6 });
const dashes = new THREE.InstancedMesh(dashGeo, dashMat, 90);
const q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1), pos = new THREE.Vector3();
for (let i = 0; i < 90; i++) {
  const a = (i / 90) * Math.PI * 2;
  pos.set(Math.cos(a) * 2.9, Math.sin(a) * 2.9, 0);
  q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), a + Math.PI / 2 + 0.5);
  m4.compose(pos, q, s);
  dashes.setMatrixAt(i, m4);
}
rings.add(dashes);
rings.position.z = -1.2;
hero.add(rings);

/* ---------- Glow sprite behind the dumbbell ---------- */
function radialTexture(stops) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const glow = new THREE.Sprite(new THREE.SpriteMaterial({
  map: radialTexture([[0, 'rgba(240,190,90,.55)'], [0.4, 'rgba(180,110,40,.18)'], [1, 'rgba(0,0,0,0)']]),
  blending: THREE.AdditiveBlending, depthWrite: false, transparent: true
}));
glow.scale.set(7, 7, 1);
glow.position.z = -2;
hero.add(glow);

/* ---------- Gold dust (animated entirely on the GPU) ---------- */
const COUNT = isSmall() ? 600 : 1400;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(COUNT * 3);
const pCol = new Float32Array(COUNT * 3);
const pSpeed = new Float32Array(COUNT);
const PALETTE = { gold: [0.953, 0.824, 0.494], red: [1, 0.29, 0.188], pale: [1, 0.949, 0.8] };
for (let i = 0; i < COUNT; i++) {
  pPos[i * 3] = (Math.random() - 0.5) * 24;
  pPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
  pPos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
  const c = Math.random() < 0.08 ? PALETTE.red : Math.random() < 0.3 ? PALETTE.pale : PALETTE.gold;
  pCol.set(c, i * 3);
  pSpeed[i] = 0.2 + Math.random() * 0.8;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
pGeo.setAttribute('aColor', new THREE.BufferAttribute(pCol, 3));
pGeo.setAttribute('aSpeed', new THREE.BufferAttribute(pSpeed, 1));
const dustMat = new THREE.ShaderMaterial({
  uniforms: { uOffset: { value: 0 }, uSize: { value: 0.06 }, uScale: { value: 400 }, uOpacity: { value: 0.85 } },
  vertexShader: `
    attribute vec3 aColor;
    attribute float aSpeed;
    uniform float uOffset, uSize, uScale;
    varying vec3 vColor;
    void main() {
      vec3 p = position;
      p.y = mod(p.y + uOffset * aSpeed + 20.0, 40.0) - 20.0;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = uSize * uScale / -mv.z;
      vColor = aColor;
    }`,
  fragmentShader: `
    uniform float uOpacity;
    varying vec3 vColor;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.0, d);
      a *= a * uOpacity;
      gl_FragColor = vec4(vColor * a, a);
    }`,
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false
});
const dust = new THREE.Points(pGeo, dustMat);
dust.frustumCulled = false;
scene.add(dust);

/* ---------- Layout ---------- */
function layout() {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  dustMat.uniforms.uScale.value = h * dpr * 0.5;
  const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
  const visW = visH * camera.aspect;
  if (w < 760) {
    hero.userData.base = { x: 0, y: visH * 0.25, s: 0.46 };
  } else if (w < 1100) {
    hero.userData.base = { x: visW * 0.3, y: 0.1, s: 0.66 };
  } else {
    hero.userData.base = { x: visW * 0.27, y: 0, s: 0.86 };
  }
}
layout();
// Mobile browsers fire resize while the URL bar slides in/out during scroll:
// reallocating the canvas then causes a visible hitch, so ignore height-only jitter.
let lastW = window.innerWidth, lastH = window.innerHeight, resizeT = 0;
window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight;
  if (isTouch && w === lastW && Math.abs(h - lastH) < 160) return;
  clearTimeout(resizeT);
  resizeT = setTimeout(() => { lastW = w; lastH = h; layout(); if (reduceMotion) render(); }, 120);
});

/* ---------- Interaction state ---------- */
const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
window.addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
}, { passive: true });

// gyroscope parallax on mobile (when allowed without prompt)
window.addEventListener('deviceorientation', (e) => {
  if (e.gamma == null) return;
  pointer.x = THREE.MathUtils.clamp(e.gamma / 30, -1, 1);
  pointer.y = THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1) * -1;
}, { passive: true });

let introT = reduceMotion ? 1 : 0;
let introStarted = reduceMotion;
window.addEventListener('ac:intro', () => { introStarted = true; });

let burst = 0;
window.addEventListener('ac:burst', () => { burst = 1; });

/* ---------- Render loop ---------- */
const clock = new THREE.Clock();
let running = true;
const ticker = window.gsap && window.gsap.ticker;
document.addEventListener('visibilitychange', () => {
  running = !document.hidden;
  if (running) clock.getDelta();                 // don't jump after a hidden tab
  if (running && !reduceMotion && !ticker) requestAnimationFrame(tick);
});

const easeOut = (t) => 1 - Math.pow(1 - t, 4);

// Scroll-driven values are eased a little so the 3D motion glides instead of
// stepping with each wheel tick.
const sm = { travel: 0, pin: 0, exit: 0, init: false };
function smoothState(src, dt) {
  if (!sm.init) { sm.travel = src.travel; sm.pin = src.pin; sm.exit = src.exit; sm.init = true; }
  const k = 1 - Math.exp(-dt * 9);
  sm.travel += (src.travel - sm.travel) * k;
  sm.pin += (src.pin - sm.pin) * k;
  sm.exit += (src.exit - sm.exit) * k;
  return sm;
}

// Lower the resolution step by step if frames take too long (weak GPUs).
let sampleT = 0, sampleN = 0, warmup = 2.5;
function adaptQuality(dt) {
  if (warmup > 0) { warmup -= dt; return; }
  sampleT += dt; sampleN++;
  if (sampleN < 50) return;
  const avg = sampleT / sampleN;
  sampleT = 0; sampleN = 0;
  if (avg > 1 / 45 && dpr > 1) {
    dpr = Math.max(1, dpr - 0.25);
    renderer.setPixelRatio(dpr);
    layout();
  }
}

function render() {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (!reduceMotion) adaptQuality(dt);
  const t = clock.elapsedTime;
  const vh = window.innerHeight;
  const scroll = window.scrollY / vh;             // 0 → 1 across the hero
  const heroP = THREE.MathUtils.clamp(scroll, 0, 1.4);
  const base = hero.userData.base;

  if (introStarted && introT < 1) introT = Math.min(1, introT + dt * 0.55);
  const ie = easeOut(introT);

  const kp = 1 - Math.exp(-dt * 3);               // frame-rate independent easing
  pointer.sx += (pointer.x - pointer.sx) * kp;
  pointer.sy += (pointer.y - pointer.sy) * kp;

  // Choreography driven by main.js (window.AC_STATE):
  //   travel 0→1  dumbbell glides from the hero to the centre of the screen
  //   pin    0→1  pinned manifesto: rotation + exploded view
  //   exit   0→1  flies away after the manifesto
  const st = window.AC_STATE ? smoothState(window.AC_STATE, dt) : null;
  const smooth = (v) => v * v * (3 - 2 * v);
  const spin = reduceMotion ? 0 : t * 0.35;
  let x, y, sc, fade, explode = 0, pin = 0;
  const hx = base.x + pointer.sx * 0.25;
  const hy = base.y + Math.sin(t * 0.8) * 0.08 + pointer.sy * 0.15;

  if (st) {
    const tr = smooth(THREE.MathUtils.clamp(st.travel, 0, 1));
    const ex = THREE.MathUtils.clamp(st.exit, 0, 1);
    pin = THREE.MathUtils.clamp(st.pin, 0, 1);
    explode = smooth(Math.pow(Math.sin(pin * Math.PI), 0.8));
    const cs = base.s * (isSmall() ? 1.15 : 0.95);
    x = THREE.MathUtils.lerp(hx, pointer.sx * 0.15, tr);
    y = THREE.MathUtils.lerp(hy, Math.sin(t * 0.8) * 0.05, tr) + ex * ex * 5;
    sc = THREE.MathUtils.lerp(base.s, cs, tr) * (0.4 + 0.6 * ie) * (1 - ex * 0.45);
    fade = 1 - ex;
    dbPivot.rotation.y = spin + (1 - ie) * -4 + tr * Math.PI + pin * Math.PI * 2 + pointer.sx * 0.6;
    dbPivot.rotation.x = 0.35 + pointer.sy * -0.4 + tr * 0.25 + explode * 0.35 + ex * 1.2;
  } else {
    // fallback (no GSAP / reduced motion): simple exit with the hero
    const heroP = THREE.MathUtils.clamp(scroll, 0, 1.4);
    x = hx - heroP * (isSmall() ? 0 : 1.2);
    y = hy + heroP * 3.2;
    sc = base.s * (0.4 + 0.6 * ie) * (1 - heroP * 0.35);
    fade = 1 - heroP / 1.35;
    dbPivot.rotation.y = spin + (1 - ie) * -4 + heroP * 3 + pointer.sx * 0.6;
    dbPivot.rotation.x = 0.35 + pointer.sy * -0.4 + heroP * 0.8;
  }
  fade = THREE.MathUtils.clamp(fade, 0, 1);
  hero.position.set(x, y, 0);
  hero.scale.setScalar(sc);
  hero.visible = fade > 0.01;
  dbPivot.rotation.z = -0.25 + Math.sin(t * 0.5) * 0.06;

  // exploded view: every piece slides out along the bar
  for (const m of parts) {
    const { baseY, side, k } = m.userData.explode;
    m.position.y = baseY + side * k * explode * 0.62;
    m.position.x = Math.sin(k * 5) * explode * 0.12;
  }

  rings.rotation.z = (reduceMotion ? 0 : t * 0.08) + pin * Math.PI;
  rings.rotation.x = 0.2 + pointer.sy * 0.25 + explode * 0.5;
  rings.rotation.y = -0.35 + pointer.sx * 0.35 - explode * 0.4;
  rings.scale.setScalar(1 + explode * 0.35);
  ringMat.opacity = 0.9 * ie * fade;
  dashMat.opacity = 0.55 * ie * fade;
  glow.material.opacity = ie * fade * (1 + explode * 0.4);
  camera.userData.dolly = explode;

  // light follows pointer
  mouseLight.position.x = hero.position.x + pointer.sx * 4;
  mouseLight.position.y = pointer.sy * 3;

  // dust: drift up, parallax with scroll, burst on quiz result
  burst = Math.max(0, burst - dt * 0.6);
  if (!reduceMotion) dustMat.uniforms.uOffset.value += (0.15 + burst * 4 + (camera.userData.dolly || 0) * 1.2) * dt;
  dust.position.y = scroll * 2.2;
  dust.rotation.y = pointer.sx * 0.08 + (reduceMotion ? 0 : t * 0.01);
  dustMat.uniforms.uOpacity.value = 0.85 * (0.35 + 0.65 * ie);

  camera.position.z = 9 - (camera.userData.dolly || 0) * 1.4;
  camera.position.x = pointer.sx * 0.3;
  camera.position.y = pointer.sy * 0.2;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

function tick() {
  if (!running) return;
  render();
  if (!ticker) requestAnimationFrame(tick);
}

render();
window.dispatchEvent(new Event('ac:scene-ready'));
if (reduceMotion) {
  window.addEventListener('scroll', render, { passive: true });
} else if (ticker) {
  // Same frame clock as Lenis + ScrollTrigger: scroll position and 3D stay in sync.
  ticker.add(tick);
} else {
  requestAnimationFrame(tick);
}
