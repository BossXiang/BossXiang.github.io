// The desk scene engine (ported from legacy/index.html). Runs client-side
// only, on the home page. Clicking a labelled object navigates to its real
// page instead of opening an in-scene overlay — the "paper pages" are now
// real Astro routes, not DOM swapped in by this script.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { photoCanvas, screenCanvas, sheetCanvas, globeCanvas, ballCanvas, nameCanvas } from './textures.js';

export function createDesk({ canvas, labelsEl, hintEl }) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // finalPass below already does its own ACES tonemap + gamma encode by hand
  // (same as the legacy r147 pin, whose default output was linear) — without
  // this, the renderer's own default sRGB output doubles up on that and
  // blows everything out.
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

  /* ================= scene basics ================= */
  const V3 = THREE.Vector3;
  // three's ColorManagement already converts sRGB hex -> the linear working
  // space on construction, so (unlike the legacy r147 pin) no manual
  // convertSRGBToLinear() call is needed here.
  const col = (h) => new THREE.Color(h);
  const scene = new THREE.Scene();
  scene.background = col('#101217');
  const FOV = 30,
    TAN = Math.tan((FOV * Math.PI) / 360);
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 70);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const mats = {};
  const M = (hex, o) => {
    const k = hex + JSON.stringify(o || {});
    return mats[k] || (mats[k] = new THREE.MeshStandardMaterial(Object.assign({ color: col(hex), roughness: 0.8, metalness: 0, envMapIntensity: 0.22 }, o || {})));
  };
  const rbox = (w, h, d, r, m) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), m);
  const cyl = (rt, rb, h, m, seg) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 32), m);
  const sph = (r, m) => new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), m);
  function limb(a, b, r, m) {
    const d = b.clone().sub(a),
      me = new THREE.Mesh(new THREE.CapsuleGeometry(r, d.length(), 6, 16), m);
    me.position.copy(a).addScaledVector(d, 0.5);
    me.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize());
    return me;
  }
  function tex(cv) {
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }
  let seed = 11;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const CREAM = '#efe7d6',
    AMBER = '#f2a33a',
    CORAL = '#e2644c',
    TEAL = '#2f8f8a',
    NAVY = '#2c3d5c',
    CHAR = '#2a2d33',
    GOLD = '#f0b63c';

  /* ---- drawn textures ---- */
  const photoCv = [0, 1, 2].map((k) => photoCanvas(k, false, rnd));
  const { canvas: nameCv, redraw: redrawName } = nameCanvas();
  const nameTex = tex(nameCv);
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load('800 150px "Bricolage Grotesque"'), document.fonts.load('500 40px "DM Mono"')])
      .then(() => {
        redrawName();
        nameTex.needsUpdate = true;
      })
      .catch(() => {});
  }

  /* ================= desk objects ================= */
  const SURF = 0.012; // top of the desk mat
  const objs = [],
    byKey = {};
  function add(key, kind, radius, build) {
    const group = new THREE.Group(),
      body = new THREE.Group();
    group.add(body);
    const o = { key, kind, radius, group, body, home: new V3(), pos: new V3(), vel: new V3(), target: new V3(), h: 0, y: reduce ? 0 : 1.1, yv: 0, lift: 0, delay: objs.length * 0.07, parts: {} };
    o.update = build(body, o) || (() => {});
    const hit = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, o.tall || 0.5, 12), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, transparent: true, opacity: 0 }));
    hit.position.y = (o.tall || 0.5) / 2;
    hit.userData.o = o;
    group.add(hit);
    o.hit = hit;
    group.traverse((m) => {
      if (m.isMesh && m !== hit && !m.userData.flat) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    scene.add(group);
    objs.push(o);
    byKey[key] = o;
    return o;
  }
  // Work: laptop
  add('work', 'section', 0.4, (g, o) => {
    const sil = M('#c5cad2', { roughness: 0.45, metalness: 0.35, envMapIntensity: 0.5 });
    const base = rbox(0.66, 0.035, 0.44, 0.016, sil);
    base.position.y = 0.0175;
    g.add(base);
    const kb = rbox(0.56, 0.006, 0.2, 0.002, M('#3a3f48'));
    kb.position.set(0, 0.035, -0.05);
    g.add(kb);
    const pad = rbox(0.2, 0.005, 0.11, 0.002, M('#aeb4bd', { roughness: 0.4 }));
    pad.position.set(0, 0.035, 0.14);
    g.add(pad);
    const hinge = new THREE.Group();
    hinge.position.set(0, 0.04, -0.215);
    g.add(hinge);
    const lid = rbox(0.66, 0.022, 0.44, 0.011, sil);
    lid.position.set(0, 0.011, 0.22);
    hinge.add(lid);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.38), new THREE.MeshBasicMaterial({ map: tex(screenCanvas(rnd)) }));
    scr.material.color.setScalar(0.95);
    scr.rotation.x = Math.PI / 2;
    scr.position.set(0, -0.0015, 0.22);
    scr.userData.flat = true;
    hinge.add(scr);
    const dot = cyl(0.03, 0.03, 0.002, M(AMBER), 24);
    dot.position.set(0, 0.0225, 0.22);
    hinge.add(dot);
    o.tall = 0.5;
    g.rotation.y = 0.12;
    return () => {
      hinge.rotation.x = -(1.0 + o.h * 0.85);
    };
  });
  // Research: papers
  add('research', 'section', 0.38, (g, o) => {
    const sheets = [],
      base = [],
      pm = M('#f4efe4', { roughness: 0.95 });
    for (let i = 0; i < 5; i++) {
      const s = rbox(0.42, 0.007, 0.56, 0.003, pm);
      base.push((rnd() - 0.5) * 0.22);
      s.position.y = 0.004 + i * 0.0075;
      g.add(s);
      sheets.push(s);
    }
    const top = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.56), M('#ffffff', { map: tex(sheetCanvas()), roughness: 0.95 }));
    top.rotation.x = -Math.PI / 2;
    top.position.y = 0.0042;
    top.userData.flat = true;
    top.receiveShadow = true;
    sheets[4].add(top);
    const pen = limb(new V3(0.3, 0.016, -0.2), new V3(0.34, 0.016, 0.16), 0.016, M(AMBER, { roughness: 0.5 }));
    g.add(pen);
    const cap = limb(new V3(0.34, 0.016, 0.16), new V3(0.347, 0.016, 0.22), 0.0165, M(CHAR));
    g.add(cap);
    return () => {
      sheets.forEach((s, i) => {
        s.rotation.y = base[i] + o.h * (i - 2) * 0.2;
        s.position.x = o.h * (i - 2) * 0.045;
        s.position.y = 0.004 + i * 0.0075 + o.h * i * 0.012;
      });
    };
  });
  // Achievements: trophy
  add('achievements', 'section', 0.3, (g, o) => {
    const gold = M(GOLD, { roughness: 0.28, metalness: 0.75, envMapIntensity: 1.1 });
    const b = rbox(0.22, 0.07, 0.22, 0.014, M(CHAR));
    b.position.y = 0.035;
    g.add(b);
    const pl = rbox(0.12, 0.03, 0.004, 0.002, gold);
    pl.position.set(0, 0.036, 0.111);
    g.add(pl);
    const cupG = new THREE.Group();
    g.add(cupG);
    const stem = cyl(0.022, 0.045, 0.1, gold);
    stem.position.y = 0.12;
    cupG.add(stem);
    const cup = new THREE.Mesh(
      new THREE.LatheGeometry(
        [
          [0, 0.165],
          [0.05, 0.168],
          [0.098, 0.22],
          [0.124, 0.3],
          [0.132, 0.39],
          [0.12, 0.39],
          [0.112, 0.3],
          [0.088, 0.235],
          [0, 0.2],
        ].map((p) => new THREE.Vector2(p[0], p[1])),
        40
      ),
      gold
    );
    cup.material.side = THREE.DoubleSide;
    cupG.add(cup);
    [-1, 1].forEach((s) => {
      const h = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.013, 10, 24, Math.PI), gold);
      h.rotation.z = (-s * Math.PI) / 2;
      h.position.set(s * 0.122, 0.31, 0);
      cupG.add(h);
    });
    o.tall = 0.55;
    return (dt, t) => {
      cupG.position.y = o.h * Math.abs(Math.sin(t * 5.5)) * 0.06;
      cupG.rotation.y += dt * o.h * 3.2;
    };
  });
  // Travel: globe
  add('travel', 'section', 0.3, (g, o) => {
    const b = cyl(0.13, 0.15, 0.035, M(NAVY));
    b.position.y = 0.0175;
    g.add(b);
    const st = cyl(0.018, 0.018, 0.09, M(GOLD, { roughness: 0.3, metalness: 0.7, envMapIntensity: 1 }));
    st.position.y = 0.075;
    g.add(st);
    const a = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.012, 10, 40, Math.PI * 1.1), M(GOLD, { roughness: 0.3, metalness: 0.7, envMapIntensity: 1 }));
    a.rotation.z = -Math.PI / 2 - 0.16;
    a.position.y = 0.33;
    g.add(a);
    const tilt = new THREE.Group();
    tilt.position.y = 0.33;
    tilt.rotation.z = 0.36;
    g.add(tilt);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.185, 48, 32), M('#ffffff', { map: tex(globeCanvas()), roughness: 0.6 }));
    tilt.add(ball);
    ball.rotation.y = 2.2;
    o.tall = 0.6;
    return (dt) => {
      ball.rotation.y += dt * (0.22 + o.h * 3.2);
    };
  });
  // About: nameplate
  add('about', 'section', 0.36, (g, o) => {
    const b = rbox(0.62, 0.03, 0.2, 0.012, M(CHAR));
    b.position.y = 0.015;
    g.add(b);
    const tip = new THREE.Group();
    tip.position.set(0, 0.03, 0.02);
    g.add(tip);
    const pl = rbox(0.6, 0.21, 0.03, 0.012, M('#d8d0b4'));
    pl.position.set(0, 0.105, 0);
    tip.add(pl);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.57, 0.19), M('#ffffff', { map: nameTex, roughness: 0.9 }));
    face.position.set(0, 0.105, 0.0155);
    face.userData.flat = true;
    tip.add(face);
    o.tall = 0.34;
    return (dt, t) => {
      tip.rotation.x = -0.42 + Math.sin(t * 7) * 0.07 * o.h;
    };
  });
  // Side projects: controller
  add('side-projects', 'section', 0.36, (g, o) => {
    const c = M('#e9e3d6', { roughness: 0.6 });
    const w = new THREE.Group();
    g.add(w);
    const b = rbox(0.46, 0.075, 0.25, 0.036, c);
    b.position.y = 0.05;
    w.add(b);
    [-1, 1].forEach((s) => {
      const gr = sph(0.1, c);
      gr.scale.set(1, 0.5, 1.3);
      gr.position.set(s * 0.2, 0.045, 0.09);
      w.add(gr);
    });
    const d1 = rbox(0.085, 0.014, 0.028, 0.004, M(CHAR)),
      d2 = rbox(0.028, 0.014, 0.085, 0.004, M(CHAR));
    d1.position.set(-0.125, 0.092, -0.02);
    d2.position.set(-0.125, 0.092, -0.02);
    w.add(d1, d2);
    const btn = [
      [0.03, 0, CORAL],
      [-0.03, 0, TEAL],
      [0, -0.03, AMBER],
      [0, 0.03, NAVY],
    ].map((p) => {
      const k = cyl(0.019, 0.019, 0.016, M(p[2], { roughness: 0.5 }), 20);
      k.position.set(0.125 + p[0], 0.092, -0.02 + p[1]);
      w.add(k);
      return k;
    });
    const st = [-0.055, 0.055].map((x) => {
      const s = new THREE.Group();
      s.position.set(x, 0.088, 0.06);
      const k = cyl(0.026, 0.03, 0.02, M(CHAR), 20);
      k.position.y = 0.012;
      s.add(k);
      w.add(s);
      return s;
    });
    w.rotation.x = 0.1;
    o.tall = 0.3;
    return (dt, t) => {
      btn.forEach((k, i) => {
        k.position.y = 0.092 - Math.max(0, Math.sin(t * 9 + i * 1.7)) * 0.008 * o.h;
      });
      st.forEach((s, i) => {
        s.rotation.z = Math.sin(t * 5 + i * 2) * 0.4 * o.h;
        s.rotation.x = Math.cos(t * 4 + i) * 0.4 * o.h;
      });
      w.rotation.z = Math.sin(t * 8) * 0.04 * o.h;
    };
  });
  // Photographs: prints + toy camera
  add('photos', 'section', 0.4, (g, o) => {
    const pm = M('#ecebe6', { roughness: 0.9 });
    const prints = [
      [-0.06, 0.02, 0.3],
      [0.02, -0.02, -0.12],
      [-0.02, 0.06, 0.07],
    ].map((p, i) => {
      const pr = new THREE.Group();
      const s = rbox(0.34, 0.006, 0.235, 0.003, pm);
      pr.add(s);
      const f = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.226), M('#ffffff', { map: tex(photoCv[i]), roughness: 0.9 }));
      f.rotation.x = -Math.PI / 2;
      f.position.y = 0.0036;
      f.userData.flat = true;
      f.receiveShadow = true;
      pr.add(f);
      pr.position.set(p[0], 0.004 + i * 0.007, p[1] + 0.06);
      pr.rotation.y = p[2];
      pr.userData.b = p;
      g.add(pr);
      return pr;
    });
    const cam = new THREE.Group();
    cam.position.set(0.2, 0, -0.2);
    cam.rotation.y = -0.5;
    g.add(cam);
    const bd = rbox(0.21, 0.12, 0.085, 0.02, M(CHAR, { roughness: 0.6 }));
    bd.position.y = 0.06;
    cam.add(bd);
    const tp = rbox(0.21, 0.03, 0.085, 0.012, M('#c5cad2', { roughness: 0.4, metalness: 0.4, envMapIntensity: 0.6 }));
    tp.position.y = 0.123;
    cam.add(tp);
    const ln = cyl(0.048, 0.052, 0.06, M('#c5cad2', { roughness: 0.4, metalness: 0.4, envMapIntensity: 0.6 }));
    ln.rotation.x = Math.PI / 2;
    ln.position.set(0.02, 0.06, 0.07);
    cam.add(ln);
    const gl = cyl(0.036, 0.036, 0.004, M('#1a2733', { roughness: 0.1, metalness: 0.6, envMapIntensity: 1.6 }));
    gl.rotation.x = Math.PI / 2;
    gl.position.set(0.02, 0.06, 0.101);
    cam.add(gl);
    const sh = cyl(0.016, 0.016, 0.014, M(AMBER, { roughness: 0.5 }), 20);
    sh.position.set(-0.065, 0.145, 0);
    cam.add(sh);
    o.tall = 0.3;
    return (dt, t) => {
      prints.forEach((pr, i) => {
        const b = pr.userData.b;
        pr.rotation.y = b[2] + o.h * (i - 1) * 0.5;
        pr.position.x = b[0] + o.h * (i - 1) * 0.1;
        pr.position.y = 0.004 + i * 0.007 + o.h * i * 0.014;
      });
      cam.position.y = o.h * Math.abs(Math.sin(t * 6)) * 0.03;
      sh.position.y = 0.145 - o.h * Math.max(0, Math.sin(t * 6)) * 0.008;
    };
  });
  // Writing: notebook
  add('writing', 'section', 0.38, (g, o) => {
    const cv = M(TEAL, { roughness: 0.7 });
    const bot = rbox(0.4, 0.012, 0.54, 0.006, cv);
    bot.position.y = 0.006;
    g.add(bot);
    const pg = rbox(0.375, 0.04, 0.515, 0.004, M('#f6f2e8', { roughness: 0.95 }));
    pg.position.y = 0.032;
    g.add(pg);
    const piv = new THREE.Group();
    piv.position.set(-0.2, 0.052, 0);
    g.add(piv);
    const top = rbox(0.4, 0.012, 0.54, 0.006, cv);
    top.position.set(0.2, 0.006, 0);
    piv.add(top);
    const band = rbox(0.022, 0.016, 0.546, 0.004, M(CORAL));
    band.position.set(0.33, 0.006, 0);
    piv.add(band);
    const pc = limb(new V3(0.29, 0.014, -0.22), new V3(0.33, 0.014, 0.14), 0.013, M(AMBER, { roughness: 0.6 }));
    g.add(pc);
    const tipc = new THREE.Mesh(new THREE.ConeGeometry(0.013, 0.04, 16), M('#e9d5ae'));
    tipc.position.set(0.3345, 0.014, 0.181);
    tipc.rotation.x = Math.PI / 2;
    tipc.rotation.z = -0.11;
    g.add(tipc);
    g.rotation.y = -0.1;
    return () => {
      piv.rotation.z = o.h * 0.8;
    };
  });
  // Toys
  const lampState = { on: true };
  add('lamp', 'lamp', 0.17, (g, o) => {
    const m = M(CHAR, { roughness: 0.5 }),
      j = M(AMBER, { roughness: 0.5 });
    const b = cyl(0.13, 0.15, 0.035, m);
    b.position.y = 0.0175;
    g.add(b);
    const A = new V3(0, 0.035, 0),
      B = new V3(-0.08, 0.52, -0.02),
      C = new V3(0.3, 0.92, 0.22);
    g.add(limb(A, B, 0.018, m), limb(B, C, 0.018, m));
    [A, B, C].forEach((p) => {
      const s = sph(0.034, j);
      s.position.copy(p);
      g.add(s);
    });
    const head = new THREE.Group();
    head.position.copy(C);
    const dir = new V3(0.35, -0.85, 0.3).normalize();
    head.quaternion.setFromUnitVectors(new V3(0, -1, 0), dir);
    g.add(head);
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.16, 0.19, 40, 1, true), M(AMBER, { roughness: 0.55, side: THREE.DoubleSide }));
    shade.position.y = -0.1;
    head.add(shade);
    const capm = cyl(0.05, 0.05, 0.03, M(AMBER, { roughness: 0.55 }));
    capm.position.y = -0.005;
    head.add(capm);
    const bulbM = new THREE.MeshBasicMaterial({ color: col('#fff0cf') });
    const bulb = sph(0.05, bulbM);
    bulb.position.y = -0.13;
    bulb.userData.flat = true;
    head.add(bulb);
    // The lamp is purely a trigger for the room's global day/night mood (see
    // `lampMix` in the frame loop) — no local point light or glow pool, so
    // it doesn't spotlight whatever happens to be nearby. The bulb itself
    // still visibly lights up/dims as feedback, via its own unlit material.
    o.tall = 1.05;
    o.parts = { bulbM, head };
    let glowK = 1;
    return (dt, t) => {
      const k = lampState.on ? 1 : 0;
      glowK += (k - glowK) * Math.min(1, dt * 8);
      bulbM.color.copy(col('#fff0cf')).multiplyScalar(0.12 + glowK * 1.9);
      head.rotation.z = Math.sin(t * 9) * 0.05 * o.h;
    };
  });
  const mug = { tip: 0, tipping: false };
  add('mug', 'mug', 0.13, (g, o) => {
    const m = M(CORAL, { roughness: 0.45, side: THREE.DoubleSide });
    const w = new THREE.Group();
    g.add(w);
    const cupm = new THREE.Mesh(
      new THREE.LatheGeometry(
        [
          [0, 0],
          [0.07, 0],
          [0.08, 0.008],
          [0.083, 0.17],
          [0.073, 0.17],
          [0.07, 0.016],
          [0, 0.016],
        ].map((p) => new THREE.Vector2(p[0], p[1])),
        40
      ),
      m
    );
    w.add(cupm);
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 10, 24, Math.PI), m);
    h.rotation.z = -Math.PI / 2;
    h.position.set(0.082, 0.09, 0);
    w.add(h);
    const cof = new THREE.Mesh(new THREE.CircleGeometry(0.072, 32), M('#2a170c', { roughness: 0.2 }));
    cof.rotation.x = -Math.PI / 2;
    cof.position.y = 0.145;
    cof.userData.flat = true;
    w.add(cof);
    const pud = new THREE.Mesh(new THREE.CircleGeometry(0.2, 40), M('#2a170c', { roughness: 0.15, transparent: true, opacity: 0.9 }));
    pud.rotation.x = -Math.PI / 2;
    pud.position.set(-0.26, 0.003, 0.02);
    pud.scale.set(0, 0, 1);
    pud.userData.flat = true;
    g.add(pud);
    const sm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, depthWrite: false });
    const steam = [0, 1, 2, 3].map((i) => {
      const s = sph(0.022, sm.clone());
      s.userData.flat = true;
      s.userData.p = i / 4;
      g.add(s);
      return s;
    });
    o.tall = 0.24;
    return (dt, t) => {
      if (mug.tipping) {
        mug.tip += dt;
        if (mug.tip > 2.6) {
          mug.tipping = false;
          mug.tip = 0;
        }
      }
      const u = mug.tip,
        a = u < 0.35 ? u / 0.35 : u < 2 ? 1 : Math.max(0, 1 - (u - 2) / 0.6),
        e = a * a * (3 - 2 * a);
      w.rotation.z = e * 1.5;
      w.position.x = -e * 0.02;
      w.position.y = e * 0.07;
      cof.visible = e < 0.3;
      const ps = u < 0.25 ? 0 : u < 2.1 ? Math.min(1, (u - 0.25) / 0.5) : Math.max(0, 1 - (u - 2.1) / 0.5);
      pud.scale.set(ps, ps * 0.8, 1);
      steam.forEach((s) => {
        s.userData.p = (s.userData.p + dt * 0.28) % 1;
        const p = s.userData.p;
        s.position.set(Math.sin(t * 1.3 + p * 9) * 0.02, 0.19 + p * 0.26, Math.cos(t + p * 7) * 0.015);
        s.scale.setScalar(0.6 + p * 1.4);
        s.material.opacity = reduce || e > 0.2 ? 0 : 0.22 * Math.sin(p * Math.PI);
      });
    };
  });
  add('ball', 'ball', 0.13, (g, o) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 40, 28), M('#ffffff', { map: tex(ballCanvas()), roughness: 0.7 }));
    b.position.y = 0.13;
    g.add(b);
    o.parts.b = b;
    o.tall = 0.3;
    b.rotation.z = 0.5;
  });
  const ball = byKey.ball;

  /* ---- desk ---- */
  let deskG = null,
    DW = 5,
    DD = 3,
    portrait = false;
  function buildDesk() {
    if (deskG) {
      scene.remove(deskG);
      deskG.traverse((m) => {
        if (m.geometry) m.geometry.dispose();
      });
    }
    deskG = new THREE.Group();
    const slab = rbox(DW, 0.2, DD, 0.07, M('#c79d70', { roughness: 0.7 }));
    slab.position.y = -0.1;
    slab.receiveShadow = true;
    slab.castShadow = true;
    deskG.add(slab);
    const mat = rbox(DW - 0.36, 0.012, DD - 0.36, 0.006, M('#1f3b45', { roughness: 0.95 }));
    mat.position.y = 0.006;
    mat.receiveShadow = true;
    deskG.add(mat);
    scene.add(deskG);
  }

  /* ---- lights ---- */
  const key = new THREE.DirectionalLight(col('#ffe2bd'), 1.3);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.012;
  key.shadow.radius = 5;
  scene.add(key, key.target);
  const hemi = new THREE.HemisphereLight(col('#b7cdf2'), col('#241c12'), 0.5);
  scene.add(hemi);
  const rim = new THREE.DirectionalLight(col('#8fb2ff'), 0.4);
  rim.position.set(4, 3, -5);
  scene.add(rim);
  const DAYLIGHT = col('#ffdca3'),
    MOONLIGHT = col('#46608f');
  const BG_DAY = col('#1c1912'),
    BG_NIGHT = col('#0b0d12');
  let lampMix = 0; // lamp starts on (lampState.on === true) → start at the day/warm mix

  /* ---- post ---- */
  const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: renderer.capabilities.isWebGL2 ? 4 : 0 });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(4, 4), 0.22, 0.4, 2.1));
  const finalPass = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, time: { value: 0 }, exposure: { value: 0.55 }, mood: { value: 1 } },
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    // `mood` is lampMix (0 = lamp off / day, 1 = lamp on / night). The day/night
    // read leans on a deliberate colour grade — a warm amber lift by day, a
    // desaturated cool teal push by night, plus a deeper vignette at night —
    // rather than only on raw light intensity, which ACES + bloom compress
    // into something barely perceptible.
    fragmentShader:
      'uniform sampler2D tDiffuse;uniform float time,exposure,mood;varying vec2 vUv;' +
      'vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}' +
      'float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}' +
      'void main(){' +
      'vec3 c=texture2D(tDiffuse,vUv).rgb*exposure;' +
      'c=aces(c);' +
      'c=pow(c,vec3(1./2.2));' +
      'vec3 dayGrade=vec3(1.1,1.0,0.86);' +
      'vec3 nightGrade=vec3(0.74,0.86,1.14);' +
      'c*=mix(dayGrade,nightGrade,mood);' +
      'float g=dot(c,vec3(.299,.587,.114));' +
      'c=mix(c,vec3(g),mood*.22);' +
      'vec2 d=vUv-.5;' +
      'c*=1.-(.62+mood*.4)*dot(d,d);' +
      'c+=(h(vUv*vec2(1920.,1080.)+fract(time)*60.)-.5)*.016;' +
      'gl_FragColor=vec4(c,1.);}',
  });
  composer.addPass(finalPass);

  /* ================= layout and camera ================= */
  let W = 1,
    H = 1,
    aspect = 1,
    prCap = 2,
    perfN = 0,
    perfT = 0;
  const LAND = [
    ['achievements', 'work', 'travel', 'about'],
    ['research', 'photos', 'side-projects', 'writing'],
  ];
  const PORT = [
    ['achievements', 'work'],
    ['travel', 'about'],
    ['research', 'photos'],
    ['side-projects', 'writing'],
  ];
  const base = { target: new V3(), dist: 10, elev: 0.86, az: 0 },
    cur = { target: new V3(), dist: 10, elev: 0.86, az: 0 };
  const tmp = new V3(),
    tmp2 = new V3();
  function place(c, dx, dy) {
    const e = Math.min(1.5, c.elev + dy),
      a = c.az + dx;
    camera.position.set(c.target.x + c.dist * Math.cos(e) * Math.sin(a), c.target.y + c.dist * Math.sin(e), c.target.z + c.dist * Math.cos(e) * Math.cos(a));
    camera.lookAt(c.target);
    camera.updateMatrixWorld();
  }
  function layout(snap) {
    const was = portrait;
    portrait = aspect < 1;
    const grid = portrait ? PORT : LAND,
      rows = grid.length,
      cols = grid[0].length,
      CW = 1.08,
      CD = portrait ? 1.24 : 1.14;
    const nw = cols * CW + 0.86,
      nd = rows * CD + 0.62;
    if (!deskG || nw !== DW || nd !== DD) {
      DW = nw;
      DD = nd;
      buildDesk();
    }
    grid.forEach((row, r) =>
      row.forEach((k, c) => {
        byKey[k].home.set((c - (cols - 1) / 2) * CW, 0, (r - (rows - 1) / 2) * CD - 0.04);
      })
    );
    byKey.lamp.home.set(-DW / 2 + 0.36, 0, -DD / 2 + 0.34);
    byKey.lamp.group.rotation.y = portrait ? 0.15 : 0.05;
    byKey.mug.home.set(DW / 2 - 0.36, 0, -DD / 2 + 0.36);
    if (snap || was !== portrait) {
      objs.forEach((o) => {
        if (o !== ball) {
          o.pos.copy(o.home);
          o.vel.set(0, 0, 0);
        }
      });
      ball.pos.set(DW / 2 - 0.42, 0, DD / 2 - 0.36);
      ball.vel.set(0, 0, 0);
    }
    key.position.set(-3.2, 7.5, 3.6);
    key.target.position.set(0, 0, 0);
    {
      const r = Math.hypot(DW, DD) / 2 + 0.5,
        sc = key.shadow.camera;
      sc.left = -r;
      sc.right = r;
      sc.top = r;
      sc.bottom = -r;
      sc.near = 1;
      sc.far = 20;
      sc.updateProjectionMatrix();
    }
    // fit the whole desk between the header and the hint
    base.elev = portrait ? 1.06 : 0.86;
    base.az = 0;
    base.target.set(0, 0, 0);
    const pts = [];
    [-1, 1].forEach((sx) =>
      [-1, 1].forEach((sz) => {
        pts.push(new V3((sx * DW) / 2, 0, (sz * DD) / 2), new V3(sx * (DW / 2 - 0.3), 0.5, sz * (DD / 2 - 0.3)));
      })
    );
    pts.push(new V3(-DW / 2 + 0.7, 1.0, -DD / 2 + 0.6));
    const top = 1 - 2 * (78 / H),
      bot = -1 + 2 * (58 / H),
      mx = 1 - 2 * (10 / W);
    const bounds = () => {
      let a = 9,
        b = -9,
        c = 9,
        d = -9;
      pts.forEach((p) => {
        tmp.copy(p).project(camera);
        a = Math.min(a, tmp.x);
        b = Math.max(b, tmp.x);
        c = Math.min(c, tmp.y);
        d = Math.max(d, tmp.y);
      });
      return [a, b, c, d];
    };
    for (let it = 0; it < 4; it++) {
      let lo = 1,
        hi = 80;
      for (let i = 0; i < 26; i++) {
        const mid = (lo + hi) / 2;
        base.dist = mid;
        place(base, 0, 0);
        const q = bounds();
        if (q[1] - q[0] <= 2 * mx && q[3] - q[2] <= top - bot) hi = mid;
        else lo = mid;
      }
      base.dist = hi;
      place(base, 0, 0);
      const q = bounds();
      tmp.setFromMatrixColumn(camera.matrixWorld, 1);
      tmp2.setFromMatrixColumn(camera.matrixWorld, 0);
      base.target.addScaledVector(tmp, ((q[2] + q[3]) / 2 - (top + bot) / 2) * base.dist * TAN).addScaledVector(tmp2, (((q[0] + q[1]) / 2) * base.dist * TAN) * aspect);
    }
  }
  function resize() {
    W = canvas.clientWidth || innerWidth;
    H = canvas.clientHeight || innerHeight;
    aspect = W / H;
    const pr = Math.min(devicePixelRatio || 1, prCap);
    renderer.setPixelRatio(pr);
    renderer.setSize(W, H, false);
    composer.setSize(Math.round(W * pr), Math.round(H * pr));
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    layout(false);
  }

  /* ================= labels ================= */
  // Built in boot(), in section-list (reading) order rather than desk-add
  // order, so keyboard tab order follows reading order, not desk position.
  let labelHover = null;
  let labels = [];
  function activate(o) {
    if (o.kind === 'section') {
      o.yv = reduce ? 0 : 1.5;
      setTimeout(() => {
        location.href = o.href;
      }, reduce ? 0 : 240);
    } else if (o.kind === 'lamp') {
      lampState.on = !lampState.on;
      o.yv = reduce ? 0 : 0.9;
    } else if (o.kind === 'mug') {
      if (!mug.tipping && !reduce) {
        mug.tipping = true;
        mug.tip = 0;
      }
    } else if (o.kind === 'ball') {
      const a = rnd() * 6.283;
      ball.vel.set(Math.cos(a) * 2.4, 0, Math.sin(a) * 2.4);
      ball.yv = 1.8;
    }
  }

  /* ================= pointer ================= */
  const ray = new THREE.Raycaster(),
    nd = new THREE.Vector2(),
    plane = new THREE.Plane(new V3(0, 1, 0), -SURF);
  let hover = null,
    down = null,
    drag = null;
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
  function setRay(e) {
    const r = canvas.getBoundingClientRect();
    nd.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(nd, camera);
  }
  function pick(e) {
    setRay(e);
    const h = ray.intersectObjects(
      objs.map((o) => o.hit),
      false
    );
    return h.length ? h[0].object.userData.o : null;
  }
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    if (e.pointerType === 'mouse') {
      ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    }
    if (down && !down.moved && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 7) {
      down.moved = true;
      if (down.o && down.o.kind !== 'lamp') {
        drag = down.o;
        drag.target.copy(drag.pos);
      }
    }
    if (drag) {
      setRay(e);
      if (ray.ray.intersectPlane(plane, tmp)) {
        drag.target.set(Math.max(-DW / 2 + 0.2, Math.min(DW / 2 - 0.2, tmp.x)), 0, Math.max(-DD / 2 + 0.2, Math.min(DD / 2 - 0.2, tmp.z)));
      }
    } else if (!down) {
      hover = pick(e);
    }
    canvas.style.cursor = drag ? 'grabbing' : hover ? (hover.kind === 'lamp' ? 'pointer' : 'grab') : '';
  });
  canvas.addEventListener('pointerdown', (e) => {
    const o = pick(e);
    down = { o, x: e.clientX, y: e.clientY, moved: false };
    hover = o;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (_) {}
  });
  function release(e) {
    const d = down,
      g = drag;
    down = null;
    drag = null;
    if (!d) return;
    if (g) {
      if (g === ball) {
        const s = Math.min(1, 7 / Math.max(0.001, g.vel.length()));
        g.vel.multiplyScalar(s);
      }
    } else if (!d.moved && d.o) activate(d.o);
    if (e.pointerType !== 'mouse') hover = null;
    canvas.style.cursor = '';
  }
  canvas.addEventListener('pointerup', (e) => release(e));
  canvas.addEventListener('pointercancel', (e) => release(e));

  /* ================= frame ================= */
  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-(reduce ? 60 : k) * dt));
  let last = performance.now(),
    time = 0;
  const axis = new V3();
  function tick(dt, draw) {
    time += dt;
    finalPass.uniforms.time.value = time;
    // lamp mood — a deliberate day/night "look", not just a brightness dial.
    // The scene lights move moderately (kept well clear of the exposure that
    // blows out flat light-coloured objects like the nameplate); the real
    // day/night read comes from finalPass's colour grade + vignette + the
    // void background, which can't be swallowed by tonemapping the way raw
    // light intensity was.
    // lampMix is "how much night/cool mood" — the lamp turning ON should
    // make the room read brighter/warmer, same as the bulb itself lighting
    // up, so ON targets 0 (day grade) and OFF targets 1 (night grade).
    lampMix = damp(lampMix, lampState.on ? 0 : 1, 6, dt);
    key.intensity = 0.85 - lampMix * 0.5;
    key.color.copy(DAYLIGHT).lerp(MOONLIGHT, lampMix);
    hemi.intensity = 0.62 - lampMix * 0.3;
    rim.intensity = 0.26 + lampMix * 0.3;
    scene.background.copy(BG_DAY).lerp(BG_NIGHT, lampMix);
    finalPass.uniforms.mood.value = lampMix;
    finalPass.uniforms.exposure.value = 0.62 - lampMix * 0.22;

    objs.forEach((o) => {
      const active = hover === o || drag === o || labelHover === o;
      o.h = damp(o.h, active ? 1 : 0, 10, dt);
      if (o.delay > 0) o.delay -= dt;
      else if (o.y > 0 || o.yv !== 0) {
        o.yv -= 9.5 * dt;
        o.y += o.yv * dt;
        if (o.y <= 0) {
          o.y = 0;
          o.yv = Math.abs(o.yv) > 0.5 ? -o.yv * 0.32 : 0;
        }
      }
      const px = o.pos.x,
        pz = o.pos.z;
      if (drag === o) {
        o.pos.x = damp(o.pos.x, o.target.x, 22, dt);
        o.pos.z = damp(o.pos.z, o.target.z, 22, dt);
        if (dt > 0) o.vel.set((o.pos.x - px) / dt, 0, (o.pos.z - pz) / dt);
      } else if (o !== ball) {
        const ax = -110 * (o.pos.x - o.home.x) - 15 * o.vel.x,
          az = -110 * (o.pos.z - o.home.z) - 15 * o.vel.z;
        o.vel.x += ax * dt;
        o.vel.z += az * dt;
        o.pos.x += o.vel.x * dt;
        o.pos.z += o.vel.z * dt;
      }
      o.lift = damp(o.lift, drag === o ? 0.16 : 0, 14, dt);
      if (o !== ball) {
        o.body.rotation.z = damp(o.body.rotation.z, Math.max(-0.35, Math.min(0.35, -o.vel.x * 0.07)), 12, dt);
        o.body.rotation.x = damp(o.body.rotation.x, Math.max(-0.35, Math.min(0.35, o.vel.z * 0.07)), 12, dt);
      }
      o.update(dt, time);
    });
    // ball
    if (drag !== ball) {
      const b = ball,
        f = Math.exp(-1.1 * dt);
      b.vel.x *= f;
      b.vel.z *= f;
      if (b.vel.lengthSq() < 0.0004) b.vel.set(0, 0, 0);
      b.pos.x += b.vel.x * dt;
      b.pos.z += b.vel.z * dt;
      const lx = DW / 2 - 0.2,
        lz = DD / 2 - 0.2;
      if (b.pos.x > lx) {
        b.pos.x = lx;
        b.vel.x = -Math.abs(b.vel.x) * 0.6;
      }
      if (b.pos.x < -lx) {
        b.pos.x = -lx;
        b.vel.x = Math.abs(b.vel.x) * 0.6;
      }
      if (b.pos.z > lz) {
        b.pos.z = lz;
        b.vel.z = -Math.abs(b.vel.z) * 0.6;
      }
      if (b.pos.z < -lz) {
        b.pos.z = -lz;
        b.vel.z = Math.abs(b.vel.z) * 0.6;
      }
    }
    objs.forEach((o) => {
      if (o === ball) return;
      const dx = ball.pos.x - o.pos.x,
        dz = ball.pos.z - o.pos.z,
        d = Math.hypot(dx, dz),
        min = o.radius * 0.82 + ball.radius;
      if (d < min && d > 1e-5 && drag !== ball) {
        const nx = dx / d,
          nz = dz / d;
        ball.pos.x = o.pos.x + nx * min;
        ball.pos.z = o.pos.z + nz * min;
        const vn = (ball.vel.x - o.vel.x) * nx + (ball.vel.z - o.vel.z) * nz;
        if (vn < 0) {
          ball.vel.x -= 1.6 * vn * nx;
          ball.vel.z -= 1.6 * vn * nz;
          if (o.kind === 'mug' && vn < -1.3 && !mug.tipping && !reduce) {
            mug.tipping = true;
            mug.tip = 0;
          } else if (vn < -1 && o.y === 0 && !reduce) o.yv = Math.min(1.1, -vn * 0.35);
        }
      }
    });
    {
      const sp = ball.vel.length();
      if (sp > 0.001) {
        axis.set(ball.vel.z, 0, -ball.vel.x).normalize();
        ball.parts.b.rotateOnWorldAxis(axis, (sp * dt) / 0.13);
      }
    }
    objs.forEach((o) => {
      o.group.position.set(o.pos.x, SURF + o.y + o.lift + (o.kind === 'section' ? o.h * 0.045 : 0), o.pos.z);
    });

    // camera
    cur.target.x = damp(cur.target.x, base.target.x, 3.2, dt);
    cur.target.y = damp(cur.target.y, base.target.y, 3.2, dt);
    cur.target.z = damp(cur.target.z, base.target.z, 3.2, dt);
    cur.dist = damp(cur.dist, base.dist, 3.2, dt);
    cur.elev = base.elev;
    cur.az = base.az;
    ptr.sx = damp(ptr.sx, ptr.x, 4, dt);
    ptr.sy = damp(ptr.sy, ptr.y, 4, dt);
    place(cur, reduce || drag ? ptr.sx * 0 : ptr.sx * 0.05, reduce ? 0 : -ptr.sy * 0.025);

    // labels
    labels.forEach((l) => {
      tmp.set(l.o.home.x, SURF, l.o.home.z + 0.5).project(camera);
      l.b.style.left = ((tmp.x * 0.5 + 0.5) * W).toFixed(1) + 'px';
      l.b.style.top = ((-tmp.y * 0.5 + 0.5) * H).toFixed(1) + 'px';
      l.b.classList.toggle('hot', hover === l.o || drag === l.o);
    });
    if (draw) composer.render();
  }
  function frame(now) {
    requestAnimationFrame(frame);
    if (!canvas.clientWidth || !canvas.clientHeight) {
      // The desk is toggled off (hidden behind the plain index) — skip
      // resize/render work entirely instead of thrashing layout every frame.
      last = now;
      return;
    }
    if (canvas.clientWidth !== W || canvas.clientHeight !== H) resize();
    const raw = (now - last) / 1000,
      dt = Math.max(0, Math.min(raw, 0.05));
    last = now;
    if (prCap > 1 && raw > 0 && raw < 0.5) {
      perfT += raw;
      if (++perfN === 80) {
        const avg = perfT / 80;
        if (avg > 0.05) {
          prCap = Math.max(1, prCap - 0.5);
          resize();
        } else if (avg > 0.036 && prCap > 1.5) {
          prCap = 1.5;
          resize();
        }
        perfN = 0;
        perfT = 0;
      }
    }
    tick(dt, true);
  }

  return {
    boot(sections) {
      labels = sections
        .filter((s) => byKey[s.key])
        .map((s) => {
          const o = byKey[s.key];
          o.label = s.label;
          o.href = s.href;
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'label';
          b.dataset.key = o.key;
          b.textContent = o.label;
          b.addEventListener('click', () => activate(o));
          b.addEventListener('mouseenter', () => {
            labelHover = o;
          });
          b.addEventListener('mouseleave', () => {
            if (labelHover === o) labelHover = null;
          });
          b.addEventListener('focus', () => {
            labelHover = o;
          });
          b.addEventListener('blur', () => {
            if (labelHover === o) labelHover = null;
          });
          labelsEl.appendChild(b);
          return { b, o };
        });
      W = canvas.clientWidth || innerWidth;
      H = canvas.clientHeight || innerHeight;
      aspect = W / H;
      resize();
      layout(true);
      cur.target.copy(base.target);
      cur.dist = base.dist;
      cur.elev = base.elev;
      cur.az = base.az;
      if (matchMedia('(pointer:coarse)').matches && hintEl) hintEl.textContent = 'Tap a label to open it. Drag anything.';
      addEventListener('resize', resize);
      requestAnimationFrame(frame);
    },
  };
}
