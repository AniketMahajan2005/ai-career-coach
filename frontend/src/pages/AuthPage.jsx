import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AuthPage() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const { login, register } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>⚡ AI Career Coach</div>
        <h1 style={styles.heading}>{isLogin ? 'Sign in' : 'Create account'}</h1>
        <p style={styles.sub}>
          {isLogin ? "Don't have an account? " : 'Already have one? '}
          <Link to={isLogin ? '/register' : '/login'} style={{ color: 'var(--primary)' }}>
            {isLogin ? 'Register' : 'Sign in'}
          </Link>
        </p>

        <div style={styles.fields}>
          {!isLogin && (
            <input name="name" placeholder="Full name" value={form.name} onChange={handle} />
          )}
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handle} />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handle}
            onKeyDown={(e) => e.key === 'Enter' && submit()} />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.btn} onClick={submit} disabled={loading}>
          {loading ? <Loader2 size={16} className="spin" /> : (isLogin ? 'Sign in' : 'Create account')}
        </button>
      </div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '24px',
  },
  card: {
    width: '100%', maxWidth: 400,
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 16, padding: '40px 36px',
  },
  logo: { fontSize: 18, fontWeight: 700, color: 'var(--primary)', marginBottom: 28 },
  heading: { fontSize: 26, fontWeight: 700, marginBottom: 6 },
  sub: { color: 'var(--muted)', fontSize: 14, marginBottom: 28 },
  fields: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 },
  error: { color: 'var(--danger)', fontSize: 13, marginBottom: 12 },
  btn: {
    width: '100%', padding: '12px', borderRadius: 8,
    background: 'var(--primary)', color: '#fff',
    fontWeight: 600, fontSize: 15, marginTop: 8,
    transition: 'background 0.2s',
  },
};
