import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../auth/AuthContext';

export function Layout({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const nav = useNavigate();
  const isNarrador = profile?.roles?.narrador === true;

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand"><span className="brand-mark">🧛</span> Live Action</Link>
          <nav className="topnav">
            <Link to="/personagens">Personagens</Link>
            <Link to="/acoes">Ações</Link>
            <Link to="/dados">Dados</Link>
          </nav>
          <div className="topuser">
            <span>{user?.email} {isNarrador && <span className="badge badge-narrador">narrador</span>}</span>
            <button className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }} onClick={async () => { await signOut(auth); nav('/login'); }}>Sair</button>
          </div>
        </div>
      </header>
      <div className="container">{children}</div>
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
