# Project Status

Last updated: 2026-09-26 CST

## Current Target

Version target: `0.5`

Goal: maintain a playable cloud-hosted 0.5 prototype while documenting the current system clearly enough for continued development.

The current priority is a stable playable baseline and clear handoff documentation, not commercial completeness.

## 2026-09-26 Mobile Readability and State Integrity Update

- Mobile source and target markers now use shape, text, color, and a dark backing together instead of relying on gold/green color alone.
- The 3D table now gives actionable points a dark perimeter and uses hollow source rings versus filled target discs.
- White and black horses retain their body colors while gaining opposite-luminance edge treatment for light and dark board surfaces.
- Added pure board-state invariant checks for point structure, non-negative integer counters, and per-player horse totals.
- Move application now asserts that each player's horse count is conserved across normal moves, hits, bar entry, and bearing off.
- Added eight invariant tests; the suite now passes 46 tests across 11 files.
- UI horse-count copy and character counters now read `ruleConfig.horsesPerPlayer` instead of repeating the MVP value.
- Browser QA covered 390x844 and 430x932 portrait viewports plus the 3D WebGL scene. The 3D scene produced no console errors; Three r184 emitted existing deprecation warnings for `Clock` and `PCFSoftShadowMap`.
- Web production build, TypeScript validation, and the isolated Capacitor/Vite mobile build pass.

## Production Baseline

Current production:

```txt
URL: https://shuanglu.uway.click
Server: Linode Singapore
Tailscale node: linode-singapore
Runtime: Node.js 20.20.2
Service: systemd unit shuanglu.service
Application: /opt/apps/shuanglu/current
Internal address: 127.0.0.1:3002
Reverse proxy: Docker nginx
```

The previous Aliyun IP deployment is retired infrastructure and is retained only in historical documentation.

Production operations are tracked in the repository:

```txt
.nvmrc
ops/systemd/shuanglu.service
ops/systemd/shuanglu-certbot-renew.service
ops/systemd/shuanglu-certbot-renew.timer
ops/nginx/shuanglu.uway.click.conf
ops/scripts/deploy-certificate.sh
scripts/deploy-production.sh
scripts/production-health-check.sh
```

## Current State

The project has been initialized as a Next.js web application.

Implemented:

- Next.js + React + TypeScript project scaffold.
- Tailwind CSS styling setup.
- Zustand game state orchestration.
- Vitest test setup.
- Pure TypeScript rules engine under `src/game`.
- Basic local Human vs Human mode.
- Human vs AI mode.
- Upgraded Human vs AI opponent:
  - Full-turn legal move sequence search for current dice steps.
  - Deterministic tactical and positional evaluation.
  - Evaluates bearing off, bar pressure, pip count, hits, made points, home-board structure, blot exposure, stack concentration, and mobility.
  - Default black opponent now uses the `expert` AI profile.
  - Expert profile now plays more aggressively after playtest feedback: higher hit pressure, lower over-conservatism around temporary blots, stronger bar pressure, re-entry blocking, and consecutive made-point pressure.
- Added Human vs AI black move trace UI:
  - Feedback panel lists every black move in the latest completed AI turn.
  - 2D board marks black move order with `黑1起`, `黑1落`, and `黑1打` chips.
  - Bar re-entry and bearing-off by black are also marked in the central wells.
  - Latest black-turn extraction is covered by regression tests.
- Basic Song Huizong themed opponent presentation.
- Rule/help modal.
- Main menu and game board screen.
- Dice panel, current move message, bar display, borne-off display.
- Automated rule tests.
- Historical claim boundary document at `docs/HISTORICAL_NOTES.md`.
- Future data derivative contracts for `src/data/lore.ts` and `src/data/ruleNotes.ts` documented in `docs/HISTORICAL_NOTES.md`.
- `RuleConfig` implemented in `src/game`.
- Reconstruction Mode and Classical Mode dice-step behavior covered by tests.
- MVP victory classification implemented as `single_win` / `double_win`.
- `src/data/lore.ts` and `src/data/ruleNotes.ts` created from `docs/HISTORICAL_NOTES.md`.
- Rules modal now renders mode notes and lore entries from data files.
- Basic browser smoke test completed for menu, rules modal, dice roll, and legal target highlighting.
- Board now uses a horizontally scrollable fixed minimum-width playfield to avoid mobile column collapse.
- Game screen now places the dice panel above the board so the first action is visible without scrolling.
- Added an in-game turn coach that states the win goal, movement direction, hitting rule, click sequence, current action, legal move count, and example legal moves.
- Board sources now highlight only currently legal source points, with visible `选马` labels; selected moves show green `可行` landing points.
- Main menu and dice panel copy now explain the objective and dice-step relationship in player-action language.
- Added a persistent victory tracker that shows each side's borne-off count, remaining horses to win, and the MVP double-win condition.
- Reworked the board from rectangular debug cells into a more game-like triangular point layout with stacked horse pieces.
- Compressed the HUD so victory progress and dice sit side by side on desktop, keeping the board visible earlier in the first viewport.
- Simplified character panels so they read as secondary context rather than oversized placeholder portraits.
- Added a play feedback strip that reports the current instruction and the previous move.
- Added visible last-move board traces: previous source, previous destination, hit marker, and borne-off marker.
- Added gameplay motion states for selectable sources, legal landing points, dice results, piece arrival, hit feedback, and feedback-strip updates.
- Added a short dice rolling phase with changing preview dice and `听骰` button state before the roll resolves.
- Replaced numeric dice blocks with actual pip-based dice faces.
- Added atmospheric board motion: lacquer-board glow, center-rail shimmer, arrival ripple, and horse-piece hover glints.
- Improved bar re-entry guidance: when a player has horses on the bar, the board now labels the bar control as `点这里复马` and the turn prompts explain the two-step action.
- Started the visual-board upgrade from flat prototype to a more 3D-like lacquer table.
- Reordered the game screen so the board appears before the turn coach and play feedback.
- Reworked the board into a staged scene with perspective wrapper, thick lacquer shell, dark inner tray, gold center spine, bar well, and bearing-off well.
- Added image asset slots for final bottle-shaped horse pieces at `public/assets/pieces/white-horse-idle.png` and `public/assets/pieces/black-horse-idle.png`.
- Added CSS fallback vase-shaped horse pieces while the final image assets are not yet committed.
- Added first-pass online room play:
  - Create room by six-character code.
  - Creator plays white.
  - First friend to join plays black.
  - Additional clients join as spectators.
  - Authoritative room state lives on the Next.js Node server.
  - Online roll and move actions are validated server-side.
  - Clients poll the room state for turn updates.
