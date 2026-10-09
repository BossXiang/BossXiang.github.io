// Canvas-drawn placeholder art for the desk scene (ported from legacy/index.html).
// Pure 2D canvas — no three.js here, so scene.js wraps these with THREE.CanvasTexture.

function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function figure(c, x, y, h, fill) {
  c.fillStyle = fill || '#0c0c0c';
  c.beginPath();
  c.arc(x, y - h * 0.9, h * 0.1, 0, 7);
  c.fill();
  c.beginPath();
  c.moveTo(x - h * 0.13, y - h * 0.78);
  c.lineTo(x + h * 0.13, y - h * 0.78);
  c.lineTo(x + h * 0.1, y - h * 0.38);
  c.lineTo(x + h * 0.09, y);
  c.lineTo(x + h * 0.01, y);
  c.lineTo(x, y - h * 0.36);
  c.lineTo(x - h * 0.01, y);
  c.lineTo(x - h * 0.09, y);
  c.lineTo(x - h * 0.1, y - h * 0.38);
  c.closePath();
  c.fill();
}

export function photoCanvas(kind, flip, rnd) {
  const W = 512,
    H = 340,
    cv = mk(W, H),
    c = cv.getContext('2d'),
    m = 20;
  c.fillStyle = '#ecebe6';
  c.fillRect(0, 0, W, H);
  c.save();
  c.beginPath();
  c.rect(m, m, W - 2 * m, H - 2 * m);
  c.clip();
  if (flip) {
    c.translate(W, 0);
    c.scale(-1, 1);
  }
  let g;
  if (kind === 0) {
    c.translate(W / 2, H / 2);
    c.rotate(-0.09);
    c.scale(1.12, 1.12);
    c.translate(-W / 2, -H / 2);
    g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#7d7d7d');
    g.addColorStop(0.6, '#dcdcdc');
    c.fillStyle = g;
    c.fillRect(-50, -50, W + 100, H + 100);
    g = c.createLinearGradient(0, 205, 0, H);
    g.addColorStop(0, '#8c8c8c');
    g.addColorStop(1, '#3a3a3a');
    c.fillStyle = g;
    c.fillRect(-50, 205, W + 100, H);
    c.fillStyle = '#161616';
    c.fillRect(-50, 196, W + 100, 9);
    [140, 372].forEach((x) => {
      c.fillRect(x - 9, 70, 18, 170);
      c.fillRect(x - 14, 62, 28, 12);
    });
    c.strokeStyle = '#161616';
    c.lineWidth = 3;
    const cable = (x0, x1, sag) => {
      c.beginPath();
      c.moveTo(x0, 70);
      c.quadraticCurveTo((x0 + x1) / 2, 70 + sag * 2, x1, 70);
      c.stroke();
      c.lineWidth = 1;
      for (let x = x0 + 12; x < x1; x += 12) {
        const t = (x - x0) / (x1 - x0),
          y = 70 + sag * 4 * t * (1 - t);
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x, 196);
        c.stroke();
      }
      c.lineWidth = 3;
    };
    cable(140, 372, 58);
    cable(-92, 140, 58);
    cable(372, 604, 58);
    c.fillStyle = '#0e0e0e';
    c.fillRect(-50, 292, W + 100, 80);
    figure(c, 318, 294, 62);
  } else if (kind === 1) {
    g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#f0f0f0');
    g.addColorStop(1, '#a9a9a9');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    c.fillStyle = '#222';
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(205, 128);
    c.lineTo(205, 236);
    c.lineTo(0, H);
    c.fill();
    c.fillStyle = '#3b3b3b';
    c.beginPath();
    c.moveTo(W, 0);
    c.lineTo(318, 132);
    c.lineTo(318, 234);
    c.lineTo(W, H);
    c.fill();
    g = c.createLinearGradient(0, 230, 0, H);
    g.addColorStop(0, '#bdbdbd');
    g.addColorStop(1, '#6f6f6f');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(205, 236);
    c.lineTo(318, 234);
    c.lineTo(W, H);
    c.lineTo(0, H);
    c.fill();
    c.strokeStyle = 'rgba(0,0,0,.28)';
    c.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      const t = i / 7;
      c.beginPath();
      c.moveTo(0, t * t * H * 0.9);
      c.lineTo(205, 128 + t * 108);
      c.stroke();
      c.beginPath();
      c.moveTo(W, t * t * H * 0.9);
      c.lineTo(318, 132 + t * 102);
      c.stroke();
    }
    c.fillStyle = 'rgba(10,10,10,.55)';
    c.beginPath();
    c.moveTo(250, 292);
    c.lineTo(262, 292);
    c.lineTo(392, 330);
    c.lineTo(352, 334);
    c.fill();
    figure(c, 256, 294, 58);
  } else {
    c.fillStyle = '#141414';
    c.fillRect(0, 0, W, H);
    for (let i = 0; i < 4; i++) {
      const x = 58 + i * 112,
        w = 74;
      g = c.createLinearGradient(0, 60, 0, 250);
      g.addColorStop(0, '#f2f2f2');
      g.addColorStop(1, '#9b9b9b');
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(x, 250);
      c.lineTo(x, 110);
      c.arc(x + w / 2, 110, w / 2, Math.PI, 0);
      c.lineTo(x + w, 250);
      c.fill();
      g = c.createLinearGradient(0, 250, 0, H);
      g.addColorStop(0, 'rgba(220,220,220,.55)');
      g.addColorStop(1, 'rgba(220,220,220,0)');
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(x, 250);
      c.lineTo(x + w, 250);
      c.lineTo(x + w + 70, H);
      c.lineTo(x + 40, H);
      c.fill();
    }
    figure(c, 320, 252, 70, '#0a0a0a');
  }
  c.restore();
  const id = c.getImageData(m, m, W - 2 * m, H - 2 * m),
    d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rnd() - 0.5) * 34;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  c.putImageData(id, m, m);
  g = c.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,.42)');
  c.fillStyle = g;
  c.fillRect(m, m, W - 2 * m, H - 2 * m);
  return cv;
}

