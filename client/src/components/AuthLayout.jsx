export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth" >
      <aside className="auth-brand">
        <span className="logo">Stockly</span>
        <div>
          <h1>Run your shop, not your spreadsheets.</h1>
          <p>Track stock, record sales and see your profit every day.</p>
        </div>
      </aside>
      <main className="auth-wrap">
        <div className="auth-card">
          <h2>{title}</h2>
          <p className="muted">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}