- Added online entry UI to the main menu and online room status UI to the game screen.
- Opened the `0.6-3d-table` interface phase.
- Added Three.js / React Three Fiber / Drei runtime dependencies.
- Added a dynamically loaded WebGL game table scene as the primary board presentation.
- Added a programmatic 3D room, lacquer table, 24 board points, glossy bottle/vase horse pieces, dice, and spectator figures.
- Wired 3D point/bar/off clicks into the existing legal move selection and target submission callbacks.
- Removed external HDR environment dependency from the first 3D pass; the scene currently uses local procedural geometry and lights only.
- Stabilized the 3D scene after the first animation-heavy version crashed:
  - Removed `drei/Text` labels.
  - Removed continuous per-frame horse, spectator, and dice animation.
  - Reduced geometry/shadow/rendering cost for the first stable 3D baseline.
- Separated board presentation into `classic` and `3d` views:
  - Stable 2D board is the default.
  - Online friend-play rooms use the stable 2D board.
  - 3D scene is isolated behind the `3D测试` menu entry and `/3d`.
- Added shareable online room URLs with `?room=<ROOM_ID>`.
- Added `docs/ART_DIRECTION_3D.md` to reset the 3D work process around approved effect images before further implementation.
- Marked the current `/3d` route as a technical spike only, not the target visual direction.
- Defined first visual directions to test:
  - Courtly Table.
  - Scholar's Study Table.
  - Museum-Grade Reconstructed Tabletop.
- Recommended Museum-Grade Reconstructed Tabletop with restrained Scholar's Study atmosphere as the first playable 3D target.
- Saved approved first-round 3D concept references in `public/assets/concepts/`.
- Started the approved 3D greybox implementation:
  - Close tabletop camera.
  - Dark lacquer board and tray.
  - Gold/brass point inlays.
  - Bottle-shaped glossy white/black horses.
  - Physical dice tray.
  - Restrained study/court atmosphere props at scene edges.
- First browser check loaded `/3d` but found the WebGL area could appear visually empty, so the 3D scene was simplified by removing risky shadow/spotlight components and increasing scene visibility.
- Tuned the `/3d` horse-to-board ratio after user review:
  - Reduced procedural bottle horse world scale.
  - Tightened stack spacing on each point.
  - Lowered the overflow marker to match the smaller pieces.
- Deployed the `/3d` horse-scale correction to Aliyun GD at `http://47.121.182.144/3d`.
- Stopped local development listeners on `127.0.0.1:3001` and `127.0.0.1:3004` during the cloud handoff.
- MiniMac operating policy is now cloud-only runtime testing: do not run the Shuanglu web service locally unless explicitly requested.
- Added `docs/CLOUD_ASSETS.md` as the current cloud asset inventory and handoff document.
- Initialized local Git repository and synced the project to GitHub at `lolouw1010/shuanglu`.
- BigNAS Git mirror configured as local remote `bignas` at `uway-nas:/var/services/homes/louieadmin/git/shuanglu.git`; the earlier receive-pack hang was resolved, and `bignas/main` was verified at `092ace8` alongside GitHub.
- Mounted the generated 2D parchment PNG asset pass:
  - Top banner remains image-led.
  - Round/action plaque uses generated artwork.
  - Character side panels use generated parchment scrolls.
  - Li Qingzhao and Song Huizong portraits use generated transparent PNGs as CSS background layers.
  - Lower command band, footer nav, board medallion, and point rings use generated PNG assets.
