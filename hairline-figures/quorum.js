/**
 * Quorum: a hall of tip-up chairs on five tiers, facing a lectern. A chair that
 * has been taken has its seat down; a free one has its seat folded up. The
 * pointer picks a row, and every row up to it fills (a few latecomers sit one
 * row behind), staggered outwards from the pointer. A cord is strung before
 * the third tier: the line a meeting has to cross to count. The bright stroke
 * is the frontier, the last row to have arrived: at rest, the row at the cord.
 * The slider is the stagger, in ms.
 *
 * The pattern: discrete items. Tweens, a stagger by distance, a state carried
 * by the shape of each seat, and a hit test on the rows' rest poses.
 */
const {
  Cam, facing, fillet, fit, poly, prism, proj, rad, rings, unproj,
  tdone, tset, tval, tween, disposer, mk, pointer, put, register, solid,
} = HL;

const NR = 5, NC = 5, CP = 16, RP = 18, ST = 4.5, W = NC * CP, DEPTH = NR * RP;
const CW = 12, SL = 7, TK = 1.3, SEAT = 5, BACK = 12, UP = 88, REST = 1, LATE = "41 12 32 03 23 24 44";
const tierH = (d) => (d + 1) * ST;
const rowY = (d) => (NR - 1 - d) * RP + RP / 2;
const SHAPE = fillet([[-CW / 2, 0], [CW / 2, 0], [CW / 2, SL], [-CW / 2, SL]], [1.8, 1.8, 1.8, 1.8]);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value, act = -1;

  const C = Cam(45, 0.5, 2.1);
  fit(C, [[-6, -6, -4], [W + 6, -6, -4], [W + 6, DEPTH + 24, -4], [-6, DEPTH + 24, -4], [0, 0, tierH(NR - 1) + BACK], [W, 0, tierH(NR - 1) + BACK]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const box = (x0, y0, x1, y1, r, b, z0, z1) => { const [o, i] = rings(x0, y0, x1, y1, r, b); put(solid(g), prism(P, front, o, i, z0, z1)); };
  box(-6, -6, W + 6, DEPTH + 24, 7, 1.6, -4, 0);

  // Back to front: each tier, then its chairs, so every nearer thing covers what is behind it.
  const chairs = [];
  for (let d = NR - 1; d >= 0; d--) {
    const h = tierH(d), yc = rowY(d), y0 = (NR - 1 - d) * RP;
    box(0, y0, W, y0 + RP, 3, 1.2, 0, h);
    for (let c = 0; c < NC; c++) {
      const xc = (c + 0.5) * CP, late = LATE.includes(`${c}${d}`) ? 1 : 0;
      const [br, bi] = rings(xc - CW / 2, yc - 4.4, xc + CW / 2, yc - 2, 1.1, 0.5);
      const back = solid(g);
      put(back, prism(P, front, br, bi, h, h + BACK));
      const under = mk("path", { class: "lo" }, g), face = mk("path", { class: "sil" }, g);
      const t = tween(d + late <= REST ? 0 : UP);
      chairs.push({ c, d, late, back, under, face, t, xc, yh: yc - 2, zh: h + SEAT, drawn: NaN });
      back.sil.classList.toggle("hi", d === REST);
    }
    if (d === 3) { // the cord, strung along the edge of the tier behind the quorum
      for (const px of [1.5, W - 1.5]) box(px - 1, 33.4, px + 1, 35.4, 0.9, 0.3, h, h + 4.2);
      box(2.5, 34, W - 2.5, 34.8, 0.4, 0.2, h + 2.6, h + 3.8);
    }
  }
  // the lectern, nearest the viewer
  box(W / 2 - 9, DEPTH + 6, W / 2 + 9, DEPTH + 15, 1.5, 0.6, 0, 9);
  box(W / 2 - 11, DEPTH + 4.5, W / 2 + 11, DEPTH + 16.5, 1.5, 0.5, 9, 10.4);

  /** A seat hinged at the back of its chair, th degrees up from flat: its top face and its underside. */
  function draw(ch, th) {
    ch.drawn = th;
    const s = Math.sin(rad(th)), k = Math.cos(rad(th));
    const w = (u, v, o) => P(ch.xc + u, ch.yh + v * k + o * s, ch.zh + v * s - o * k);
    ch.face.setAttribute("d", poly(SHAPE.map(([u, v]) => w(u, v, 0))));
    ch.under.setAttribute("d", poly(SHAPE.map(([u, v]) => w(u, v, TK))));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const ch of chairs) {
      const th = tval(ch.t, now);
      if (th !== ch.drawn) draw(ch, th);
      if (!tdone(ch.t, now)) moving = true;
    }
    return moving;
  });
  bag.add(B.unregister);

  /** The row whose rest pose is nearest the pointer; -1 outside the hall. Each row is tested on a plane at its own chair height. */
  function hit([sx, sy]) {
    let best = -1, bd = RP * 0.55;
    for (let d = 0; d < NR; d++) {
      const [x, y] = unproj(C, sx, sy, tierH(d) + 6);
      const e = Math.abs(y - (rowY(d) - 2));
      if (x > -8 && x < W + 8 && e < bd) { best = d; bd = e; }
    }
    return best;
  }

  function setRow(a) {
    if (a === act) return;
    const now = performance.now(), f = a < 0 ? REST : a, from = a >= 0 ? a : act;
    act = a;
    let n = 0;
    for (const ch of chairs) {
      const taken = ch.d + ch.late <= f;
      if (taken) n++;
      tset(ch.t, taken ? 0 : UP, now, Math.abs(ch.d - from) * stag);
      ch.back.sil.classList.toggle("hi", ch.d === f);
    }
    read.textContent = a < 0 ? "rest" : `row ${a + 1} · ${n}`;
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => setRow(hit(p)), leave: () => setRow(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "quorum",
  means: "A hall of tip-up chairs: the pointer picks a row, and every row up to it fills, from the lectern back.",
  rules: [1, 2, 5, 9],
  range: [0, 40, 90],
  tour: [[165, 188], [245, 124], [272, 102], null],
  mount,
});
