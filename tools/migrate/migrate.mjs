/**
 * Migração RTDB (thelive-f8cb5) → Firestore (thelive-v2).
 * Pagamentos/chats-adm FORA do escopo (removidos por decisão do dono).
 *
 * Uso:
 *   node tools/migrate/migrate.mjs --export /home/wagner/code/js/live/tmp/thelive-f8cb5-export.json \
 *     --service-account /home/wagner/code/js/live/tmp/thelive-v2-firebase-adminsdk-fbsvc-eb0af41e3e.json \
 *     --dry-run
 *   node tools/migrate/migrate.mjs --export ... --service-account ... --commit
 */
import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) acc.push([cur, arr[i + 1]?.startsWith('--') || arr[i + 1] === undefined ? 'true' : arr[i + 1]]);
    return acc;
  }, []),
);
const getArg = (k) => args[`--${k}`];
const DRY = getArg('dry-run') === 'true' || process.argv.includes('--dry-run');
const COMMIT = process.argv.includes('--commit');

if (!getArg('export') || !getArg('service-account')) {
  console.error('Uso: --export <json> --service-account <json> [--dry-run|--commit]');
  process.exit(1);
}

const raw = JSON.parse(readFileSync(getArg('export'), 'utf8'));
const svc = JSON.parse(readFileSync(getArg('service-account'), 'utf8'));

initializeApp({ credential: cert(svc), projectId: svc.project_id });
const db = getFirestore();
const ts = (ms) => (ms ? Timestamp.fromMillis(Number(ms)) : FieldValue.serverTimestamp());
const boolSN = (v) => v === 'S' || v === true;

const batches = [];
let batch = db.batch();
let ops = 0;
const queue = (ref, data) => {
  batch.set(ref, data, { merge: true });
  if (++ops % 400 === 0) { batches.push(batch); batch = db.batch(); }
};

const stats = { personagens: 0, info: 0, infoVazias: 0, xps: 0, acoes: 0, citacoes: 0, clans: 0, seitas: 0, users: 0 };

// 1. personagens + users
const seenUsers = new Map();
for (const [pid, p] of Object.entries(raw.personagens ?? {})) {
  queue(db.doc(`personagens/${pid}`), {
    nome: p.nome ?? '', clan: p.clan ?? '', seita: p.seita ?? '',
    geracao: Number(p.geracao ?? 13), status: Number(p.status ?? 0),
    userid: p.userid ?? null, jogador: p.jogador ?? '',
    dataCriacao: ts(p.dataCriacao), aprovado: boolSN(p.aprovado),
    narrador: boolSN(p.narrador), legacyId: pid,
  });
  stats.personagens++;
  if (p.userid && !seenUsers.has(p.userid)) {
    seenUsers.set(p.userid, true);
    queue(db.doc(`users/${p.userid}`), {
      personagemId: pid, displayName: p.jogador || p.nome || '',
      roles: { narrador: boolSN(p.narrador) }, migratedAt: FieldValue.serverTimestamp(),
    });
    stats.users++;
  }
}

// 2. personagensInfo → subcoleção info/principal
for (const [pid, info] of Object.entries(raw.personagensInfo ?? {})) {
  queue(db.doc(`personagens/${pid}/info/principal`), {
    historia: info.historia ?? '', planilha: info.planilha ?? '',
    rumores: info.rumores ?? '', antecedentes: info.antecedentes ?? '',
  });
  stats.info++;
}
for (const pid of Object.keys(raw.personagens ?? {})) {
  if (!raw.personagensInfo?.[pid]) {
    queue(db.doc(`personagens/${pid}/info/principal`), { historia: '', planilha: '', rumores: '', antecedentes: '' });
    stats.infoVazias++;
  }
}

// 3. xps
for (const [pid, entries] of Object.entries(raw.xps ?? {})) {
  for (const [xid, x] of Object.entries(entries)) {
    queue(db.doc(`personagens/${pid}/xps/${xid}`), { data: ts(x.data), descricao: x.descricao ?? '', valor: Number(x.valor ?? 0) });
    stats.xps++;
  }
}

// 4. ações (acoesCtrl descartado — trava vira regra de app/Function)
for (const [aid, a] of Object.entries(raw.acoes ?? {})) {
  queue(db.doc(`acoes/${aid}`), {
    data: ts(a.data), idPersonagem: a.idPersonagem ?? null,
    nomePersonagem: a.nomePersonagem ?? '', jogador: a.jogador ?? '',
    userid: null, // vincular pós-migração via personagens.idPersonagem → userid
    acao: a.acao ?? '', status: a.respondido === 'S' ? 'answered' : 'open',
    resposta: a.resposta ?? '', narrador: a.narrador ?? '',
    dataResposta: a.dataResposta ? ts(a.dataResposta) : null, legacyId: aid,
  });
  stats.acoes++;
}

// 5. citações / clans / seitas
for (const [cid, c] of Object.entries(raw.citacoes ?? {})) {
  queue(db.doc(`citacoes/${cid}`), { citacao: c.citacao ?? '', autor: c.autor ?? '' });
  stats.citacoes++;
}
(raw.clanlist ?? []).forEach((c, i) => {
  if (!c) return;
  queue(db.doc(`clans/clan_${i}`), { clan: c.clan ?? '', seita: c.seita ?? '' });
  stats.clans++;
});
(raw.seita ?? []).forEach((s, i) => {
  if (!s) return;
  queue(db.doc(`seitas/seita_${i}`), { nome: s.nome ?? '' });
  stats.seitas++;
});
batches.push(batch);

console.log('Plano de migração (sem pagamentos):', stats, DRY ? '[DRY-RUN]' : '[COMMIT]');
if (DRY && !COMMIT) { console.log('Nada escrito. Rode com --commit para aplicar.'); process.exit(0); }
for (const b of batches) await b.commit();
console.log(`OK: ${ops} writes aplicados em ${batches.length} batches.`);
console.log('Pós-migração: rode backfill de acoes.userid via personagens e confira órfãos no relatório.');