- Dice PNGs are intentionally not mounted yet; dice remain CSS-rendered until the next asset discussion.
- Final horse-piece PNGs are still absent. The board now avoids requesting missing horse-piece PNG paths and uses the existing CSS horse fallback.
- Latest cloud visual verification room: `1248E8`.
- Latest cloud screenshot: `/tmp/shuanglu-screens/game-png-assets-cssfix.png`.
- Latest Aliyun backup: `/opt/shuanglu_backups/shuanglu_before_png_assets_cssfix_20260615_033923`.
- Aliyun disk cleanup completed after a failed release hit 100% root usage; only Shuanglu old backups and upload artifacts were cleaned, leaving 28G available.
- Completed a follow-up 2D UI tuning pass on the mounted PNG interface:
  - Character portraits now lead the side panels.
  - Character names now sit in dark plaque treatments below the portraits.
  - Skill and token-track boxes were softened to blend into the scroll panels.
  - Board point rings and center medallion were reduced so pieces read more clearly.
  - Lower command band spacing and typography were tightened.
- Latest cloud UI tuning verification room: `CF6EA0`.
- Latest cloud UI tuning screenshot: `/tmp/shuanglu-screens/game-ui-tuning-final.png`.
- Latest Aliyun UI tuning backup: `/opt/shuanglu_backups/shuanglu_before_ui_tuning_final_20260615_172912`.
- Aliyun root filesystem after latest cleanup: 29G available, 25% used.
- Completed a local 2D point/layout correction pass after visual QA:
  - Board points now distinguish empty and occupied states.
  - Empty point circles are smaller and lighter.
  - Occupied points hide the circle marker so horses do not sit on oversized round holes.
  - Removed an extra board-shell grid overlay that made the live grid appear misaligned.
  - Side portraits were retuned to preserve head/hat visibility.
  - Local verification passed: `npx tsc --noEmit`, `npm test`, and `npm run build`.
- Attempted to deploy the point/layout correction to Aliyun GD, but the server became unreachable during remote install/build:
  - HTTP to `http://47.121.182.144/` timed out.
  - SSH timed out during banner exchange.
  - Cloud deployment status for this latest pass is not confirmed.
  - Next cloud action must first verify or recover `/opt/shuanglu`, PM2, Nginx, and disk usage.
- Aliyun GD recovered after user reboot:
  - Broken half-deployed `/opt/shuanglu` was moved to `/opt/shuanglu_backups/shuanglu_broken_after_reboot_20260616_001132`.
  - Runtime was restored from `/opt/shuanglu_backups/shuanglu_before_point_layout_fix_20260615_214256`.
  - PM2 process `shuanglu` is online.
  - Nginx configuration test passed and was reloaded.
  - `http://47.121.182.144/` returned HTTP 200.
  - Recovery visual QA room: `A9D96C`.
  - Recovery screenshot: `/tmp/shuanglu-screens/game-recovery-check-20260616001747.png`.
  - The final local point-circle tuning commit `93c0a91` remains pushed to GitHub/BigNAS but is not currently confirmed as deployed on Aliyun.
- Removed the large baked-in left/right side circles from the active 2D board texture:
  - Updated `public/assets/ui/2d-board-texture.png`.
  - Applied to Aliyun as a static asset hotfix only; PM2 was not restarted.
  - Previous cloud PNG backup: `/opt/shuanglu_backups/2d-board-texture-before-remove-side-circles-20260617_023141.png`.
  - Cloud visual QA room: `06495C`.
  - Cloud visual QA screenshot: `/tmp/shuanglu-screens/game-remove-side-circles-20260617023305.png`.
  - Local verification passed: `npx tsc --noEmit`, `npm test`, and `npm run build`.
- Mounted six user-generated faux-3D dice faces:
  - Corrected baked checkerboard backgrounds into real transparency.
  - Normalized all faces to `512×512 RGBA` with consistent visual height, center, and baseline.
  - `DiceFace` now renders `/assets/ui/dice/dice-1.png` through `dice-6.png` for numeric results.
  - Existing roll timing and CSS animation remain active.
  - Deployed through an independent release directory with temporary-port smoke testing before the live switch.
  - Latest Aliyun backup: `/opt/shuanglu_backups/shuanglu_before_dice_ui_20260621_215030`.
  - Cloud visual QA room: `C2B3E1`, rolled `5-3`.
  - Cloud visual QA screenshot: `/tmp/shuanglu-screens/game-dice-assets-review.png`.
  - Local and cloud production builds passed; 10 test files and 38 tests passed.
- Restyled the stable 2D board screen toward the approved light parchment reference:
  - Top brand/chapter/action bar.
  - Left and right character-side panels.
  - Central board-first play area.
  - Light parchment board material, smaller round 2D horse tokens, restyled dice, and paper-like turn feedback panels.
  - Deployed to Aliyun GD at `http://47.121.182.144/` from commit `1f588f3`.
  - This is build-verified and cloud-verified, but still needs human browser visual approval.
- Added active 2D interface art direction:
  - Documented in `docs/ART_DIRECTION_2D.md`.
  - Reference states archived at `public/assets/concepts/2d-parchment-state-initial.png` and `public/assets/concepts/2d-parchment-state-progress.png`.
  - 2D top gameplay HUD now focuses on round/current action plus dice.
  - Side-panel `已出马` and `马栏` now use circular state tracks with counts.
  - Deployed to Aliyun GD at `http://47.121.182.144/` from commit `bcf8e2f`.
- Replaced the 2D character side-panel portraits with crops from the user-provided reference UI:
  - `public/assets/characters/white-reference-portrait.png`.
  - `public/assets/characters/black-reference-portrait.png`.
  - Deployed to Aliyun GD from commit `bc7485d`.
  - Actual cloud game-state screenshot check confirmed both character heads and upper bodies are visible.
