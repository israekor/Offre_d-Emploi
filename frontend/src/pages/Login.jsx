import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/auth';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userName', user.name);
      if (user.role === 'recruiter') {
        window.location.href = '/recruiter-dashboard';
      } else {
        navigate('/jobs');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Identifiants incorrects');
    }
  };

  return (
    <div style={wrap}>
      <form onSubmit={handleSubmit} style={card}>


        {/* Logo / brand mark */}
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36, cursor: 'pointer' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#0C1F3C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0C1F3C', letterSpacing: '-0.3px' }}>JobBoard</span>
        </div>
                

        <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0C1F3C', letterSpacing: '-0.5px', margin: '0 0 6px' }}>
          Bon retour
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 28px' }}>
          Connectez-vous à votre compte pour continuer.
        </p>

        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 8, padding: '10px 14px',
            fontSize: 13, color: '#B91C1C', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Adresse email</label>
          <input
            style={inputStyle}
            type="email"
            placeholder="vous@exemple.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={labelStyle}>Mot de passe</label>
            <a href="#" style={{ fontSize: 12, color: '#378ADD', textDecoration: 'none' }}>
              Mot de passe oublié ?
            </a>
          </div>
          <input
            style={inputStyle}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <button type="submit" style={btnPrimary}>
          Se connecter
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 24, margin: '24px 0 0' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: '#378ADD', fontWeight: 500, textDecoration: 'none' }}>
            S'inscrire
          </Link>
        </p>

      </form>
    </div>
  );
}

const wrap = {
  minHeight: '100vh',
  background: '#f7f9fc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
};

const card = {
  background: '#fff',
  border: '1px solid #eaecf0',
  borderRadius: 20,
  padding: '40px 36px',
  width: '100%',
  maxWidth: 420,
};

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '10px 14px',
  fontSize: 14,
  color: '#111',
  background: '#fff',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const btnPrimary = {
  display: 'block',
  width: '100%',
  marginTop: 20,
  padding: '12px',
  borderRadius: 10,
  background: '#0C1F3C',
  color: '#fff',
  border: 'none',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  letterSpacing: '-0.1px',
  fontFamily: 'inherit',
};