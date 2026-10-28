import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, BookOpen, Bot, Quote, Sparkles, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import NeuralCanopy from '../components/visual/NeuralCanopy';
import { useStore } from '../lib/store';
import { SUGGESTIONS, answer } from '../lib/assistant';
import { GLOSSARY } from '../data/plan';

// Render **bold** spans in answers.
const rich = (t) => t.split(/(\*\*[^*]+\*\*)/).map((p, i) => (p.startsWith('**') ? <b key={i}>{p.slice(2, -2)}</b> : p));

function Streamed({ msg, onDone }) {
  // Reveal the answer word by word to mimic a streaming model.
  const words = msg.text.split(' ');
  const [n, setN] = useState(msg.streamed ? words.length : 0);
  const done = n >= words.length;
  useEffect(() => {
    if (done) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setN((x) => x + 2), 28);
    return () => clearTimeout(t);
  }, [n, done]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <p>{rich(words.slice(0, n).join(' '))}{!done && <span className="caret" />}</p>
      {done && msg.bullets?.length > 0 && (
        <motion.ul className="msg-bullets" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {msg.bullets.map((b, i) => (
            <motion.li key={b} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              {rich(b)}
            </motion.li>
          ))}
        </motion.ul>
      )}
      {done && msg.sources?.length > 0 && (
        <div className="msg-sources">
          {msg.sources.map((s) => (
            <span key={s} className="source mono">
              <Quote size={10} /> {s}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

export default function Assistant() {
  const { state } = useStore();
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef(null);
  const field = useRef(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs, busy]);

  const ask = (text) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput('');
    setMsgs((m) => [...m, { role: 'user', text: q, id: Date.now() }]);
    setBusy(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { role: 'ai', id: Date.now() + 1, ...answer(q, state) }]);
    }, 650);
  };

  const markStreamed = (id) => {
    setBusy(false);
    setMsgs((m) => m.map((x) => (x.id === id ? { ...x, streamed: true } : x)));
  };

  const thinking = busy && msgs[msgs.length - 1]?.role === 'user';

  return (
    <div className="page assistant">
      <div className="chat">
        <div className="chat-scroll">
          {msgs.length === 0 && (
            <motion.div className="chat-empty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="chat-orb">
                <NeuralCanopy density={0.004} intensity={1} />
                <Sparkles size={22} />
              </div>
              <span className="eyebrow">Ask Canopy</span>
              <h1 className="display chat-title">
                What would you like to <em>know</em> about Year 1?
              </h1>
              <p className="muted">Answers come from the PFMSB 2027 Action Plan and the live programme state, and each one cites its source.</p>
              <div className="suggestions">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button key={s} className="suggestion" onClick={() => ask(s)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          <AnimatePresence initial={false}>
            {msgs.map((m) => (
              <motion.div key={m.id} className={`msg msg-${m.role}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <span className="msg-avatar">{m.role === 'ai' ? <Bot size={15} /> : <User size={15} />}</span>
                <div className="msg-body">{m.role === 'ai' ? <Streamed msg={m} onDone={() => markStreamed(m.id)} /> : <p>{m.text}</p>}</div>
              </motion.div>
            ))}
          </AnimatePresence>
          {thinking && (
            <div className="msg msg-ai">
              <span className="msg-avatar">
                <Bot size={15} />
              </span>
              <div className="msg-body">
                <span className="thinking mono">
                  <Sparkles size={12} /> Searching the plan…
                </span>
              </div>
            </div>
          )}
          <div ref={end} />
        </div>
        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          <textarea
            ref={field}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                ask(input);
              }
            }}
            placeholder="Ask about a phase, gate, function, KPI or term…"
            aria-label="Message"
          />
          <button className="composer-send" type="submit" disabled={!input.trim() || busy} aria-label="Send">
            <ArrowUp size={18} />
          </button>
        </form>
        <p className="composer-note mono faint">Canopy answers from the plan. Check figures before you rely on them.</p>
      </div>

      <aside className="glossary">
        <Card>
          <CardHeader eyebrow="Panduan istilah ringkas" title="Plain-language guide" icon={BookOpen} />
          <div className="glossary-list">
            {GLOSSARY.map((g) => (
              <button key={g.term} className="glossary-item" onClick={() => ask(`What does ${g.term} mean?`)}>
                <span className="glossary-term">{g.term}</span>
                <span className="muted">{g.text}</span>
              </button>
            ))}
          </div>
        </Card>
      </aside>
    </div>
  );
}