- Advanced the stable 2D screen toward the supplied parchment UI reference:
  - Top banner now uses a re-cropped reference-style chapter/navigation asset without static dice or round state.
  - Bottom black-gold navigation now mirrors the reference layout.
  - The live board uses the reference board texture while keeping real point buttons, legal-move highlights, and online state.
  - Board labels now display as `1-12` / `12-1` in the UI while internal rules continue to use `0-23`.
  - Central `马栏` / `出马` controls are compressed to reduce board interruption.
  - Deployed to Aliyun GD from commit `60488ae`.
  - Actual cloud screenshot check captured `/tmp/shuanglu-screens/game-design-alignment-edge-final.png`.
- Reworked the 2D command area after user review:
  - Removed the always-visible large rule explanation cards from 2D gameplay.
  - Added a reference-style lower command panel with `剧情对话`, `可行动点`, `可行步数`, and `提示`.
  - Kept detailed rule coaching only in the 3D technical view.
  - Changed top-banner sizing to avoid hard two-axis stretching.
  - Restyled round/dice controls toward the same parchment material language.
  - Reduced 2D board horse tokens and landing-circle sizing so stacks fit more comfortably.
  - Added a cropped bottom scenery layer that excludes the fake reference `结束回合` button.
  - Deployed to Aliyun GD from commit `badaa8d`.
  - Actual cloud screenshot check captured `/tmp/shuanglu-screens/game-reference-final-badaa8d.png`.
- Softened the 2D lower command and hint area after follow-up visual review:
  - Converted the online room/share notice into a thin parchment strip instead of a dark utility card.
  - Converted the lower command area from separate rigid cards into a single continuous parchment band.
  - Replaced hard per-card borders with short faded internal separators.
  - Reduced source/step token sizing inside the command area to better match board pieces.
  - Reduced and faded the bottom-right scenery layer so it no longer creates a dominant hard rectangular block below the command panel.
  - Deployed to Aliyun GD from application code commit `bf38063`.
  - Actual cloud screenshot check captured `/tmp/shuanglu-screens/game-command-panel-soft-v3.png`.
- Aligned the 2D top HUD and side portraits closer to the supplied parchment reference:
  - Reworked the round/action display into a central two-tone plaque with clipped angled ends.
  - Removed the boxed `骰声` tray treatment in parchment mode so dice read as two independent dice beside the plaque.
  - Reduced the roll control to a small paper button beside the dice.
  - Reduced side-panel double-framing by removing the DOM portrait frame and softening the outer scroll frame.
  - Cropped the existing reference portrait assets more tightly so their embedded top labels and inner borders are no longer prominent.
  - Deployed to Aliyun GD from application code commit `7a55042`.
  - Actual cloud screenshot check captured `/tmp/shuanglu-screens/game-hud-portrait-align-v2.png`.
- Primary local development workspace moved out of iCloud to `/Users/lizhe/Projects/shuanglu`.
- Added deployment tracking document at `docs/DEPLOYMENT.md`.
- Added `docs/DOCUMENTATION_INDEX.md` as the documentation map and handoff entry point.
- Updated `README.md` with live cloud URLs, current MVP scope, architecture, and historical claim boundary notes.
- Deployed the current Next.js build to Aliyun GD at `http://47.121.182.144/`.
- Production runtime is PM2 process `shuanglu` behind Nginx, bound internally to `127.0.0.1:3002`.
- Deployed the first 3D-like board visual pass to Aliyun GD from working-tree archive `/tmp/shuanglu-visual-20260502-2349.tgz`.
- Deployed the online room MVP to Aliyun GD from source commit `0108b27`.
- Increased generated background visibility after user feedback:
  - Reduced the dark overlay over the 2D background.
  - Added the same generated background to the main menu through `menu-shell-bg`.
  - Kept central darkening to preserve board readability.
- Added a generated Song-era study/court background image for the stable 2D interface:
  - Project asset: `public/assets/backgrounds/song-study-court-bg.png`.
  - The composition keeps figures at the edges and a darker center behind the board.
  - The 2D shell adds overlay gradients and panel backdrop blur to preserve playfield readability.
  - The `/3d` route keeps its own scene background.
- Reworked the 2D game screen toward one-window playability:
  - 2D mode no longer spends the main viewport width on side character panels.
  - The title/header, victory tracker, and dice tray are shorter.
  - The board no longer requires a fixed 1080px-wide horizontal scroll area.
  - Board point height, board padding, center well height, and dice size are reduced to keep roll/move interactions in the first viewport.
- Improved the stable 2D board interaction layer after the bottle-piece update:
  - Board-level action guide explains whether to roll, point-pick, re-enter from bar, or land.
  - Legal source points now show gold `点取` chips and dice-step labels.
  - Legal target points now show green `落马` chips and dice-step labels.
  - Source/target triangular lanes and beacons now provide stronger visual affordance than the piece artwork alone.
  - Board points now expose accessibility labels with point number, owner/count, and legal action state.
