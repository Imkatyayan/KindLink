import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import PostCard from '../components/PostCard';
import PaymentModal from '../components/PaymentModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { DONATION_AREAS, USER_ROLES } from '../constants/areas';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

export default function Posts() {
  const { user } = useAuth();
  const { refreshPosts, makePayment } = useData();
  const { success } = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [area, setArea] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentPost, setPaymentPost] = useState(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await refreshPosts({ type: filter, area });
      setPosts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, [filter, area]);

  const filtered = posts.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleContact = (post) => {
    if (!user) return navigate('/login');
    navigate(`/messages?user=${post.userId}`);
  };

  const handleDonate = (post) => {
    if (!user) return navigate('/login');
    if (user.role !== USER_ROLES.DONOR) return;
    setPaymentPost(post);
  };

  return (
    <div className="page container">
      <div className="page-header">
        <div>
          <h1>Browse SOP Posts</h1>
          <p>Explore donation and reception posts from verified users.</p>
        </div>
        {user && user.role !== USER_ROLES.ADMIN && (
          <button type="button" className="btn btn-primary" onClick={() => navigate('/posts/create')}>
            Create Post
          </button>
        )}
      </div>

      <div className="filters-bar">
        <div className="search-input">
          <Search size={18} />
          <input placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="donation">Donation Offers</option>
          <option value="reception">Reception Requests</option>
        </select>
        <select value={area} onChange={(e) => setArea(e.target.value)}>
          <option value="all">All Areas</option>
          {DONATION_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading posts..." />
      ) : filtered.length === 0 ? (
        <p className="empty-state">No posts match your filters.</p>
      ) : (
        <div className="card-grid">
          {filtered.map((post, i) => (
            <PostCard
              key={post.id}
              index={i}
              post={post}
              onContact={handleContact}
              onDonate={user?.role === USER_ROLES.DONOR ? handleDonate : null}
            />
          ))}
        </div>
      )}

      {paymentPost && (
        <PaymentModal
          post={paymentPost}
          onClose={(tx) => {
            setPaymentPost(null);
            if (tx) success(`Payment successful! Ref: ${tx.gatewayRef}`);
          }}
          onSuccess={makePayment}
        />
      )}
    </div>
  );
}
