import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { USER_ROLES } from '../constants/areas';
import { APP_NAME } from '../constants/brand';
import { AnimatedSection } from '../components/PageTransition';

export default function Login() {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      success(`Welcome back, ${user.fullName}!`);
      navigate(user.role === USER_ROLES.ADMIN ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message);
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-visual">
        <AnimatedSection>
          <h2>Connect. Give. Impact.</h2>
          <p>Direct one-to-one donations between verified donors and receivers — transparent, secure, no middleman.</p>
        </AnimatedSection>
        <div className="auth-visual-cards">
          {['Admin-verified accounts', 'Interest-based matching', 'Gateway-monitored payments'].map((t, i) => (
            <AnimatedSection key={t} delay={i * 100}>
              <div className="mini-card"><span className="check-icon">✓</span> {t}</div>
            </AnimatedSection>
          ))}
        </div>
      </div>

      <div className="auth-form-side">
        <AnimatedSection delay={100}>
          <div className="auth-card card glass-card">
            <div className="auth-icon"><LogIn size={24} /></div>
            <h1>Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your {APP_NAME} account</p>

            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label htmlFor="email"><Mail size={14} /> Email</label>
                <input id="email" name="email" type="email" required placeholder="you@example.com"
                  value={form.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="password"><Lock size={14} /> Password</label>
                <input id="password" name="password" type="password" required placeholder="••••••••"
                  value={form.password} onChange={handleChange} />
              </div>
              {error && <p className="form-error">{error}</p>}
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Signing in...' : <>Sign In <ArrowRight size={16} /></>}
              </button>
            </form>

            <p className="auth-footer">
              Don&apos;t have an account? <Link to="/register">Create one</Link>
            </p>
            <div className="demo-hint">
              <p><strong>Demo:</strong> admin@kindlink.com / admin123</p>
              <p>sarah@example.com / demo123</p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
