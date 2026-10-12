import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { useAuth } from "../auth/AuthContext";
import { ClanCrest } from "../components/ClanCrest";

type Char = { id: string; nome: string; clan: string; seita: string; jogador: string; aprovado: boolean };
type Ordem = "nome" | "cla" | "seita" | "jogador" | "status";

function compara(a: Char, b: Char, ordem: Ordem) {
  switch (ordem) {
    case "cla": return a.clan.localeCompare(b.clan) || a.nome.localeCompare(b.nome);
    case "seita": return a.seita.localeCompare(b.seita) || a.nome.localeCompare(b.nome);
    case "jogador": return a.jogador.localeCompare(b.jogador) || a.nome.localeCompare(b.nome);
    case "status": return Number(b.aprovado) - Number(a.aprovado) || a.nome.localeCompare(b.nome);
    default: return a.nome.localeCompare(b.nome);
  }
}

export default function Home() {
  const { user, profile, profileError } = useAuth();
  const [chars, setChars] = useState<Char[]>([]);
  const [filtro, setFiltro] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("nome");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isNarrador = profile?.roles?.narrador === true;

  useEffect(() => {
    (async () => {
      try {
        // Narrador vê todos (sem where, ordena no cliente); jogador só aprovados
        // (usa o índice aprovado+seita+clan+nome já publicado; reordena no cliente).
        const q = isNarrador
          ? query(collection(db, "personagens"), limit(100))
          : query(
            collection(db, "personagens"),
            where("aprovado", "==", true),
            orderBy("seita"), orderBy("clan"), orderBy("nome"),
            limit(100),
          );
        const snap = await getDocs(q);
        setChars(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Char, "id">),
          })),
        );
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Falha ao carregar personagens.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [isNarrador]);

  const f = filtro.trim().toLowerCase();
  const filtrados = f
    ? chars.filter((c) =>
      [c.nome, c.clan, c.seita, c.jogador, c.aprovado ? "aprovado" : "pendente"]
        .join(" ").toLowerCase().includes(f),
    )
    : chars;
  const lista = [...filtrados].sort((a, b) => compara(a, b, ordem));

  return (
    <>
      <div className="page-head spread">
        <div>
          <h1>Crônica</h1>
          <p>
            Olá, {user?.email}{" "}
            {isNarrador && (
              <span className="badge badge-narrador">narrador</span>
            )}
          </p>
        </div>
        <Link className="btn btn-primary" to="/acoes">
          Enviar ação
        </Link>
      </div>

      {!profile && !profileError && (
        <div className="alert alert-warn">
          Sem doc em <b>users/{user?.uid}</b> — crie no Firestore com{" "}
          <b>roles.narrador</b> se for narrador.
        </div>
      )}
      {profileError && (
        <div className="alert alert-error">Perfil: {profileError}</div>
      )}

      <div className="row" style={{ margin: "16px 0" }}>
        <Link className="btn" to="/personagens">
          Personagens
        </Link>
        <Link className="btn" to="/acoes">
          Ações
        </Link>
        <Link className="btn" to="/dados">
          Dados d10
        </Link>
      </div>

      <div className="card">
        <div className="spread">
          <h2 style={{ margin: 0 }}>Membros</h2>
          <span className="muted small">
            {isNarrador ? `${chars.length} no total` : `${chars.length} aprovados`}
          </span>
        </div>
        <div className="row" style={{ marginTop: 12, alignItems: "flex-end" }}>
          <label className="field" style={{ flex: "1 1 200px" }}>
            Filtrar
            <input
              className="input"
              placeholder="Nome, clã, seita, jogador, status…"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </label>
          <label className="field" style={{ minWidth: 150 }}>
            Ordenar
            <select
              className="input"
              value={ordem}
              onChange={(e) => setOrdem(e.target.value as Ordem)}
            >
              <option value="nome">Nome</option>
              <option value="cla">Clã</option>
              <option value="seita">Seita</option>
              <option value="jogador">Jogador</option>
              <option value="status">Status</option>
            </select>
          </label>
        </div>
        {loading && <p className="muted">Carregando personagens…</p>}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && !error && lista.length === 0 && (
          <p className="muted">Nenhum personagem encontrado.</p>
        )}
        <div className="cards-grid" style={{ marginTop: 12 }}>
          {lista.map((c) => (
            <Link
              key={c.id}
              className="card home-card"
              to={`/personagens/${c.id}`}
            >
              <ClanCrest clan={c.clan} size={52} />
              <div>
                <b>{c.nome}</b>{" "}
                {c.aprovado
                  ? <span className="badge badge-aprovado">aprovado</span>
                  : <span className="badge badge-pendente">pendente</span>}
                <div className="small muted">
                  {c.clan} · {c.seita} · {c.jogador}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
