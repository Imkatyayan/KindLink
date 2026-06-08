import { useState } from 'react';
import { Save, User } from 'lucide-react';
import { DONATION_AREAS } from '../constants/areas';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateProfile } from '../services/api';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState({
    phone: user.phone || '',
    address: user.address || '',
    bio: user.bio || '',
    preferredArea: user.preferredArea || DONATION_AREAS[0],
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateProfile(form);
      setUser(updated);
      success('Profile updated successfully!');
    } catch (err) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container narrow">
      <div className="page-header">
        <h1><User size={28} className="inline-icon" /> My Profile</h1>
        <p>Manage your account details.</p>
      </div>

      <div className="profile-header card">
        <div className="profile-avatar">{user.fullName.charAt(0)}</div>
        <div>
          <h2>{user.fullName}</h2>
          <p>{user.email}</p>
          <span className={`status-pill status-${user.status}`}>{user.status}</span>
          <span className="badge capitalize" style={{ marginLeft: 8 }}>{user.role}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card form" style={{ marginTop: '1.5rem' }}>
        <div className="form-group">
          <label>Full Name</label>
          <input value={user.fullName} disabled />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input value={user.email} disabled />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input id="address" name="address" value={form.address} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="preferredArea">Preferred Area</label>
          <select id="preferredArea" name="preferredArea" value={form.preferredArea} onChange={handleChange}>
            {DONATION_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea id="bio" name="bio" rows={3} value={form.bio} onChange={handleChange}
            placeholder="Tell others about yourself..." />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
