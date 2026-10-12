import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../lib/firebase';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');

  return (
    <main style={{ maxWidth: 420, margin: '48px auto', padding: 16 }}>
      <h1>Live Action — entrar</h1>
      <form onSubmit={async (e) => {
        e.preventDefault();
        setErr('');
        try { await signInWithEmailAndPassword(auth, email, pass); nav('/'); }
        catch { setErr('Login inválido. Confira e-mail/senha.'); }
      }}>
        <input placeholder="e-mail" value={email} onChange={(e) => setEmail(e.target.value)} style={{ display: 'block', width: '100%', margin: '8px 0', padding: 10 }} />
        <input placeholder="senha" type="password" value={pass} onChange={(e) => setPass(e.target.value)} style={{ display: 'block', width: '100%', margin: '8px 0', padding: 10 }} />
        {err && <p style={{ color: 'crimson' }}>{err}</p>}
        <button type="submit" style={{ padding: '10px 16px' }}>Entrar</button>
      </form>
      <p><Link to="/signup">Criar conta</Link> · <Link to="/reset">Esqueci a senha</Link></p>
    </main>
  );
}
