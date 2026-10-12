// Logos de clã: arquivos em web/public/img/clanlogos/ (legado só tinha Caitiff).
// Clãs sem arquivo usam avatar de iniciais (fallback). Para adicionar um clã,
// coloque o PNG em public/img/clanlogos/ e registre no mapa abaixo.

const MAP: Record<string, string> = {
  caitiff: 'caitiff.png',
};

export function normClan(clan: string) {
  return (clan ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function clanLogo(clan: string): string | null {
  const f = MAP[normClan(clan)];
  return f ? `${import.meta.env.BASE_URL}img/clanlogos/${f}` : null;
}
