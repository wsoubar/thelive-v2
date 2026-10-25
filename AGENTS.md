# AGENTS.md — thelive-v2

## Visão geral
- Responda sempre em português do Brasil e execute as tarefas seguindo essa preferência, incluindo textos, documentação e comunicação com o usuário.
- App único em `web/` (Vite + React 19 + TS + React Router 7), Firebase Auth/Firestore, sem backend próprio. `tools/migrate/` é um script avulso de migração RTDB → Firestore.
- `firebase.json`, `firestore.rules`, `firestore.indexes.json` e `storage.rules` ficam na raiz e apontam para o projeto Firebase `thelive-v2`.
- `../live` é o legado Ionic 1 arquivado: consulte dados/nomes, não copie código.
- Domínio e UI são 100% pt-BR (textos, identificadores, collections). Não há i18n; strings ficam hardcoded.
- Não existe `package.json` na raiz. Rode todos os comandos em `web/` (ou em `tools/migrate/`).

## Comandos
```bash
cd web
npm run dev      # Vite
npm run lint     # oxlint (não ESLint)
npm run build    # tsc -b && vite build
```
- Não existe suíte de testes. A verificação mínima é `npm run lint && npm run build`; o CI (Node 24) roda só `npm ci && npm run build`, sem lint nem testes.
- `build` falha em import/parâmetro não usado (`noUnusedLocals`/`noUnusedParameters`) e exige `import type` para tipos (`verbatimModuleSyntax`, `erasableSyntaxOnly`).
- O lint já tem warnings (fast-refresh, exhaustive-deps) e o build avisa de chunk >500 kB; nenhum dos dois falha o comando.
- Nunca rode `npm audit fix --force`: ele rebaixa o `firebase` e quebra os peers. Se o lockfile quebrar, restaure com `git checkout -- web/package.json web/package-lock.json && npm ci`.
- `npm audit --omit=dev` deve ficar em **0**. O que sobra no `npm audit` completo vem só das CLIs de dev (`firebase-tools`/`gh-pages`) e não tem versão corrigida; não tente resolver com `--force`. O `overrides` de `@grpc/grpc-js` corrige o CVE que o `firebase` ainda fixa em `~1.9` — não remova sem revisar o audit.
- `web/.env` é local/ignorado; copie de `web/.env.example`. As chaves Firebase não são segredo de servidor.
- Firebase CLI não é global: da raiz use `./web/node_modules/.bin/firebase deploy --only firestore --project thelive-v2`.

## Dados e regras
- Firestore: `users/{uid}`, `personagens/{pid}` (+ subcoleções `info/principal` e `xps/{xid}`), `acoes/{aid}`, `chats/{id}/messages/{mid}`, `citacoes`, `clans`, `seitas`.
- `users/{uid}.roles.narrador === true` é o único critério de narrador no app e nas rules. Promover alguém = editar esse doc no console (não há tela de admin).
- As rules limitam leitura a personagens `aprovado == true` (dono e narrador veem o resto) e só permitem ações com `status: 'open'` na criação. A trava de "1 ação aberta por jogador" é apenas no client (`web/src/pages/Acoes.tsx`), não nas rules nem em Function.
- Responder ação é exclusivo do narrador; o jogador só edita/apaga a própria ação enquanto ela está `open`. Não há Cloud Functions no repo: validação = rules + client.
- Plano Spark, Storage indisponível na prática: avatar é base64 pequeno no doc ou `ClanCrest` (SVG gerado) / PNG em `web/public/img/clanlogos/` registrado em `web/src/lib/clanlogo.ts`. `storage.rules` não está no `firebase.json`.
- Queries evitam índices novos de propósito: narrador busca sem `where` e ordena no client; jogador usa o índice composto `aprovado+seita+clan+nome`. Ao adicionar `where`/`orderBy`, atualize `firestore.indexes.json` e faça deploy.
- Ações migradas ficam com `userid: null` e não aparecem para o jogador até o backfill via Admin SDK. Senhas do legado não migram: use "Esqueci a senha".
- Migração: `node tools/migrate/migrate.mjs --export <json> --service-account <json> --dry-run` não escreve nada; só `--commit` aplica (batches de 400). Nunca commitar service account, `.env`, `dist/` ou `tmp/`.

## Navegação e deploy
- `HashRouter` é intencional (GitHub Pages não reescreve rotas): use URLs `#/rota`; não troque para BrowserRouter. O Vite usa `base: './'`; assets públicos via `import.meta.env.BASE_URL`.
- Rotas em `web/src/App.tsx`; páginas protegidas passam por `RequireAuth` + `Layout`. `/chats` é só placeholder.
- Deploy automático: push na `main` tocando `web/**`, com secrets `VITE_FIREBASE_*`. Manual: `cd web && npm run deploy` (branch `gh-pages`).
- O CI não publica rules nem índices; mudanças neles exigem o comando `firebase deploy --only firestore` acima.
- `web/README.md` é boilerplate do Vite; a documentação real é o `README.md` da raiz.
- Ionic/Capacitor foram removidos por estarem sem uso (nenhum import em `src/`); o alvo é 100% web — não reintroduza stack nativo sem pedido.
