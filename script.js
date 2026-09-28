const SVG_NS = 'http://www.w3.org/2000/svg';

const scene = document.getElementById('scene');
const openBtn = document.getElementById('openBtn');
const resetBtn = document.getElementById('resetBtn');
const garden = document.getElementById('garden');
const starsLayer = document.getElementById('starsLayer');
const firefliesLayer = document.getElementById('firefliesLayer');

const VIEW_W = 1000;
const VIEW_H = 600;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createSvgEl(tag, attrs) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const key in attrs) el.setAttribute(key, attrs[key]);
  return el;
}

/* ---------------- Stars & constellations ---------------- */

function buildStars() {
  starsLayer.innerHTML = '';

  // Loose background stars
  for (let i = 0; i < 70; i++) {
    addStar(random(0, VIEW_W), random(0, VIEW_H), random(0.9, 2.2));
  }

  // A handful of connected constellations
  const groupCount = 5;
  for (let g = 0; g < groupCount; g++) {
    const pointCount = Math.floor(random(3, 6));
    let x = random(VIEW_W * 0.1, VIEW_W * 0.9);
    let y = random(VIEW_H * 0.05, VIEW_H * 0.42);
    const points = [{ x, y }];

    for (let i = 1; i < pointCount; i++) {
      x += random(-70, 70);
      y += random(-40, 40);
      x = Math.min(Math.max(x, 10), VIEW_W - 10);
      y = Math.min(Math.max(y, 10), VIEW_H * 0.5);
      points.push({ x, y });
    }

    const line = createSvgEl('polyline', {
      class: 'constellation-line',
      points: points.map((p) => `${p.x},${p.y}`).join(' '),
    });
    starsLayer.appendChild(line);

    points.forEach((p) => addStar(p.x, p.y, random(1.8, 3)));
  }
}

function addStar(x, y, r) {
  const star = createSvgEl('circle', {
    class: 'star',
    cx: x,
    cy: y,
    r,
  });
  star.style.setProperty('--dur', `${random(2, 4.5)}s`);
  star.style.setProperty('--delay', `${random(0, 4)}s`);
  star.style.setProperty('--op-min', random(0.15, 0.35).toFixed(2));
  star.style.setProperty('--op-max', random(0.7, 1).toFixed(2));
  starsLayer.appendChild(star);
}

/* ---------------- Fireflies ---------------- */

function buildFireflies() {
  firefliesLayer.innerHTML = '';
  const count = 22;
  for (let i = 0; i < count; i++) {
    const outer = document.createElement('div');
    outer.className = 'firefly';
    outer.style.setProperty('--x', `${random(4, 96)}%`);
    outer.style.setProperty('--y', `${random(6, 88)}%`);
    outer.style.setProperty('--dx', `${random(-40, 40)}px`);
    outer.style.setProperty('--dy', `${random(-30, 30)}px`);
    outer.style.setProperty('--dur', `${random(7, 13)}s`);
    outer.style.setProperty('--delay', `${random(0, 6)}s`);

    const core = document.createElement('div');
    core.className = 'firefly__core';
    core.style.setProperty('--size', `${random(4, 8).toFixed(1)}px`);
    core.style.setProperty('--op-base', random(0.3, 0.55).toFixed(2));
    core.style.setProperty('--blink-dur', `${random(2.4, 4.6)}s`);
    core.style.setProperty('--blink-delay', `${random(0, 4)}s`);

    outer.appendChild(core);
    firefliesLayer.appendChild(outer);
  }
}

/* ---------------- Flowers (tulip-style) ---------------- */

function pointAlongQuad(x0, y0, cx, cy, x1, y1, t) {
  const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1;
  const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1;
  return { x, y };
}

const PETAL_HUES = [46, 42, 50];

