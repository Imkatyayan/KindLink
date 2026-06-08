export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="page-center loading-container">
      <div className="loader">
        <div className="loader-ring" />
        <div className="loader-ring loader-ring-2" />
        <div className="loader-dot" />
      </div>
      <p className="loading-text">{text}</p>
    </div>
  );
}
