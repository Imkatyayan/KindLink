import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Users, MessageSquare, CreditCard, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AnimatedSection } from '../components/PageTransition';
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from '../constants/brand';

const features = [
  { icon: Shield, title: 'Verified Users', desc: 'Admin verifies every registration before granting platform access.', color: 'feature-teal' },
  { icon: Users, title: 'Interest Matching', desc: 'Create SOP posts and discover donors or receivers in your area.', color: 'feature-blue' },
  { icon: MessageSquare, title: 'Direct Communication', desc: 'Message matched users privately for one-to-one coordination.', color: 'feature-purple' },
  { icon: CreditCard, title: 'Transparent Payments', desc: 'All transfers monitored through the payment gateway.', color: 'feature-amber' },
];

const steps = [
  'Register & get verified by admin',
  'Create an SOP post with your interest area',
  'Match with compatible donors or receivers',
  'Message & transfer funds directly',
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-bg">
          <div className="grid-pattern" />
        </div>

        <div className="container hero-content">
          <AnimatedSection>
            <span className="hero-tag">
              <Sparkles size={14} /> {APP_NAME} · {APP_TAGLINE}
            </span>
          </AnimatedSection>
          <AnimatedSection delay={80}>
            <h1>Direct transfers between donors & receivers</h1>
          </AnimatedSection>
          <AnimatedSection delay={160}>
            <p>{APP_DESCRIPTION}</p>
          </AnimatedSection>
          <AnimatedSection delay={240}>
            <div className="hero-actions">
              {!user ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Get Started <ArrowRight size={18} />
                  </Link>
                  <Link to="/posts" className="btn btn-glass btn-lg">Browse SOPs</Link>
                </>
              ) : (
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Go to Dashboard <ArrowRight size={18} />
                </Link>
              )}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={320}>
            <div className="hero-stats">
              <div className="hero-stat"><strong>100%</strong><span>Direct transfers</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>0</strong><span>Middlemen</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>24/7</strong><span>Transparency</span></div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="features container">
        {features.map(({ icon: Icon, title, desc, color }, i) => (
          <AnimatedSection key={title} delay={i * 100} className="feature-card-wrapper">
            <div className={`feature-card ${color}`}>
              <div className="feature-icon"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <div className="feature-card-glow" />
            </div>
          </AnimatedSection>
        ))}
      </section>

      <section className="how-it-works container">
        <AnimatedSection>
          <h2>How It Works</h2>
          <p className="section-subtitle">Four simple steps to make a direct impact</p>
        </AnimatedSection>
        <div className="steps">
          {steps.map((text, i) => (
            <AnimatedSection key={text} delay={i * 120} className="step-wrapper">
              <div className="step">
                <span className="step-number">{i + 1}</span>
                <p>{text}</p>
                {i < steps.length - 1 && <div className="step-connector" />}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </div>
  );
}
