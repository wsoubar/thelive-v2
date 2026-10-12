import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { auth } from '../lib/firebase';

export default function Reset() {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);
  const invalid = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  return (
    <main style={{ maxWidth: 420, margin: '48px auto', padding: 16 }}>
      <h1>Live Action — recuperar senha</h1>
      <form onSubmit={async (e) => {
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
        <input placeholder="e-mail" value={email} onChange={(e) => setEmail(e.target.value)} style={{ display: 'block', width: '100%', margin: '8px 0', padding: 10 }} />
        {err && <p style={{ color: 'crimson' }}>{err}</p>}
        {ok && <p>Em instantes você recebe o e-mail de reset.</p>}
        <button type="submit" disabled={invalid} style={{ padding: '10px 16px' }}>Resetar senha</button>
      </form>
      <p><Link to="/login">Voltar ao login</Link></p>
    </main>
  );
}
