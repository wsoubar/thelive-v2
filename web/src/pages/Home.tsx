import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { useAuth } from '../auth/AuthContext';

type Char = { id: string; nome: string; clan: string; seita: string };

export default function Home() {
  const { user, profile, profileError } = useAuth();
  const [chars, setChars] = useState<Char[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isNarrador = profile?.roles?.narrador === true;

  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, 'personagens'), where('aprovado', '==', true), limit(20));
        const snap = await getDocs(q);
        setChars(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Char, 'id'>) })));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Falha ao carregar personagens.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <div className="page-head spread">
        <div>
          <h1>Crônica</h1>
          <p>Olá, {user?.email} {isNarrador && <span className="badge badge-narrador">narrador</span>}</p>
        </div>
        <Link className="btn btn-primary" to="/acoes">Enviar ação</Link>
      </div>

      {!profile && !profileError && (
        <div className="alert alert-warn">Sem doc em <b>users/{user?.uid}</b> — crie no Firestore com <b>roles.narrador</b> se for narrador.</div>
      )}
      {profileError && <div className="alert alert-error">Perfil: {profileError}</div>}

      <div className="row" style={{ margin: '16px 0' }}>
        <Link className="btn" to="/personagens">Personagens</Link>
        <Link className="btn" to="/acoes">Ações</Link>
        <Link className="btn" to="/dados">Dados d10</Link>
      </div>

      <div className="card">
        <div className="spread"><h2 style={{ margin: 0 }}>Aprovados</h2><span className="muted small">amostra · 20</span></div>
        {loading && <p className="muted">Carregando personagens…</p>}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && !error && chars.length === 0 && <p className="muted">Nenhum aprovado encontrado.</p>}
        <div className="stack" style={{ marginTop: 12 }}>
          {chars.map((c) => (
            <div key={c.id} className="row" style={{ justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: 10 }}>
              <span><b>{c.nome}</b> <span className="muted">· {c.clan} / {c.seita}</span></span>
              <Link className="small" to="/personagens">ver</Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