export function screenCanvas(rnd) {
  const cv = mk(600, 380),
    c = cv.getContext('2d');
  c.fillStyle = '#14171d';
  c.fillRect(0, 0, 600, 380);
  c.fillStyle = '#1d222b';
  c.fillRect(0, 0, 600, 38);
  ['#e2644c', '#f2a33a', '#2f8f8a'].forEach((k, i) => {
    c.fillStyle = k;
    c.beginPath();
    c.arc(22 + i * 22, 19, 6, 0, 7);
    c.fill();
  });
  const cols = ['#f2a33a', '#8fd3cf', '#e9edf2', '#8fd3cf', '#e2644c', '#e9edf2'];
  let y = 70;
  for (let i = 0; i < 9; i++) {
    let x = 28 + (i % 4 === 1 || i % 4 === 2 ? 32 : 0) + (i % 4 === 2 ? 32 : 0);
    const n = 1 + Math.floor(rnd() * 3.5);
    for (let k = 0; k < n; k++) {
      const w = 38 + rnd() * 120;
      c.fillStyle = cols[(i + k * 2) % 6];
      c.globalAlpha = k ? 0.75 : 1;
      c.fillRect(x, y, w, 12);
      x += w + 12;
    }
    y += 32;
  }
  c.globalAlpha = 1;
  return cv;
}

export function sheetCanvas() {
  const cv = mk(420, 560),
    c = cv.getContext('2d');
  c.fillStyle = '#f6f2e8';
  c.fillRect(0, 0, 420, 560);
  c.fillStyle = '#22262c';
  c.fillRect(44, 52, 250, 16);
  c.fillRect(44, 78, 170, 16);
  c.fillStyle = '#a85f06';
  c.fillRect(44, 112, 110, 7);
  c.fillStyle = '#9aa0a6';
  for (let i = 0; i < 15; i++) {
    const y = 150 + i * 24;
    c.fillRect(44, y, i % 5 === 4 ? 190 : 332, 6);
  }
  c.strokeStyle = '#2f8f8a';
  c.lineWidth = 5;
  c.beginPath();
  c.moveTo(250, 522);
  for (let i = 1; i <= 8; i++) c.lineTo(250 + i * 15, 522 - Math.sin(i * 0.9) * 14 - i * 2.2);
  c.stroke();
  return cv;
}

export function globeCanvas() {
  const cv = mk(1024, 512),
    c = cv.getContext('2d'),
    X = (l) => ((l + 180) / 360) * 1024,
    Y = (l) => ((90 - l) / 180) * 512;
  c.fillStyle = '#2f7fa6';
  c.fillRect(0, 0, 1024, 512);
  c.fillStyle = '#f1dfb4';
  [
    [-104, 50, 34, 17],
    [-92, 28, 13, 11],
    [-112, 36, 10, 8],
    [-60, -14, 15, 23],
    [-70, 6, 9, 8],
    [20, 6, 19, 25],
    [26, -22, 10, 12],
    [12, 49, 15, 8],
    [32, 58, 22, 10],
    [90, 54, 46, 17],
    [104, 28, 22, 13],
    [78, 20, 9, 11],
    [45, 27, 10, 9],
    [134, -25, 15, 9],
    [-40, 73, 12, 7],
    [114, 2, 9, 5],
    [138, 37, 4, 7],
  ].forEach((b) => {
    c.beginPath();
    c.ellipse(X(b[0]), Y(b[1]), (b[2] / 360) * 1024, (b[3] / 180) * 512, 0, 0, 7);
    c.fill();
  });
  c.fillStyle = '#f7f3ea';
  c.fillRect(0, 478, 1024, 34);
  [
    [121.5, 25],
    [103.8, 1.3],
    [-79.4, 43.7],
  ].forEach((p) => {
    c.fillStyle = '#fff';
    c.beginPath();
    c.arc(X(p[0]), Y(p[1]), 13, 0, 7);
    c.fill();
    c.fillStyle = '#e2644c';
    c.beginPath();
    c.arc(X(p[0]), Y(p[1]), 8.5, 0, 7);
    c.fill();
  });
  return cv;
}

export function ballCanvas() {
  const cv = mk(256, 128),
    c = cv.getContext('2d');
  c.fillStyle = '#e2644c';
  c.fillRect(0, 0, 256, 128);
  c.fillStyle = '#f6efe2';
  c.fillRect(0, 46, 256, 9);
  c.fillRect(0, 73, 256, 9);
  return cv;
}

export function nameCanvas() {
  const cv = mk(960, 320);
  const draw = () => {
    const c = cv.getContext('2d');
    // Kept a touch off pure-white: a big flat plane this close to white
    // clips to a blown-out highlight the instant it faces the key light.
    c.fillStyle = '#d8d0b4';
    c.fillRect(0, 0, 960, 320);
    c.textAlign = 'center';
    c.textBaseline = 'alphabetic';
    c.fillStyle = '#1b1f24';
    c.font = '800 150px "Bricolage Grotesque","Avenir Next","Segoe UI",sans-serif';
    c.fillText('Tom Cheng', 480, 192);
    c.fillStyle = '#a85f06';
    c.font = '500 40px "DM Mono",ui-monospace,Menlo,monospace';
    c.fillText('S O F T W A R E   E N G I N E E R', 480, 262);
  };
  draw();
  return { canvas: cv, redraw: draw };
}
