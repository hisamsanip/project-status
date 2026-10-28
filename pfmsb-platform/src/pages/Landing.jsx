import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Diamond,
  FileSearch,
  Flag,
  GitBranch,
  Network,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useRef } from 'react';
import Button from '../components/ui/Button';
import Logo from '../components/visual/Logo';
import NeuralCanopy from '../components/visual/NeuralCanopy';
import GrowthRings from '../components/visual/GrowthRings';
import Ring from '../components/ui/Ring';
import { CLUSTERS, PHASES, PROGRAMME, TAKEAWAYS } from '../data/plan';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

function HeroPreview() {
  return (
    <div className="preview">
      <div className="preview-chrome">
        <span />
        <span />
        <span />
        <p className="mono">canopy.pfmsb / overview</p>
      </div>
      <div className="preview-body">
        <div className="preview-row">
          <div className="preview-card preview-pulse">
            <Ring value={0.25} size={92} stroke={6}>
              <span className="display preview-ring-val">M3</span>
            </Ring>
            <div>
              <span className="eyebrow">Phase 2 · live</span>
              <p className="preview-big display">Core capability</p>
              <p className="faint preview-small">Gate M4 in 1 month · 1/3 checks</p>
            </div>
          </div>
          <div className="preview-card preview-ai">
            <span className="eyebrow">
              <Sparkles size={11} /> Canopy brief
            </span>
            <p>
              <b>Tender &amp; business development</b> is the weakest critical function at 1/5.
            </p>
            <p className="faint">3 in-focus functions have no evidence yet.</p>
            <span className="preview-caret" />
          </div>
        </div>
        <div className="preview-card preview-band">
          {PHASES.map((p) => (
            <div key={p.id} className={`preview-seg ${p.id === 1 ? 'is-done' : p.id === 2 ? 'is-active' : ''}`} style={{ flex: p.end - p.start + 1 }}>
              <span className="mono">P{p.id}</span>
              <Diamond size={9} />
            </div>
          ))}
        </div>
        <div className="preview-row preview-rings">
          {CLUSTERS.map((c, i) => (
            <div key={c.id} className="preview-card preview-cluster">
              <GrowthRings value={[2, 2, 3, 2][i]} target={[3, 3, 3, 3][i]} size={46} label={false} />
              <div>
                <span className="mono faint">Cluster {c.id}</span>
                <p>{c.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: GitBranch,
    title: 'Roadmap intelligence',
    text: 'Twelve months, five phases and five gates on one living timeline. Scrub the programme clock and the whole platform re-plans with you.',
    span: 'wide',
    to: '/app/roadmap',
  },
  {
    icon: FileSearch,
    title: 'Evidence vault',
    text: 'Drop in registers, contracts and SOPs. Canopy classifies each one to a function and pulls out what matters.',
    to: '/app/evidence',
  },
  {
    icon: Flag,
    title: 'Stage gates',
    text: 'Management confirms evidence before the next phase starts. No gate is passed on confidence alone.',
    to: '/app/gates',
  },
  {
    icon: Network,
    title: 'Maturity scoring',
    text: 'All 12 functions scored 1–5 on five dimensions. Baseline in Phase 1, reassessed in Phase 5.',
    to: '/app/functions',
  },
  {
    icon: Bot,
    title: 'Ask Canopy',
    text: 'Ask a plain-language question about any phase, KPI, risk or term and get an answer that cites the plan.',
    span: 'wide',
    to: '/app/assistant',
  },
];

export default function Landing() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const tilt = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const lift = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <div className="landing">
      <header className="lnav">
        <a href="#/" aria-label="Canopy home">
          <Logo />
        </a>
        <nav className="lnav-links" aria-label="Sections">
          <a href="#/" onClick={(e) => { e.preventDefault(); document.getElementById('phases')?.scrollIntoView({ behavior: 'smooth' }); }}>Roadmap</a>
          <a href="#/" onClick={(e) => { e.preventDefault(); document.getElementById('platform')?.scrollIntoView({ behavior: 'smooth' }); }}>Platform</a>
          <a href="#/" onClick={(e) => { e.preventDefault(); document.getElementById('principles')?.scrollIntoView({ behavior: 'smooth' }); }}>Principles</a>
        </nav>
        <Button as="a" href="#/app" size="sm" iconRight={ArrowRight}>
          Open platform
        </Button>
      </header>

      <section className="hero" ref={heroRef}>
        <NeuralCanopy className="hero-canvas" />
        <div className="hero-glow" aria-hidden="true" />
        <motion.div className="hero-copy" initial="hidden" animate="show">
          <motion.a href="#/app/assistant" className="hero-pill" variants={fadeUp} custom={0}>
            <span className="hero-pill-tag mono">New</span>
            Ask Canopy now answers from the full Year 1 plan
            <ArrowUpRight size={14} />
          </motion.a>
          <motion.h1 className="display hero-title" variants={fadeUp} custom={1}>
            Grow capability
            <br />
            with <em>evidence</em>, not guesswork.
          </motion.h1>
          <motion.p className="hero-sub" variants={fadeUp} custom={2}>
            Canopy is the transformation intelligence platform for {PROGRAMME.name}. {PROGRAMME.summary}
          </motion.p>
          <motion.div className="hero-ctas" variants={fadeUp} custom={3}>
            <Button as="a" href="#/app" size="lg" iconRight={ArrowRight}>
              Enter the command centre
            </Button>
            <Button as="a" href="#/app/roadmap" size="lg" variant="ghost">
              View the 12-month roadmap
            </Button>
          </motion.div>
          <motion.p className="hero-ms mono" variants={fadeUp} custom={4}>
            {PROGRAMME.titleMs} · Pelan Tindakan PFMSB 2027
          </motion.p>
        </motion.div>

        <motion.div className="hero-stage" style={{ rotateX: tilt, y: lift }} initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          <HeroPreview />
        </motion.div>
      </section>

      <section className="strip">
        {[
          ['12', 'months'],
          ['5', 'phases'],
          ['5', 'stage gates'],
          ['12', 'functions'],
          ['4', 'clusters'],
        ].map(([v, l], i) => (
          <motion.div key={l} className="strip-item" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} custom={i}>
            <span className="display">{v}</span>
            <span className="mono faint">{l}</span>
          </motion.div>
        ))}
      </section>

      <section className="lsection" id="phases">
        <motion.div className="lsection-head" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <motion.span className="eyebrow" variants={fadeUp}>The year in one picture</motion.span>
          <motion.h2 className="display lsection-title" variants={fadeUp} custom={1}>
            Foundation first. Then delivery.
            <br />
            <em>Then growth.</em>
          </motion.h2>
        </motion.div>
        <div className="phase-flow">
          <div className="phase-flow-line" aria-hidden="true" />
          {PHASES.map((p, i) => (
            <motion.a
              href={`#/app/roadmap?phase=${p.id}`}
              key={p.id}
              className="phase-flow-card"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              custom={i}
            >
              <span className="phase-flow-node">
                <Diamond size={12} />
              </span>
              <span className="mono faint">
                Phase {p.id} · M{p.start}–{p.end}
              </span>
              <h3>{p.short}</h3>
              <p className="muted">{p.summary}</p>
              <div className="phase-flow-deliv">
                <span className="eyebrow">Deliverable</span>
                <p>{p.deliverable}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      <section className="lsection" id="platform">
        <motion.div className="lsection-head" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <motion.span className="eyebrow" variants={fadeUp}>The platform</motion.span>
          <motion.h2 className="display lsection-title" variants={fadeUp} custom={1}>
            One place for the plan, the proof
            <br />
            and the <em>decisions</em>.
          </motion.h2>
        </motion.div>
        <div className="bento">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.a
                key={f.title}
                href={`#${f.to}`}
                className={`bento-card ${f.span === 'wide' ? 'is-wide' : ''}`}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                custom={i}
              >
                <span className="bento-icon">
                  <Icon size={18} />
                </span>
                <h3>{f.title}</h3>
                <p className="muted">{f.text}</p>
                <span className="bento-link mono">
                  Open <ArrowRight size={13} />
                </span>
                {i === 0 && <NeuralCanopy className="bento-canvas" density={0.0003} intensity={0.7} />}
              </motion.a>
            );
          })}
        </div>
      </section>

      <section className="lsection" id="principles">
        <motion.div className="lsection-head" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <motion.span className="eyebrow" variants={fadeUp}>Year 1 · three takeaways</motion.span>
          <motion.h2 className="display lsection-title" variants={fadeUp} custom={1}>
            Build capability. Prove readiness.
            <br />
            <em>Scale with evidence.</em>
          </motion.h2>
          <motion.p className="mono faint" variants={fadeUp} custom={2}>
            Bina keupayaan. Buktikan kesediaan. Kembang dengan bukti.
          </motion.p>
        </motion.div>
        <div className="takeaways">
          {TAKEAWAYS.map((t, i) => (
            <motion.div key={t} className="takeaway" initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <span className="display takeaway-num">0{i + 1}</span>
              <p>{t}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="cta">
        <NeuralCanopy className="cta-canvas" density={0.00018} />
        <div className="cta-inner">
          <ShieldCheck size={22} className="tone-leaf" />
          <span className="eyebrow">Decision requested</span>
          <h2 className="display cta-title">
            Approve the Phase 1 mobilisation charter and launch the <em>baseline assessment</em>.
          </h2>
          <p className="muted">Once approved, Month 1 begins: charter signed, owners named and scope confirmed.</p>
          <Button as="a" href="#/app/risks" size="lg" iconRight={ArrowRight}>
            Review the decisions
          </Button>
        </div>
      </section>

      <footer className="lfoot">
        <Logo size={24} />
        <p className="mono faint">PFMSB 2027 Action Plan · Confidential &amp; Restricted · Proposed plan for management alignment</p>
      </footer>
    </div>
  );
}
