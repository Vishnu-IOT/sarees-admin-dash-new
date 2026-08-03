import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function MotifSVG(props) {
  return (
    <svg viewBox="0 0 220 220" fill="none" {...props}>
      <path
        d="M110 20c34 32 52 63 52 87a52 52 0 1 1-104 0c0-24 18-55 52-87z"
        stroke="var(--gold-soft)"
        strokeWidth="1.4"
        opacity="0.55"
      />
      <path
        d="M110 55c22 22 34 42 34 58a34 34 0 1 1-68 0c0-16 12-36 34-58z"
        stroke="var(--gold)"
        strokeWidth="1.4"
        opacity="0.8"
      />
    </svg>
  );
}

export default function Login() {
  const { isAuthenticated, login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to={location.state?.from || '/'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.ok) {
      navigate(location.state?.from || '/', { replace: true });
    } else {
      setError(result.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-visual">
        <div className="thread-frame" />
        <MotifSVG className="motif" />
        <div className="thread-rule" />
        <h2>Every saree has a story woven into its border.</h2>
        <p>Manage your catalogue, orders and customers from one place — as
          considered as the pieces you sell.</p>
      </div>

      <div className="login-form-side">
        <div className="login-form-card">
          <svg viewBox="0 0 34 34" fill="none" className="brand-mark">
            <circle cx="17" cy="17" r="17" fill="var(--ink)" />
            <path d="M17 7c4.5 4.3 6.8 8.3 6.8 11.3a6.8 6.8 0 1 1-13.6 0C10.2 15.3 12.5 11.3 17 7z" fill="var(--gold)" />
          </svg>
          <h1>Sign in to Boutique</h1>
          <p className="sub">Enter your admin credentials to continue.</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="form-note">
            This login checks against <code>VITE_ADMIN_EMAIL: admin@gmail.com</code> / <code>VITE_ADMIN_PASSWORD: changeme123</code>
          </div>
        </div>
      </div>
    </div>
  );
}
