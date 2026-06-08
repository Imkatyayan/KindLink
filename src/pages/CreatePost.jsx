import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DONATION_AREAS, POST_TYPES, USER_ROLES } from '../constants/areas';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

export default function CreatePost() {
  const { user } = useAuth();
  const { addPost } = useData();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const defaultType = user.role === USER_ROLES.DONOR ? POST_TYPES.DONATION : POST_TYPES.RECEPTION;

  const [form, setForm] = useState({
    type: defaultType, title: '', description: '',
    areaOfInterest: DONATION_AREAS[0], amount: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addPost({ ...form, amount: Number(form.amount) });
      success('Post published successfully!');
      navigate('/dashboard');
    } catch (err) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container narrow">
      <div className="page-header">
        <h1>Create SOP Post</h1>
        <p>Publish your area of interest for donation or reception.</p>
      </div>

      <form onSubmit={handleSubmit} className="card form">
        <div className="form-group">
          <label htmlFor="type">Post Type</label>
          <select id="type" name="type" value={form.type} onChange={handleChange}>
            <option value={POST_TYPES.DONATION}>Donation Offer</option>
            <option value={POST_TYPES.RECEPTION}>Reception Request</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input id="title" name="title" required value={form.title} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea id="description" name="description" rows={5} required
            value={form.description} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="areaOfInterest">Area of Interest *</label>
          <select id="areaOfInterest" name="areaOfInterest" value={form.areaOfInterest} onChange={handleChange}>
            {DONATION_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount (USD) *</label>
          <input id="amount" name="amount" type="number" min="1" required
            value={form.amount} onChange={handleChange} />
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
