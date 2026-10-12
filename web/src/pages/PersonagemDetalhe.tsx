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
    <main style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
      <p><Link to="/personagens">← Personagens</Link></p>
      {loading && <p>Carregando…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {p && (
        <>
          <h1>{p.nome}</h1>
          <p>{p.seita} · {p.clan} · {p.jogador} {p.aprovado ? '' : '(não aprovado)'}</p>
          {info && (
            <>
              {info.historia && <><h3>História</h3><p>{info.historia}</p></>}
              {info.rumores && <><h3>Rumores</h3><p>{info.rumores}</p></>}
              {info.antecedentes && <><h3>Antecedentes</h3><p>{info.antecedentes}</p></>}
            </>
          )}
          <h3>XPs ({xps.length})</h3>
          <ul>{xps.map((x) => <li key={x.id}>{x.descricao} — {x.valor}</li>)}</ul>
        </>
      )}
    </main>
  );
}
