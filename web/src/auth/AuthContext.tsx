import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

type Profile = { personagemId: string | null; roles: { narrador: boolean } } | null;

const Ctx = createContext<{ user: User | null; profile: Profile; loading: boolean }>({ user: null, profile: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, async (u) => {
    setUser(u);
    if (u) {
      const snap = await getDoc(doc(db, 'users', u.uid));
      setProfile((snap.data() as Profile) ?? null);
    } else setProfile(null);
    setLoading(false);
  }), []);

  return <Ctx.Provider value={{ user, profile, loading }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
