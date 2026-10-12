import { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { Link, useParams } from 'react-router-dom';
import { db } from '../lib/firebase';

type Info = { historia: string; rumores: string; antecedentes: string; planilha: string };
type Xp = { id: string; data: unknown; descricao: string; valor: number };
type P = { nome: string; clan: string; seita: string; jogador: string; aprovado: boolean };

export default function PersonagemDetalhe() {
  const { id = '' } = useParams();
  const [p, setP] = useState<P | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [xps, setXps] = useState<Xp[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const s = await getDoc(doc(db, 'personagens', id));
        if (!s.exists()) { setError('Personagem não encontrado ou sem permissão.'); return; }
        setP(s.data() as P);
        const i = await getDoc(doc(db, 'personagens', id, 'info', 'principal'));
        if (i.exists()) setInfo(i.data() as Info);
        const xs = await getDocs(collection(db, 'personagens', id, 'xps'));
        setXps(xs.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Xp, 'id'>) })));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Falha ao carregar.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <>
      <Link className="backlink" to="/personagens">← Personagens</Link>
      {loading && <p className="muted">Carregando…</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {p && (
        <>
          <div className="page-head">
            <h1>{p.nome}</h1>
            <p>{p.seita} · {p.clan} · {p.jogador} {!p.aprovado && <span className="badge">não aprovado</span>}</p>
          </div>
          <div className="stack">
            {info?.historia && <div className="card"><h3 style={{ marginTop: 0 }}>História</h3><p>{info.historia}</p></div>}
            {info?.rumores && <div className="card"><h3 style={{ marginTop: 0 }}>Rumores</h3><p>{info.rumores}</p></div>}
            {info?.antecedentes && <div className="card"><h3 style={{ marginTop: 0 }}>Antecedentes</h3><p>{info.antecedentes}</p></div>}
            <div className="card">
              <div className="spread"><h3 style={{ margin: 0 }}>XPs</h3><span className="badge">{xps.length}</span></div>
              {xps.length === 0 && <p className="muted small">Sem XPs registrados.</p>}
              {xps.map((x) => (
                <div key={x.id} className="row" style={{ justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: 8, marginTop: 8 }}>
                  <span>{x.descricao}</span><b>{x.valor}</b>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