- Reworked the generated 2D atmosphere treatment into side character decoration:
  - Added `public/assets/decor/song-left-observers.png`.
  - Added `public/assets/decor/song-right-observer.png`.
  - Removed the full-page generated image from the active 2D/menu shell backgrounds.
  - Kept the center playfield on dark lacquer/study gradients for board readability.
  - Reduced side-decoration opacity on smaller screens.
- Improved 2D horse readability after user feedback:
  - Removed staggered visual stacking from board points.
  - Replaced `piece-stack` with a smaller `piece-rack` grid layout.
  - Each point now displays up to six individual horses in a clear 3-column arrangement.
  - Extra horses still show with a compact `xN` count marker.
  - CSS fallback horse pieces are smaller and less visually dominant.

## Verified Commands

Last verified locally on 2026-05-03 17:11 CST:

```bash
npm run build
```

Result:

```txt
Next.js production build passed.
API routes /api/rooms and /api/rooms/[roomId] compiled as dynamic server routes.
```

Last verified locally on 2026-05-05 12:53 CST:

```bash
npm test
npx tsc --noEmit
```

Result:

```txt
8 test files passed, 27 tests passed.
TypeScript no-emit check passed.
```









Last verified locally on 2026-05-12 12:38 CST without starting a local service:

```bash
npm run build
npm test
```

Result:

```txt
Next.js production build passed.
8 test files passed, 27 tests passed.
```

Last verified on Aliyun GD on 2026-05-12 12:49 CST:

```bash
curl -I --max-time 20 http://47.121.182.144/
curl -I --max-time 20 http://47.121.182.144/assets/backgrounds/song-study-court-bg.png
curl -s --max-time 20 -X POST http://47.121.182.144/api/rooms \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"codex-bg-visible-test"}'
```

Result:

```txt
Public root path returned HTTP 200.
Generated background image returned HTTP 200.
POST /api/rooms created room BE4ABC.
PM2 process shuanglu is online after restart.
Cloud build artifacts contain menu-shell-bg and the generated background reference.
```

Last verified locally on 2026-05-13 01:14 CST without starting a local service:

```bash
npm run build
npm test
```

Result:

```txt
Next.js production build passed.
8 test files passed, 27 tests passed.
```

Last verified locally on 2026-06-11 21:10 CST from `/Users/lizhe/Projects/shuanglu`:

```bash
npm install
npm test
npx tsc --noEmit
```

Result:

```txt
Dependencies installed.
10 test files passed, 38 tests passed.
TypeScript no-emit check passed.
```

Last verified on 2026-05-30 00:45 CST:

```bash
curl -I --max-time 20 http://47.121.182.144/
```

Result:

```txt
Public root path returned HTTP 200.
GitHub documentation sync prepared from local working tree.
```

Last verified locally on 2026-05-22 01:30 CST without starting a local service:

```bash
npx tsc --noEmit
npm test
```

Result:

```txt
TypeScript no-emit check passed.
10 test files passed, 38 tests passed.
```

Last verified locally on 2026-05-21 23:14 CST without starting a local service:

```bash
npm test
```

Result:

```txt
9 test files passed, 35 tests passed.
Local npm run build was stopped after hanging at Next.js production build startup; cloud deployment must run server-side production build before release swap.
```

Last verified locally on 2026-05-18 10:31 CST without starting a local service:

```bash
npm test
npm run build
```

Result:

```txt
9 test files passed, 33 tests passed.
Next.js production build passed.
```

Last verified locally on 2026-05-17 22:29 CST without starting a local service:

```bash
npm test
npm run build
```

Result:

```txt
8 test files passed, 31 tests passed.
Next.js production build passed.
```

Last verified locally on 2026-05-16 11:15 CST without starting a local service:

```bash
npm run build
npm test
```

Result:

```txt
Next.js production build passed.
8 test files passed, 27 tests passed.
```

Last verified on Aliyun GD on 2026-05-22 01:57 CST:

```bash
curl -I --max-time 20 http://47.121.182.144/
curl -s --max-time 20 -X POST http://47.121.182.144/api/rooms \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"codex-auto-pass-test"}'
ssh root@47.121.182.144 'grep -R "没有可复马入口" -n /opt/shuanglu/.next/static /opt/shuanglu/.next/server | head'
ssh root@47.121.182.144 'grep -R "剩余步数" -n /opt/shuanglu/.next/static /opt/shuanglu/.next/server | head'
```

Result:

```txt
Public root path returned HTTP 200.
POST /api/rooms created room DDBF99.
PM2 process shuanglu is online after restart.
Cloud static/server artifacts contain automatic pass notice text for blocked bar re-entry and unusable remaining dice.
```

Last verified on Aliyun GD on 2026-05-21 23:35 CST:

```bash
curl -I --max-time 20 http://47.121.182.144/
curl -s --max-time 20 -X POST http://47.121.182.144/api/rooms \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"codex-ai-pressure-test"}'
ssh root@47.121.182.144 'grep -R "entryBlock" -n /opt/shuanglu/.next/static | head'
ssh root@47.121.182.144 'grep -R "longestPrime" -n /opt/shuanglu/.next/static | head'
```

Result:

```txt
Public root path returned HTTP 200.
POST /api/rooms created room A23741.
PM2 process shuanglu is online after restart.
Cloud static JavaScript contains the expert AI pressure markers `entryBlock` and `longestPrime`.
```

Last verified on Aliyun GD on 2026-05-18 10:10 CST:

