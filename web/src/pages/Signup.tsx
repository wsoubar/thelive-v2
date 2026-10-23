import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { AuthShell } from '../components/Layout';
import { PasswordField } from '../components/PasswordField';

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

  const invalid =
    nome.trim().length < 7 || nome.trim().length > 30 ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ||
    pass.length < 6 || pass.length > 15 || pass !== pass2;

  return (
    <AuthShell title="Criar conta" subtitle="Nome 7–30 caracteres · senha 6–15 caracteres.">
      <form className="stack" onSubmit={async (e) => {
        e.preventDefault();
        setErr('');
        if (invalid) { setErr('Confira nome (7-30), e-mail e senha (6-15, iguais).'); return; }
        try {
          const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
          await updateProfile(cred.user, { displayName: nome.trim() });
          await setDoc(doc(db, 'users', cred.user.uid), {
            personagemId: null, displayName: nome.trim(), roles: { narrador: false },
          });
          nav('/');
        } catch (er) {
          setErr(msg(er instanceof Error ? er.message : ''));
        }
      }}>
        <label className="field">Nome<input className="input" placeholder="Seu nome e sobrenome" value={nome} onChange={(e) => setNome(e.target.value)} /></label>
        <label className="field">E-mail<input className="input" placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <PasswordField label="Senha" placeholder="6 a 15 caracteres" value={pass} onChange={setPass} />
        <PasswordField label="Confirmar senha" placeholder="repita a senha" value={pass2} onChange={setPass2} />
        {err && <div className="alert alert-error">{err}</div>}
        <button className="btn btn-primary" type="submit" disabled={invalid}>Confirmar</button>
      </form>
      <p className="small muted" style={{ marginTop: 14 }}><Link to="/login">Voltar ao login</Link></p>
    </AuthShell>
  );
}
