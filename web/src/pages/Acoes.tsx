import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../auth/AuthContext';

type Acao = { id: string; nomePersonagem: string; acao: string; resposta: string; narrador: string; data: { toDate?: () => Date } | null; dataResposta: { toDate?: () => Date } | null; status: string };

function fmtData(d: { toDate?: () => Date } | null | undefined) {
  try {
    const t = d?.toDate ? d.toDate() : null;
    if (!t) return '—';
    const dd = String(t.getDate()).padStart(2, '0');
    const mm = String(t.getMonth() + 1).padStart(2, '0');
    const yyyy = t.getFullYear();
    const hh = String(t.getHours()).padStart(2, '0');
    const mi = String(t.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  } catch {
    return '—';
  }
}

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
      const q = isNarrador
        ? query(base, orderBy('data', 'desc'), limit(50))
        : query(base, where('userid', '==', user!.uid), limit(50));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Acao, 'id'>) }));
      list.sort((a, b) => {
        const ta = a.data?.toDate ? a.data.toDate().getTime() : 0;
        const tb = b.data?.toDate ? b.data.toDate().getTime() : 0;
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
    <>
      <div className="page-head">
        <h1>Ações</h1>
        <p>{isNarrador ? 'Todas as ações recentes' : abertas === 0 ? 'Você pode enviar 1 ação.' : 'Você já tem 1 ação aberta — aguarde resposta.'}</p>
      </div>
      <div className="card">
        <form className="stack" onSubmit={async (e) => {
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
          <label className="field">Nova ação <span className="hint">{texto.trim().length}/600</span>
            <textarea className="textarea" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Descreva sua ação…" maxLength={600} />
          </label>
          <div className="row">
            <button className="btn btn-primary" type="submit" disabled={sending || !texto.trim() || (!isNarrador && abertas > 0)}>Enviar</button>
            <button className="btn" type="button" onClick={load}>Atualizar</button>
          </div>
        </form>
      </div>
      {loading && <p className="muted">Carregando…</p>}
      {error && <div className="alert alert-error">{error}</div>}
      <div className="stack" style={{ marginTop: 12 }}>
        {items.map((a) => (
          <div key={a.id} className="card">
            <div className="spread"><b>{a.nomePersonagem}</b><span className="badge">{a.status === 'open' && !a.resposta ? 'aberta' : 'respondida'}</span></div>
            <div className="small muted">Enviada em {fmtData(a.data)}</div>
            <p style={{ marginTop: 8 }}>{a.acao}</p>
            {a.resposta && <div className="alert alert-info" style={{ marginTop: 10 }}><b>Resposta ({a.narrador})</b> <span className="small">· {fmtData(a.dataResposta)}</span><br />{a.resposta}</div>}
            {!a.resposta && !isNarrador && (
              <div className="row" style={{ marginTop: 10 }}><button className="btn btn-ghost" onClick={async () => { await deleteDoc(doc(db, 'acoes', a.id)); await load(); }}>Apagar</button></div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
