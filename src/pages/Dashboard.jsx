import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, FileText, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
  const { getUserPosts, getMatches } = useData();
  const [myPosts, setMyPosts] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUserPosts(), getMatches()])
      .then(([posts, matched]) => {
        setMyPosts(posts);
        setMatches(matched);
      })
      .finally(() => setLoading(false));
  }, [getUserPosts, getMatches]);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="page container">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, <strong>{user.fullName}</strong></p>
        </div>
        <Link to="/posts/create" className="btn btn-primary">
          <Plus size={18} /> Create SOP Post
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-role"><Users size={20} /></div>
          <div><span>Your Role</span><strong className="capitalize">{user.role}</strong></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-posts"><FileText size={20} /></div>
          <div><span>Your Posts</span><strong>{myPosts.length}</strong></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-matches"><TrendingUp size={20} /></div>
          <div><span>Matches Found</span><strong>{matches.length}</strong></div>
        </div>
      </div>

      <section className="section">
        <div className="section-header">
          <h2>Your SOP Posts</h2>
          <Link to="/posts/create">+ New Post</Link>
        </div>
        {myPosts.length === 0 ? (
          <div className="empty-panel card">
            <p>No posts yet. Create your first SOP to start matching.</p>
            <Link to="/posts/create" className="btn btn-primary btn-sm">Create Post</Link>
          </div>
        ) : (
          <div className="card-grid">
            {myPosts.map((post, i) => <PostCard key={post.id} index={i} post={post} showActions={false} />)}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Recent Matches</h2>
          <Link to="/matches">View all →</Link>
        </div>
        {matches.length === 0 ? (
          <p className="empty-state">Create a post to discover matching donors or receivers.</p>
        ) : (
          <div className="card-grid">
            {matches.slice(0, 3).map((post, i) => <PostCard key={post.id} index={i} post={post} />)}
          </div>
        )}
      </section>
    </div>
  );
}