```bash
curl -I --max-time 20 http://47.121.182.144/
curl -s --max-time 20 -X POST http://47.121.182.144/api/rooms \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"codex-black-trace-test"}'
ssh root@47.121.182.144 'grep -R "黑方刚走" -n /opt/shuanglu/.next/static | head'
ssh root@47.121.182.144 'grep -R "ai-trail-chip" -n /opt/shuanglu/.next/static | head'
```

Result:

```txt
Public root path returned HTTP 200.
POST /api/rooms created room 5180FC.
PM2 process shuanglu is online after restart.
Cloud static build artifacts contain the black-move list and board trace markers.
```

Last verified on Aliyun GD on 2026-05-17 22:40 CST:

```bash
curl -I --max-time 20 http://47.121.182.144/
curl -s --max-time 20 -X POST http://47.121.182.144/api/rooms \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"codex-expert-ai-test"}'
ssh root@47.121.182.144 'grep -R "enterFromBar" -n /opt/shuanglu/.next/static | head'
ssh root@47.121.182.144 'grep -R '"'"'aiProfile:"expert"'"'"' -n /opt/shuanglu/.next/static | head'
```

Result:

```txt
Public root path returned HTTP 200.
POST /api/rooms created room 67DF0C.
PM2 process shuanglu is online after restart.
Cloud static JavaScript contains the expert AI scoring and profile markers.
```

Last verified on Aliyun GD on 2026-05-16 11:36 CST:

```bash
curl -I --max-time 20 http://47.121.182.144/
curl -s --max-time 20 -X POST http://47.121.182.144/api/rooms \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"codex-piece-rack-test"}'
ssh root@47.121.182.144 'grep -R "piece-rack" -n /opt/shuanglu/.next/static | head'
```

Result:

```txt
Public root path returned HTTP 200.
POST /api/rooms created room 6E9FAF.
PM2 process shuanglu is online after restart.
Cloud static CSS contains `piece-rack`.
```

Last verified on Aliyun GD on 2026-05-13 01:25 CST:

```bash
curl -I --max-time 20 http://47.121.182.144/
curl -I --max-time 20 http://47.121.182.144/assets/decor/song-left-observers.png
curl -I --max-time 20 http://47.121.182.144/assets/decor/song-right-observer.png
curl -s --max-time 20 -X POST http://47.121.182.144/api/rooms \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"codex-side-decor-test"}'
```

Result:

```txt
Public root path returned HTTP 200.
Left side character decoration returned HTTP 200.
Right side character decoration returned HTTP 200.
POST /api/rooms created room 0A1EC4.
PM2 process shuanglu is online after restart.
```

Last verified on Aliyun GD on 2026-05-12 01:25 CST:

```bash
curl -I --max-time 20 http://47.121.182.144/
curl -I --max-time 20 http://47.121.182.144/assets/backgrounds/song-study-court-bg.png
curl -I --max-time 20 http://47.121.182.144/3d
curl -s --max-time 20 -X POST http://47.121.182.144/api/rooms \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"codex-2d-bg-art-test"}'
```

Result:

```txt
Public root path returned HTTP 200.
Generated background image returned HTTP 200.
Public /3d path returned HTTP 200.
POST /api/rooms created room B3568C.
PM2 process shuanglu is online after restart.
Cloud build artifacts contain song-study-court-bg and game-shell-bg.
```

Last verified locally on 2026-05-11 21:10 CST without starting a local service:

```bash
npm run build
npm test
```

Result:

```txt
Next.js production build passed.
8 test files passed, 27 tests passed.
```

Last verified on Aliyun GD on 2026-05-09 21:17 CST:

```bash
curl -I --max-time 20 http://47.121.182.144/
curl -I --max-time 20 http://47.121.182.144/3d
curl -s --max-time 20 -X POST http://47.121.182.144/api/rooms \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"codex-one-window-layout-test"}'
```

Result:

```txt
Public root path returned HTTP 200.
Public /3d path returned HTTP 200.
POST /api/rooms created room C5E553.
PM2 process shuanglu is online after restart.
Cloud build artifacts contain the one-window 2D layout classes.
```

Last verified locally on 2026-05-09 19:29 CST without starting a local service:

```bash
npm run build
npm test
```

Result:

```txt
Next.js production build passed.
8 test files passed, 27 tests passed.
```

Last verified on Aliyun GD on 2026-05-08 23:26 CST:

```bash
curl -I --max-time 20 http://47.121.182.144/
curl -I --max-time 20 http://47.121.182.144/3d
curl -s --max-time 20 -X POST http://47.121.182.144/api/rooms \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"codex-2d-usability-test"}'
```

Result:

```txt
Public root path returned HTTP 200.
Public /3d path returned HTTP 200.
POST /api/rooms created room D8F1F1.
PM2 process shuanglu is online after restart.
Cloud build artifacts contain 点取, 落马, and board-action-guide.
```

Last verified locally on 2026-05-08 22:06 CST without starting a local service:

```bash
npm run build
npm test
```

Result:

```txt
Next.js production build passed.
8 test files passed, 27 tests passed.
```

Last verified on Aliyun GD on 2026-05-07 07:48 CST:

