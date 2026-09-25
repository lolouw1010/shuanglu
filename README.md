# 双陆 Shuanglu

A playable web prototype of Shuanglu, an ancient Chinese dice-and-race board game reconstruction.

## Live Build

Current production build:

```txt
https://shuanglu.uway.click/
https://shuanglu.uway.click/3d
```

Production runs on Linode Singapore as a systemd-managed Next.js service behind a Docker-hosted Nginx reverse proxy. The stable playable interface is the 2D board at `/`; `/3d` is a separate visual spike and is not the primary play surface yet.

## Current Scope

Version target: `0.5`

The current MVP focuses on a playable rules baseline:

- Reconstruction Mode rules by default.
- 15 horses per side.
- 24 abstract board points.
- Two-player local play.
- Human vs AI play with an expert profile.
- Online room play for friend testing.
- Rule guidance, legal move highlights, bar re-entry guidance, and automatic-pass explanations.
- MVP victory types: `single_win` and `double_win`.

Story-mode character skills, Quick Mode, crushing win, and the full 3D room/table scene are future variants or experiments, not MVP requirements.

## Local Workspace

Recommended primary local workspace:

```txt
/Users/lizhe/Projects/shuanglu
```

Avoid using the iCloud/Obsidian directory as the main program workspace because `.git`, `.next`, and `node_modules` create many small files and cache churn.

## Commands

```bash
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

## Mobile App

The Capacitor 8 mobile workspace lives in `mobile/` and requires Node.js 22. It shares the existing game and UI source while keeping its dependencies separate from the Node.js 20 production server.

```bash
npm run mobile:build
npm run mobile:sync
```

See `mobile/README.md` for native requirements, architecture, and platform commands.

Local runtime policy for the current MiniMac workflow: do not start a local web service unless explicitly requested. Use cloud deployment for runtime checks.

Node.js 20 is the supported development and production major version. Run `nvm use` before installing dependencies.

## Architecture

- `src/game`: pure TypeScript rules engine.
- `src/store`: game state orchestration around the rules engine.
- `src/components`: React rendering and interaction components.
- `src/server`: online room state and server actions.
- `src/data`: characters, lore entries, and rule notes.
- `tests`: Vitest coverage for core rules and AI behavior.
- `docs`: design, rules, history, deployment, and development records.

## Documentation

Start here:

- `docs/PROJECT_STATUS.md`: current implementation status, verification notes, risks, and next priorities.
- `docs/DEV_LOG.md`: chronological development log.
- `docs/DEPLOYMENT.md`: cloud deployment history and server handoff notes.
- `docs/RULES_SPEC.md`: rule-layer specification.
- `docs/MVP_SCOPE.md`: MVP boundary and future variants.
- `docs/HISTORICAL_NOTES.md`: historical claim boundaries and recommended wording.
- `docs/ART_DIRECTION_3D.md`: approved 3D visual direction process and constraints.
- `docs/CLOUD_ASSETS.md`: cloud asset inventory and runtime notes.

## Historical Claim Boundary

This project is a playable reconstruction. It does not claim to be a perfect Tang-Song rule restoration, and it does not claim that all historical board terms or layouts were universally fixed across all periods.
