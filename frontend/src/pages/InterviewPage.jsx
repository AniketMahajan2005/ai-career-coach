import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, CheckCircle2, Clock } from 'lucide-react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
const DIFFICULTY_COLOR = { Easy: 'var(--success)', Medium: 'var(--warn)', Hard: 'var(--danger)' };

export default function InterviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { topics = [], jd = '' } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | connecting | streaming | done | error
  const [statusMsg, setStatusMsg] = useState('');
  const [revealed, setRevealed] = useState({});
  const wsRef = useRef(null);

  const startSession = () => {
    const token = localStorage.getItem('token');
    if (!token || !topics.length) return;

    setQuestions([]);
    setStatus('connecting');
    setRevealed({});

    const params = new URLSearchParams({
      token,
      topics: topics.join(','),
      job_description: jd,
    });

    const ws = new WebSocket(`${WS_URL}/ws/interview?${params}`);
    wsRef.current = ws;

    ws.onopen = () => setStatus('streaming');

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'status') setStatusMsg(msg.message);
      else if (msg.type === 'question') {
        setQuestions((prev) => [...prev, msg]);
      } else if (msg.type === 'done') {
        setStatus('done');
      } else if (msg.type === 'error') {
        setStatus('error');
        setStatusMsg(msg.message);
      }
    };

    ws.onerror = () => { setStatus('error'); setStatusMsg('WebSocket connection failed'); };
    ws.onclose = () => { if (status !== 'done') setStatus('idle'); };
  };

  useEffect(() => { return () => wsRef.current?.close(); }, []);

  const toggleReveal = (i) => setRevealed((prev) => ({ ...prev, [i]: !prev[i] }));

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <button style={s.back} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Back to dashboard
        </button>
        <span style={s.brand}>⚡ Interview Prep</span>
      </nav>

      <div style={s.main}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Interview questions</h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
              Topics: {topics.join(' · ')}
            </p>
          </div>
          <button style={s.startBtn} onClick={startSession}
            disabled={status === 'connecting' || status === 'streaming'}>
            <Zap size={15} />
            {status === 'streaming' ? 'Generating...' : status === 'done' ? 'Regenerate' : 'Generate questions'}
          </button>
        </div>

        {(status === 'connecting' || status === 'streaming') && (
          <div style={s.banner}>
            <span className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
            {statusMsg || 'Connecting to interview session...'}
          </div>
        )}

        {status === 'error' && (
          <div style={{ ...s.banner, borderColor: 'var(--danger)', color: 'var(--danger)' }}>
            ⚠ {statusMsg}
          </div>
        )}

        <div style={s.list}>
          {questions.map((q, i) => (
            <div key={i} style={s.qCard}>
              <div style={s.qMeta}>
                <span style={{ ...s.badge, color: DIFFICULTY_COLOR[q.difficulty], borderColor: DIFFICULTY_COLOR[q.difficulty] }}>
                  {q.difficulty}
                </span>
                <span style={s.category}>{q.category}</span>
                <span style={{ ...s.category, marginLeft: 'auto' }}>Q{q.index}/{q.total}</span>
              </div>
              <p style={s.qText}>{q.question}</p>
              <button style={s.revealBtn} onClick={() => toggleReveal(i)}>
                {revealed[i] ? <><CheckCircle2 size={13} /> Hide tips</> : <><Clock size={13} /> Show answer tips</>}
              </button>
              {revealed[i] && (
                <div style={s.tips}>
                  Think about: specific examples (STAR method), concrete metrics, and how your experience maps to this role's requirements.
                </div>
              )}
            </div>
          ))}

          {status === 'idle' && questions.length === 0 && (
            <div style={s.empty}>
              <Zap size={48} color="var(--border)" />
              <p style={{ color: 'var(--muted)', marginTop: 16 }}>
                Click "Generate questions" to start your session
              </p>
            </div>
          )}

          {status === 'done' && (
            <div style={s.doneBanner}>
              <CheckCircle2 size={18} color="var(--success)" />
              All {questions.length} questions delivered. Good luck!
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        .pulse { animation: pulse 1.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 28px', borderBottom: '1px solid var(--border)',
    background: 'var(--surface)', position: 'sticky', top: 0,
  },
  back: {
    display: 'flex', alignItems: 'center', gap: 6, background: 'transparent',
    color: 'var(--muted)', fontSize: 13, border: 'none',
  },
  brand: { fontSize: 15, fontWeight: 600, color: 'var(--primary)' },
  main: { maxWidth: 800, margin: '0 auto', width: '100%', padding: '32px 24px' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 },
  title: { fontSize: 22, fontWeight: 700 },
  startBtn: {
    display: 'flex', alignItems: 'center', gap: 7,
    background: 'var(--primary)', color: '#fff',
    padding: '10px 18px', borderRadius: 8, fontWeight: 600, fontSize: 13,
    whiteSpace: 'nowrap', flexShrink: 0,
  },
  banner: {
    display: 'flex', alignItems: 'center', gap: 10,
    border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px',
    fontSize: 13, color: 'var(--muted)', marginBottom: 20,
  },
  list: { display: 'flex', flexDirection: 'column', gap: 14 },
  qCard: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 12, padding: 20,
    animation: 'fadeIn 0.3s ease',
  },
  qMeta: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 },
  badge: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, border: '1px solid' },
  category: { fontSize: 12, color: 'var(--muted)' },
  qText: { fontSize: 15, lineHeight: 1.6, fontWeight: 500 },
  revealBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    background: 'transparent', color: 'var(--muted)', fontSize: 12,
    marginTop: 12, padding: 0, border: 'none',
  },
  tips: {
    marginTop: 10, padding: '10px 14px',
    background: 'var(--bg)', borderLeft: '3px solid var(--primary)',
    borderRadius: 4, fontSize: 13, color: 'var(--muted)', lineHeight: 1.6,
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '80px 0', color: 'var(--muted)',
  },
  doneBanner: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#0d2318', border: '1px solid var(--success)',
    borderRadius: 8, padding: '12px 18px', color: 'var(--success)', fontSize: 14,
  },
};
