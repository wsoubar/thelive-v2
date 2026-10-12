import { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';

import { useAuth } from '../auth/AuthContext';

type P = { id: string; nome: string; clan: string; seita: string; jogador: string; narrador: boolean; aprovado: boolean };
type Info = { historia: string; rumores: string; antecedentes: string; planilha: string };

function iniciais(nome: string) {
  return nome.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?';
}

export default function Personagens() {
  const { profile } = useAuth();
  const isNarrador = profile?.roles?.narrador === true;
  const [items, setItems] = useState<P[]>([]);
  const [filtro, setFiltro] = useState('');
  const [aba, setAba] = useState<'todos' | 'aprovados' | 'pendentes'>('todos');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [infos, setInfos] = useState<Record<string, Info>>({});
  const [infoLoading, setInfoLoading] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const toggle = async (pid: string) => {
    const willOpen = !open[pid];
    setOpen((o) => ({ ...o, [pid]: willOpen }));
    // Rumores/história moram em personagens/{pid}/info/principal (legado personagensInfo).
    if (willOpen && !infos[pid] && !infoLoading[pid]) {
      setInfoLoading((s) => ({ ...s, [pid]: true }));
      try {
        const s = await getDoc(doc(db, 'personagens', pid, 'info', 'principal'));
        if (s.exists()) setInfos((m) => ({ ...m, [pid]: s.data() as Info }));
      } catch {
        // mantém fechado sem rumores; detalhe mostra o erro de permissão
      } finally {
        setInfoLoading((s) => ({ ...s, [pid]: false }));
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        // Jogador: só aprovados (índice aprovado+seita+clan+nome já publicado).
        // Narrador: tudo (sem where para não exigir índice novo), ordena no cliente.
        const q = isNarrador
          ? query(collection(db, 'personagens'), limit(100))
          : query(
            collection(db, 'personagens'),
            where('aprovado', '==', true),
            orderBy('seita'), orderBy('clan'), orderBy('nome'),
            limit(100),
          );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<P, 'id'>) }));
        list.sort((a, b) => [a.seita, a.clan, a.nome].join('|').localeCompare([b.seita, b.clan, b.nome].join('|')));
        setItems(list);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Falha ao carregar.');
      } finally {
        setLoading(false);
      }
    })();
  }, [isNarrador]);

  const f = filtro.trim().toLowerCase();
  const porAba = aba === 'aprovados' ? items.filter((p) => p.aprovado) : aba === 'pendentes' ? items.filter((p) => !p.aprovado) : items;
  const list = f ? porAba.filter((p) => [p.nome, p.clan, p.seita, p.jogador].join(' ').toLowerCase().includes(f)) : porAba;
  const nAp = items.filter((p) => p.aprovado).length;
  const nPen = items.length - nAp;

  return (
    <>
      <div className="page-head">
        <h1>Personagens</h1>
        <p>{isNarrador ? `${items.length} no total · ${nAp} aprovados · ${nPen} pendentes` : `${list.length} aprovados`} · toque para ver rumores</p>
      </div>
      {isNarrador && (
        <div className="row" style={{ marginBottom: 8 }}>
          <button className={`btn${aba === 'todos' ? ' btn-primary' : ''}`} onClick={() => setAba('todos')}>Todos ({items.length})</button>
          <button className={`btn${aba === 'aprovados' ? ' btn-primary' : ''}`} onClick={() => setAba('aprovados')}>Aprovados ({nAp})</button>
          <button className={`btn${aba === 'pendentes' ? ' btn-primary' : ''}`} onClick={() => setAba('pendentes')}>Pendentes ({nPen})</button>
        </div>
      )}
      <input className="input" placeholder="Filtrar por nome, clã, seita…" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
      {loading && <p className="muted">Carregando…</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !error && list.length === 0 && <div className="card"><p className="muted">Nenhum personagem.</p></div>}
      <div className="stack" style={{ marginTop: 12 }}>
        {list.map((p) => (
          <div key={p.id} className="card list-item" onClick={() => toggle(p.id)}>
            <div className="row">
              <span className="avatar">{iniciais(p.nome)}</span>
              <div>
                <b>{p.nome}</b> {!p.aprovado && <span className="badge">pendente</span>} <Link to={`/personagens/${p.id}`} onClick={(e) => e.stopPropagation()}>detalhe</Link>
                <div className="small muted">{p.seita} · {p.clan}</div>
                <div className="small">{p.narrador ? <span className="badge badge-narrador">Narrador</span> : <span className="badge">Jogador</span>} <b>{p.jogador}</b></div>
              </div>
            </div>
            {open[p.id] && (
              <div className="small" style={{ marginTop: 10, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                {infoLoading[p.id] && <span className="muted">Carregando ficha…</span>}
                {!infoLoading[p.id] && infos[p.id]?.rumores && <p>{infos[p.id].rumores}</p>}
                {!infoLoading[p.id] && !infos[p.id]?.rumores && <span className="muted">Sem rumores registrados. <Link to={`/personagens/${p.id}`} onClick={(e) => e.stopPropagation()}>Ver ficha completa</Link></span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
