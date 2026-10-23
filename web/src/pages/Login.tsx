import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { AuthShell } from '../components/Layout';
import { PasswordField } from '../components/PasswordField';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');

  return (
    <AuthShell title="Entrar" subtitle="Acesse seu personagem e envie suas ações da crônica.">
      <form className="stack" onSubmit={async (e) => {
        e.preventDefault();
        setErr('');
        try { await signInWithEmailAndPassword(auth, email.trim(), pass); nav('/'); }
        catch { setErr('Login inválido. Confira e-mail/senha.'); }
      }}>
        <label className="field">E-mail<input className="input" placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <PasswordField label="Senha" placeholder="••••••" value={pass} onChange={setPass} />
        {err && <div className="alert alert-error">{err}</div>}
        <button className="btn btn-primary" type="submit">Entrar</button>
      </form>
      <p className="small muted" style={{ marginTop: 14 }}><Link to="/signup">Criar conta</Link> · <Link to="/reset">Esqueci a senha</Link></p>
    </AuthShell>
  );
}
