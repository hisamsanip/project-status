import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { KPIS, SUCCESS, TAKEAWAYS } from '../data/plan';

export default function Outcomes() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Ukuran kejayaan Tahun 1"
        title={
          <>
            What success looks like at <em>M12</em>.
          </>
        }
        subtitle="Definitions, baselines, owners and thresholds are confirmed during Phase 1."
      />
      <div className="notice">
        <Info size={16} />
        <span>All values are <b>proposed Year 1 targets</b> or gates for management validation. They are not PFMSB actual results.</span>
      </div>

      <div className="success-grid">
        {SUCCESS.map((s, i) => (
          <motion.div key={s.label} className="success" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <span className="display success-value">{s.value}</span>
            <p className="muted">{s.label}</p>
            <span className="success-idx mono faint">0{i + 1}</span>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader eyebrow="Hasil kerja yang boleh diukur dan KPI yang dicadangkan" title="Deliverables and proposed KPIs" />
        <div className="kpi-table" role="table">
          <div className="kpi-row kpi-head" role="row">
            <span className="eyebrow" role="columnheader">Deliverable</span>
            <span className="eyebrow" role="columnheader">Evidence</span>
            <span className="eyebrow" role="columnheader">Proposed target</span>
          </div>
          {KPIS.map((k, i) => (
            <motion.div key={k.name} className="kpi-row" role="row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <span className="kpi-name" role="cell">
                <span className="mono faint">{String(i + 1).padStart(2, '0')}</span> {k.name}
              </span>
              <span className="muted" role="cell">
                {k.evidence}
              </span>
              <span className="kpi-target" role="cell">
                {k.target}
              </span>
            </motion.div>
          ))}
        </div>
      </Card>

      <div className="takeaways takeaways-app">
        {TAKEAWAYS.map((t, i) => (
          <div key={t} className="takeaway">
            <span className="display takeaway-num">0{i + 1}</span>
            <p>{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
