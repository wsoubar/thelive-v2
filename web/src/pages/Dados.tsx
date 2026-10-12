import { useState } from 'react';

export default function Dados() {
  const [parada, setParada] = useState(5);
  const [dificuldade, setDificuldade] = useState(6);
  const [minSucessos, setMinSucessos] = useState(1);
  const [rolagem, setRolagem] = useState<number[]>([]);
  const [sucessos, setSucessos] = useState<number | null>(null);

  const rolar = () => {
    const ds = Array.from({ length: parada }, () => 1 + Math.floor(Math.random() * 10));
    setRolagem(ds);
    setSucessos(ds.filter((d) => d >= dificuldade).length);
  };

  const ok = sucessos !== null && sucessos >= minSucessos;

  return (
    <>
      <div className="page-head"><h1>Dados d10</h1><p>Rolagem local — nada é salvo.</p></div>
      <div className="card stack">
        <label className="field">Mínimo de sucessos: {minSucessos}<input type="range" min={1} max={15} value={minSucessos} onChange={(e) => setMinSucessos(Number(e.target.value))} /></label>
        <label className="field">Dificuldade: {dificuldade}<input type="range" min={1} max={10} value={dificuldade} onChange={(e) => setDificuldade(Number(e.target.value))} /></label>
        <label className="field">Parada de dados: {parada}<input type="range" min={1} max={15} value={parada} onChange={(e) => setParada(Number(e.target.value))} /></label>
        <div><button className="btn btn-primary" onClick={rolar}>Rolar</button></div>
      </div>
      {sucessos !== null && (
        <div className="card" style={{ marginTop: 12, borderColor: ok ? '#9ed9b8' : '#f3c2c4' }}>
          <b>{sucessos} sucesso(s)</b> — {ok ? 'Sucesso!' : 'Falha.'}
          <div className="dice">{rolagem.map((d, i) => <span key={i} className={`die${d >= dificuldade ? ' hit' : ''}`}>{d}</span>)}</div>
        </div>
      )}
    </>
  );
}
