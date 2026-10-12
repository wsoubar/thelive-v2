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
    <main style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
      <p><Link to="/">← Início</Link></p>
      <h1>Personagens</h1>
      <input placeholder="filtrar por nome, clã, seita…" value={filtro} onChange={(e) => setFiltro(e.target.value)} style={{ display: 'block', width: '100%', padding: 10, margin: '8px 0' }} />
      {loading && <p>Carregando…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {!loading && !error && list.length === 0 && <p>Nenhum personagem.</p>}
      {list.map((p) => (
        <div key={p.id} style={{ border: '1px solid #e5e4e7', borderRadius: 8, margin: '8px 0', padding: 12 }}>
          <div onClick={() => setOpen((o) => ({ ...o, [p.id]: !o[p.id] }))} style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ width: 40, height: 40, borderRadius: '50%', background: '#eee', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{iniciais(p.nome)}</span>
            <div>
              <b>{p.nome}</b> — <Link to={`/personagens/${p.id}`}>detalhe</Link>
              <div>{p.seita} · {p.clan}</div>
              <div>{p.narrador ? 'Narrador' : 'Jogador'}: <b>{p.jogador}</b></div>
            </div>
          </div>
          {open[p.id] && p.rumores && <p style={{ marginTop: 8 }}>{p.rumores}</p>}
        </div>
      ))}
    </main>
  );
}
