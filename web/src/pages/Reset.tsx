import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { AuthShell } from '../components/Layout';

export default function Reset() {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);
  const invalid = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  return (
    <AuthShell title="Recuperar senha" subtitle="Enviamos um link de reset para o seu e-mail.">
      <form className="stack" onSubmit={async (e) => {
        e.preventDefault();
        setErr(''); setOk(false);
        if (invalid) { setErr('E-mail inválido.'); return; }
        try {
          await sendPasswordResetEmail(auth, email.trim());
          setOk(true);
        } catch {
          setErr('Não foi possível enviar. Confira o e-mail.');
        }
      }}>
        <label className="field">E-mail<input className="input" placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        {err && <div className="alert alert-error">{err}</div>}
        {ok && <div className="alert alert-ok">Em instantes você recebe o e-mail de reset.</div>}
        <button className="btn btn-primary" type="submit" disabled={invalid}>Resetar senha</button>
      </form>
      <p className="small muted" style={{ marginTop: 14 }}><Link to="/login">Voltar ao login</Link></p>
    </AuthShell>
  );
}
