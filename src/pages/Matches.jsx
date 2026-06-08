import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import PaymentModal from '../components/PaymentModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { USER_ROLES } from '../constants/areas';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

export default function Matches() {
  const { user } = useAuth();
  const { getMatches, makePayment } = useData();
  const { success } = useToast();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentPost, setPaymentPost] = useState(null);

  useEffect(() => {
    getMatches().then(setMatches).finally(() => setLoading(false));
  }, [getMatches]);

  if (loading) return <LoadingSpinner text="Finding matches..." />;

  return (
    <div className="page container">
      <div className="page-header">
        <h1>Your Matches</h1>
        <p>Compatible donors/receivers based on your area of interest.</p>
      </div>

      {matches.length === 0 ? (
        <div className="empty-panel card">
          <h3>No matches yet</h3>
          <p>Create an SOP post to discover compatible users.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/posts/create')}>
            Create Post
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {matches.map((post, i) => (
            <PostCard
              key={post.id}
              index={i}
              post={post}
              onContact={(p) => navigate(`/messages?user=${p.userId}`)}
              onDonate={user.role === USER_ROLES.DONOR ? setPaymentPost : null}
            />
          ))}
        </div>
      )}

      {paymentPost && (
        <PaymentModal
          post={paymentPost}
          onClose={(tx) => {
            setPaymentPost(null);
            if (tx) success(`Transfer complete! Ref: ${tx.gatewayRef}`);
          }}
          onSuccess={makePayment}
        />
      )}
    </div>
  );
}
