import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

type Profile = { personagemId: string | null; displayName?: string; roles?: { narrador: boolean } } | null;

const Ctx = createContext<{ user: User | null; profile: Profile; loading: boolean; profileError: string }>({ user: null, profile: null, loading: true, profileError: '' });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [profileError, setProfileError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, async (u) => {
    setUser(u);
    setProfileError('');
    if (u) {
      try {
        const snap = await getDoc(doc(db, 'users', u.uid));
        setProfile((snap.data() as Profile) ?? null);
      } catch (e) {
        setProfile(null);
        setProfileError(e instanceof Error ? e.message : 'Falha ao ler perfil.');
      } finally {
        setLoading(false);
      }
    } else {
      setProfile(null);
      setLoading(false);
    }
  }), []);

  return <Ctx.Provider value={{ user, profile, loading, profileError }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
