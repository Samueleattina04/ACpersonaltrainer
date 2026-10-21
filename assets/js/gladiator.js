/* ==========================================================================
   A.C. PERSONAL TRAINER — Gladiatore 3D procedurale
   Statua in argento e oro ispirata al logo: elmo corinzio con cresta,
   fascia rossa, bracciale d'oro, curl con il manubrio.
   ========================================================================== */
import * as THREE from 'three';

const gauss = (d2, s) => Math.exp(-d2 / (s * s));
const smooth = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

/* Lathe around Y with the seam at the back (phi = PI), so the front is seamless. */
function lathe(points, segments = 64, phiStart = Math.PI, phiLength = Math.PI * 2) {
  return new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments, phiStart, phiLength);
}

/* Muscular torso: a lathe deformed with pecs, abs and lats.
   The same deform() is used to place the sash exactly on the surface. */
const TORSO = [
  [0.0, -1.05], [0.43, -1.05], [0.46, -0.94], [0.48, -0.66], [0.55, -0.34], [0.67, -0.04],
  [0.79, 0.22], [0.84, 0.4], [0.78, 0.56], [0.56, 0.67], [0.3, 0.74], [0.0, 0.77]
];
function torsoRadius(y) {
  for (let i = 1; i < TORSO.length; i++) {
    const [r1, y1] = TORSO[i];
    if (y <= y1) { const [r0, y0] = TORSO[i - 1]; return r0 + (r1 - r0) * ((y - y0) / (y1 - y0 || 1)); }
  }
  return 0;
}
const lat = (y) => 1.08 * (1 + 0.12 * gauss((y - 0.15) ** 2, 0.3));     // V-taper
function bumps(x, y, front) {
  let dz = 0;
  for (const cx of [-0.31, 0.31]) dz += 0.14 * front * gauss((x - cx) ** 2 + ((y - 0.3) ** 2) * 1.4, 0.22);  // pecs
  for (const cy of [-0.1, -0.32, -0.54]) for (const cx of [-0.12, 0.12]) {
    dz += 0.045 * front * Math.exp(-((x - cx) ** 2) / 0.0064 - ((y - cy) ** 2) / 0.0075);                    // abs
  }
  dz -= 0.028 * front * gauss(x * x, 0.035) * (y < 0.16 ? 1 : 0.3);                                          // linea alba
  return dz;
}
function deform(x0, y, z0) {
  const r = Math.hypot(x0, z0) || 1e-4;
  const x = x0 * lat(y);
  return new THREE.Vector3(x, y, z0 * 0.6 + bumps(x, y, Math.max(0, z0 / r)));
}
/* Point on the torso surface at (x, y), front (side = 1) or back (side = -1). */
function torsoSurface(x, y, side, lift) {
  const r = torsoRadius(y);
  const x0 = THREE.MathUtils.clamp(x / lat(y), -r * 0.995, r * 0.995);
  const z0 = side * Math.sqrt(Math.max(r * r - x0 * x0, 1e-4));
  const p = deform(x0, y, z0);
  const n = new THREE.Vector3(x0 / r, 0, side * Math.abs(z0) / r).normalize();
  return p.addScaledVector(n, lift);
}
function torsoGeometry() {
  const g = lathe(TORSO, 96);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const v = deform(p.getX(i), p.getY(i), p.getZ(i));
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/* Tapered limb along -Y with a muscle bulge. */
function limbGeometry(len, r0, bulge, r1, bulgeAt = 0.42) {
  return lathe([
    [0.001, 0.02], [r0 * 0.75, 0.0], [r0, -0.07], [bulge, -len * bulgeAt],
    [r1 * 1.06, -len * 0.86], [r1 * 0.72, -len - 0.02], [0.001, -len - 0.04]
  ], 40);
}

export function createGladiator({ gold, goldDark, crimson, dumbbell }) {
  const skin = new THREE.MeshStandardMaterial({ color: 0x8c877e, metalness: 0.62, roughness: 0.4 });
  const shade = new THREE.MeshStandardMaterial({ color: 0x0c0a08, metalness: 0.3, roughness: 0.7 });
  const leather = new THREE.MeshStandardMaterial({ color: 0x4d2114, metalness: 0.35, roughness: 0.55 });
  const goldShell = gold.clone();
  goldShell.side = THREE.DoubleSide;
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffc56a });

  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  /* --- Torso, neck, shoulders --- */
  const torso = new THREE.Mesh(torsoGeometry(), skin);
  body.add(torso);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.24, 0.42, 32), skin);
  neck.position.y = 0.86;
  body.add(neck);

  for (const sx of [-1, 1]) {
    const trap = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), skin);
    trap.scale.set(0.36, 0.15, 0.24);
    trap.position.set(sx * 0.32, 0.69, -0.04);
    body.add(trap);
    const delt = new THREE.Mesh(new THREE.SphereGeometry(0.25, 40, 24), skin);
    delt.scale.set(0.95, 1.05, 0.9);
    delt.position.set(sx * 0.86, 0.5, 0);
    body.add(delt);
  }

  /* --- Belt + pteruges (leather strips) --- */
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.065, 14, 72), gold);
  belt.rotation.x = Math.PI / 2;
  belt.scale.set(1, 0.64, 1);
  belt.position.y = -0.97;
  body.add(belt);
  const stripGeo = new THREE.BoxGeometry(0.12, 0.4, 0.03);
  const tipGeo = new THREE.BoxGeometry(0.12, 0.05, 0.035);
  for (let i = 0; i < 16; i++) {
    const a = -Math.PI * 0.95 + (i / 15) * Math.PI * 1.9;      // around the hips, front-centred
    const strip = new THREE.Group();
    strip.position.set(Math.sin(a) * 0.5, -1.2, Math.cos(a) * 0.32);
    strip.rotation.y = a;
    strip.rotation.x = 0.12;
    const s1 = new THREE.Mesh(stripGeo, leather);
    const s2 = new THREE.Mesh(tipGeo, gold);
    s2.position.y = -0.2;
    strip.add(s1, s2);
    body.add(strip);
  }

  /* --- Sash: three folds draped from the right shoulder, across the chest, to the left hip --- */
  for (let k = -1; k <= 1; k++) {
    const off = k * 0.08, lift = 0.045 - Math.abs(k) * 0.008;
    const pts = [
      torsoSurface(0.36 + off, 0.4, -1, lift),                        // on the back
      new THREE.Vector3(0.5 + off * 0.4, 0.7 + lift, -0.02),         // over the shoulder
    ];
    for (let i = 0; i <= 10; i++) {
      const u = i / 10;
      pts.push(torsoSurface(THREE.MathUtils.lerp(0.56, -0.5, u) + off * 0.7, THREE.MathUtils.lerp(0.58, -0.86, u) + off, 1, lift + 0.01));
    }
    pts.push(torsoSurface(-0.62, -0.9 + off, -1, lift).setZ(-0.05));   // round the hip
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    body.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 140, 0.052 - Math.abs(k) * 0.01, 10), crimson));
  }

  /* --- Head + Corinthian helmet --- */
  const head = new THREE.Group();
  head.position.y = 1.2;
  head.scale.setScalar(1.14);
  body.add(head);
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.27, 32, 24), shade);
  face.scale.set(0.95, 1.05, 1);
  head.add(face);
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 8), eyeMat);
    eye.position.set(sx * 0.085, 0.0, 0.255);
    head.add(eye);
  }

  const helmet = new THREE.Group();
  head.add(helmet);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.335, 56, 28, 0, Math.PI * 2, 0, Math.PI * 0.56), gold);
  dome.position.y = 0.02;
  helmet.add(dome);
  const brow = new THREE.Mesh(new THREE.TorusGeometry(0.325, 0.03, 12, 72), gold);
  brow.rotation.x = Math.PI / 2;
  brow.position.y = -0.04;
  helmet.add(brow);
  const GAP = 1.0;                                     // face opening (radians)
  const guard = new THREE.Mesh(lathe([
    [0.335, -0.03], [0.342, -0.15], [0.336, -0.27], [0.315, -0.37], [0.285, -0.42]
  ], 56, GAP / 2, Math.PI * 2 - GAP), goldShell);
  helmet.add(guard);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.22, 0.045), gold);
  nose.position.set(0, -0.13, 0.335);
  helmet.add(nose);
  for (const sx of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.035), gold);
    cheek.position.set(sx * 0.12, -0.3, 0.29);
    cheek.rotation.y = sx * 0.45;
    helmet.add(cheek);
    const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), goldDark);
    rivet.position.set(sx * 0.3, -0.12, 0.12);
    helmet.add(rivet);
  }

  // crest: a fan of blades along an arc, front to back
  const crest = new THREE.Group();
  crest.position.y = 0.06;
  helmet.add(crest);
  const CR = 0.4, A0 = 0.22, A1 = Math.PI - 0.12, N = 40;
  const arcPts = [];
  for (let i = 0; i <= 24; i++) {
    const a = A0 + (A1 - A0) * (i / 24);
    arcPts.push(new THREE.Vector3(0, Math.sin(a) * CR, Math.cos(a) * CR));
  }
  crest.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arcPts), 48, 0.035, 10), goldDark));
  const blade = new THREE.BoxGeometry(0.05, 1, 0.075);
  blade.translate(0, 0.5, 0);
  const bladesA = new THREE.InstancedMesh(blade, gold, Math.ceil(N / 2));
  const bladesB = new THREE.InstancedMesh(blade, goldDark, Math.floor(N / 2));
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3();
  const X = new THREE.Vector3(1, 0, 0);
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    const a = A0 + (A1 - A0) * u;
    const h = 0.14 + 0.22 * Math.sin(Math.PI * Math.pow(u, 0.8));
    pos.set(0, Math.sin(a) * CR, Math.cos(a) * CR);
    q.setFromAxisAngle(X, Math.PI / 2 - a);           // blade points away from the arc centre
    sc.set(1, h, 1);
    m.compose(pos, q, sc);
    (i % 2 ? bladesB : bladesA).setMatrixAt(i >> 1, m);
  }
  crest.add(bladesA, bladesB);

  /* --- Arms --- */
  const upperGeo = limbGeometry(0.82, 0.21, 0.25, 0.15);
  const foreGeo = limbGeometry(0.74, 0.17, 0.195, 0.1, 0.28);
  const jointGeo = new THREE.SphereGeometry(0.152, 32, 20);
  function arm(side) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.9, 0.46, 0);
    shoulder.rotation.z = side * 0.13;
    body.add(shoulder);
    const upper = new THREE.Mesh(upperGeo, skin);
    shoulder.add(upper);
    const bicep = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 16), skin);
    bicep.position.set(0, -0.4, 0.07);
    bicep.scale.set(1.1, 1.9, 1);
    shoulder.add(bicep);
    const tricep = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 16), skin);
    tricep.position.set(0, -0.36, -0.06);
    tricep.scale.set(1.05, 2, 0.95);
    shoulder.add(tricep);
    const joint = new THREE.Mesh(jointGeo, skin);
    joint.position.y = -0.8;
    shoulder.add(joint);
    const elbow = new THREE.Group();
    elbow.position.y = -0.82;
    shoulder.add(elbow);
    elbow.add(new THREE.Mesh(foreGeo, skin));
    const wrist = new THREE.Group();
    wrist.position.y = -0.76;
    elbow.add(wrist);
    const fist = new THREE.Mesh(new THREE.SphereGeometry(0.125, 24, 16), skin);
    fist.scale.set(1, 1.1, 1.2);
    fist.position.y = -0.06;
    wrist.add(fist);
    return { shoulder, elbow, wrist, bicep };
  }
  const curlArm = arm(-1);                              // holds the dumbbell
  const restArm = arm(1);
  restArm.elbow.rotation.x = -0.3;
  const bracer = new THREE.Mesh(new THREE.CylinderGeometry(0.128, 0.112, 0.2, 32), gold);
  bracer.position.y = -0.56;
  restArm.elbow.add(bracer);
  for (const by of [-0.48, -0.64]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.012, 8, 32), goldDark);
    band.rotation.x = Math.PI / 2;
    band.position.y = by;
    restArm.elbow.add(band);
  }

  // the existing gold dumbbell goes in the curling hand
  const grip = new THREE.Group();
  grip.position.y = -0.07;
  grip.scale.setScalar(0.36);
  grip.add(dumbbell);
  curlArm.wrist.add(grip);

  root.position.y = -0.32;

  /* --- Animation --- */
  const CURL_T = 3.4;
  function update(t, dt, { px = 0, py = 0, explode = 0, still = false } = {}) {
    // breathing
    const breath = still ? 0 : Math.sin(t * 1.7);
    torso.scale.set(1 + breath * 0.012, 1, 1 + breath * 0.02);
    body.position.y = breath * 0.008;

    // bicep curl: up, squeeze, slow negative
    const ph = still ? 0.45 : (t % CURL_T) / CURL_T;
    const curl = ph < 0.38 ? smooth(0, 0.38, ph) : ph < 0.52 ? 1 : 1 - smooth(0.52, 1, ph);
    curlArm.elbow.rotation.x = -(0.22 + 1.95 * curl);
    curlArm.shoulder.rotation.x = -0.12 * curl;
    curlArm.bicep.scale.set(1.1 + 0.15 * curl, 1.9 - 0.3 * curl, 1 + 0.4 * curl);
    curlArm.wrist.rotation.x = -0.15 * curl;
    restArm.shoulder.rotation.x = 0.04 * Math.sin(t * 0.9);

    // head follows the pointer, crest sways
    head.rotation.y = THREE.MathUtils.clamp(px * 0.45, -0.5, 0.5);
    head.rotation.x = THREE.MathUtils.clamp(-py * 0.18, -0.2, 0.2);
    crest.rotation.z = still ? 0 : Math.sin(t * 2.1) * 0.03;

    // manifesto "exploded" view: the helmet lifts and the crest fans out
    helmet.position.y = explode * 0.55;
    helmet.rotation.x = -explode * 0.35;
    crest.scale.setScalar(1 + explode * 0.25);
  }

  return { group: root, update };
}
