import { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';

type P = { id: string; nome: string; clan: string; seita: string; jogador: string; narrador: boolean; rumores?: string };

function iniciais(nome: string) {
  return nome.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?';
}

export default function Personagens() {
  const [items, setItems] = useState<P[]>([]);
  const [filtro, setFiltro] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const q = query(
          collection(db, 'personagens'),
          where('aprovado', '==', true),
          orderBy('seita'), orderBy('clan'), orderBy('nome'),
          limit(100),
        );
        const snap = await getDocs(q);
        setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<P, 'id'>) })));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Falha ao carregar.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const f = filtro.trim().toLowerCase();
  const list = f ? items.filter((p) => [p.nome, p.clan, p.seita, p.jogador].join(' ').toLowerCase().includes(f)) : items;

  return (
    <>
      <div className="page-head">
        <h1>Personagens</h1>
        <p>{list.length} aprovados · toque para ver rumores</p>
      </div>
      <input className="input" placeholder="Filtrar por nome, clã, seita…" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
      {loading && <p className="muted">Carregando…</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !error && list.length === 0 && <div className="card"><p className="muted">Nenhum personagem.</p></div>}
      <div className="stack" style={{ marginTop: 12 }}>
        {list.map((p) => (
          <div key={p.id} className="card list-item" onClick={() => setOpen((o) => ({ ...o, [p.id]: !o[p.id] }))}>
            <div className="row">
              <span className="avatar">{iniciais(p.nome)}</span>
              <div>
                <b>{p.nome}</b> <Link to={`/personagens/${p.id}`} onClick={(e) => e.stopPropagation()}>detalhe</Link>
                <div className="small muted">{p.seita} · {p.clan}</div>
                <div className="small">{p.narrador ? <span className="badge badge-narrador">Narrador</span> : <span className="badge">Jogador</span>} <b>{p.jogador}</b></div>
              </div>
            </div>
            {open[p.id] && p.rumores && <p className="small" style={{ marginTop: 10, borderTop: '1px solid var(--line)', paddingTop: 10 }}>{p.rumores}</p>}
          </div>
        ))}
      </div>
    </>
  );
}
