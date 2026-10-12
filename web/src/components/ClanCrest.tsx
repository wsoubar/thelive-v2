// Emblemas próprios dos clãs (SVG gerado, sem assets externos).
// Se um dia houver PNG real em public/img/clanlogos/, o mapa de clanlogo.ts
// tem prioridade — o Brasao usa o PNG quando existir.

import { normClan } from '../lib/clanlogo';

// Cor de fundo por clã (paleta gótica, tons distintos)
const CORES: Record<string, [string, string]> = {
  brujah: ['#7f1d1d', '#ef4444'],
  gangrel: ['#14532d', '#22c55e'],
  malkaviano: ['#581c87', '#a855f7'],
  nosferatu: ['#1c1917', '#78716c'],
  toreador: ['#831843', '#f472b6'],
  tremere: ['#1e3a8a', '#60a5fa'],
  ventrue: ['#713f12', '#eab308'],
  'seguidores de set': ['#431407', '#f97316'],
  giovanni: ['#064e3b', '#2dd4bf'],
  assamita: ['#111827', '#9ca3af'],
  'filha da cacofania': ['#4a044e', '#e879f9'],
  ravnos: ['#7c2d12', '#fb923c'],
  salubri: ['#f8fafc', '#94a3b8'],
  lasombra: ['#020617', '#64748b'],
  tzmisce: ['#3b0764', '#8b5cf6'],
  'serpente da luz': ['#052e16', '#4ade80'],
  pander: ['#3f3f46', '#d4d4d8'],
  gargula: ['#44403c', '#a8a29e'],
  caitiff: ['#0c4a6e', '#38bdf8'],
};

function cores(clan: string): [string, string] {
  const n = normClan(clan);
  // variações AT (anti-tribu) herdam a cor do clã base
  for (const base of Object.keys(CORES)) {
    if (n === base || n.startsWith(base)) return CORES[base];
  }
  return ['#334155', '#94a3b8'];
}

function monograma(clan: string) {
  const clean = (clan ?? '').replace(/\s+AT$/i, '').trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ClanCrest({ clan, size = 44 }: { clan: string; size?: number }) {
  const [c1, c2] = cores(clan);
  const gid = `g${normClan(clan).replace(/[^a-z]/g, '') || 'x'}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={`Emblema ${clan}`}
      style={{ flex: 'none', borderRadius: '50%', boxShadow: 'var(--shadow)', border: '2px solid #fff' }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill={`url(#${gid})`} />
      <circle cx="24" cy="24" r="18.5" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.5" />
      <text
        x="24"
        y="24"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontSize="15"
        fontWeight="800"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {monograma(clan)}
      </text>
    </svg>
  );
}