```bash
curl -I --max-time 20 http://47.121.182.144/
curl -I --max-time 20 http://47.121.182.144/3d
curl -s --max-time 20 -X POST http://47.121.182.144/api/rooms \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"codex-cloud-only-test"}'
```

Result:

```txt
Public root path returned HTTP 200.
Public /3d path returned HTTP 200.
POST /api/rooms created room 3B24A7.
PM2 process shuanglu is online with cwd /opt/shuanglu.
Local service ports 3000, 3001, 3002, and 3004 have no listeners.
```

Last verified on Aliyun GD on 2026-05-05 23:31 CST:

```bash
curl -I --max-time 20 http://47.121.182.144/
curl -I --max-time 20 http://47.121.182.144/3d
curl -s --max-time 20 -X POST http://47.121.182.144/api/rooms \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"codex-deploy-test"}'
```

Result:

```txt
Public root path returned HTTP 200.
Public /3d path returned HTTP 200.
POST /api/rooms created room 89E372.
PM2 process shuanglu is online with cwd /opt/shuanglu.
```

```bash
npm test
```

Result:

```txt
8 test files passed, 27 tests passed.
```

Last verified on 2026-04-29 20:20 CST:

```bash
npm test
```

Result:

```txt
8 test files passed
27 tests passed
```

```bash
npm run build
```

Result:

```txt
Next.js production build passed
```

```bash
npm run dev
```

Result:

```txt
Local: http://localhost:3000
```

Last deployed on 2026-04-30 22:10 CST:

```bash
npm ci
npm run build
pm2 start npm --name shuanglu -- start -- --hostname 127.0.0.1 --port 3002
nginx -t
systemctl reload nginx
```

Result:

```txt
Server build passed.
PM2 process shuanglu is online.
Nginx configuration test passed.
Public URL http://47.121.182.144/ returns <title>双陆 Shuanglu.
```

Latest server recovery and deployment verification on 2026-05-01 18:36 CST:

```bash
npm ci --no-audit --no-fund
npm run build
pm2 restart shuanglu --update-env
pm2 save
curl -I --max-time 20 http://47.121.182.144/
```

Result:

```txt
Server build passed.
PM2 process shuanglu is online.
Next.js listens on 127.0.0.1:3002.
Public URL http://47.121.182.144/ returns HTTP 200.
Public JavaScript bundle contains 点这里复马.
```

Latest Aliyun visual deployment on 2026-05-03 10:54 CST:

```bash
npm ci --no-audit --no-fund
npm run build
pm2 restart shuanglu --update-env
pm2 save
nginx -t
systemctl reload nginx
curl -I --max-time 20 http://47.121.182.144/
```

Result:

```txt
Server build passed.
PM2 process shuanglu is online.
Nginx configuration test passed.
Public URL http://47.121.182.144/ returns HTTP 200.
Public JavaScript bundle contains board-scene, board-shell, board-perspective, and white-horse-idle.
```

Latest Aliyun online room deployment on 2026-05-03 17:55 CST:

```bash
npm ci --no-audit --no-fund
npm run build
pm2 restart shuanglu --update-env
pm2 save
nginx -t
systemctl reload nginx
curl -I --max-time 20 http://47.121.182.144/
curl -s --max-time 20 -X POST http://47.121.182.144/api/rooms
```

Result:

```txt
Server build passed.
PM2 process shuanglu is online.
Nginx configuration test passed.
Public URL http://47.121.182.144/ returns HTTP 200.
Online room API can create a room, join a second player, read room state, roll, and apply a legal move.
```

Latest local 3D interface verification on 2026-05-04 16:00 CST:

```bash
npm run build
npm test
```

Result:

```txt
Next.js production build passed.
8 test files passed, 27 tests passed.
```

Dev server smoke check:

```txt
npm run dev started on http://localhost:3000.
The game route compiled and served without dev server runtime errors.
The local dev server was stopped after the check.
```

Latest 3D stabilization verification on 2026-05-04 16:19 CST:

```bash
npm run build
npm test
```

Result:

```txt
Next.js production build passed.
8 test files passed, 27 tests passed.
```

Latest 3D isolation and share-link verification on 2026-05-04 17:09 CST:

```bash
npm run build
npm test
```

Result:

```txt
Next.js production build passed.
Routes include / and /3d.
8 test files passed, 27 tests passed.
```

Latest Aliyun 3D isolation deployment on 2026-05-04 18:27 CST:

```bash
npm ci --no-audit --no-fund
npm run build
pm2 restart shuanglu --update-env
pm2 save
nginx -t
systemctl reload nginx
curl -I --max-time 20 http://47.121.182.144/
curl -I --max-time 20 http://47.121.182.144/3d
curl -s --max-time 20 -X POST http://47.121.182.144/api/rooms
curl -I --max-time 20 'http://47.121.182.144/?room=77E484'
```

Result:

```txt
Server build passed.
PM2 process shuanglu is online.
Nginx configuration test passed.
Public root path returns HTTP 200.
Public /3d path returns HTTP 200.
Online room API can create a room.
Public share URL with ?room=77E484 returns HTTP 200.
```

Latest 3D art-direction greybox verification on 2026-05-04 21:50 CST:

```bash
npm run build
npm test
```

Result:

```txt
Next.js production build passed.
Routes include / and /3d.
8 test files passed, 27 tests passed.
```

