export default function Placeholder({ title }: { title: string }) {
  return (
    <>
      <div className="page-head"><h1>{title}</h1><p>Em breve</p></div>
      <div className="card"><p className="muted">Tela em construção — chats chegam na Fase 2.</p></div>
    </>
  );
}
