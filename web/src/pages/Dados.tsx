import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Dados() {
  const [parada, setParada] = useState(5);
  const [dificuldade, setDificuldade] = useState(6);
  const [minSucessos, setMinSucessos] = useState(1);
  const [rolagem, setRolagem] = useState<number[]>([]);
  const [sucessos, setSucessos] = useState<number | null>(null);

  const rolar = () => {
    const ds = Array.from({ length: parada }, () => 1 + Math.floor(Math.random() * 10));
    const s = ds.filter((d) => d >= dificuldade).length;
    setRolagem(ds); setSucessos(s);
  };

  const ok = sucessos !== null && sucessos >= minSucessos;

  return (
    <main style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
      <p><Link to="/">← Início</Link></p>
      <h1>Dados d10</h1>
      <label>Mínimo de sucessos: {minSucessos}<input type="range" min={1} max={15} value={minSucessos} onChange={(e) => setMinSucessos(Number(e.target.value))} style={{ width: '100%' }} /></label>
      <label>Dificuldade: {dificuldade}<input type="range" min={1} max={10} value={dificuldade} onChange={(e) => setDificuldade(Number(e.target.value))} style={{ width: '100%' }} /></label>
      <label>Parada de dados: {parada}<input type="range" min={1} max={15} value={parada} onChange={(e) => setParada(Number(e.target.value))} style={{ width: '100%' }} /></label>
      <p><button onClick={rolar} style={{ padding: '12px 24px' }}>Rolar</button></p>
      {sucessos !== null && (
        <div style={{ border: '1px solid #e5e4e7', borderRadius: 8, padding: 12, background: ok ? '#ecfdf5' : '#fef2f2' }}>
          <b>{sucessos} sucesso(s)</b> — {ok ? 'Sucesso!' : 'Falha.'}
          <div>Dados: {rolagem.join(', ')}</div>
        </div>
      )}
    </main>
  );
}
