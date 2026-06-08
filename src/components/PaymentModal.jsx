import { useState } from 'react';
import { Shield, X } from 'lucide-react';

export default function PaymentModal({ post, onClose, onSuccess }) {
  const receiver = post.author;
  const [amount, setAmount] = useState(post.amount || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const transaction = await onSuccess({
        receiverId: post.userId,
        amount: Number(amount),
        postId: post.id,
      });
      onClose(transaction);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(null)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Shield size={22} className="text-primary" />
            <h2>Secure Direct Transfer</h2>
          </div>
          <button type="button" className="modal-close" onClick={() => onClose(null)}>
            <X size={20} />
          </button>
        </div>

        <p className="modal-subtitle">
          Funds go directly to <strong>{receiver?.fullName}</strong> — no middleman.
          Transaction is recorded via payment gateway for transparency.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="amount">Amount (USD)</label>
            <input
              id="amount"
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="payment-summary">
            <div><span>Recipient</span><strong>{receiver?.fullName}</strong></div>
            <div><span>Post</span><strong>{post.title}</strong></div>
            <div><span>Gateway</span><strong>SecurePay</strong></div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => onClose(null)} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