function buildFlower({ x, size, delay, swayDelay }) {
  const width = 60 * size;
  const height = 210 * size;
  const cx = width / 2;
  const topY = 40 * size;
  const stemCurve = random(-12, 12) * size;

  const wrapper = document.createElement('div');
  wrapper.className = 'flower';
  wrapper.style.left = `${x}%`;
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  wrapper.style.setProperty('--delay', `${delay}s`);
  wrapper.style.setProperty('--grow-duration', `${random(0.85, 1.2)}s`);
  wrapper.style.setProperty('--sway-duration', `${random(3.6, 5.4)}s`);
  wrapper.style.setProperty('--sway-delay', `${swayDelay}s`);

  const hue = pick(PETAL_HUES) + random(-2, 2);
  const petalColor = `hsl(${hue}, 92%, ${random(58, 66)}%)`;
  wrapper.style.setProperty('--petal-color', petalColor);

  const svg = createSvgEl('svg', {
    class: 'flower__svg',
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
  });

  const shadow = createSvgEl('ellipse', {
    class: 'flower__shadow',
    cx,
    cy: height - 2,
    rx: 13 * size,
    ry: 3.2 * size,
  });
  svg.appendChild(shadow);

  const stemPath = `M ${cx} ${height - 4} Q ${cx + stemCurve} ${height * 0.55} ${cx} ${topY}`;
  const stem = createSvgEl('path', { class: 'flower__stem', d: stemPath });
  svg.appendChild(stem);

  // Leaves along the stem (blade-shaped)
  [0.42, 0.66].forEach((t, i) => {
    const along = pointAlongQuad(cx, height - 4, cx + stemCurve, height * 0.55, cx, topY, t);
    const side = i % 2 === 0 ? 1 : -1;
    const leafLen = 26 * size;
    const leafW = 8 * size;
    const tipX = along.x + side * leafLen;
    const tipY = along.y - leafLen * 0.35;
    const leaf = createSvgEl('path', {
      class: 'flower__leaf',
      d: `M ${along.x} ${along.y}
          C ${along.x + side * leafLen * 0.3} ${along.y - leafW * 0.9},
            ${along.x + side * leafLen * 0.8} ${tipY - leafW * 0.3},
            ${tipX} ${tipY}
          C ${along.x + side * leafLen * 0.75} ${tipY + leafW * 0.5},
            ${along.x + side * leafLen * 0.25} ${along.y + leafW * 0.5},
            ${along.x} ${along.y} Z`,
    });
    svg.appendChild(leaf);
  });

  // Sunflower head: disc + petals that unfurl outward from the center
  const head = createSvgEl('g', { class: 'flower__head' });
  const discR = 8.5 * size;
  const ox = cx;
  const oy = topY - discR * 0.85;
  head.style.setProperty('--ox', `${ox}px`);
  head.style.setProperty('--oy', `${oy}px`);

  const discOuter = createSvgEl('circle', {
    class: 'flower__disc flower__disc--outer',
    cx: ox,
    cy: oy,
    r: discR,
  });
  const discInner = createSvgEl('circle', {
    class: 'flower__disc flower__disc--inner',
    cx: ox,
    cy: oy,
    r: discR * 0.72,
  });
  head.appendChild(discOuter);
  head.appendChild(discInner);

  const seedCount = 24;
  for (let i = 0; i < seedCount; i++) {
    const a = i * 137.508 * (Math.PI / 180);
    const r = discR * 0.8 * Math.sqrt(i / seedCount);
    const seed = createSvgEl('circle', {
      class: 'flower__disc flower__disc--seed',
      cx: ox + Math.cos(a) * r,
      cy: oy + Math.sin(a) * r,
      r: 0.85 * size,
    });
    head.appendChild(seed);
  }

  const petalCount = 14 + Math.floor(random(0, 5));
  const petalLen = 16 * size;
  const petalWidth = 6.5 * size;
  const baseOffset = discR * 0.6;

  for (let i = 0; i < petalCount; i++) {
    const angle = (360 / petalCount) * i + random(-3, 3);
    const petal = createSvgEl('path', {
      class: 'flower__petal',
      d: petalPath(angle, ox, oy, baseOffset, petalLen, petalWidth),
    });
    petal.style.setProperty('--petal-stagger', `${i * 0.028}s`);
    head.appendChild(petal);
  }

  svg.appendChild(head);
  wrapper.appendChild(svg);

  return { wrapper, stem };
}

