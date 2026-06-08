import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight, Heart } from 'lucide-react';
import { POST_TYPES } from '../constants/areas';

export default function PostCard({ post, showActions = true, onContact, onDonate, index = 0 }) {
  const author = post.author;
  const isDonation = post.type === POST_TYPES.DONATION;

  return (
    <article
      className="card post-card animate-card"
      style={{ '--animation-delay': `${index * 60}ms` }}
    >
      <div className="post-card-accent" />
      <div className="post-card-header">
        <span className={`badge ${isDonation ? 'badge-donor' : 'badge-receiver'}`}>
          {isDonation ? 'Donation Offer' : 'Reception Request'}
        </span>
        <span className="badge badge-area">{post.areaOfInterest}</span>
      </div>

      <h3>{post.title}</h3>
      <p className="post-description">{post.description}</p>

      <div className="post-meta">
        <span className="post-amount">${Number(post.amount).toLocaleString()}</span>
        <span className="post-author">
          <span className="author-dot" />
          {author?.fullName || 'Unknown'}
        </span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>

      {showActions && (
        <div className="card-actions">
          <Link to={`/posts/${post.id}`} className="btn btn-ghost btn-sm">
            <ArrowRight size={16} /> Details
          </Link>
          {onContact && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => onContact(post)}>
              <MessageCircle size={16} /> Message
            </button>
          )}
          {onDonate && !isDonation && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => onDonate(post)}>
              <Heart size={16} /> Send Funds
            </button>
          )}
        </div>
      )}
    </article>
  );
}
