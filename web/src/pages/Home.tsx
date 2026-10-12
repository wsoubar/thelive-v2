import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { useAuth } from '../auth/AuthContext';

type Char = { id: string; nome: string; clan: string; seita: string };

export default function Home() {
  const { user, profile } = useAuth();
  const [chars, setChars] = useState<Char[]>([]);

  useEffect(() => {
    (async () => {
      const q = query(collection(db, 'personagens'), where('aprovado', '==', true), limit(20));
      const snap = await getDocs(q);
      setChars(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Char, 'id'>) })));
    })();
  }, []);

  return (
    <main style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
      <h1>Live Action 🧛</h1>
      <p>Olá, {user?.email} {profile?.roles.narrador && '(narrador)'}</p>
      <nav style={{ display: 'flex', gap: 12, margin: '16px 0' }}>
        <Link to="/personagens">Personagens</Link>
        <Link to="/acoes">Ações</Link>
        <Link to="/chats">Chats</Link>
        <Link to="/dados">Dados</Link>
      </nav>
      <h2>Aprovados (amostra)</h2>
      <ul>{chars.map((c) => <li key={c.id}>{c.nome} — {c.clan}/{c.seita}</li>)}</ul>
    </main>
  );
}
