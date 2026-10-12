import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';

const input = { display: 'block', width: '100%', margin: '8px 0', padding: 10 } as const;

function msg(code: string) {
  if (code.includes('email-already-in-use')) return 'E-mail já cadastrado. Tente entrar ou resetar a senha.';
  if (code.includes('weak-password')) return 'Senha fraca: use 6 a 15 caracteres.';
  if (code.includes('invalid-email')) return 'E-mail inválido.';
  return 'Falha ao criar conta. Confira os campos.';
}

export default function Signup() {
  const nav = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);

  const invalid =
    nome.trim().length < 7 || nome.trim().length > 30 ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ||
    pass.length < 6 || pass.length > 15 || pass !== pass2;

  return (
    <main style={{ maxWidth: 420, margin: '48px auto', padding: 16 }}>
      <h1>Live Action — criar conta</h1>
      <form onSubmit={async (e) => {
        e.preventDefault();
        setErr('');
        if (invalid) { setErr('Confira nome (7-30), e-mail e senha (6-15, iguais).'); return; }
        try {
          const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
          await updateProfile(cred.user, { displayName: nome.trim() });
          await setDoc(doc(db, 'users', cred.user.uid), {
            personagemId: null, displayName: nome.trim(), roles: { narrador: false },
          });
          setOk(true);
          nav('/');
        } catch (er) {
          setErr(msg(er instanceof Error ? er.message : ''));
        }
      }}>
        <input placeholder="Nome (7-30 caracteres)" value={nome} onChange={(e) => setNome(e.target.value)} style={input} />
        <input placeholder="e-mail" value={email} onChange={(e) => setEmail(e.target.value)} style={input} />
        <input placeholder="senha (6-15)" type="password" value={pass} onChange={(e) => setPass(e.target.value)} style={input} />
        <input placeholder="confirmar senha" type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} style={input} />
        {err && <p style={{ color: 'crimson' }}>{err}</p>}
        {ok && <p>Conta criada.</p>}
        <button type="submit" disabled={invalid} style={{ padding: '10px 16px' }}>Confirmar</button>
      </form>
      <p><Link to="/login">Voltar ao login</Link></p>
    </main>
  );
}
