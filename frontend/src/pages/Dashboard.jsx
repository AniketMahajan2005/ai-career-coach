import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Upload, Loader2, LogOut, Zap, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!file || !jd.trim()) { setError('Upload a resume and paste the job description'); return; }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append('resume', file);
      form.append('job_description', jd);
      const { data } = await api.post('/analyze/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s) => s >= 75 ? 'var(--success)' : s >= 50 ? 'var(--warn)' : 'var(--danger)';

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.brand}>⚡ AI Career Coach</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'var(--muted)', fontSize: 14 }}>Hi, {user.name}</span>
          <button style={s.navBtn} onClick={logout}><LogOut size={15} /> Sign out</button>
        </div>
      </nav>

      <div style={s.main}>
        <div style={s.panel}>
          <h2 style={s.panelTitle}>Analyse your resume</h2>

          <label style={s.dropzone}>
            <Upload size={28} color="var(--primary)" />
            <span style={{ fontSize: 14, color: 'var(--muted)', marginTop: 8 }}>
              {file ? file.name : 'Click to upload resume (PDF)'}
            </span>
            <input type="file" accept=".pdf" style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files[0])} />
          </label>

          <div style={{ marginTop: 16 }}>
            <label style={s.label}>Job Description</label>
            <textarea
              rows={10}
              placeholder="Paste the job description here..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              style={{ resize: 'vertical', marginTop: 6 }}
            />
          </div>

          {error && <p style={s.error}>{error}</p>}

          <button style={s.btn} onClick={analyze} disabled={loading}>
            {loading
              ? <><Loader2 size={16} className="spin" /> Analysing...</>
              : <><Zap size={16} /> Analyse fit</>
            }
          </button>
        </div>

        <div style={s.panel}>
          {!result && !loading && (
            <div style={s.empty}>
              <TrendingUp size={48} color="var(--border)" />
              <p style={{ color: 'var(--muted)', marginTop: 16, textAlign: 'center' }}>
                Upload your resume and a job description to see your fit score, skill gaps, and tailored interview topics.
              </p>
            </div>
          )}

          {loading && (
            <div style={s.empty}>
              <Loader2 size={40} color="var(--primary)" className="spin" />
              <p style={{ color: 'var(--muted)', marginTop: 16 }}>Consulting the AI career coach...</p>
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={s.panelTitle}>Analysis results</h2>

              <div style={{ ...s.card, textAlign: 'center' }}>
                <div style={{ fontSize: 64, fontWeight: 700, color: scoreColor(result.fit_score), lineHeight: 1 }}>
                  {result.fit_score}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>fit score out of 100</div>
                <div style={s.scorebar}>
                  <div style={{ ...s.scorefill, width: `${result.fit_score}%`, background: scoreColor(result.fit_score) }} />
                </div>
                <p style={{ fontSize: 14, marginTop: 12, color: 'var(--text)' }}>{result.summary}</p>
              </div>

              <div style={s.card}>
                <h3 style={s.cardTitle}>Skill match</h3>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ ...s.skillLabel, color: 'var(--success)' }}>
                      <CheckCircle size={13} /> Matching
                    </div>
                    <div style={s.pills}>
                      {result.skill_gap.matching_skills.map(sk => (
                        <span key={sk} style={{ ...s.pill, borderColor: 'var(--success)', color: 'var(--success)' }}>{sk}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ ...s.skillLabel, color: 'var(--danger)' }}>
                      <XCircle size={13} /> Missing
                    </div>
                    <div style={s.pills}>
                      {result.skill_gap.missing_skills.map(sk => (
                        <span key={sk} style={{ ...s.pill, borderColor: 'var(--danger)', color: 'var(--danger)' }}>{sk}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={s.card}>
                <h3 style={s.cardTitle}>Recommendations</h3>
                <ul style={{ paddingLeft: 18, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.skill_gap.suggestions.map((sg, i) => (
                    <li key={i} style={{ fontSize: 14, color: 'var(--text)' }}>{sg}</li>
                  ))}
                </ul>
              </div>

              <button style={{ ...s.btn, background: '#1a2744' }}
                onClick={() => navigate('/interview', { state: { topics: result.interview_topics, jd } })}>
                <Zap size={15} /> Start interview prep →
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 28px', borderBottom: '1px solid var(--border)',
    background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 10,
  },
  brand: { fontSize: 16, fontWeight: 700, color: 'var(--primary)' },
  navBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'transparent', color: 'var(--muted)', fontSize: 13,
    padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)',
  },
  main: {
    display: 'flex', gap: 24, padding: 28, flex: 1,
    maxWidth: 1200, margin: '0 auto', width: '100%',
  },
  panel: {
    flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 14, padding: 24,
  },
  panelTitle: { fontSize: 18, fontWeight: 600, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 500, color: 'var(--muted)' },
  dropzone: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    border: '2px dashed var(--border)', borderRadius: 10, padding: '28px 16px',
    cursor: 'pointer', transition: 'border-color 0.2s',
  },
  btn: {
    width: '100%', marginTop: 16, padding: '12px',
    background: 'var(--primary)', color: '#fff', borderRadius: 8,
    fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  error: { color: 'var(--danger)', fontSize: 13, marginTop: 10 },
  empty: {
    height: '100%', minHeight: 300,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  },
  card: { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 18 },
  cardTitle: { fontSize: 14, fontWeight: 600, color: 'var(--muted)' },
  scorebar: { height: 6, background: 'var(--border)', borderRadius: 3, marginTop: 14, overflow: 'hidden' },
  scorefill: { height: '100%', borderRadius: 3, transition: 'width 1s ease' },
  skillLabel: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, marginBottom: 8 },
  pills: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  pill: { fontSize: 12, padding: '2px 10px', borderRadius: 20, border: '1px solid', background: 'transparent' },
};
