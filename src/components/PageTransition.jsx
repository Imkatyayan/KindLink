export default function PageTransition({ children }) {
  return <div className="page-transition fade-in">{children}</div>;
}

export function AnimatedSection({ children, className = '', delay = 0 }) {
  return (
    <div
      className={`animate-section ${className}`}
      style={{ '--delay': `${delay}ms` }}
    >
      {children}
    </div>
  );
}
