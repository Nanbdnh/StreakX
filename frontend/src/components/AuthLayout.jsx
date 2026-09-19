export function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob--1" aria-hidden="true" />
      <div className="auth-blob auth-blob--2" aria-hidden="true" />
      <div className="auth-blob auth-blob--3" aria-hidden="true" />
      <div className="auth-content">
        <p className="auth-tagline">🔥 Never give up</p>
        {children}
      </div>
    </div>
  );
}
