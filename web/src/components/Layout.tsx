import { useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../auth/AuthContext';

export function Layout({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isNarrador = profile?.roles?.narrador === true;

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand" onClick={() => setMenuOpen(false)}><span className="brand-mark">🧛</span> Live Action</Link>
          <button
            className="menu-btn"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
          <nav className={`topnav${menuOpen ? ' open' : ''}`}>
            <NavLink to="/personagens" onClick={() => setMenuOpen(false)}>Personagens</NavLink>
            <NavLink to="/acoes" onClick={() => setMenuOpen(false)}>Ações</NavLink>
            <NavLink to="/dados" onClick={() => setMenuOpen(false)}>Dados</NavLink>
          </nav>
          <div className="topuser">
            <span className="user-email">{user?.email} {isNarrador && <span className="badge badge-narrador">narrador</span>}</span>
            <button className="btn btn-ghost btn-sm btn-logout" onClick={async () => { await signOut(auth); nav('/login'); }}>Sair</button>
          </div>
        </div>
      </header>
      <div className="container">{children}</div>
      <nav className="bottomnav" aria-label="Navegação principal">
        <NavLink to="/" end>🏠<span>Início</span></NavLink>
        <NavLink to="/personagens">🧛<span>Personas</span></NavLink>
        <NavLink to="/acoes">⚔️<span>Ações</span></NavLink>
        <NavLink to="/dados">🎲<span>Dados</span></NavLink>
      </nav>
    </>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="auth-brand"><span className="brand-mark">🧛</span><h1>{title}</h1></div>
        <p className="muted small" style={{ marginBottom: 16 }}>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
