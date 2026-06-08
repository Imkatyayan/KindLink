import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageCircle, HeartHandshake } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { POST_TYPES, USER_ROLES } from '../constants/areas';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { getPostById } from '../services/api';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { makePayment } = useData();
  const { success } = useToast();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => {
    getPostById(id).then(setPost).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!post) return <div className="page container"><p className="empty-state">Post not found.</p></div>;

  const isDonation = post.type === POST_TYPES.DONATION;

  return (
    <div className="page container narrow">
      <article className="card post-detail">
        <div className="post-card-header">
          <span className={`badge ${isDonation ? 'badge-donor' : 'badge-receiver'}`}>
            {isDonation ? 'Donation Offer' : 'Reception Request'}
          </span>
          <span className="badge badge-area">{post.areaOfInterest}</span>
        </div>

        <h1>{post.title}</h1>
        <p className="post-description">{post.description}</p>

        <div className="detail-grid">
          <div><span>Amount</span><strong className="post-amount-lg">${Number(post.amount).toLocaleString()}</strong></div>
          <div><span>Posted by</span><strong>{post.author?.fullName}</strong></div>
          <div><span>Role</span><strong className="capitalize">{post.author?.role}</strong></div>
          <div><span>Date</span><strong>{new Date(post.createdAt).toLocaleDateString()}</strong></div>
        </div>

        <div className="card-actions">
          <button type="button" className="btn btn-secondary"
            onClick={() => user ? navigate(`/messages?user=${post.userId}`) : navigate('/login')}>
            <MessageCircle size={16} /> Message Author
          </button>
          {!isDonation && user?.role === USER_ROLES.DONOR && (
            <button type="button" className="btn btn-primary" onClick={() => setPaymentOpen(true)}>
              <HeartHandshake size={16} /> Send Funds
            </button>
          )}
        </div>
      </article>

      {paymentOpen && (
        <PaymentModal
          post={post}
          onClose={(tx) => {
            setPaymentOpen(false);
            if (tx) success(`Payment successful! Ref: ${tx.gatewayRef}`);
          }}
          onSuccess={makePayment}
        />
      )}
    </div>
  );
}
