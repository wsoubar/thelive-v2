import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { useAuth } from '../auth/AuthContext';

type Acao = { id: string; nomePersonagem: string; acao: string; resposta: string; narrador: string; data: { toDate?: () => Date } | null; status: string };

export default function Acoes() {
  const { user, profile } = useAuth();
  const isNarrador = profile?.roles?.narrador === true;
  const [items, setItems] = useState<Acao[]>([]);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const base = collection(db, 'acoes');
      // Sem orderBy composto (evita índice userid+data): ordena no cliente.
      const q = isNarrador
        ? query(base, orderBy('data', 'desc'), limit(50))
        : query(base, where('userid', '==', user!.uid), limit(50));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Acao, 'id'>) }));
      list.sort((a, b) => {
        const ta = a.data && typeof a.data === 'object' && 'toDate' in a.data && a.data.toDate ? a.data.toDate().getTime() : 0;
        const tb = b.data && typeof b.data === 'object' && 'toDate' in b.data && b.data.toDate ? b.data.toDate().getTime() : 0;
        return tb - ta;
      });
      setItems(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar ações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const abertas = items.filter((a) => a.status === 'open' && !a.resposta).length;

  return (
    <main style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
      <p><Link to="/">← Início</Link></p>
      <h1>Ações</h1>
      {!isNarrador && <p>{abertas === 0 ? 'Você pode enviar 1 ação.' : 'Você já tem 1 ação aberta (limite do legado). Aguarde resposta.'}</p>}
      <form onSubmit={async (e) => {
        e.preventDefault();
        setError('');
        const v = texto.trim();
        if (!v || v.length > 600 || (!isNarrador && abertas > 0) || !user) return;
        setSending(true);
        try {
          await addDoc(collection(db, 'acoes'), {
            userid: user.uid, idPersonagem: profile?.personagemId ?? null,
            nomePersonagem: profile?.displayName ?? user.email ?? '',
            jogador: profile?.displayName ?? user.email ?? '',
            acao: v, status: 'open', resposta: '', narrador: '', data: serverTimestamp(), dataResposta: null,
          });
          setTexto('');
          await load();
        } catch (er) {
          setError(er instanceof Error ? er.message : 'Falha ao enviar.');
        } finally {
          setSending(false);
        }
      }}>
        <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Sua ação (máx 600)" maxLength={600} style={{ display: 'block', width: '100%', padding: 10, margin: '8px 0' }} />
        <button type="submit" disabled={sending || !texto.trim() || (!isNarrador && abertas > 0)} style={{ padding: '10px 16px' }}>Enviar</button>
      </form>
      <p><button onClick={load}>Atualizar</button></p>
      {loading && <p>Carregando…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {items.map((a) => (
        <div key={a.id} style={{ border: '1px solid #e5e4e7', borderRadius: 8, margin: '8px 0', padding: 12 }}>
          <div><b>{a.nomePersonagem}</b></div>
          <p>{a.acao}</p>
          {a.resposta && <p><b>Resposta ({a.narrador})</b><br />{a.resposta}</p>}
          {!a.resposta && !isNarrador && (
            <button onClick={async () => { await deleteDoc(doc(db, 'acoes', a.id)); await load(); }}>Apagar</button>
          )}
        </div>
      ))}
    </main>
  );
}
