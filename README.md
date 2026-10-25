# Live Action v2 — React + TS + Firebase (thelive-v2), 100% Web no GitHub Pages

Projeto novo e limpo. O legado em `../live` (Ionic 1) fica como arquivo morto, só consulta.
**Pagamentos removidos do escopo** por decisão do dono. **Sem app Android** — só web.

## Estrutura

```
thelive-v2/
  web/                  # Vite + React + TS (GitHub Pages)
  tools/migrate/        # script RTDB → Firestore
  firestore.rules
  storage.rules
  firestore.indexes.json
  .github/workflows/deploy.yml
```

## Rodar

```bash
cd web
cp .env.example .env   # já vem com as chaves do thelive-v2
npm install
npm run dev
```

## Migrar dados (dry-run primeiro)

```bash
node ../tools/migrate/migrate.mjs \
  --export /home/wagner/code/js/live/tmp/thelive-f8cb5-export.json \
  --service-account /home/wagner/code/js/live/tmp/thelive-v2-firebase-adminsdk-fbsvc-eb0af41e3e.json \
  --dry-run

# se o relatório estiver ok:
node ../tools/migrate/migrate.mjs --export ... --service-account ... --commit
```

## Deploy (GitHub Pages)

Live: https://wsoubar.github.io/thelive-v2/

Automático via `.github/workflows/deploy.yml` a cada push na `main` (usa Secrets `VITE_FIREBASE_*` — já configurados).

## Firebase (regras + migração)

```bash
firebase deploy --only firestore --project thelive-v2
```

> Sem Firebase Storage (plano Spark, sem Blaze): avatares viram foto base64
> pequena no doc do personagem ou iniciais — sem upload de arquivos.

## Notas

- `tmp/` e `*service-account*.json` nunca são commitados (ver `.gitignore`).
- Trava de 1 ação aberta do legado (`acoesCtrl`) virou `status: open|answered` + validação no app/Function.
- Auth antigo não migra senha: usuários farão reset de senha no primeiro acesso.
