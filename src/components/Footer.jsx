import { Heart } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '../constants/brand';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Heart size={14} className="footer-heart" />
          <p>© {new Date().getFullYear()} {APP_NAME}</p>
        </div>
        <p className="footer-note">{APP_TAGLINE} · Payments monitored via secure gateway</p>
      </div>
    </footer>
  );
}