Last verified locally on 2026-05-01 16:08 CST:

```bash
npm test
npm run build
```

Result:

```txt
8 test files passed, 27 tests passed.
Next.js production build passed.
```

## Runtime Policy

The current MiniMac operating policy is cloud-only runtime testing. Do not start the Shuanglu web service locally unless the user explicitly asks for it.

Current public test targets:

```txt
https://shuanglu.uway.click/
https://shuanglu.uway.click/3d
```

## Known Risks

- Production uses Node.js 20. Local development must use the version pinned in `.nvmrc` to avoid Node 24/production drift.
- The production certificate must be monitored through the certbot timer and deploy hook; a valid certificate alone is not proof that renewal is working.
- Deployments use Git archives from a clean `main` revision that matches `origin/main`; each release must include a `REVISION` file.
- Online rooms are currently in-memory only. A PM2 restart will clear active rooms.
- Online room access is intentionally lightweight for testing and does not yet include accounts, passwords, or private invites.
- Online clients use polling rather than WebSocket. This is acceptable for the first turn-based friend-play test but should be reviewed after playtesting.
- The 3D scene is a first procedural interface pass. It has not yet had full screenshot QA across desktop and mobile.
- The 3D scene uses procedural placeholder pieces, dice, table, room, and spectators. Final art assets are still needed.
- Current 3D animation is intentionally disabled after the first animation-heavy pass caused crashes. Animation must be reintroduced incrementally.
- The `/3d` scene is intentionally isolated from the stable online room flow until it passes browser QA.
- The current `/3d` scene is not the approved art target. It should not receive further polish until an effect image is selected and a new greybox plan is derived from that image.
- Full court or full-room character scenes are a later expansion risk; the first 3D target should prioritize tabletop readability, bottle-shaped horses, dice, board points, bar, and borne-off area.
- The first effect-image family is now approved, and the new `/3d` greybox has started from that target. It still needs reliable browser screenshot QA before cloud deployment; the first browser check found an empty-looking WebGL region and triggered a simplification pass.
- Aliyun still runs Node 18.19.1. The new 3D dependency stack builds, but `camera-controls` warns that it prefers Node >=20.11.0.
- Interrupted dependency installs can leave `node_modules` in a broken state. If that happens, move the broken directory outside `/opt/shuanglu` before running a clean `npm ci --no-audit --no-fund`.
- Quick Mode is documented but not implemented. `createInitialState` intentionally rejects non-15-horse layouts until quick layouts exist.
- In-game text has only had an initial audit through the rules modal; character and future story text still need review against `docs/HISTORICAL_NOTES.md`.
- `npm install` reported 7 moderate severity vulnerabilities. Do not run `npm audit fix --force` without reviewing the dependency changes.
- UI has had browser screenshot QA for the revised victory tracker, triangular board, gameplay feedback layer, and dice/board animation pass, but not for the latest 3D-like board shell pass or a full mobile pass.
- The first-turn guidance is clearer, but a fresh user still needs a full five-minute comprehension test.
- Human vs AI now uses full-turn deterministic heuristics with more aggressive expert pressure, but still needs full-match human playtesting and weight tuning before it can be called strong.
- Automatic turn passes now explain why the current player could not move, including blocked bar re-entry and unusable remaining dice steps.
- Full-match manual testing is still required. Automated tests cover core rules but not a complete end-to-end game.
- The board UI is no longer a pure debug grid and now includes basic gameplay motion and a first 3D-like lacquer-table pass, but still needs final art direction, real piece assets, audio, and mobile polish before launch.
- Generated dice PNGs exist in the source asset drop but were deliberately not mounted because their style and generation plan still need review.
- Real final horse-piece PNGs are still not present in `public/assets/pieces/`; the visible pieces are CSS fallback pieces.
- The generated parchment assets now load on cloud, but side-panel typography and portrait composition still need a focused polish pass against the reference layout.

## Next Engineering Priorities

1. Verify the Linode certificate renewal dry-run and timer.
2. Exercise one release and rollback through the tracked deployment script.
3. Test one complete online match with two browsers or two devices.
4. Improve refresh/reconnect UX and browser-test `/?room=<ROOM_ID>` with two clients.
5. Run desktop screenshot QA for the `/3d` greybox.
6. Tune camera, board scale, and point spacing against the approved concept images.
7. Prepare authored GLB assets for the bottle-shaped white/black horses.
8. Consider a controlled Node 20 LTS upgrade on Aliyun for the 3D dependency stack.
9. Add 3D horse move-path animation and clearer stack layout only after the static tabletop passes QA.
10. Manual playtest a complete Human vs Human online match.
11. Manual playtest a complete Human vs AI match against the expert profile.
12. Tune AI weights from full-match playtest notes, especially blot risk versus tempo.
13. Add explicit reason feedback when clicking non-highlighted or blocked points.
14. Run mobile viewport QA for the online menu, compact HUD, and 3D scene fallback behavior.
15. Add regression tests for full-turn edge sequences that use all four doubles steps.
16. Decide the final dice PNG generation direction and mount dice assets only after approval.
17. Produce final white/black horse-piece PNGs for `public/assets/pieces/` or keep refining the CSS fallback intentionally.
18. Polish the 2D side-panel typography, portrait scale, and lower content spacing against the approved reference layout.