function rotatePoint(x, y, angleDeg, ox, oy) {
  const rad = (angleDeg * Math.PI) / 180;
  const rx = x * Math.cos(rad) - y * Math.sin(rad);
  const ry = x * Math.sin(rad) + y * Math.cos(rad);
  return `${ox + rx} ${oy + ry}`;
}

function petalPath(angleDeg, ox, oy, baseOffset, len, width) {
  const p1 = rotatePoint(-width / 2, -baseOffset, angleDeg, ox, oy);
  const c1 = rotatePoint(-width / 2, -(baseOffset + len * 0.5), angleDeg, ox, oy);
  const c2 = rotatePoint(-width * 0.28, -(baseOffset + len * 0.88), angleDeg, ox, oy);
  const tip = rotatePoint(0, -(baseOffset + len), angleDeg, ox, oy);
  const c3 = rotatePoint(width * 0.28, -(baseOffset + len * 0.88), angleDeg, ox, oy);
  const c4 = rotatePoint(width / 2, -(baseOffset + len * 0.5), angleDeg, ox, oy);
  const p2 = rotatePoint(width / 2, -baseOffset, angleDeg, ox, oy);
  return `M ${p1} C ${c1}, ${c2}, ${tip} C ${c3}, ${c4}, ${p2} Z`;
}

function growGarden() {
  garden.innerHTML = '';

  const flowerCount = 7;
  const spread = 26; // percentage width the cluster occupies
  const center = 50;
  const positions = [];
  for (let i = 0; i < flowerCount; i++) {
    const t = flowerCount === 1 ? 0.5 : i / (flowerCount - 1);
    const base = center - spread / 2 + spread * t;
    positions.push(base + random(-3.5, 3.5));
  }
  positions.sort(() => Math.random() - 0.5);

  let maxFinish = 0;

  positions.forEach((x, i) => {
    const size = random(0.8, 1.3);
    const delay = i * random(0.12, 0.2);
    const swayDelay = random(0, 2);
    const { wrapper, stem } = buildFlower({ x, size, delay, swayDelay });
    garden.appendChild(wrapper);

    const length = stem.getTotalLength();
    stem.style.strokeDasharray = length;
    wrapper.style.setProperty('--stem-length', length);

    requestAnimationFrame(() => wrapper.classList.add('is-growing'));

    const growDuration = parseFloat(wrapper.style.getPropertyValue('--grow-duration')) || 1;
    const finish = delay + growDuration + 0.75;
    if (finish > maxFinish) maxFinish = finish;

    wrapper.addEventListener('animationend', (e) => {
      if (e.animationName === 'bloom') {
        wrapper.classList.add('is-swaying');
      }
    });
  });

  setTimeout(() => {
    resetBtn.hidden = false;
    requestAnimationFrame(() => resetBtn.classList.add('is-visible'));
  }, maxFinish * 1000);
}

/* ---------------- Sparkles ---------------- */

function spawnSparkles(originX, originY) {
  for (let i = 0; i < 18; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    const angle = random(0, Math.PI * 2);
    const dist = random(40, 140);
    s.style.left = `${originX}px`;
    s.style.top = `${originY}px`;
    s.style.setProperty('--sx', `${Math.cos(angle) * dist}px`);
    s.style.setProperty('--sy', `${Math.sin(angle) * dist}px`);
    s.style.animationDelay = `${random(0, 0.15)}s`;
    scene.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  }
}

/* ---------------- Interaction ---------------- */

openBtn.addEventListener('click', () => {
  const rect = openBtn.getBoundingClientRect();
  spawnSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2);
  scene.classList.add('is-open');
  openBtn.classList.add('is-hidden');
  growGarden();
});

resetBtn.addEventListener('click', () => {
  garden.innerHTML = '';
  resetBtn.classList.remove('is-visible');
  resetBtn.hidden = true;
  scene.classList.remove('is-open');
  openBtn.classList.remove('is-hidden');
});

buildStars();
buildFireflies();
