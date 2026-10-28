import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Check, Clock, Compass, Database, Handshake, ShieldCheck, Users, Wallet } from 'lucide-react';

const Icons = { BadgeCheck, Compass, Database, Handshake, Users, Wallet };
import PageHeader from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Segmented from '../components/ui/Segmented';
import { useStore } from '../lib/store';
import { DECISIONS, RISKS } from '../data/plan';

export default function Risks() {
  const { state, dispatch } = useStore();
  const approved = state.decisions.filter((d) => d === 'approved').length;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Part D · Risks and decisions"
        title={
          <>
            What could go wrong, and what we must <em>decide</em>.
          </>
        }
        subtitle="Escalate any unresolved critical dependency before the relevant stage gate."
      />

      <div className="grid grid-3">
        {RISKS.map((r, i) => {
          const Icon = Icons[r.icon] || ShieldCheck;
          return (
            <Card key={r.name} delay={i * 0.05} className="risk">
              <span className="risk-icon">
                <Icon size={18} />
              </span>
              <h3>{r.name}</h3>
              <div className="risk-block">
                <span className="eyebrow">We must</span>
                <p className="muted">{r.must}</p>
              </div>
              <div className="risk-control">
                <ShieldCheck size={14} className="tone-leaf" />
                <span>{r.control}</span>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader
          eyebrow="Keputusan yang diperlukan daripada pengurusan"
          title="Decisions needed from management"
          action={<Badge tone={approved === 6 ? 'leaf' : 'sun'} dot>{approved}/6 approved</Badge>}
        />
        <ol className="decisions">
          {DECISIONS.map((d, i) => {
            const st = state.decisions[i];
            return (
              <motion.li key={d} className={`decision is-${st}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <span className="decision-idx display">{i + 1}</span>
                <p>{d}</p>
                <Segmented
                  size="sm"
                  label={`Decision ${i + 1} status`}
                  value={st}
                  onChange={(v) => dispatch({ type: 'decision', index: i, status: v })}
                  options={[
                    { value: 'pending', label: <><Clock size={12} /> Pending</> },
                    { value: 'approved', label: <><Check size={12} /> Approved</> },
                  ]}
                />
              </motion.li>
            );
          })}
        </ol>
      </Card>

      <Card className="request" glow>
        <span className="eyebrow">Decision requested</span>
        <h2 className="display request-title">
          Approve the Phase 1 mobilisation charter and launch the <em>baseline assessment</em>.
        </h2>
        <p className="muted">Once approved, Month 1 begins: charter signed, owners named and scope confirmed.</p>
        <a className="request-link mono" href="#/app/gates">
          See how gates control the year <ArrowRight size={13} />
        </a>
      </Card>
    </div>
  );
}
