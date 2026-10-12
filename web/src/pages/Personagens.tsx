import { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';

import { useAuth } from '../auth/AuthContext';
import { clanLogo } from '../lib/clanlogo';
import { ClanCrest } from '../components/ClanCrest';

type P = { id: string; nome: string; clan: string; seita: string; jogador: string; narrador: boolean; aprovado: boolean };
type Info = { historia: string; rumores: string; antecedentes: string; planilha: string };
type Ordem = 'nome' | 'cla' | 'seita' | 'jogador' | 'status';

function compara(a: P, b: P, ordem: Ordem) {
  switch (ordem) {
    case 'cla': return a.clan.localeCompare(b.clan) || a.nome.localeCompare(b.nome);
    case 'seita': return a.seita.localeCompare(b.seita) || a.nome.localeCompare(b.nome);
    case 'jogador': return a.jogador.localeCompare(b.jogador) || a.nome.localeCompare(b.nome);
    case 'status': return Number(b.aprovado) - Number(a.aprovado) || a.nome.localeCompare(b.nome);
    default: return a.nome.localeCompare(b.nome);
  }
}

function iniciais(nome: string) {
  return nome.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?';
}

function Brasao({ clan, nome }: { clan: string; nome: string }) {
  const [falhou, setFalhou] = useState(false);
  const src = clanLogo(clan);
  // PNG real quando existir; senão emblema SVG do clã; iniciais como último recurso.
  if (src && !falhou) {
    return (
      <img
        src={src}
        alt={`Brasão ${clan}`}
        className="avatar avatar-img"
        onError={() => setFalhou(true)}
      />
    );
  }
  if (clan?.trim()) return <ClanCrest clan={clan} />;
  return <span className="avatar">{iniciais(nome)}</span>;
}

export default function Personagens() {
  const { profile } = useAuth();
  const isNarrador = profile?.roles?.narrador === true;
  const [items, setItems] = useState<P[]>([]);
  const [filtro, setFiltro] = useState('');
  const [ordem, setOrdem] = useState<Ordem>('nome');
  const [aba, setAba] = useState<'todos' | 'aprovados' | 'pendentes'>('todos');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [infos, setInfos] = useState<Record<string, Info>>({});
  const [ficha, setFicha] = useState<Record<string, boolean>>({});
  const [infoLoading, setInfoLoading] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const temConteudo = (i?: Info) => !!i && [i.historia, i.planilha, i.rumores, i.antecedentes].some((v) => (v ?? '').trim().length > 0);

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
        // Ícone de ficha: confere info/principal de cada um (leitura única, com cache).
        const got = await Promise.all(list.map(async (p) => {
          try {
            const s = await getDoc(doc(db, 'personagens', p.id, 'info', 'principal'));
            return [p.id, s.exists() ? (s.data() as Info) : undefined] as const;
          } catch {
            return [p.id, undefined] as const;
          }
        }));
        const im: Record<string, Info> = {};
        const fm: Record<string, boolean> = {};
        for (const [pid, info] of got) {
          if (info) { im[pid] = info; fm[pid] = temConteudo(info); }
        }
        setInfos((m) => ({ ...im, ...m }));
        setFicha(fm);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Falha ao carregar.');
      } finally {
        setLoading(false);
      }
    })();
  }, [isNarrador]);

  const aprovar = async (pid: string, aprovado: boolean) => {
    setSaving((s) => ({ ...s, [pid]: true }));
    setError('');
    try {
      await updateDoc(doc(db, 'personagens', pid), { aprovado });
      setItems((arr) => arr.map((p) => (p.id === pid ? { ...p, aprovado } : p)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao atualizar aprovação.');
    } finally {
      setSaving((s) => ({ ...s, [pid]: false }));
    }
  };

  const f = filtro.trim().toLowerCase();
  const porAba = aba === 'aprovados' ? items.filter((p) => p.aprovado) : aba === 'pendentes' ? items.filter((p) => !p.aprovado) : items;
  const filtrados = f ? porAba.filter((p) => [p.nome, p.clan, p.seita, p.jogador, p.aprovado ? 'aprovado' : 'pendente'].join(' ').toLowerCase().includes(f)) : porAba;
  const list = [...filtrados].sort((a, b) => compara(a, b, ordem));
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
      <div className="row">
        <input className="input" style={{ flex: '1 1 200px' }} placeholder="Filtrar por nome, clã, seita, jogador, status…" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
        <label className="field" style={{ minWidth: 150 }}>
          Ordenar
          <select className="input" value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)}>
            <option value="nome">Nome</option>
            <option value="cla">Clã</option>
            <option value="seita">Seita</option>
            <option value="jogador">Jogador</option>
            <option value="status">Status</option>
          </select>
        </label>
      </div>
      {loading && <p className="muted">Carregando…</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !error && list.length === 0 && <div className="card"><p className="muted">Nenhum personagem.</p></div>}
      <div className="stack" style={{ marginTop: 12 }}>
        {list.map((p) => (
          <div key={p.id} className="card list-item" onClick={() => toggle(p.id)}>
            <div className="row">
              <Brasao clan={p.clan} nome={p.nome} />
              <div>
                <b>{p.nome}</b> {!p.aprovado && <span className="badge">pendente</span>}{' '}
                {ficha[p.id] && <span className="badge" title="Possui ficha (história/planilha/rumores/antecedentes)">📋 ficha</span>}{' '}
                <Link to={`/personagens/${p.id}`} onClick={(e) => e.stopPropagation()}>detalhe</Link>
                <div className="small muted">{p.seita} · {p.clan}</div>
                <div className="small">{p.narrador ? <span className="badge badge-narrador">Narrador</span> : <span className="badge">Jogador</span>} <b>{p.jogador}</b></div>
                {isNarrador && (
                  <div className="row" style={{ marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
                    {p.aprovado
                      ? <button className="btn btn-sm" disabled={saving[p.id]} onClick={() => aprovar(p.id, false)}>Reprovar</button>
                      : <button className="btn btn-sm btn-primary" disabled={saving[p.id]} onClick={() => aprovar(p.id, true)}>Aprovar</button>}
                  </div>
                )}
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
