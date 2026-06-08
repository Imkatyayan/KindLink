import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight } from 'lucide-react';
import { DONATION_AREAS, USER_ROLES } from '../constants/areas';
import { APP_NAME } from '../constants/brand';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AnimatedSection } from '../components/PageTransition';

export default function Register() {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    phone: '', address: '', idProof: '', role: USER_ROLES.DONOR,
    preferredArea: DONATION_AREAS[0],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      success('Registration submitted! Await admin verification.');
      setTimeout(() => navigate('/login'), 2000);
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
          <h2>Join {APP_NAME}</h2>
          <p>Register as a donor or receiver. Your account will be verified by our admin team before you get access.</p>
        </AnimatedSection>
      </div>

      <div className="auth-form-side">
        <AnimatedSection delay={100}>
        <div className="auth-card card glass-card auth-card-wide">
          <div className="auth-icon"><UserPlus size={24} /></div>
          <h1>Create Account</h1>
          <p className="auth-subtitle">Fill in your details for verification</p>

          <form onSubmit={handleSubmit} className="form form-grid">
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input id="fullName" name="fullName" required value={form.fullName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input id="password" name="password" type="password" minLength={6} required
                value={form.password} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required
                value={form.confirmPassword} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone *</label>
              <input id="phone" name="phone" type="tel" required value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="role">I want to *</label>
              <select id="role" name="role" value={form.role} onChange={handleChange}>
                <option value={USER_ROLES.DONOR}>Donate (Donor)</option>
                <option value={USER_ROLES.RECEIVER}>Receive (Receiver)</option>
              </select>
            </div>
            <div className="form-group form-group-full">
              <label htmlFor="address">Address *</label>
              <input id="address" name="address" required value={form.address} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="idProof">ID Proof Number *</label>
              <input id="idProof" name="idProof" required placeholder="Passport / License / National ID"
                value={form.idProof} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="preferredArea">Area of Interest</label>
              <select id="preferredArea" name="preferredArea" value={form.preferredArea} onChange={handleChange}>
                {DONATION_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {error && <p className="form-error form-group-full">{error}</p>}

            <button type="submit" className="btn btn-primary btn-block form-group-full" disabled={loading}>
              {loading ? 'Submitting...' : <>Submit for Verification <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="auth-footer">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
