import { useEffect, useRef } from 'react';

// Living node network: drifting "spores" linked like mycelium, with
// signal pulses travelling between them. Pure canvas, no deps.
export default function NeuralCanopy({ density = 0.00009, className = '', intensity = 1 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let nodes = [];
    let pulses = [];
    let raf = 0;
    const mouse = { x: -9999, y: -9999 };

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(24, Math.min(140, Math.floor(w * h * density)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.6 + 0.6,
        hue: Math.random() < 0.75 ? 'leaf' : 'moss',
        phase: Math.random() * Math.PI * 2,
      }));
      pulses = [];
    };

    const colors = { leaf: '184,242,138', moss: '79,209,165' };
    const LINK = 130;

    const frame = (t) => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        if (!reduce) {
          n.x += n.vx;
          n.y += n.vy;
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 14000) {
            n.x += dx * 0.004;
            n.y += dy * 0.004;
          }
          if (n.x < -20) n.x = w + 20;
          if (n.x > w + 20) n.x = -20;
          if (n.y < -20) n.y = h + 20;
          if (n.y > h + 20) n.y = -20;
        }
      }
      // links
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            const o = (1 - d / LINK) * 0.22 * intensity;
            ctx.strokeStyle = `rgba(${colors[a.hue]},${o})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            if (!reduce && Math.random() < 0.00025 && pulses.length < 18) pulses.push({ a, b, p: 0 });
          }
        }
      }
      // pulses
      pulses = pulses.filter((p) => p.p < 1);
      for (const p of pulses) {
        p.p += 0.012;
        const x = p.a.x + (p.b.x - p.a.x) * p.p;
        const y = p.a.y + (p.b.y - p.a.y) * p.p;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
        g.addColorStop(0, `rgba(184,242,138,${0.9 * intensity})`);
        g.addColorStop(1, 'rgba(184,242,138,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      // nodes
      for (const n of nodes) {
        const tw = 0.55 + 0.45 * Math.sin(t / 900 + n.phase);
        ctx.fillStyle = `rgba(${colors[n.hue]},${(0.35 + 0.5 * tw) * intensity})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    seed();
    raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(() => {
      seed();
      if (reduce) frame(0);
    });
    ro.observe(canvas);
    window.addEventListener('pointermove', onMove);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
    };
  }, [density, intensity]);

  return <canvas ref={ref} className={`neural-canopy ${className}`} aria-hidden="true" />;
}
