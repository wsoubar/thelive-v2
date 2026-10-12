import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../auth/AuthContext';

type Char = { id: string; nome: string; clan: string; seita: string };

export default function Home() {
  const { user, profile, profileError } = useAuth();
  const nav = useNavigate();
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
    <main style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
      <h1>Live Action 🧛</h1>
      <p>Olá, {user?.email} {isNarrador && '(narrador)'}</p>
      {!profile && !profileError && <p style={{ color: '#a16207' }}>Sem doc em users/{user?.uid} — crie no Firestore com roles.narrador se for narrador.</p>}
      {profileError && <p style={{ color: 'crimson' }}>Perfil: {profileError}</p>}
      <p><button onClick={async () => { await signOut(auth); nav('/login'); }}>Sair</button></p>
      <nav style={{ display: 'flex', gap: 12, margin: '16px 0' }}>
        <Link to="/personagens">Personagens</Link>
        <Link to="/acoes">Ações</Link>
        <Link to="/chats">Chats</Link>
        <Link to="/dados">Dados</Link>
      </nav>
      <h2>Aprovados (amostra)</h2>
      {loading && <p>Carregando personagens…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {!loading && !error && chars.length === 0 && <p>Nenhum aprovado encontrado.</p>}
      <ul>{chars.map((c) => <li key={c.id}>{c.nome} — {c.clan}/{c.seita}</li>)}</ul>
    </main>
  );
}
