# Development Log

This file is the chronological engineering log for the Shuanglu web prototype.

Rules for maintaining this log:

- Add an entry for every meaningful implementation session.
- Record what changed, why it changed, and how it was verified.
- Record unresolved risks explicitly.
- Keep timestamps concrete.
- Do not rely on chat history as the only source of project memory.

## 2026-04-26 20:42 CST

### Objective

Initialize the project and create the first playable `0.5` baseline for a one-week launch push.

### Inputs Read

- `docs/AGENTS.md`
- `docs/GAME_DESIGN.md`
- `docs/MVP_SCOPE.md`
- `docs/RULES_SPEC.md`
- `docs/TECH_SPEC.md`
- `docs/TEST_CASES.md`

### File Organization

Moved the original core documents into `docs/` and corrected the mistaken `*.md.md` naming to `*.md`.

Current canonical document paths:

- `docs/AGENTS.md`
- `docs/GAME_DESIGN.md`
- `docs/MVP_SCOPE.md`
- `docs/RULES_SPEC.md`
- `docs/TECH_SPEC.md`
- `docs/TEST_CASES.md`

Confirmed there are no remaining `*.md.md` files or references.

### Implementation Completed

Created project scaffold:

- `package.json`
- `package-lock.json`
- `next.config.ts`
- `tsconfig.json`
- `tailwind.config.ts`
- `postcss.config.mjs`
- `vitest.config.ts`
- `src/app`
- `src/components`
- `src/data`
- `src/game`
- `src/store`
- `tests`

Implemented pure TypeScript rules engine:

- `src/game/types.ts`
- `src/game/constants.ts`
- `src/game/initialState.ts`
- `src/game/dice.ts`
- `src/game/movement.ts`
- `src/game/legalMoves.ts`
- `src/game/validateMove.ts`
- `src/game/applyMove.ts`
- `src/game/turn.ts`
- `src/game/winDetector.ts`
- `src/game/ai.ts`
- `src/game/index.ts`

Rules covered in the first engine pass:

- Initial 24-point board.
- 15 horses per player.
- Dice conversion, including doubles as four steps.
- White and black movement direction.
- Entering empty points.
- Stacking friendly horses.
- Blocking by two or more opponent horses.
- Hitting one exposed opponent horse.
- Bar re-entry priority.
- White and black bar entry mapping.
- Home-board detection.
- Exact bearing off.
- Oversized bearing off.
- Dice step consumption.
- Turn ending.
- Win detection.

Implemented first UI pass:

- Main menu.
- Human vs Human start.
- Human vs AI start.
- Rule/help modal.
- Game screen.
- Board point rendering.
- Source selection and legal target highlighting.
- Dice panel.
- Move hint panel.
- Character panels.
- Song Huizong themed opponent.

Implemented first automated tests:

- `tests/initialState.test.ts`
- `tests/dice.test.ts`
- `tests/movement.test.ts`
- `tests/legalMoves.test.ts`
- `tests/applyMove.test.ts`
- `tests/bearingOff.test.ts`
- `tests/winDetector.test.ts`
- `tests/helpers.ts`

### Verification

Ran:

```bash
npm test
```

Result:

```txt
7 test files passed
20 tests passed
```

Ran:

```bash
npm run build
```

Result:

```txt
Next.js production build passed
```

Started local dev server with approval because sandboxed port binding failed:

```bash
npm run dev
```

Result:

```txt
Local: http://localhost:3000
```

Confirmed page returns HTML with:

```bash
curl -s http://127.0.0.1:3000/
```

### Issues Encountered

Initial `npm install` in sandbox failed with:

```txt
connect EPERM 127.0.0.1:7897
```

Resolution:

- Re-ran `npm install` with escalated permissions.
- Dependencies installed successfully.

Initial Vitest run failed to resolve `@/game`.

Cause:

- `vitest.config.ts` used URL pathname alias resolution, which was fragile with the current iCloud path containing spaces and encoded characters.

Resolution:

- Switched alias resolution to `fileURLToPath(new URL("./src", import.meta.url))`.

Initial `npm run dev` failed in sandbox with:

```txt
listen EPERM 0.0.0.0:3000
```

Resolution:

- Re-ran `npm run dev` with escalated permissions.

### Open Risks

- Full game completion has not yet been manually playtested.
- AI can choose legal moves but has not been tuned.
- UI layout needs mobile QA.
- npm reported 7 moderate severity vulnerabilities after installation.
- No deployment target has been selected yet.

### Next Step

Run a structured browser playtest and record findings before adding new features.

## 2026-04-26 20:47 CST

### Objective

Update the rule and MVP scope documents to reflect explicit rule-layering decisions. Do not implement code.

### Documents Changed

- `docs/RULES_SPEC.md`
- `docs/MVP_SCOPE.md`
- `docs/PROJECT_STATUS.md`
- `docs/DECISIONS.md`

### Changes Made

Added `RuleConfig` to the rules specification:

```ts
type RuleMode = 'classical' | 'reconstruction' | 'quick';

type RuleConfig = {
  mode: RuleMode;
  useDoublesAsFourSteps: boolean;
  enableCrushingWin: boolean;
  horsesPerPlayer: 15 | 12 | 9;
  enableCharacterSkills: boolean;
};
```

Documented MVP default as Reconstruction Mode:

```ts
const DEFAULT_RULE_CONFIG: RuleConfig = {
  mode: 'reconstruction',
  useDoublesAsFourSteps: true,
  enableCrushingWin: false,
  horsesPerPlayer: 15,
  enableCharacterSkills: false,
};
```

Clarified that Classical Mode:

- Uses two dice steps even when doubles are rolled.
- Uses 15 horses.
- Disables character skills.
- Disables crushing win.

Clarified that MVP victory types are only:

- `single_win`
- `double_win`

Removed `crushing_win` from MVP scope and documented it only as a future variant controlled by `enableCrushingWin`.

Labeled oversized bearing off as a playable reconstruction mechanic.

Clarified the documentation distinction between:

- historically attested elements
- playable reconstruction mechanics
- future game variants

### Verification

No code was changed. No tests were run for this documentation-only update.

## 2026-04-26 21:13 CST

### Objective

Create a dedicated historical-claim boundary document. Do not implement code.

### Documents Changed

- `docs/HISTORICAL_NOTES.md`
- `docs/PROJECT_STATUS.md`
- `docs/DEV_LOG.md`

### Changes Made

Created `docs/HISTORICAL_NOTES.md` with five required sections:

1. Historically Supported Elements
2. Historically Suggested but Under-Specified Elements
3. Playable Reconstruction Mechanics
4. Game Adaptation / Story Mode Mechanics
5. Claims We Must Not Make

The new document clearly labels rule material as:

- `supported`
- `suggested`
- `reconstructed`
- `game adaptation`
- `must not claim`

It records the following project constraints:

- The MVP uses 15 horses per side.
- The MVP uses 24 abstract board points.
- `doubles as four steps` belongs to Reconstruction Mode, not Classical Mode.
- Oversized bearing-off is a playable reconstruction mechanic.
- Character skills are future Story Mode adaptations and not MVP rules.
- Crushing win is not part of MVP.
- The project must not claim to be a perfect Tang-Song rule restoration.
- The project must not claim all board terms and layouts are universally fixed across all historical periods.

Each major rule item includes a `Recommended In-Game Wording` subsection and an `Avoid` example.

### Verification

No code was changed. No tests were run for this documentation-only update.

### Open Follow-Up

Future UI copy, help text, character dialogue, marketing text, and AI-generated commentary should be checked against `docs/HISTORICAL_NOTES.md`.

## 2026-04-26 21:19 CST

### Objective

Record future data derivatives from `docs/HISTORICAL_NOTES.md`. Do not implement code.

### Documents Changed

- `docs/HISTORICAL_NOTES.md`
- `docs/PROJECT_STATUS.md`
- `docs/DEV_LOG.md`

### Changes Made

Added `Future Data Derivatives` to `docs/HISTORICAL_NOTES.md`.

Documented future `src/data/lore.ts` contract:

```ts
type LoreEntry = {
  id: string;
  title: string;
  category: 'rules' | 'history' | 'equipment' | 'adaptation';
  confidence: 'supported' | 'suggested' | 'reconstructed' | 'adaptation';
  body: string;
};
```

Documented future `src/data/ruleNotes.ts` purpose and starter notes:

- Classical Mode: conservative rules.
- Reconstruction Mode: modern playability completion.
- Story Mode: character skills and narrative adaptations, not Classical rules.

Added a process guardrail: future lore and rule-note entries should be traceable back to `docs/HISTORICAL_NOTES.md`.

### Verification

No code was changed. No tests were run for this documentation-only update.

## 2026-04-26 23:17 CST

### Objective

Continue 0.5 implementation by aligning code with the documented rule-layering model, deriving lore/rule-note data, and improving the end-of-match loop.

### Files Changed

- `src/game/types.ts`
- `src/game/constants.ts`
- `src/game/initialState.ts`
- `src/game/dice.ts`
- `src/game/winDetector.ts`
- `src/game/ai.ts`
- `src/store/gameStore.ts`
- `src/data/lore.ts`
- `src/data/ruleNotes.ts`
- `src/components/RulesPanel.tsx`
- `src/components/GameScreen.tsx`
- `tests/helpers.ts`
- `tests/dice.test.ts`
- `tests/initialState.test.ts`
- `tests/winDetector.test.ts`
- `tests/ai.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/DEV_LOG.md`

### Implementation Completed

Implemented `RuleConfig` in the rules engine:

- Added `RuleMode`.
- Added `RuleConfig`.
- Added `DEFAULT_RULE_CONFIG`.
- Added `CLASSICAL_RULE_CONFIG`.
- Added `ruleConfig` to `BoardState`.
- Updated `createInitialState(config?)`.
- Updated `cloneState`.
- Updated `diceToSteps(roll, config?)`.
- Updated game store dice expansion to use `state.ruleConfig`.

Added MVP victory classification:

- `VictoryType = 'single_win' | 'double_win'`.
- `getVictoryType(state)`.
- `crushing_win` remains unimplemented for MVP.

Added future historical data derivatives:

- `src/data/lore.ts`
- `src/data/ruleNotes.ts`

Updated `RulesPanel` to render rule-mode notes and lore entries from data files rather than hardcoding all historical/reconstruction copy directly in the component.

Improved end-of-match UI:

- Added victory summary panel.
- Added `single_win` / `double_win` display text.
- Added "再开一局" restart button.

Fixed AI scoring:

- Bear-off moves no longer produce `NaN` advancement scores.
- Added a regression test for AI choosing a bear-off move.

### Verification

Ran:

```bash
npm test
```

Result:

```txt
8 test files passed
27 tests passed
```

Ran:

```bash
npm run build
```

Result:

```txt
Next.js production build passed
```

Browser smoke test:

- Opened `http://127.0.0.1:3000`.
- Confirmed main menu renders.
- Confirmed menu Rules button opens 博戏志 modal without starting a game.
- Confirmed rule-mode notes render from `src/data/ruleNotes.ts`.
- Confirmed lore entries render from `src/data/lore.ts`.
- Confirmed Human vs AI game screen renders.
- Confirmed dice roll updates remaining dice steps.
- Confirmed legal target highlighting appears after selecting a movable horse.

### Issues Encountered

Browser initially showed a stale Next.js runtime overlay:

```txt
__webpack_modules__[moduleId] is not a function
```

Resolution:

- Stopped the stale Next dev server process.
- Restarted `npm run dev`.
- Reloaded the in-app browser at `http://127.0.0.1:3000`.
- The page then rendered correctly.

### Open Follow-Up

- Full-match manual testing is still required.
- Quick Mode remains intentionally unimplemented.
- Character/story text still needs future audit against `docs/HISTORICAL_NOTES.md`.
- Mobile screenshot QA has not yet been completed.

## 2026-04-26 23:19 CST

### Objective

Reduce mobile board layout risk and verify the restarted development server in browser.

### Files Changed

- `src/components/Board.tsx`
- `docs/PROJECT_STATUS.md`
- `docs/DEV_LOG.md`

### Implementation Completed

Updated `Board` layout:

- Wrapped the board in `overflow-x-auto`.
- Added a fixed minimum internal board width.
- Kept the 12-column point structure stable instead of letting mobile viewports crush point buttons and horses.

### Verification

Ran:

```bash
npm test
```

Result:

```txt
8 test files passed
27 tests passed
```

Ran:

```bash
npm run build
```

Result:

```txt
Next.js production build passed
```

Browser smoke test after restarting dev server:

- Opened `http://127.0.0.1:3000`.
- Confirmed main menu is visible.
- Confirmed no runtime overlay is visible.
- Clicked Human vs Human.
- Confirmed game screen and board render.
- Confirmed no runtime overlay is visible after navigation.

### Issue Noted

Running `npm run build` while `next dev` is active can leave the dev server with a stale `.next` module graph and show:

```txt
__webpack_modules__[moduleId] is not a function
```

Resolution:

- Stop the old dev server process.
- Restart `npm run dev`.
- Reload the browser.

### Open Follow-Up

- Full screenshot QA across desktop and mobile is still needed.
- Full-match manual testing is still needed.

## 2026-04-26 23:28 CST

### Objective

Improve first-screen playability after visual QA showed the dice controls were below the board.

### Files Changed

- `src/components/GameScreen.tsx`
- `src/components/CharacterPanel.tsx`
- `docs/PROJECT_STATUS.md`
- `docs/DEV_LOG.md`

### Implementation Completed

Adjusted game screen layout:

- Moved the dice panel above the board.
- Kept the move hint above the dice panel.
- Reordered non-wide layouts so the board appears before character panels.
- Reduced non-wide character portrait height to prevent the portrait panel from pushing the board off-screen.

### Verification

Ran:

```bash
npm test
```

Result:

```txt
8 test files passed
27 tests passed
```

Ran:

```bash
npm run build
```

Result:

```txt
Next.js production build passed
```

Browser screenshot QA:

- Opened `http://127.0.0.1:3000`.
- Clicked Human vs Human.
- Confirmed no runtime overlay is visible.
- Confirmed dice panel appears before the board.
- Confirmed the board is visible in the first viewport.

### Open Follow-Up

- Mobile viewport screenshot QA still needs a separate pass.
- Full-match manual testing is still required.

## 2026-04-27 00:25 CST

### Objective

Address the playtest finding that the game was mechanically playable but not understandable to a new player.

The core problem was not the rules engine. The visible UI did not explain:

- What the player is trying to accomplish.
- Which direction each side moves.
- Which horses are legal to select.
- Why some points can or cannot be entered.
- What the next click should be after rolling or selecting a horse.

### Files Changed

- `src/components/TurnCoach.tsx`
- `src/components/GameScreen.tsx`
- `src/components/Board.tsx`
- `src/components/BoardPoint.tsx`
- `src/components/DicePanel.tsx`
- `src/components/MainMenu.tsx`
- `src/components/MoveHint.tsx`
- `src/store/gameStore.ts`
- `docs/PROJECT_STATUS.md`
- `docs/DEV_LOG.md`

### Implementation Completed

Added a compact in-game turn coach:

- States the objective: first side to bear off all 15 horses wins.
- Shows the current action in player language.
- Explains movement direction: white moves from 23 to 0, black moves from 0 to 23.
- Explains hitting and blocking.
- Explains the click sequence: select a highlighted horse, then select a green landing point.
- Shows the number of currently legal actions.
- Shows up to three concrete legal move examples after rolling or selecting a source.

Improved board readability:

- Board sources now highlight only source points that have at least one legal move.
- Legal source points show `选马`.
- Legal landing points show `可行`.
- Selected source points get a stronger border.
- The bearing-off button gets an explicit green enabled style only when bearing off is legal.
- The board header now uses player-action language instead of terse route labels.

Improved first-screen wording:

- Main menu now explains that the goal is to send all 15 horses off the board.
- Dice panel now explains that dice faces become the turn's available steps.
- Move hint now labels the current instruction explicitly.
- Store messages now tell the player to click highlighted horses and green landing points.

### Verification

Ran:

```bash
npm test
```

Result:

```txt
8 test files passed
27 tests passed
```

Ran:

```bash
npm run build
```

Result:

```txt
Next.js production build passed
```

Browser smoke test:

- Restarted the stale local dev server after `npm run build`.
- Opened `http://127.0.0.1:3000`.
- Confirmed the main menu renders and includes the revised objective wording.
- Started a Human vs Human match.
- Confirmed the game screen shows the turn coach.
- Confirmed the coach states the 15-horse objective, movement direction, hitting rule, and click sequence.
- Rolled dice.
- Confirmed legal source points show `选马`.
- Selected a legal source.
- Confirmed the coach says to select a green landing point and the board shows `可行` targets.

### Issues Encountered

Initial production build failed because JSX text used raw `>` characters in `TurnCoach`.

Resolution:

- Escaped the arrows as `-&gt;`.
- Re-ran tests and build successfully.

The existing dev server on port 3000 stopped responding after the production build.

Resolution:

- Stopped the stale Node process.
- Restarted `npm run dev`.
- Completed browser smoke testing against the restarted server.

### Open Follow-Up

- Run a fresh-player five-minute comprehension test.
- Add feedback for clicks on non-highlighted or blocked points.
- Run mobile viewport screenshot QA.
- Full-match manual testing is still required.

## 2026-04-27 13:45 CST

### Objective

Address the stronger product-quality finding that the UI still felt crude and that the win condition was not sufficiently legible during play.

The problem was split into two issues:

- Victory state was explained in text but not represented as persistent game progress.
- The board still looked like a grid of debug buttons instead of a game surface.

### Files Changed

- `src/components/VictoryTracker.tsx`
- `src/components/GameScreen.tsx`
- `src/components/Board.tsx`
- `src/components/BoardPoint.tsx`
- `src/components/TurnCoach.tsx`
- `src/components/DicePanel.tsx`
- `src/components/CharacterPanel.tsx`
- `docs/PROJECT_STATUS.md`
- `docs/DEV_LOG.md`

### Implementation Completed

Added persistent victory progress:

- New `VictoryTracker` component.
- Shows `0/15` borne-off progress for both sides.
- Shows how many horses each side still needs to bear off to win.
- Marks the current player.
- States the MVP double-win condition.
- Explicitly states that MVP does not include crushing win.

Improved board presentation:

- Replaced rectangular point cards with triangular point visuals.
- Added alternating point tones to make the board read more like a traditional race board.
- Kept stacked horse pieces visible on each point.
- Changed legal source labels from verbose `选马` to compact `选`.
- Changed legal target labels from `可行` to compact `可落`.
- Strengthened selected-source and legal-target styling.
- Reworked the center strip for bar and borne-off areas with clearer purpose text.

Reduced first-viewport clutter:

- Victory progress and dice panel now sit side by side on desktop.
- Turn coach was compressed into a lower-height action bar.
- Dice panel was compacted.
- Character panels were simplified so they no longer dominate the layout with large placeholder portraits.

### Verification

Ran:

```bash
npm test
```

Result:

```txt
8 test files passed
27 tests passed
```

Ran:

```bash
npm run build
```

Result:

```txt
Next.js production build passed
```

Browser screenshot QA:

- Restarted the stale local dev server after production build.
- Opened `http://127.0.0.1:3000`.
- Started a Human vs Human match.
- Confirmed the screen shows `先出完 15 枚马即胜`.
- Confirmed both sides show `0/15` and remaining horses to win.
- Confirmed dice panel and victory tracker fit side by side on desktop.
- Confirmed the triangular board is visible in the first viewport.
- Rolled dice and confirmed legal source labels appear.
- Selected a legal source and confirmed green `可落` targets appear on the board.

### Issues Encountered

The first pass of the victory tracker made the HUD too tall, pushing the board out of the first viewport.

Resolution:

- Compressed `VictoryTracker`.
- Moved `VictoryTracker` and `DicePanel` into the same desktop row.
- Compressed `TurnCoach` and `DicePanel`.

### Open Follow-Up

- Mobile viewport QA remains required.
- The board still needs final visual direction and art assets; this pass removes the debug-grid feel but is not final art.
- Add click feedback for non-highlighted or blocked points.
- Run full-match manual tests in Human vs Human and Human vs AI.

## 2026-04-28 09:12 CST

### Objective

Continue improving the in-play feel. The previous pass made the win condition and board shape clearer, but play still needed moment-to-moment feedback so the player can feel that a move happened and understand what changed.

### Files Changed

- `src/components/PlayFeedback.tsx`
- `src/components/GameScreen.tsx`
- `src/components/Board.tsx`
- `src/components/BoardPoint.tsx`
- `src/components/DicePanel.tsx`
- `src/app/globals.css`
- `docs/PROJECT_STATUS.md`
- `docs/DEV_LOG.md`

### Implementation Completed

Added a gameplay feedback strip:

- Shows the current instruction.
- Shows the previous move after each action.
- Distinguishes normal moves, bar re-entry, bearing off, and hits.
- Uses event icons for normal movement, hits, bearing off, and pre-move state.

Added board-state feedback:

- Previous source point is marked with `起`.
- Previous destination point is marked with `落`.
- Hit destination is marked with `打`.
- Bearing-off destination shows `刚出马`.
- Legal landing points pulse while waiting for target selection.
- Legal source points pulse while waiting for source selection.

Added motion feedback:

- Dice results pop when a roll is made.
- Roll button pulses when rolling is currently allowed.
- Arriving pieces animate briefly on the latest destination.
- Hit badges flash in.
- Feedback strip animates on state updates.
- Reduced-motion users receive near-instant animations through a `prefers-reduced-motion` rule.

### Verification

Ran:

```bash
npm test
```

Result:

```txt
8 test files passed
27 tests passed
```

Ran:

```bash
npm run build
```

Result:

```txt
Next.js production build passed
```

Browser gameplay QA:

- Started local dev server.
- Opened `http://127.0.0.1:3000`.
- Started a Human vs Human match.
- Confirmed the feedback strip starts with `上一手：尚未行棋，先掷骰`.
- Rolled dice and confirmed legal source points appear.
- Selected a legal source and confirmed legal `可落` target appears.
- Clicked a legal target and confirmed the board marks previous source with `起` and destination with `落`.
- Confirmed the previous move appears in the feedback strip.

### Open Follow-Up

- Add explicit reason feedback when the player clicks a non-highlighted point or blocked point.
- Add hit-specific browser QA with a constructed position.
- Add bearing-off browser QA with a constructed late-game position.
- Mobile viewport QA remains required.

## 2026-04-29 11:09 CST

### Objective

Increase atmosphere and tactile feedback for dice and horse movement. The prior pass added functional feedback, but dice and board motion still felt too immediate and thin.

### Files Changed

- `src/components/DicePanel.tsx`
- `src/components/Board.tsx`
- `src/components/BoardPoint.tsx`
- `src/app/globals.css`
- `docs/PROJECT_STATUS.md`
- `docs/DEV_LOG.md`

### Implementation Completed

Improved dice feel:

- Converted `DicePanel` to a client component.
- Added a short rolling phase before resolving a roll.
- During rolling, the button changes from `掷骰` to `听骰`.
- Preview dice values change rapidly during the rolling phase.
- The dice icon spins while rolling.
- Dice squares use a tumbling animation while rolling and a pop animation when resolved.

Improved board atmosphere:

- Added a subtle lacquer-board glow animation.
- Added a center-rail shimmer.
- Added an arrival ripple on the last destination point.
- Added piece glints on hover.
- Kept the existing source, target, hit, and last-move animations.

### Verification

Ran:

```bash
npm test
```

Result:

```txt
8 test files passed
27 tests passed
```

Ran:

```bash
npm run build
```

Result:

```txt
Next.js production build passed
```

Browser animation QA:

- Started local dev server.
- Opened `http://127.0.0.1:3000`.
- Started a Human vs Human match.
- Confirmed dice panel and board render.
- Clicked `掷骰` and confirmed the button enters `听骰` state.
- Confirmed preview dice values appear during the rolling phase.
- Confirmed roll settles into legal move selection.
- Selected a horse and confirmed legal `可落` targets.
- Clicked a target and confirmed previous source / destination markers plus the destination ripple state.

### Open Follow-Up

- Add audio hooks or optional sound effects for dice, hits, and bearing off.
- Add hit-specific browser QA with a constructed position.
- Add bearing-off browser QA with a constructed late-game position.
- Mobile viewport QA remains required.

## 2026-04-29 20:20 CST

### Objective

Replace the numeric dice placeholders with actual simulated dice faces. The prior dice animation changed numbers inside square blocks, which did not read as dice.

### Files Changed

- `src/components/DiceFace.tsx`
- `src/components/DicePanel.tsx`
- `src/app/globals.css`
- `docs/PROJECT_STATUS.md`
- `docs/DEV_LOG.md`

### Implementation Completed

Added a dedicated `DiceFace` component:

- Renders pips for values 1 through 6.
- Uses an empty die state before the first roll.
- Provides accessible labels such as `3 点`.
- Keeps the rolling-state integration from `DicePanel`.

Improved dice styling:

- Added rounded die body with bevel, highlight, shadow, and darker pips.
- Reused the rolling and settle animations on the die body rather than on a numeric block.

### Verification

Ran:

```bash
npm test
```

Result:

```txt
8 test files passed
27 tests passed
```

Ran:

```bash
npm run build
```

Result:

```txt
Next.js production build passed
```

Browser visual QA:

- Restarted local dev server after the build.
- Opened `http://127.0.0.1:3000`.
- Started a Human vs Human match.
- Confirmed unrolled dice render as empty dice bodies.
- Clicked `掷骰` and confirmed the `听骰` rolling state.
- Confirmed settled dice render as pip dice faces rather than numeric blocks.

### Open Follow-Up

- Improve dice motion further with a more physical roll path if needed.
- Add optional audio only after the visual dice is acceptable.

## 2026-04-30 19:40 CST

### Objective

Move the project out of local-only development by syncing it to GitHub and preparing for Aliyun GD deployment.

### Files Changed

- `.gitignore`
- `docs/DEPLOYMENT.md`
- `docs/PROJECT_STATUS.md`
- `docs/DEV_LOG.md`

### GitHub Sync

Initialized a local Git repository in the project directory.

Added `.obsidian` to `.gitignore` so local Obsidian workspace state is not pushed.

Committed the initial project:

```txt
dd43221 Initial Shuanglu prototype
```

Configured remote:

```txt
origin git@github.com:louiezhelee-uway/shuanglu.git
```

The remote repository already had a placeholder commit:

```txt
95768b4 Initialize repository
```

Merged the remote placeholder history instead of force pushing:

```txt
9211616 Merge remote repository placeholder
```

Pushed `main` successfully:

```txt
95768b4..9211616 main -> main
```

Current synced commit:

```txt
921161631b11e92fcfa2f2a48e07d576f52e8fd5
```

### Verification

Before the GitHub sync, the project had already passed:

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

### Aliyun GD Deployment Status

Deployment is blocked pending server details.

Findings:

- No working `aliyun-gd` SSH config entry exists locally.
- `ssh -G aliyun-gd` falls back to unresolved hostname defaults.
- Direct `ssh aliyun-gd` fails DNS resolution.
- Existing configured hosts do not clearly identify an Aliyun GD server.

Required to proceed:

- SSH host or SSH config alias
- SSH user
- Deployment path
- Public domain or port
- Whether to serve with static export or a Node/Next process

### Open Follow-Up

- Deploy to Aliyun GD after receiving the correct SSH target.
- Add server-side deployment notes once the target is confirmed.

## 2026-04-30 22:10 CST

### Objective

Sync the project to GitHub and deploy the current `0.5` prototype to the Aliyun GD server using a Next.js Node process behind Nginx.

### Deployment Target

- GitHub repository: `louiezhelee-uway/shuanglu`
- Synced commit: `b7b9e554787ae3f62e08f2b8f7160c84bf2f6982`
- Public URL: `http://47.121.182.144/`
- Server app path: `/opt/shuanglu`
- Internal app address: `127.0.0.1:3002`
- PM2 process: `shuanglu`
- Nginx config: `/etc/nginx/conf.d/shuanglu.conf`

No server credentials are stored in repository documents.

### Server Findings

The server is Ubuntu 24.04.4 LTS with:

- Node `v18.19.1`
- npm `9.2.0`
- Git `2.43.0`
- Nginx `1.24.0`
- PM2 already installed and active

Existing services were preserved:

- PM2 process `school-application`
- PM2 process `gaokao-sprint-coach`
- Existing Nginx default server for `college.hkuway.com`
- Existing `/gaokao` reverse proxy to `127.0.0.1:3001`

### Deployment Work Completed

The server could not reliably fetch the GitHub repository directly within the deployment window, so the deployed package was created from the local synced Git commit:

```bash
git archive --format=tar.gz -o /tmp/shuanglu-deploy-b7b9e55.tgz HEAD
```

Uploaded the archive to the server and extracted it into:

```txt
/opt/shuanglu
```

Installed dependencies and built on the server:

```bash
npm ci
npm run build
```

Started the production app with PM2:

```bash
pm2 start npm --name shuanglu -- start -- --hostname 127.0.0.1 --port 3002
pm2 save
```

Added a dedicated Nginx server block for the IP host `47.121.182.144`, proxying to:

```txt
http://127.0.0.1:3002
```

Reloaded Nginx after configuration validation:

```bash
nginx -t
systemctl reload nginx
```

### Verification

Server-side build passed:

```txt
Next.js production build passed.
```

Internal app check:

```bash
curl -I --max-time 10 http://127.0.0.1:3002/
```

Result:

```txt
HTTP/1.1 200 OK
```

PM2 status:

```txt
shuanglu online
```

Nginx status:

```txt
nginx configuration file syntax is ok
nginx configuration test is successful
```

External public check:

```bash
curl -s --max-time 20 http://47.121.182.144/
```

Result:

```txt
The response contains <title>双陆 Shuanglu.
```

### Open Risks

- The public deployment currently uses HTTP on an IP address. A real hostname and HTTPS certificate are still required for launch.
- The server uses Node `18.19.1`. The build passed, but one transitive development dependency emitted a warning that newer Node versions are preferred.
- `npm ci` reported 7 moderate severity advisories. They were not force-fixed because that could introduce breaking dependency changes.
- Direct server-to-GitHub fetch was unreliable during this deployment. Future releases should use either a reliable server Git path or a scripted local archive upload process.

## 2026-05-01 16:08 CST

### Objective

Fix a playability problem reported during manual play: when the game says `尚有马在栏，必须先从马栏复马。`, the player does not know what to click.

### Files Changed

- `src/store/gameStore.ts`
- `src/components/Board.tsx`
- `src/components/TurnCoach.tsx`
- `docs/PROJECT_STATUS.md`
- `docs/DEV_LOG.md`

### Changes Made

Clarified the bar re-entry flow in player-action language:

1. Click the board's central `马栏` control.
2. Then click the green entry point.

Updated the board UI so the bar area becomes a clear operation control when re-entry is mandatory:

- Shows `点这里复马`.
- Uses green active styling when the bar is selectable.
- Shows how many legal re-entry entrances are currently available.
- Changes to `已选马栏，去点绿色入口。` after the player selects the bar.

Updated turn guidance and store messages so they no longer only state the rule; they now tell the player the next click.

### Verification

Ran:

```bash
npm test
```

Result:

```txt
8 test files passed
27 tests passed
```

Ran:

```bash
npm run build
```

Result:

```txt
Next.js production build passed
```

### Open Follow-Up

- Add browser QA for an actual hit-and-re-entry scenario so the visual state can be checked in context.
- Consider adding a one-turn tutorial overlay the first time a player has a horse on the bar.

## 2026-05-01 18:36 CST

### Objective

Recover the Aliyun GD deployment after the server became unresponsive during the first attempt to deploy the bar re-entry UX fix, then complete the deployment.

### Incident

During the first server-side update, `npm ci` was interrupted and left the app in a broken dependency state.

Symptoms after reboot:

- Nginx was online, but the public endpoint returned `502 Bad Gateway`.
- PM2 process `shuanglu` was online only briefly and kept restarting.
- `ss` showed no listener on `127.0.0.1:3002`.
- PM2 logs first showed `next: not found`.
- A partial repair then produced `Bus error (core dumped)` from `next start`.

### Recovery Work Completed

Logged in with the Aliyun PEM key:

```txt
/Users/louie/Downloads/aliyun_test.pem
```

Stopped the PM2 restart loop:

```bash
pm2 stop shuanglu
```

Moved the damaged dependency directory out of the app's active dependency path:

```bash
cd /opt/shuanglu
mv node_modules node_modules.broken_20260501_183014
```

Reinstalled dependencies cleanly:

```bash
npm ci --no-audit --no-fund
```

Moved broken dependency backups out of the project root because Next.js/TypeScript scanned them during build:

```bash
mkdir -p /opt/shuanglu_backups
mv /opt/shuanglu/node_modules.broken_* /opt/shuanglu_backups/
```

Built the server deployment:

```bash
npm run build
```

Restarted and saved PM2:

```bash
pm2 restart shuanglu --update-env
pm2 save
```

### Verification

Server build passed:

```txt
Next.js production build passed.
```

PM2 and port check:

```txt
shuanglu online
127.0.0.1:3002 listening
```

Internal check:

```bash
curl -I --max-time 10 http://127.0.0.1:3002/
```

Result:

```txt
HTTP/1.1 200 OK
```

Public check:

```bash
curl -I --max-time 20 http://47.121.182.144/
```

Result:

```txt
HTTP/1.1 200 OK
```

Bundle content check:

```bash
curl -s --max-time 20 http://47.121.182.144/_next/static/chunks/app/page-29f06141854caf05.js
```

Result:

```txt
The public bundle contains 点这里复马 and 马栏/复马.
```

### Open Follow-Up

- Replace ad hoc archive deployment with a repeatable deploy script.
- Keep dependency backup directories outside `/opt/shuanglu` so Next.js builds do not scan them.
- Consider upgrading the server runtime to Node 20 LTS after a controlled test.

## 2026-05-02 23:49 CST

### Objective

Start the visual upgrade from a flat prototype board toward a more atmospheric, game-like table that can later use the approved slender bottle-shaped horse assets.

### Context

The previous playable prototype was understandable at the rules level after testing, but the board still read too much like a debug interface. The user clarified that the horse pieces should look like glossy small bottle/vase forms with a rounded belly and long narrow neck, and that the whole interface must become more 3D-like before final piece assets are placed into it.

### Implementation Completed

Changed the main playfield order:

- Moved the board above the turn coach and play feedback in `src/components/GameScreen.tsx`.
- Kept victory progress and dice controls above the board so the player still sees the immediate turn action.
- Grouped turn guidance and play feedback below the board to reduce first-viewport visual clutter.

Added a 3D-like board shell:

- Reworked `src/components/Board.tsx` into a staged board scene with caption, perspective wrapper, lacquer shell, two ranks, center spine, bar well, and bearing-off well.
- Added matching CSS in `src/app/globals.css` for a thick lacquer-board edge, dark inner tray, gold center spine, inset wells, board highlights, and subtle board breathing.

Added piece asset slots:

- Added `src/data/assets.ts` to define piece image paths.
- Added `public/assets/pieces/.gitkeep` so the future piece asset directory exists.
- Updated `src/components/BoardPoint.tsx` to render image-based horse pieces from:
  - `/assets/pieces/white-horse-idle.png`
  - `/assets/pieces/black-horse-idle.png`
- Kept CSS fallback bottle-shaped pieces if the image assets are not present.

Improved point and piece staging:

- Added point lane classes for warm and dark alternating triangular points.
- Added shadows and surface highlights to make each point read as part of a physical board.
- Preserved existing state feedback for selectable source, legal target, last move, arrival, hit, and bearing-off.

### Verification

Ran:

```bash
npm test
```

Result:

```txt
8 test files passed
27 tests passed
```

Ran:

```bash
npm run build
```

Result:

```txt
Next.js production build passed
```

### Open Follow-Up

- Browser screenshot QA is still needed for desktop and mobile after this visual pass.
- The real white and black piece PNG assets still need to be placed under `public/assets/pieces/`.
- The broader HUD still has prototype-era panels; the board has been promoted visually, but side panels and guidance panels need a second art-direction pass.
- No Aliyun deployment has been performed for this local visual change yet.

## 2026-05-03 10:54 CST

### Objective

Deploy the first 3D-like board visual pass directly to Aliyun GD. Do not spend more time on local preview.

### Deployment Package

Created local deployment archive:

```txt
/tmp/shuanglu-visual-20260502-2349.tgz
```

Archive included the current working tree, including uncommitted visual changes and the new asset directory placeholders. Excluded generated and local-only directories:

- `node_modules`
- `.next`
- `.git`
- `.DS_Store`

### Server Build

Uploaded archive to:

```txt
root@47.121.182.144:/tmp/shuanglu-visual-20260502-2349.tgz
```

Built in a separate release directory before touching the running app:

```bash
release=/opt/shuanglu_release_20260502_2349
mkdir -p $release
tar -xzf /tmp/shuanglu-visual-20260502-2349.tgz -C $release
cd $release
npm ci --no-audit --no-fund
npm run build
```

Result:

```txt
Server Next.js production build passed.
```

Notes:

- `npm ci` repeated the known Node 18 engine warning for `eslint-visitor-keys@5.0.1`.
- Linux `tar` printed warnings about unknown macOS extended header keywords. They were non-fatal.

### Cutover

Stopped the running PM2 process, archived the previous production directory, moved the new release into place, then restarted:

```bash
pm2 stop shuanglu
mv /opt/shuanglu /opt/shuanglu_backups/shuanglu_before_visual_20260502_2349
mv /opt/shuanglu_release_20260502_2349 /opt/shuanglu
cd /opt/shuanglu
pm2 restart shuanglu --update-env
pm2 save
nginx -t
systemctl reload nginx
```

### Verification

PM2 result:

```txt
shuanglu online
exec cwd /opt/shuanglu
script args start -- --hostname 127.0.0.1 --port 3002
```

Nginx result:

```txt
nginx configuration test passed
```

Internal endpoint:

```bash
curl -I --max-time 10 http://127.0.0.1:3002/
```

Result:

```txt
HTTP/1.1 200 OK
```

Public endpoint:

```bash
curl -I --max-time 20 http://47.121.182.144/
```

Result:

```txt
HTTP/1.1 200 OK
```

Public bundle check:

```bash
curl -s --max-time 20 http://47.121.182.144/_next/static/chunks/app/page-25097f5190129d22.js
```

Result:

```txt
Bundle contains board-scene, board-shell, board-perspective, and white-horse-idle.
```

### Open Follow-Up

- The deployed page still needs direct browser visual QA.
- The published app currently uses CSS fallback pieces until final PNG assets are added under `public/assets/pieces/`.
- The deployment was made from a working-tree archive, then source was committed and pushed to GitHub as `47d6f60`.

## 2026-05-03 17:11 CST

### Objective

Start the online play track so a friend can join by room code and play a real match remotely within the week.

### Product Decision

Use a room-code, polling-based online MVP rather than WebSocket for the first testable release.

Reasoning:

- Shuanglu is turn-based, so 1-2 second polling is sufficient for a first friend-play test.
- The current production runtime is a single Next.js Node service behind Nginx, so in-memory rooms are acceptable for a short-lived test build.
- Avoiding WebSocket and database setup reduces deployment risk while the visual direction is still changing.

Known limitation:

- Rooms are stored in server memory and will be lost if PM2 restarts.
- Room access is casual, not secure: room code plus browser-local player identity is enough for the test build.
- Refresh recovery is basic; players should keep their room code.

### Implementation Completed

Added shared online types:

- `src/online/types.ts`

Added server-side room manager:

- `src/server/rooms.ts`

Implemented server behavior:

- Create room with a six-character room code.
- Seat room creator as white.
- Seat first joining friend as black.
- Extra joiners become spectators.
- Store authoritative `BoardState` on the server.
- Server validates whose turn it is before rolling or moving.
- Server reconstructs legal moves from the authoritative state before applying a move.
- Server returns public room state and player seat.

Added Next.js API routes:

- `POST /api/rooms`
- `GET /api/rooms/[roomId]?playerId=...`
- `POST /api/rooms/[roomId]` with actions:
  - `join`
  - `roll`
  - `move`

Updated client state:

- Extended game mode with `online`.
- Added browser-local player identity.
- Added online room/session metadata.
- Added async create/join/sync behavior.
- Online roll and move actions now submit to the server instead of mutating local state.
- Polling skips local UI reset when the server room version has not changed.

Updated UI:

- Main menu now has `开房间`.
- Main menu now has a room-code input and `加入房间`.
- Online game header shows room code, player seat, and whether the opponent has joined.
- Online game screen shows a shareable room-code strip.
- Dice and board actions are disabled when it is not the local player's turn.

### Verification

Ran:

```bash
npm run build
```

Result:

```txt
Next.js production build passed.
API routes /api/rooms and /api/rooms/[roomId] compiled as dynamic server routes.
```

Ran:

```bash
npm test
```

Result:

```txt
8 test files passed
27 tests passed
```

### Open Follow-Up

- Deploy this online room build to Aliyun and test with two browsers or two devices.
- Add direct room links so a room can be shared as a URL, not only as a code.
- Add better reconnect UX after refresh.
- Add explicit stale-room cleanup so old in-memory rooms do not accumulate.
- Add browser screenshot QA for the new online menu and room status strip.
- Decide whether the next online milestone needs WebSocket after the polling MVP is tested.

## 2026-05-03 17:55 CST

### Objective

Deploy the online room MVP to Aliyun and verify the public API path.

### Source

Committed and pushed:

```txt
0108b27 Add online room play MVP
```

### Deployment

Created a Git archive from `HEAD`:

```txt
/tmp/shuanglu-online-0108b27.tgz
```

Uploaded to:

```txt
root@47.121.182.144:/tmp/shuanglu-online-0108b27.tgz
```

Built in:

```txt
/opt/shuanglu_release_online_0108b27
```

Server build result:

```txt
Next.js production build passed.
Dynamic API routes /api/rooms and /api/rooms/[roomId] compiled.
```

Cutover:

```bash
pm2 stop shuanglu
mv /opt/shuanglu /opt/shuanglu_backups/shuanglu_before_online_0108b27
mv /opt/shuanglu_release_online_0108b27 /opt/shuanglu
pm2 restart shuanglu --update-env
pm2 save
nginx -t
systemctl reload nginx
```

### Verification

Public app:

```txt
http://47.121.182.144/ returned HTTP 200.
```

Online API smoke test:

```txt
POST /api/rooms created room E0FCE0 and seated codex-white-test as white.
POST /api/rooms/E0FCE0 join seated codex-black-test as black.
GET /api/rooms/E0FCE0?playerId=codex-white-test returned the room to white.
POST roll for white updated currentRoll and diceSteps.
POST move from 12 to 6 applied a legal server-validated white move.
```

### Open Follow-Up

- Run an actual browser-to-browser friend-play test.
- Add shareable room URLs.
- Add reconnect guidance and stale-room cleanup.

## 2026-05-04 16:00 CST

### Objective

Open the real 3D interface phase for the Shuanglu test build. The goal is no longer to keep polishing the DOM board, but to establish a WebGL scene that can become the room/table/board/pieces/dice presentation.

### Product Decision

Use React Three Fiber inside the existing Next.js React app.

Reasoning:

- The existing rules, online room, and HUD are already React-based.
- The 3D scene needs to read from the existing `BoardState` and submit existing selection callbacks.
- DOM remains better for text-heavy panels, rules, online room status, and turn coaching.
- 3D should own the playfield: room, table, board, pieces, dice, and atmosphere.

### Dependencies Added

Installed:

```bash
npm install three @react-three/fiber @react-three/drei
```

Notes:

- Initial sandboxed install failed with a proxy/network EPERM.
- Re-ran with approval and installation succeeded.
- `npm install` still reports the existing 7 moderate advisories. No forced audit fix was run.

### Implementation Completed

Added the first 3D table scene:

- `src/components/three/GameTable3D.tsx`

Scene contents:

- WebGL `Canvas` loaded dynamically from `GameScreen`.
- Programmatic room shell with floor and walls.
- Low lacquer table and inset board surface.
- Twenty-four triangular board points mapped from the existing `BoardState`.
- Programmatic glossy bottle/vase-shaped horse pieces using `LatheGeometry`.
- White and black material variants with clearcoat for ceramic/lacquer feel.
- Two dice cubes with top-face pip rendering.
- First-pass scripted dice tumble animation when roll values change.
- Four low-detail seated spectator figures around the table.
- Gold center spine and table rim details.
- Orbit camera controls for inspection.

Interaction wiring:

- 3D points use the same `availableMoves`, `selectedSource`, and `targetMoves` data as the previous board.
- Clicking a legal source point selects it.
- Clicking a legal target point submits the target.
- Clicking the 3D bar well selects `bar` when bar entry is available.
- Clicking the 3D bearing-off well submits `off` when bearing off is available.
- Online turn gating still uses `availableMoves`, so non-current online players cannot act through the 3D board.

Updated game screen:

- Removed the 2D board as the primary game board.
- Dynamically imports `GameTable3D` with `ssr: false` to avoid server-side WebGL issues.
- Keeps victory, dice, online room status, turn coach, and play feedback as DOM HUD around the 3D scene.

Updated global CSS:

- Added `.game-3d-shell` and `.game-3d-canvas` styles for a large, low-chrome WebGL playfield.
- Kept the shell consistent with the dark lacquer visual direction.

Runtime asset policy:

- No external 3D models, textures, or HDR environment maps are required for this first pass.
- Removed `drei` `Environment preset` use to avoid runtime network dependency on external HDR assets.

### Verification

Ran:

```bash
npm run build
```

Result:

```txt
Next.js production build passed.
```

Ran:

```bash
npm test
npx tsc --noEmit
```

Result:

```txt
8 test files passed.
27 tests passed.
TypeScript no-emit check passed.
```

Started local dev server for a browser smoke check:

```bash
npm run dev
```

Result:

```txt
Local: http://localhost:3000
The app loaded and compiled the game route without runtime errors in the dev server output.
```

Then stopped the local dev server processes.

### Open Follow-Up

- Complete direct visual QA of the WebGL canvas in a browser screenshot workflow.
- Add mobile viewport checks; current 3D scene targets desktop first.
- Improve piece placement readability for large stacks.
- Add move-path animation for horses instead of instant state-position updates.
- Replace scripted dice tumble with table-aware physics or a better deterministic roll animation.
- Add shareable room URL before deploying this as the main public test link.
- Decide whether to keep a collapsed 2D rules/debug board for testing only.
- User may later provide GLB models for:
  - white bottle/vase horse
  - black bottle/vase horse
  - dice
  - lacquer table
  - seated spectator figures

## 2026-05-04 16:19 CST

### Objective

Stabilize the first 3D table scene after the initial animation-heavy version crashed during loading or early interaction.

### Problem

The first 3D pass introduced several runtime-risky pieces at once:

- `drei/Text` labels in many places, which can involve font loading and text workers.
- Per-frame `useFrame` animation on every visible horse piece.
- Per-frame floating animation on spectators.
- Per-frame dice tumble animation.
- Higher DPR and larger shadow maps than needed for the first stability pass.

For the test build, this was too much to introduce in one step.

### Stabilization Completed

Updated `src/components/three/GameTable3D.tsx`:

- Removed all `drei/Text` usage from the scene.
- Removed continuous `useFrame` animation from horse pieces.
- Removed continuous `useFrame` animation from spectator figures.
- Removed the scripted dice tumble loop.
- Replaced text labels with simple geometric markers for now.
- Replaced spectator capsule geometry with simpler cylinder body geometry.
- Reduced bottle-piece lathe segment count from 40 to 28.
- Reduced shadow map size from 2048 to 1024.
- Forced Canvas DPR to `1` for the first stability pass.

### Verification

Ran:

```bash
npm run build
```

Result:

```txt
Next.js production build passed.
```

Ran:

```bash
npm test
```

Result:

```txt
8 test files passed.
27 tests passed.
```

### Follow-Up Rule

Do not reintroduce multiple animation systems at once. Add back animation in this order:

1. Single selected-piece hover pulse.
2. Single move-path animation after a completed move.
3. Dice roll animation without physics.
4. Spectator ambient movement.
5. Optional physics dice after the rest is stable.

## 2026-05-04 17:09 CST

### Objective

Continue after the 3D crash by isolating the experimental 3D scene from the stable playable flow, then improve online-room sharing.

### Implementation Completed

Added board-view separation:

- Added `boardView: "classic" | "3d"` to `src/store/gameStore.ts`.
- Default matches now use `classic`.
- Online rooms are forced to `classic` so friend-play testing is protected from 3D instability.
- The existing 2D board is restored as the default board in `GameScreen`.
- The WebGL table scene is only used when `boardView === "3d"`.

Added 3D test entry:

- Main menu now has a `3D测试` button.
- Added `src/app/3d/page.tsx`.
- Added `src/components/ThreeTestApp.tsx`, which starts a local human match with `boardView: "3d"`.

Added shareable online room URLs:

- Creating a room updates the browser URL to `/?room=<ROOM_ID>`.
- Joining a room updates the browser URL to `/?room=<ROOM_ID>`.
- Returning to menu clears the query string.
- Opening a URL with `?room=<ROOM_ID>` auto-fills and auto-joins that room.
- Online game screen now displays the share URL.

### Verification

Ran:

```bash
npm run build
```

Result:

```txt
Next.js production build passed.
Routes include / and /3d.
```

Ran:

```bash
npm test
```

Result:

```txt
8 test files passed.
27 tests passed.
```

### Open Follow-Up

- Deploy this isolated 3D/share-link build to Aliyun.
- Browser-test `/?room=<ROOM_ID>` with two clients.
- Browser-test `/3d` separately from the stable online flow.
- Add a visible warning badge on `/3d` that it is experimental.

## 2026-05-04 18:27 CST

### Objective

Deploy the isolated 3D test route and share-link build to Aliyun without replacing the stable online play flow.

### Source

Committed and pushed:

```txt
7f73e37 Isolate 3D table test route
```

### Deployment

Created archive:

```txt
/tmp/shuanglu-3d-isolated-7f73e37.tgz
```

Built in:

```txt
/opt/shuanglu_release_3d_isolated_7f73e37
```

Server build result:

```txt
Next.js production build passed.
Routes include / and /3d.
```

Cutover backup:

```txt
/opt/shuanglu_backups/shuanglu_before_3d_isolated_7f73e37
```

### Verification

Public checks:

```txt
http://47.121.182.144/ returned HTTP 200.
http://47.121.182.144/3d returned HTTP 200.
POST /api/rooms created room 77E484.
http://47.121.182.144/?room=77E484 returned HTTP 200.
```

Runtime checks:

```txt
PM2 process shuanglu is online.
Nginx configuration test passed.
```

### Open Follow-Up

- Full browser QA is still needed for `/3d`; HTTP 200 only proves the route serves.
- Test `?room=` with two real browser clients.
- Consider upgrading Aliyun Node runtime to Node 20 LTS before relying on the 3D dependency stack in production.

## 2026-05-04 18:56 CST

### Objective

Change the 3D work process from code-first iteration to art-direction-first iteration after user review found the current 3D scene visually wrong and not aligned with the desired product.

### Documents Changed

- Added `docs/ART_DIRECTION_3D.md`.
- Updated `docs/PROJECT_STATUS.md`.

### Decisions Recorded

- The current `/3d` route is a technical spike only, not the target visual direction.
- Future 3D work must start from approved effect images before rebuilding the scene.
- The first visual directions to test are:
  - Courtly Table.
  - Scholar's Study Table.
  - Museum-Grade Reconstructed Tabletop.
- The recommended first playable direction is Museum-Grade Reconstructed Tabletop with restrained Scholar's Study atmosphere.
- The bottle-shaped horse form is now defined as rounded belly, long narrow neck, flared lip, small foot ring, pure glossy material, and strong highlight line.
- Full room scenes and human figures are postponed until the tabletop view, board readability, and interaction model are stable.

### Verification

No code was changed in this step.

### Open Follow-Up

- Generate first-round effect images for courtly table, scholar's study table, and museum-grade tabletop.
- Select one visual direction before changing `src/components/three/GameTable3D.tsx`.
- After approval, build a greybox scene that matches the selected image and verify board readability before adding animation.

## 2026-05-04 19:17 CST

### Objective

Lock the approved effect-image family and start rebuilding the isolated 3D scene toward that direction.

### Art Direction Decision

The user approved the first generated effect images and asked to proceed with that style.

Saved concept references:

- `public/assets/concepts/3d-courtly-table.png`
- `public/assets/concepts/3d-scholars-study.png`
- `public/assets/concepts/3d-museum-tabletop.png`

Implementation target:

- Museum-Grade Reconstructed Tabletop as the playable base.
- Restrained court/study atmosphere at the edges.
- No full animated character room yet.

### Implementation Completed

Updated `src/components/three/GameTable3D.tsx`:

- Replaced the old procedural room/spectator scene with a close tabletop greybox.
- Added a dark lacquer board and raised tray structure.
- Added gold/brass inlay rails and 24 readable point zones.
- Rebuilt the horse geometry toward the approved bottle form:
  - Rounded belly.
  - Long narrow neck.
  - Flared lip.
  - Small foot ring.
  - Glossy white/black material treatment.
- Added a dice tray and physical dice placement near the board center.
- Added restrained study/court edge props: screen panels, paper, brush, scroll, cushions.
- Kept 3D click wiring to the existing rules engine.
- Added a small low-chrome `博物复原桌面 / 灰盒 01` badge.
- After an initial browser check showed the WebGL area was too visually empty, reduced scene complexity:
  - Removed `ContactShadows`.
  - Removed the experimental spot-light target wiring.
  - Raised ambient/hemisphere light.
  - Brightened the lacquer board top and visible inlay area.

Updated `src/app/globals.css`:

- Added the 3D badge styles.
- Reduced the 3D shell border radius to 8px.

Updated `docs/ART_DIRECTION_3D.md`:

- Recorded approved concept assets and the selected implementation target.

### Verification

Ran:

```bash
npm run build
```

Result:

```txt
Next.js production build passed.
Routes include / and /3d.
```

Ran:

```bash
npm test
```

Result:

```txt
8 test files passed.
27 tests passed.
```

Browser check:

- Opened local `http://127.0.0.1:3001/3d` in Chrome.
- Confirmed the page shell and DOM content loaded.
- Found the first WebGL pass could appear visually empty in the browser viewport, so simplified the scene as described above.
- A reliable final screenshot check is still pending because the desktop browser automation switched between unrelated Chrome profiles/windows during verification.

Process note:

- One `npm run build` attempt failed while a local Next dev server was still active and `.next` was being used concurrently.
- Stopped the local dev server and reran the production build successfully.
- Confirmed port `3001` no longer has a listener after cleanup.

### Open Follow-Up

- Browser screenshot QA is still needed for the new `/3d` greybox.
- If the greybox camera and board readability are acceptable, the next art task is replacing procedural horses with authored GLB assets.
- Do not add dice rolling animation until the static tabletop passes visual QA.

## 2026-05-05 11:46 CST

### Objective

Correct the first visible scale mismatch in the `/3d` tabletop scene after user review: the bottle-shaped horses were too large relative to the board and points.

### Implementation Completed

Updated `src/components/three/GameTable3D.tsx`:

- Added explicit 3D horse scale constants so the procedural vase model can be tuned independently of board size.
- Reduced normal horse scale to `0.35` and selected horse scale to `0.4`.
- Tightened per-point horse stack offsets so smaller horses stay visually grouped on each playable point.
- Lowered and reduced the overflow count marker so it no longer floats at the old oversized horse height.
- Kept rules, move selection, dice logic, and board point click geometry unchanged.

### Verification

Ran:

```bash
npm test
```

Result:

```txt
8 test files passed.
27 tests passed.
```

Opened the current-source dev server at:

```txt
http://127.0.0.1:3004/3d
```

Browser result:

- Confirmed `/3d` enters the WebGL board after client hydration.
- Confirmed the smaller horse scale renders on the board.
- Console shows Three.js deprecation warnings for `THREE.Clock` and `PCFSoftShadowMap`; no application error was found during this check.

### Open Follow-Up

- If the revised horse-to-board ratio is accepted by user review, the next 3D pass should tune camera framing and dice/table prop scale against the approved concept images.
- `/assets/pieces/white-horse-idle.png` and `/assets/pieces/black-horse-idle.png` still return 404 from legacy 2D image preload slots; either commit real assets or remove the preload path before launch.

## 2026-05-05 17:48 CST

### Objective

Move the current `/3d` scale-correction build off the user's laptop and onto Aliyun, and stop local development services.

### Local Actions Completed

- Stopped project listeners on `127.0.0.1:3001` and `127.0.0.1:3004`.
- Confirmed both ports no longer had local listeners.
- Built the current source locally before deployment:

```bash
npm run build
```

Result:

```txt
Next.js production build passed.
Routes include / and /3d.
```

### Cloud Actions Completed Before Blockage

- Confirmed SSH key `/Users/louie/Downloads/aliyun_test.pem` could authenticate to `47.121.182.144`.
- Created local deployment package:

```txt
/tmp/shuanglu-3d-scale-20260505_1458.tgz
```

- Uploaded it to Aliyun:

```txt
/tmp/shuanglu-3d-scale-20260505_1458.tgz
```

- Extracted it on the server into:

```txt
/opt/shuanglu_release_3d_scale_20260505_1458
```

### Blocker

The server became unresponsive during `npm ci --no-audit --no-fund` in the new release directory.

Observed:

- SSH timed out during banner exchange.
- Public HTTP to `http://47.121.182.144/` timed out.
- The SSH session running `npm ci` ended with `Connection reset by peer`.

Important boundary:

- The PM2 production cutover was not reached.
- `/opt/shuanglu` was not intentionally replaced.
- Nginx was not reloaded.

### Open Follow-Up

- Recover or reboot the Aliyun instance from the provider console if SSH remains unavailable.
- After SSH returns, stop any leftover install process and complete deployment using the lightweight path documented in `docs/DEPLOYMENT.md`.

### Recovery And Deployment Completion

After the user rebooted the Aliyun instance, SSH recovered and the server showed low load.

Completed the deployment with the lightweight path:

- Confirmed the release directory still existed.
- Found the interrupted dependency install had left an incomplete `node_modules`.
- Moved the incomplete dependency directory out of the release root.
- Copied the known-good `/opt/shuanglu/node_modules` into the new release.
- Ran `npm run build` successfully on the server.
- Backed up the previous production directory to:

```txt
/opt/shuanglu_backups/shuanglu_before_3d_scale_20260505_2005
```

- Moved the new release into `/opt/shuanglu`.
- Restarted PM2 process `shuanglu`.
- Saved PM2 process state.
- Verified Nginx config and reloaded Nginx.

Verification:

```txt
http://47.121.182.144/ returned HTTP 200.
http://47.121.182.144/3d returned HTTP 200.
POST /api/rooms created room 89E372.
PM2 process shuanglu is online with cwd /opt/shuanglu.
The deployed 3D chunk contains 博物复原桌面 and scale:o?.4:.35.
```

## 2026-05-07 07:48 CST

### Objective

Restart work from the user's MiniMac, avoid local service runtime, and begin taking ownership of the Aliyun GD cloud assets.

### Local Discovery

MiniMac repository path:

```txt
/Users/lizhe/Library/Mobile Documents/iCloud~md~obsidian/Documents/shuanglu/shuanglu
```

Local repository state:

```txt
HEAD: 8b41eb1 Deploy 3D horse scale correction
Working tree: clean before documentation updates
```

Local service policy confirmed by user:

- Do not run the Shuanglu service locally.
- Cloud deployment is the test target.

Local ports checked:

```txt
127.0.0.1:3000 no listener
127.0.0.1:3001 no listener
127.0.0.1:3002 no listener
127.0.0.1:3004 no listener
```

Local verification notes:

- `npm test` executed all 27 rule tests successfully.
- Vitest then failed while writing `node_modules/.vite/vitest/results.json` because of local iCloud/sandbox write permissions.
- `npm run build` passed when allowed to write `.next`.
- A brief attempt to start `next start` without elevated permissions failed with `EPERM`; no local service remained running.

### Cloud Asset Takeover

Created `docs/CLOUD_ASSETS.md` to record:

- MiniMac repository path.
- MiniMac SSH key path for Aliyun.
- Cloud URLs.
- PM2 process ownership.
- Nginx route map.
- `/opt/shuanglu` production path.
- `/opt/shuanglu_backups` backup inventory.
- Cloud-only verification workflow.

Aliyun verification:

```txt
http://47.121.182.144/ returned HTTP 200.
http://47.121.182.144/3d returned HTTP 200.
POST /api/rooms created room 3B24A7.
PM2 shuanglu is online, cwd /opt/shuanglu, internal port 3002.
Nginx config test passed.
```

### Open Follow-Up

- Future testing should default to cloud URLs unless the user explicitly asks for a local service.
- Consider moving the working repository out of iCloud if local cache writes continue to interfere with test/build tooling.



## 2026-05-08 22:06 CST

### Objective

Improve the stable 2D board first, because the new bottle-shaped pieces made the old source/target interaction harder to read. Keep local runtime disabled and use cloud deployment for interactive verification.

### Changes

- Added a board action guide above the 2D board that states the current click sequence in player language.
- Added visible legal source and legal target counters to the board action guide.
- Passed legal move dice steps into each board point so the point itself can display which dice step is consumed.
- Replaced small `选` / `可落` labels with stronger `点取` / `落马` action chips.
- Highlighted the triangular point lanes directly: gold for selectable source points and green for legal landing points.
- Added pulsing source/target beacons under the pieces so empty legal targets remain visible.
- Added accessible board point labels that include point number, owner/count, and legal action state.

### Verification

Local service policy was preserved: no local Next.js service was started.

```txt
npm run build passed.
npm test passed: 8 test files, 27 tests.
```

### Cloud Deployment

Deployed this 2D usability pass to Aliyun GD.

```txt
Release: /opt/shuanglu_release_2d_usability_20260508_2206
Backup: /opt/shuanglu_backups/shuanglu_before_2d_usability_20260508_2206
Server npm run build passed.
PM2 shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
http://47.121.182.144/ returned HTTP 200.
http://47.121.182.144/3d returned HTTP 200.
POST /api/rooms created room D8F1F1.
Cloud build artifacts contain 点取, 落马, and board-action-guide.
```


## 2026-05-09 19:29 CST

### Objective

Make the stable 2D game screen playable inside one browser window. The user reported that the top HUD was too tall, the board was too narrow, and normal play required both vertical scrolling and horizontal dragging.

### Changes

- Removed the 2D mode side character panels from the primary play viewport so the board can use the full content width.
- Compressed the top title bar from a tall header into a narrow game topbar.
- Compressed the victory tracker and dice tray into a lower-height HUD row.
- Reduced dice face size from 48px to 40px.
- Removed the 2D board's fixed `1080px` minimum width and horizontal scroll wrapper.
- Reduced board shell padding, rank gaps, center well spacing, and point height.
- Changed board point height to a viewport-aware clamp so desktop and smaller screens keep the full board more visible.
- Kept turn coach and feedback panels below the board as secondary guidance rather than letting them compete with the playfield.

### Verification

Local runtime policy was preserved: no local Next.js service was started.

```txt
npm run build passed.
npm test passed: 8 test files, 27 tests.
```

### Cloud Deployment

Deployed the one-window 2D layout pass to Aliyun GD.

```txt
Release: /opt/shuanglu_release_one_window_2d_20260509_1929
Backup: /opt/shuanglu_backups/shuanglu_before_one_window_2d_20260509_1929
Server npm run build passed.
PM2 shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
http://47.121.182.144/ returned HTTP 200.
http://47.121.182.144/3d returned HTTP 200.
POST /api/rooms created room C5E553.
Cloud build artifacts contain max-w-[1780px], game-compact-hud, and min-h-[clamp(6.7rem,13.2vh,9rem)].
```


## 2026-05-11 21:10 CST

### Objective

Improve the stable 2D interface visually by adding generated character and period-background imagery without compromising board readability or one-window playability.

### Asset Generation

Generated one wide historical-scene background using the built-in image generation path.

Workspace asset:

```txt
public/assets/backgrounds/song-study-court-bg.png
```

Prompt summary:

```txt
Song-dynasty inspired scholar/court game room, figures at the left and right edges, dark low-contrast center reserved for the 2D board, warm lantern light, lacquer and wood materials, no text, no logos, no watermark, no modern objects.
```

### Changes

- Added the generated background image to the project static assets.
- Applied the image only to the stable 2D game shell; `/3d` keeps its existing technical scene background.
- Added dark overlay gradients and a fixed vignette layer so the board and HUD remain readable.
- Added a restrained backdrop blur to the 2D UI panels so the generated scene reads as atmosphere rather than visual noise.

### Verification

Local runtime policy was preserved: no local Next.js service was started.

```txt
npm run build passed.
npm test passed: 8 test files, 27 tests.
```

### Cloud Deployment

Deployed the 2D background-art pass to Aliyun GD.

```txt
Release: /opt/shuanglu_release_2d_bg_art_20260511_2110
Backup: /opt/shuanglu_backups/shuanglu_before_2d_bg_art_20260511_2110
Server npm run build passed.
PM2 shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
http://47.121.182.144/ returned HTTP 200.
http://47.121.182.144/assets/backgrounds/song-study-court-bg.png returned HTTP 200.
http://47.121.182.144/3d returned HTTP 200.
POST /api/rooms created room B3568C.
Cloud build artifacts contain song-study-court-bg and game-shell-bg.
```


## 2026-05-12 12:44 CST

### Objective

Fix the generated 2D background visibility after user feedback that the deployed interface showed no obvious background atmosphere.

### Problem

The generated image was deployed and reachable, but the UI used very dark overlay gradients and dense panels. The result was technically present but visually too subtle to notice during normal play.

### Changes

- Reduced the 2D background overlay opacity so the Song-era room and edge figures are visibly present.
- Added the same generated background to the main menu via `menu-shell-bg`, so the visual direction is visible before entering a match.
- Added a lightly translucent `menu-panel` instead of the previous fully synthetic menu background.
- Kept central darkening and panel blur so the board, dice, and action labels remain readable.

### Verification

Local runtime policy was preserved: no local Next.js service was started.

```txt
npm run build passed.
npm test passed: 8 test files, 27 tests.
```

### Cloud Deployment

Deployed the background visibility fix to Aliyun GD.

```txt
Release: /opt/shuanglu_release_bg_visible_20260512_1238
Backup: /opt/shuanglu_backups/shuanglu_before_bg_visible_20260512_1238
Server npm run build passed.
PM2 shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
http://47.121.182.144/ returned HTTP 200.
http://47.121.182.144/assets/backgrounds/song-study-court-bg.png returned HTTP 200.
POST /api/rooms created room BE4ABC.
Cloud build artifacts contain menu-shell-bg and the generated background reference.
```

## 2026-05-13 01:25 CST

### Objective

Rework the generated 2D atmosphere image from a full-page background into side character decoration. The user wanted the historical figures to read as left/right ornamental layers instead of covering the whole page.

### Changes

- Kept the previously generated Song-era study/court source image as the visual source asset.
- Added cropped decorative figure layers:
  - `public/assets/decor/song-left-observers.png`
  - `public/assets/decor/song-right-observer.png`
- Removed the full-page `song-study-court-bg.png` image from the active 2D and menu shell backgrounds.
- Rebuilt `game-shell-bg` and `menu-shell-bg` around dark lacquer/study gradients so the board center remains readable.
- Added fixed left/right pseudo-element decoration layers with reduced opacity on small screens.
- Removed the stale mobile background-attachment rule that only applied to full-page background imagery.

### Verification

Local runtime policy was preserved: no local Next.js service was started.

```txt
npm run build passed.
npm test passed: 8 test files, 27 tests.
```

### Cloud Deployment

Deployed the side-decoration pass to Aliyun GD.

```txt
Artifact: /tmp/shuanglu-side-decor-20260513-0114.tgz
Release: /opt/shuanglu_release_side_decor_20260513_0114
Backup: /opt/shuanglu_backups/shuanglu_before_side_decor_20260513_0114
Server npm run build passed.
PM2 shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
http://47.121.182.144/ returned HTTP 200.
http://47.121.182.144/assets/decor/song-left-observers.png returned HTTP 200.
http://47.121.182.144/assets/decor/song-right-observer.png returned HTTP 200.
POST /api/rooms created room 0A1EC4.
```

### Notes

The center of the screen is intentionally image-free now. The characters should frame the game rather than compete with the board, dice, or legal move chips.

## 2026-05-16 11:36 CST

### Objective

Improve the stable 2D board horse readability. The user reported that the current 2D horse pieces still looked ugly, were too large, and did not need to be visually stacked; each horse should read as a small, clear individual piece.

### Changes

- Removed the per-count staggered/overlapping horse layout from `BoardPoint`.
- Replaced the old `piece-stack` model with a `piece-rack` grid layout.
- Each occupied point now shows up to six small horses in a clean 3-column arrangement instead of offset stacking.
- Counts above the visible display still use a compact `xN` marker on the last visible horse.
- Reduced the CSS fallback horse size so the pieces no longer dominate the board point.
- Retuned the CSS fallback horse shape to a smaller glossy bottle-like piece while preserving white/black material contrast.
- Kept legal source/target chips and board point interaction labels unchanged.

### Verification

Local runtime policy was preserved: no local Next.js service was started.

```txt
npm run build passed.
npm test passed: 8 test files, 27 tests.
```

### Cloud Deployment

Deployed the 2D horse rack layout pass to Aliyun GD.

```txt
Artifact: /tmp/shuanglu-2d-piece-rack-20260516-1116.tgz
Release: /opt/shuanglu_release_2d_piece_rack_20260516_1116
Backup: /opt/shuanglu_backups/shuanglu_before_2d_piece_rack_20260516_1116
Server npm run build passed.
PM2 shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
http://47.121.182.144/ returned HTTP 200.
POST /api/rooms created room 6E9FAF.
Cloud build artifacts contain `piece-rack`.
```

### Notes

This is a usability-first 2D correction. The final museum-grade horse asset can still replace the CSS fallback later, but the board should now be readable even before final raster assets are committed.

## 2026-05-17 22:29 CST

### Objective

Upgrade Human vs AI into a directly playable opponent while keeping the current 2D interface unchanged. The requested AI behavior is rules-aware, flexible in tactics, and defensively stable.

### Changes

- Replaced the old one-move heuristic scorer in `src/game/ai.ts` with full-turn plan search.
- The AI now enumerates legal move sequences for the current dice steps, including doubles as up to four-step turns.
- Added deterministic board evaluation instead of random tie-breaking.
- Evaluation now considers:
  - Winning and bearing off.
  - Bar pressure and mandatory re-entry.
  - Pip count / race progress.
  - Hitting exposed opposing horses.
  - Making protected points.
  - Home-board structure.
  - Own exposed blots and vulnerable blots.
  - Avoiding unnecessary stack concentration.
  - Mobility from the resulting position.
- Added move-level tactical scoring for hitting, bearing off, entering from bar, making points, and avoiding source/target exposure.
- Switched the default black Human vs AI opponent profile from `aesthetic` to `expert`.
- Expanded AI regression tests from one bear-off smoke test to five behavior tests.

### Verification

Local runtime policy was preserved: no local Next.js service was started.

```txt
npm test passed: 8 test files, 31 tests.
npm run build passed.
```

### Notes

The AI is now deterministic and should make fewer obvious tactical mistakes. It is still not a deep match engine: it evaluates the current full turn and resulting position, but it does not yet do multi-turn opponent search or rollout simulation. Full-match human playtesting is still required to tune the weights.

## 2026-05-18 10:10 CST

### Objective

Make every black AI move in a completed AI turn visible to the player. The user reported that after the AI moves, the interface must explicitly say how black moved and the board must highlight those paths.

### Changes

- Added `src/components/moveDisplay.ts` for reusable move display labels and latest-contiguous-player move extraction.
- Updated the feedback panel to show a dedicated "黑方刚走 N 步" list after black completes an AI turn.
- Each listed black move now shows its order, source, target, dice step, and hit marker when applicable.
- Updated the 2D board to accept highlighted move records for the latest black AI turn.
- Board points now show path chips such as `黑1起`, `黑1落`, and `黑1打`.
- The board also highlights black re-entry from the bar and black bearing-off in the central wells.
- Added a compact board note explaining that the black path is marked on the board.
- Added regression tests for extracting only the latest contiguous black move sequence.

### Verification

Local runtime policy was preserved: no local Next.js service was started.

```txt
npm run build passed.
npm test passed: 9 test files, 33 tests.
```

### Cloud Deployment

Deployed the black-move trace UI to Aliyun GD.

```txt
Artifact: /tmp/shuanglu-black-move-trace-20260518-1005.tgz
Release: /opt/shuanglu_release_black_move_trace_20260518_1005
Backup: /opt/shuanglu_backups/shuanglu_before_black_move_trace_20260518_1005
Server npm run build passed.
PM2 shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
http://47.121.182.144/ returned HTTP 200.
POST /api/rooms created room 5180FC.
Cloud build artifacts contain `黑方刚走` and `ai-trail-chip`.
```

### Notes

The board trace is intentionally scoped to Human vs AI mode in `GameScreen`, so regular online and human-vs-human play do not gain extra black-turn path overlays unless explicitly enabled later.


## 2026-05-21 23:14 CST

### Objective

Respond to playtest feedback that the Human vs AI opponent is too weak, too passive, and too easy to beat. The scope is AI strategy only; the stable 2D UI remains unchanged.

### Changes

- Strengthened the `expert` AI profile in `src/game/ai.ts`.
- Increased expert willingness to hit exposed opposing horses, especially when behind in the race.
- Reduced expert over-penalization for temporary blot exposure so it does not decline strong attacks too often.
- Added board evaluation for blocking opponent bar re-entry points.
- Added board evaluation for consecutive made-point runs, giving the AI more value for pressure structures and blockade-like positions.
- Increased expert value for bar pressure, made points, home-board points, mobility, and race tempo.
- Added regression tests for:
  - Expert choosing a risky tactical hit instead of a passive quiet move.
  - Expert closing a re-entry point when the opponent has a horse on the bar.

### Verification

Local runtime policy was preserved: no local Next.js service was started.

```txt
npm test passed: 9 test files, 35 tests.
Local npm run build was stopped after hanging at Next.js production build startup.
Server npm run build passed on Aliyun GD.
http://47.121.182.144/ returned HTTP 200.
POST /api/rooms created room A23741.
Cloud static JavaScript contains `entryBlock` and `longestPrime` AI pressure weights.
```

### Cloud Deployment

Deployed the stronger expert AI to Aliyun GD.

```txt
Artifact: /tmp/shuanglu-ai-pressure-20260521-2314.tgz
Release: /opt/shuanglu_release_ai_pressure_20260521_2314
Backup: /opt/shuanglu_backups/shuanglu_before_ai_pressure_20260521_2314
Server npm run build passed.
PM2 shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
```

### Notes

This is still a heuristic full-turn AI, not a multi-turn search engine. The next meaningful strength step would be opponent-reply search or rollout simulation, but this change should make the default black opponent much more willing to hit, trap, and convert bar pressure.

## 2026-05-22 01:30 CST

### Objective

Investigate playtest feedback that white sometimes appears to lose the turn before re-entering from the bar or before making a move.

### Findings

- The rule engine already ends a turn when the current dice steps have no legal move.
- If a player has horses on the bar and every rolled re-entry point is blocked by two or more opposing horses, the turn correctly passes.
- If a player uses one step and the remaining dice steps cannot legally be used, the turn correctly passes.
- The confusing behavior was mainly presentation: after an automatic pass, the UI often only showed the next player prompt, and in Human vs AI mode black could begin acting after 450ms, making the pass reason easy to miss.

### Changes

- Added explicit automatic-pass messages for local Human vs Human and Human vs AI play:
  - Roll has no legal move.
  - Bar re-entry is impossible because no rolled entry point is open.
  - A move consumes one step but remaining dice have no legal continuation.
- Added the same automatic-pass notice to online room responses.
- Delayed black AI takeover from 450ms to 1400ms when white just auto-passed, so the reason remains visible before black acts.
- Added `tests/turn.test.ts` covering:
  - Bar entry remains available when at least one rolled entry point is open.
  - Turn ends when all rolled bar-entry points are blocked.
  - Turn ends after a move when remaining dice cannot be used.

### Verification

Local runtime policy was preserved: no local Next.js service was started.

```txt
npx tsc --noEmit passed.
npm test passed: 10 test files, 38 tests.
```

## 2026-05-30 00:45 CST

### Objective

Prepare the existing Shuanglu project for a documentation-first GitHub sync. The user asked where the game is and requested that the current program documentation be cleaned up and uploaded to GitHub.

### Findings

- The cloud game endpoint is still live at `http://47.121.182.144/` and returned HTTP 200.
- The `/3d` route remains available as the isolated 3D visual spike.
- The local repository still contained the May 22 automatic-pass notice fix and deployment documentation as uncommitted working-tree changes.

### Changes

- Rewrote `README.md` as the GitHub landing page for the current prototype.
- Added `docs/DOCUMENTATION_INDEX.md` as a documentation map and handoff entry point.
- Updated `docs/PROJECT_STATUS.md` with the current documentation-sync status and live cloud targets.
- Kept the previously deployed automatic-pass explanation changes in the sync scope so GitHub matches the cloud behavior.

### Verification

```txt
curl -I --max-time 20 http://47.121.182.144/ returned HTTP 200.
```

## 2026-05-31 00:20 CST

### Objective

Push the existing Shuanglu program to the BigNAS-hosted Git repository as an additional mirror beyond GitHub.

### Plan

- Use the existing SSH host alias `uway-nas`.
- Create a bare repository at `/var/services/homes/louieadmin/git/shuanglu.git` if it does not already exist.
- Add local Git remote `bignas`.
- Push `main` to the NAS remote and verify with `git ls-remote`.

## 2026-06-11 21:10 CST

### Objective

Move the active Shuanglu development workspace out of the iCloud/Obsidian directory and into a normal local project directory before continuing development in a new conversation.

### Changes

- Created a clean local clone at `/Users/lizhe/Projects/shuanglu`.
- Cloned from GitHub at `git@github.com:louiezhelee-uway/shuanglu.git`.
- Added the BigNAS remote `bignas` pointing to `uway-nas:/var/services/homes/louieadmin/git/shuanglu.git`.
- Installed dependencies in the new workspace.
- Confirmed the new workspace is clean and at commit `ca6b356` before documenting the migration.

### Verification

```txt
npm install completed.
npm test passed: 10 test files, 38 tests.
npx tsc --noEmit passed.
No local web service was started.
```

### Notes

Future development should use `/Users/lizhe/Projects/shuanglu` as the primary workspace. The old iCloud path should no longer be treated as the program host directory.

## 2026-06-11 21:49 CST

### Objective

Restyle the stable 2D game screen toward the approved parchment reference: lighter Tang-Song board presentation, stronger character-side composition, and clearer one-screen play readability.

### Assumptions

- This pass is a visual/interface skin pass only. It must not change rule logic, legal move generation, AI decision logic, online room behavior, or victory detection.
- The 2D board should favor clarity over final 3D asset fidelity. Bottle-shaped horses remain the desired 3D/material direction, but this 2D pass uses smaller round token-style pieces because the reference image is easier to read that way.
- Local runtime policy remains unchanged: do not start a local Next.js service unless explicitly requested.

### Changes

- Reworked the 2D `GameScreen` shell into a light parchment layout with:
  - Top brand/chapter/action bar.
  - Left and right character panels.
  - Central board-first play area.
  - Compact status, dice, coach, and feedback surfaces.
- Rebuilt `CharacterPanel` as a scroll-paper style side panel using the existing Song decorative character artwork.
- Changed 2D board point lanes from dark triangular lanes to flatter parchment board columns so the board more closely matches the reference composition.
- Added a scoped `.parchment-game-shell` CSS skin that restyles board material, point states, dice, tokens, side panels, and bottom feedback panels without touching the 3D route.
- In the 2D skin, piece visuals are rendered as smaller round horse tokens for clearer point occupancy and less visual clutter.

### Verification

```txt
npx tsc --noEmit passed.
npm test passed: 10 test files, 38 tests.
npm run build passed.
No local web service was started.
```

### Cloud Deployment

Deployed the parchment 2D interface pass to Aliyun GD after GitHub and BigNAS sync.

```txt
Commit: 1f588f3
Artifact: /tmp/shuanglu-parchment-1f588f3.tgz
Release: /opt/shuanglu_release_parchment_20260611_2156
Backup: /opt/shuanglu_backups/shuanglu_before_parchment_20260611_2156
Public URL: http://47.121.182.144/
```

### Cloud Verification

```txt
Server npm run build passed.
PM2 process shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
Public / returned HTTP 200.
Public /3d returned HTTP 200.
Internal http://127.0.0.1:3002/ returned HTTP 200.
Public CSS contains parchment-game-shell, character-scroll-panel, topbar-icon-button, and point-action-chip.
```

### Notes

This is deployed and build-verified, but it still needs human browser visual approval against the supplied reference image. No local web service was started.

## 2026-06-11 23:08 CST

### Objective

Incorporate two additional 2D reference states supplied by the user and tune the stable 2D layout closer to those state references.

### Reference Assets

Archived the temporary clipboard images into stable project paths:

```txt
public/assets/concepts/2d-parchment-state-initial.png
public/assets/concepts/2d-parchment-state-progress.png
```

### Changes

- Added `docs/ART_DIRECTION_2D.md` as the active 2D interface art-direction document.
- Converted the 2D top gameplay HUD from a full victory-progress card into a compact round/current-action plaque plus dice, matching the reference emphasis.
- Kept the full `VictoryTracker` for the isolated 3D view, where it remains useful during technical testing.
- Reworked side-panel `已出马` and `马栏` display from plain numbers into circular state tracks with counts.
- Adjusted the parchment dice tray so it reads more like a physical dice area near the round plaque.

### Verification

```txt
npx tsc --noEmit passed.
npm test passed: 10 test files, 38 tests.
npm run build passed.
No local web service was started.
```

### Notes

The supplied reference images are UI art-direction references only. They must not be described as historical evidence or exact Tang-Song restoration.

### Cloud Deployment

Deployed the 2D state-reference refinement to Aliyun GD.

```txt
Commit: bcf8e2f
Artifact: /tmp/shuanglu-2d-state-bcf8e2f.tgz
Release: /opt/shuanglu_release_2d_state_20260611_2330
Backup: /opt/shuanglu_backups/shuanglu_before_2d_state_20260611_2330
Public URL: http://47.121.182.144/
```

### Cloud Verification

```txt
Server npm run build passed.
PM2 process shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
Public / returned HTTP 200.
Public /3d returned HTTP 200.
Reference images returned HTTP 200 from /assets/concepts/.
Public CSS contains parchment-round-strip, round-status-plaque, character-track-slots, and character-track-slot-filled.
```

### Git Sync Note

GitHub `main` was updated to `bcf8e2f`. BigNAS `git push bignas main` hung twice during the receive-pack phase; a short `git ls-remote bignas refs/heads/main` still works but reports `f9cb3b2`. BigNAS should be retried later before treating it as current.

## 2026-06-12 00:27 CST

### Objective

Fix the 2D character panels after user review: the previous decorative character images were cropped poorly in the live game state, with heads not visible, and they did not use the higher-quality user-provided reference artwork.

### Findings

- The previous `song-left-observers.png` and `song-right-observer.png` assets were scene/decor images, not character panel portraits.
- The CSS used `object-fit: cover` plus manual object positions, which could crop heads and upper body content inside the side panels.
- The user-provided 2D reference images already contain better scroll-framed character art, so continuing to use the older decor images was the wrong asset choice.

### Changes

- Cropped portrait assets from the approved 2D state reference image:
  - `public/assets/characters/white-reference-portrait.png`
  - `public/assets/characters/black-reference-portrait.png`
- Updated `CharacterPanel` to use those cropped user-reference portraits.
- Changed character portrait CSS from `cover` to `contain` so heads and upper bodies remain visible.
- Strengthened the side-panel paper/scroll framing so the panel reads less like a flat card and more like the supplied reference.

### Verification

```txt
npx tsc --noEmit passed.
npm test passed: 10 test files, 38 tests.
npm run build passed.
```

### Notes

This correction specifically addresses visual asset choice and crop safety. The next verification step must include an actual game-state browser screenshot, not only HTTP/CSS checks.

### Cloud Deployment

Deployed the reference-portrait correction to Aliyun GD.

```txt
Commit: bc7485d
Artifact: /tmp/shuanglu-reference-portraits-bc7485d.tgz
Release: /opt/shuanglu_release_reference_portraits_20260612_0032
Backup: /opt/shuanglu_backups/shuanglu_before_reference_portraits_20260612_0032
Public URL: http://47.121.182.144/
```

### Cloud Verification

```txt
Server npm run build passed.
PM2 process shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
Public / returned HTTP 200.
Public character portrait assets returned HTTP 200.
Created online room 818E6A for visual check.
Captured actual game-state screenshot at /tmp/shuanglu-screens/game-reference-portraits.png.
Visual check confirmed both character heads and upper bodies are visible in the live game layout.

## 2026-06-12 00:55 CST

### Objective

Create a concise daily work summary and synchronize the repository to both GitHub and BigNAS.

### Changes

- Added `docs/WORK_SUMMARY_2026-06-12.md` covering:
  - Parchment 2D interface work.
  - Additional state reference image archival.
  - `ART_DIRECTION_2D.md`.
  - Round/current-action HUD and side-panel state tracks.
  - Reference portrait correction.
  - Aliyun deployment and verification.
  - Actual game-state screenshot verification.
  - GitHub and BigNAS sync state.
- Updated `docs/DOCUMENTATION_INDEX.md` to include the daily summary.
- Updated `docs/PROJECT_STATUS.md` and `docs/DEPLOYMENT.md` to show that the earlier BigNAS receive-pack hang was resolved.

### Git Verification

```txt
origin/main: 092ace884c9ca97c315b4273f1e83933bdf5d962
bignas/main: 092ace884c9ca97c315b4273f1e83933bdf5d962
```

After this log entry is committed, verify both remotes again at the resulting commit.

## 2026-06-12 13:48 CST

### Objective

Move the live 2D board closer to the supplied UI design rather than merely sharing the same parchment color palette.

### Findings

- The previous correction fixed character cropping, but the full game layout still differed from the design reference.
- The largest differences were top banner density, bottom black-gold navigation, board texture/framing, central board interruption by large bar/off controls, and lack of decorative landscape anchoring.

### Changes

- Extracted reusable UI assets from the approved 2D reference:
  - `public/assets/ui/2d-top-banner.png`
  - `public/assets/ui/2d-board-texture.png`
  - `public/assets/ui/2d-bottom-scenery.png`
- Applied the top banner asset to the 2D game topbar.
- Applied the board texture asset to the live board shell while keeping real game pieces and legal-move highlights dynamic.
- Added a black-gold bottom navigation bar with `棋局记录`, `角色信息`, `博戏志`, `帮助`, and `返回主界面`.
- Compressed the central `马栏` / `出马` controls so the board reads more like one continuous designed board.
- Added a bottom-right scenery accent behind the board area.

### Verification

```txt
npx tsc --noEmit passed.
npm test passed: 10 test files, 38 tests.
npm run build passed.
```

### Notes

This is still not a pixel-perfect recreation of the design image. It is a structural alignment pass that keeps the board state, legal move feedback, online play, and click targets real.

## 2026-06-12 16:06 CST

### Objective

Bring the live 2D game screen closer to the supplied parchment UI reference while preserving real, clickable game state.

### Assumptions

- The supplied reference is a target visual direction, not a static screenshot to paste over the game.
- The live game must keep dynamic dice, room state, legal move highlighting, bar re-entry, bearing-off, online status, and AI trace feedback.
- The MiniMac runtime policy remains cloud-only testing; no local Next.js service was started.

### Changes

- Reworked the 2D top banner so the reference art acts as the visual chapter/navigation header.
- Hid the older live topbar text in 2D mode to prevent duplicate logo/chapter/navigation overlays.
- Added the reference-style black-gold bottom navigation bar to the live 2D layout.
- Applied the reference board texture to the live board shell while keeping real point buttons and horse pieces.
- Compressed the central `马栏` / `出马` row so it interrupts the board less.
- Changed board point display labels from internal `0-23` indices to the reference-style `1-12` and `12-1` labels; internal rule indexing remains unchanged.
- Removed the bottom-right scenery overlay after visual QA showed it carried a fake red `结束回合` button from the reference image.
- Re-cropped `public/assets/ui/2d-top-banner.png` so it excludes static reference dice/round artwork and does not introduce a black left edge.

### Verification

```txt
npx tsc --noEmit passed.
npm test passed: 10 test files, 38 tests.
npm run build passed.
GitHub main pushed to 60488ae.
BigNAS main pushed to 60488ae.
Aliyun server npm run build passed.
PM2 process shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
http://47.121.182.144/ returned HTTP 200.
Created cloud room 4B2FE4 for final visual verification.
Captured cloud screenshot at /tmp/shuanglu-screens/game-design-alignment-edge-final.png.
```

### Visual QA Notes

- Confirmed the top banner no longer contains the static reference dice/round strip.
- Confirmed the left banner edge artifact from the first crop was removed.
- Confirmed both side portraits remain fully visible.
- Confirmed the fake decorative `结束回合` button no longer appears over the board.
- Remaining gap: this is not a pixel-perfect recreation. The central rules guidance and feedback panels still follow the current playable system rather than the exact reference mockup arrangement.

## 2026-06-12 20:42 CST

### Objective

Respond to user review that the 2D page still felt unlike the approved design reference:

- Remove unnecessary always-visible rule explanation panels.
- Stop stretching the top reference artwork.
- Restyle live turn/dice controls to match the parchment material language better.
- Reduce board pieces and circular landing positions so stacks fit more naturally.

### Changes

- Added `ParchmentCommandPanel` as the 2D-only lower command surface.
- Replaced the previous 2D `TurnCoach` / `PlayFeedback` rule-card block with reference-style panels:
  - `剧情对话`
  - `可行动点`
  - `可行步数`
  - `提示`
- Kept the old detailed rule coach only for the `/3d` technical view.
- Changed the top banner from `100% 100%` stretching to proportional `cover` sizing.
- Restyled the round/action plaque and dice tray using darker ink, parchment, and gold-border treatment.
- Hid the board's long action-guide strip in parchment mode; action state now appears in the lower command panel.
- Reduced board point height, landing-circle radius, horse-token size, and horse-token grid spacing.
- Added `public/assets/ui/2d-bottom-scenery-crop.png`, cropped from the reference scenery without the fake `结束回合` button.
- Anchored the scenery layer in the stretched center play region without stretching functional rows.

### Verification

```txt
npx tsc --noEmit passed.
npm test passed: 10 test files, 38 tests.
npm run build passed.
GitHub main pushed through badaa8d.
BigNAS main pushed through badaa8d.
Aliyun server npm run build passed.
PM2 process shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
http://47.121.182.144/ returned HTTP 200.
Created cloud room DBDFF8 for final visual verification.
Captured cloud screenshot at /tmp/shuanglu-screens/game-reference-final-badaa8d.png.
```

### Visual QA Notes

- Confirmed the large rule explanation cards are no longer visible in 2D gameplay.
- Confirmed top artwork is no longer hard-stretched across both axes.
- Confirmed dice/round controls now use the same parchment/ink material family.
- Confirmed pieces are smaller and five-piece stacks fit visibly inside a point.
- Confirmed the cloud screenshot no longer contains a stretched online share row after `align-content: start`.
- Remaining gap: the layout is closer to the reference, but the live dice panel and the exact lower-panel geometry are still not a pixel-level recreation of the mockup.

## 2026-06-13 00:31 CST

### Objective

Respond to follow-up visual feedback that the lower `提示` / command boxes still felt too rigid and not coordinated with the board elements.

### Changes

- Replaced the dark online room/share utility card with a thin parchment room strip.
- Restyled the 2D lower command area as one continuous parchment band rather than four separate rigid cards.
- Removed per-panel boxed backgrounds from the lower command area.
- Replaced hard full-height borders with short faded vertical separators.
- Added subtle top/bottom ornamental lines inside the command band.
- Reduced the command-area source tokens and step chips to better match the smaller board horse scale.
- Reduced and faded the bottom-right scenery decoration so it no longer reads as a large hard rectangle below the command panel.
- Kept all game rules, legal-move logic, AI logic, and 3D technical view behavior unchanged.

### Verification

```txt
npx tsc --noEmit passed.
npm test passed: 10 test files, 38 tests.
npm run build passed.
Aliyun server npm run build passed.
PM2 process shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
Created cloud room 675921 for final visual verification.
Captured cloud screenshot at /tmp/shuanglu-screens/game-command-panel-soft-v3.png.
Application code commit: bf38063.
```

### Visual QA Notes

- Confirmed the lower command surface now reads as a continuous parchment operation band.
- Confirmed the room/share strip no longer appears as a dark system-style card.
- Confirmed the scenery layer is visually subordinate to the board and command band.
- Remaining gap: the reference image still has richer bespoke ornamentation around each command group; current implementation is a pragmatic CSS approximation that keeps the live game DOM functional.

## 2026-06-13 15:24 CST

### Objective

Respond to user feedback that the round/dice HUD still did not match the supplied reference, and that the left/right character panels still felt poorly integrated because of double framing.

### Changes

- Added stable class hooks inside `DicePanel` so parchment mode can style title, dice, button, and step text independently.
- Reworked the 2D round/action plaque:
  - Two-tone dark/light plaque treatment.
  - Angled clipped ends.
  - Reduced spacing and stronger reference-style central alignment.
- Removed the parchment-mode boxed `骰声` tray treatment.
- Displayed dice as two independent light dice beside the central plaque.
- Reduced the roll button to a small paper control beside the dice and hid the icon in parchment mode.
- Softened the left/right character scroll frames.
- Removed the extra DOM border/background around the portrait area.
- Cropped the existing reference portrait images more tightly so their embedded top labels and inner frame lines are no longer visually dominant.
- Kept rules, move validation, online room state, AI, and 3D technical view logic unchanged.

### Verification

```txt
npx tsc --noEmit passed.
npm test passed: 10 test files, 38 tests.
npm run build passed.
Aliyun server npm run build passed.
PM2 process shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
Created cloud rooms D5E547 and 413931 for visual verification.
Captured final cloud screenshot at /tmp/shuanglu-screens/game-hud-portrait-align-v2.png.
Application code commit: 7a55042.
```

### Visual QA Notes

- Confirmed the top HUD now reads as a central plaque with independent dice rather than a separate utility card.
- Confirmed the right-side embedded `黑方（对手）` label from the source crop is no longer visible after the second crop pass.
- Confirmed both character heads remain visible after the tighter portrait crop.
- Remaining gap: the current portraits are still crops from a full framed reference panel. A true no-double-frame result will require clean transparent or unframed character artwork rather than cropped screenshots.

## 2026-06-15 03:45 CST

### Objective

Mount the user-generated PNG art assets into the live 2D parchment interface while leaving dice asset design for a later pass.

### Changes

- Added generated transparent character portraits:
  - `public/assets/characters/li-qingzhao-halfbody.png`
  - `public/assets/characters/song-emperor-halfbody.png`
- Added generated parchment UI assets:
  - `public/assets/ui/round-plaque-empty.png`
  - `public/assets/ui/command-band-empty.png`
  - `public/assets/ui/button-paper-empty.png`
  - `public/assets/ui/button-red-empty.png`
  - `public/assets/ui/footer-nav-bar-empty.png`
  - `public/assets/ui/point-ring-empty.png`
  - `public/assets/ui/board-center-medallion.png`
  - `public/assets/ui/side-panel-parchment-left.png`
  - `public/assets/ui/side-panel-parchment-right.png`
- Converted the character portrait render from `<img>` to CSS background layers so broken image alt text cannot appear during initial load.
- Optimized the new PNG assets for browser delivery before deployment.
- Updated the 2D parchment HUD, command band, footer nav, side panels, board center, and point rings to use the generated assets.
- Kept dice rendering on the existing CSS dice implementation; generated dice PNGs were not mounted in this pass.
- Stopped requesting missing `public/assets/pieces/*horse*.png` files. Until final horse-piece PNGs exist, the board uses the existing CSS fallback pieces.
- Fixed the fallback selector so CSS horse pieces remain visible when no image asset is configured.
- Cleaned Aliyun `/opt/shuanglu_backups` after the server hit 100% disk usage during a failed release copy. Kept the latest three Shuanglu backups.

### Verification

```txt
npx tsc --noEmit passed.
npm test passed: 10 test files, 38 tests.
npm run build passed.
Aliyun server npm run build passed.
PM2 process shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
Cloud room 1248E8 created for visual verification.
Captured cloud screenshot at /tmp/shuanglu-screens/game-png-assets-cssfix.png.
Aliyun root filesystem after cleanup: 28G available, 25% used.
Latest server backup: /opt/shuanglu_backups/shuanglu_before_png_assets_cssfix_20260615_033923.
```

### Visual QA Notes

- Confirmed the supplied top banner, round status plaque, parchment side panels, character portraits, command band, footer nav, point-ring assets, and board medallion all load from the cloud deployment.
- Confirmed CSS horse pieces are visible again after removing the missing PNG requests.
- Confirmed dice were intentionally left as CSS placeholders for the next design discussion.
- Remaining gap: side-panel typography and portrait positioning still need a dedicated layout polish pass against the reference composition; this pass focused on mounting usable assets without changing gameplay rules.

## 2026-06-15 17:40 CST

### Objective

Resolve the most visible mismatches in the mounted 2D PNG interface before requesting additional image assets.

### Changes

- Reworked character side-panel hierarchy:
  - Portraits now lead the panel.
  - Name/status text is grouped under the portrait.
  - Character names use a dark plaque treatment closer to the supplied reference.
  - Quotes, skill blocks, and token tracks were softened so they sit inside the parchment instead of reading as web-form boxes.
- Reduced visual weight of the board center medallion so it no longer competes with pieces around points 6 and 7.
- Reduced point-ring size and opacity so empty points read as board locations, not oversized buttons.
- Slightly reduced 2D CSS horse-piece scale and tightened rack spacing.
- Tuned the lower command band:
  - Reduced rigid panel spacing.
  - Lowered heading and body text size.
  - Softened source/step list spacing.
- Kept gameplay rules, online room state, AI behavior, dice behavior, and asset file set unchanged.

### Verification

```txt
npx tsc --noEmit passed.
npm test passed: 10 test files, 38 tests.
npm run build passed.
Aliyun server npm run build passed.
PM2 process shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
Cloud room CF6EA0 created for final visual verification.
Captured cloud screenshot at /tmp/shuanglu-screens/game-ui-tuning-final.png.
Latest server backup: /opt/shuanglu_backups/shuanglu_before_ui_tuning_final_20260615_172912.
Aliyun root filesystem after cleanup: 29G available, 25% used.
```

### Visual QA Notes

- Confirmed side panels, portraits, name plaques, board rings, center medallion, and command band now read as one parchment UI family.
- Confirmed dice remain the existing CSS placeholders for the next asset discussion.
- Remaining gap: final horse-piece art and dice art are still pending user asset direction; current pieces remain CSS fallback pieces.

## 2026-06-15 22:15 CST

### Objective

Fix the visible 2D parchment-board alignment issues reported after the previous tuning pass:

- Point circles and horse tokens were visually competing.
- Some board grid lines appeared misaligned against the playable cells.
- Character portraits could clip the top of the head or hat.

### Changes

- Added occupied/empty point state classes in `BoardPoint` so CSS can distinguish empty board points from points that currently contain horses.
- Removed the extra parchment-mode grid overlay on the board shell; the live 12-column board grid now provides the visible alignment structure.
- Changed empty point circles into smaller, lighter pseudo-element markers.
- Hid point-circle markers on occupied points so horses no longer sit on top of oversized round holes.
- Softened occupied point lane backgrounds to keep only a subtle parchment cell texture.
- Retuned active source/target/AI trail markers to use smaller highlight circles that fit the same scale as the horse tokens.
- Repositioned side portraits to prioritize top/head visibility and reduced their background scale.
- Kept gameplay rules, online room state, AI behavior, dice behavior, and asset file set unchanged.

### Verification

```txt
npx tsc --noEmit passed.
npm test passed: 10 test files, 38 tests.
npm run build passed.
Local cloud-target artifact created at /tmp/shuanglu-point-layout-fix-20260615214151.tgz.
```

### Cloud Deployment Status

```txt
Attempted Aliyun deployment to 47.121.182.144.
The upload and remote extraction started, but the server became unreachable during remote install/build.
HTTP check to http://47.121.182.144/ timed out after 10 seconds.
SSH checks timed out during banner exchange.
Local hung SSH sessions were terminated.
Cloud release status is not confirmed.
Do not treat this pass as successfully deployed until Aliyun SSH and HTTP recover and PM2/Nginx are verified.
```

### Visual QA Notes

- A cloud screenshot from the earlier intermediate deploy was captured at `/tmp/shuanglu-screens/game-point-portrait-fix.png`, room `20EF18`.
- That intermediate screenshot confirmed portrait head visibility improved, but point circles still needed another tuning pass.
- The final point-circle tuning has passed local build/tests but has not yet been cloud-screenshot verified because Aliyun became unreachable.

## 2026-06-16 00:20 CST

### Objective

Recover Aliyun after the interrupted 2026-06-15 point/layout deployment and the manual server reboot.

### Findings

- SSH recovered after reboot; initial uptime was about 2 minutes.
- `/opt/shuanglu` was left in a half-deployed state:
  - `.next` was missing.
  - `next` was not available to the PM2 runtime.
  - PM2 process `shuanglu` was repeatedly restarting and logging `sh: 1: next: not found`.
- Nginx itself was active and its configuration tested successfully.
- Root filesystem had enough space: 28G available, 28% used.

### Recovery Actions

- Stopped PM2 process `shuanglu` to end the restart loop.
- Moved the broken half-deployed directory to:

```txt
/opt/shuanglu_backups/shuanglu_broken_after_reboot_20260616_001132
```

- Restored the latest complete backup:

```txt
/opt/shuanglu_backups/shuanglu_before_point_layout_fix_20260615_214256 -> /opt/shuanglu
```

- Restarted PM2 process `shuanglu`.
- Saved the PM2 process list.
- Re-tested and reloaded Nginx.

### Verification

```txt
http://47.121.182.144/ returned HTTP 200.
Local server check on 127.0.0.1:3002 returned HTTP 200.
PM2 process shuanglu is online.
Nginx configuration test passed.
Cloud room A9D96C created for recovery visual QA.
Captured cloud screenshot at /tmp/shuanglu-screens/game-recovery-check-20260616001747.png.
```

### Status Note

- The cloud runtime is restored to the latest complete backup taken before the failed point/layout deployment.
- The final local point-circle tuning commit `93c0a91` is pushed to GitHub and BigNAS but is not currently confirmed as deployed on Aliyun.
- Do not run another direct in-place deployment with `rm -rf /opt/shuanglu` before a successful server-side build exists in a separate release directory.

## 2026-06-17 02:35 CST

### Objective

Remove the visually intrusive large side circles baked into the 2D board texture.

### Changes

- Edited `public/assets/ui/2d-board-texture.png`.
- Removed the left and right vertical rows of large dark circles from the baked board background.
- Preserved the existing board dimensions, border, center medallion area, labels, and live UI asset path.
- Did not change rules, game state, AI, dice behavior, React components, or PM2 process configuration.

### Verification

```txt
npx tsc --noEmit passed.
npm test passed: 10 test files, 38 tests.
npm run build passed.
```

### Cloud Hotfix

```txt
Backed up previous cloud asset to /opt/shuanglu_backups/2d-board-texture-before-remove-side-circles-20260617_023141.png.
Copied the updated PNG directly to /opt/shuanglu/public/assets/ui/2d-board-texture.png.
Did not restart PM2.
PM2 process shuanglu remained online.
Nginx configuration test passed.
Cloud room 06495C created for visual QA.
Captured cloud screenshot at /tmp/shuanglu-screens/game-remove-side-circles-20260617023305.png.
```

### Visual QA Notes

- Confirmed the board's left and right side columns no longer show the large baked-in circular holes.
- Remaining visible circles are the normal live point markers and bottom piece shadows from the original texture.

## 2026-06-21 22:05 CST

### Objective

Mount the six user-generated faux-3D dice faces in the active 2D parchment HUD.

### Asset Preparation

- Imported `dice-1.png` through `dice-6.png` from the user asset folder.
- Confirmed all six pip layouts are correct.
- Found that five source images had a baked checkerboard instead of a real alpha channel; only `dice-2.png` initially contained RGBA transparency.
- Found substantial source differences in canvas ratio, die scale, perspective, and baseline.
- Normalized all six final assets to:

```txt
512 x 512 RGBA PNG
transparent background
consistent visual height
consistent center alignment
consistent bottom baseline
```

- Final runtime assets:

```txt
public/assets/ui/dice/dice-1.png
public/assets/ui/dice/dice-2.png
public/assets/ui/dice/dice-3.png
public/assets/ui/dice/dice-4.png
public/assets/ui/dice/dice-5.png
public/assets/ui/dice/dice-6.png
```

### UI Changes

- Updated `DiceFace` to render the normalized PNG matching each numeric result.
- Kept the existing CSS die for the unrolled `-` state.
- Preserved the existing 520ms rolling preview, result timing, and game rules.
- Added asset-specific CSS so generated dice do not inherit the old CSS die background, border, or pseudo-element highlights.

### Verification

```txt
npx tsc --noEmit passed.
npm test passed: 10 test files, 38 tests.
npm run build passed.
Aliyun release-directory npm run build passed.
Temporary port 3102 smoke test passed before switching the live directory.
PM2 process shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
http://47.121.182.144/ returned HTTP 200.
Cloud room C2B3E1 created for visual QA.
Cloud room rolled 5-3.
Captured cloud screenshot at /tmp/shuanglu-screens/game-dice-assets-review.png.
```

### Visual QA Notes

- Confirmed both dice align in the live HUD.
- Confirmed transparent edges are clean against the parchment background.
- Confirmed the 5 and 3 pip layouts remain readable at the production display size.
- The generated dice retain small silhouette differences, but normalization removes the severe source-size jumps.

## 2026-07-06 Production Baseline

### Objective

Replace the retired Aliyun operating assumptions with a reproducible Linode production baseline without changing game behavior.

### Repository Changes

- Pinned development and production to Node.js 20 through `.nvmrc` and `package.json`.
- Added the `npm run typecheck` command.
- Added tracked templates for the production systemd service and Docker-hosted Nginx virtual host.
- Added a certificate deployment hook with certificate validation, Nginx configuration validation, rollback, and reload.
- Added dedicated certificate renewal service/timer templates using the pinned `certbot/certbot:v5.6.0` image.
- Added a public production health-check script.
- Added a deployment script that requires clean `main == origin/main`, builds an independent release, performs a temporary-port smoke test, switches the `current` symlink, and restores the previous release if startup fails.
- Updated active operational documentation to use `https://shuanglu.uway.click` and moved Aliyun instructions into historical context.
- Updated the online-room project instruction to permit maintenance of the existing lightweight friend-room MVP without expanding its scope.

### Linode Changes

- Preserved the previous systemd and Nginx configurations under `/opt/apps/shuanglu/backups/production-baseline-20260706`.
- Migrated the active application directory into:

```txt
/opt/apps/shuanglu/releases/20260705T015850Z-0563e64
```

- Changed `/opt/apps/shuanglu/current` into a symlink to the active release.
- Added `REVISION` containing `0563e64d6f9ecc3afd77bb8a8363c20ac40a5353`.
- Installed and enabled `shuanglu-certbot-renew.timer`.
- Installed `/usr/local/sbin/deploy-shuanglu-certificate`.

### Certificate Verification

- An initial unrestricted `certbot renew --dry-run` also processed archived domains and exposed unrelated failures.
- Restricted the Shuanglu timer to `--cert-name shuanglu.uway.click` so it does not manage other certificates.
- The targeted Shuanglu staging renewal succeeded.
- The real renewal check and deploy hook exited successfully.
- The deployed Nginx certificate hash matches the Let's Encrypt live certificate hash.
- The timer is active and enabled, with the next run scheduled by systemd.

### Operational Verification

```txt
shuanglu.service active and enabled.
Application restart count: 0.
Internal 127.0.0.1:3002 returned HTTP 200.
https://shuanglu.uway.click/health returned ok.
https://shuanglu.uway.click/ returned HTTP 200.
https://shuanglu.uway.click/3d returned HTTP 200.
Docker Nginx configuration test passed.
Certificate staging renewal passed for shuanglu.uway.click.
```

The first directory-migration attempt performed an immediate HTTP check after `systemctl restart` and correctly rolled back when Next.js had not finished starting. The readiness check was changed to retry for up to 30 seconds, after which the migration completed successfully.

## 2026-09-27 Fixed-Angle 2.5D Board Redesign

### Objective

Replace the visually inconsistent rotatable `/3d` greybox with a coherent, fixed-angle tabletop composition that remains legible in mobile portrait view.

### Design Direction

- Reviewed current production at 430x932 and confirmed that perspective cropping, oversized foreground pieces, in-board dice, and mixed HUD styles were the main visual problems.
- Used premium digital backgammon and fixed-camera tabletop layouts as composition references without copying their art assets.
- Selected the existing `3d-scholars-study.png` concept as the internal tone target: complete board, restrained study setting, and a readable oblique view.

### Implementation

- Replaced orbit controls and the perspective camera with a responsive orthographic camera that fits the whole board to the canvas.
- Removed wall scenery, decorative props, in-board dice, and thirteen lane bars.
- Rebuilt the surface with alternating cinnabar and ivory points, a walnut frame, a central rail, and side trays.
- Shortened the lathed horse profile, increased its screen presence, and laid stacks along each point rather than vertically into the camera.
- Changed the `/3d` label from a test scene to `斜俯棋局`, and changed the scene badge to `宋韵棋案 · 固定视角`.
- Hid the large victory tracker on mobile while retaining the dice action and turn guidance.

### Browser QA

```txt
430x932 initial state: complete board in frame; no cropped foreground pieces.
430x932 rolled state: actionable source points visible.
430x932 selected state: legal target point rendered in green.
1280x900 desktop state: full board and both character panels visible.
Browser console: zero errors; existing Three.js deprecation warnings remain.
Desktop horizontal overflow: none (clientWidth 1280, scrollWidth 1280).
```

## 2026-09-26 Mobile Contrast and Piece-Conservation Pass

### Scope

- Adapted the external contrast and invariant analysis to the current shared TypeScript engine and DOM/Three.js renderers.
- Did not add the unapproved `pendingOffBoard` model, arbitrary board topology, font-atlas tooling, or WeChat mini-game support.

### Implementation

- Added compact source/target action markers that combine a short label, dice step, color, and distinct geometry.
- Added dark backing and perimeter treatment so source/target markers remain separated from parchment and 3D board surfaces.
- Strengthened white/black horse silhouette edges without changing the piece body palette.
- Added `assertBoardStateStructure`, `assertBoardStateInvariant`, and `assertPieceDestinationConservation` in the pure game engine.
- Wired move-transition conservation into `applyMove` and full-state validation into initial-state creation.
- Added eight invariant regression tests, including six malformed destination/state cases.
- Replaced duplicated runtime `15` copy with `ruleConfig.horsesPerPlayer` and reused `POINT_COUNT` in test helpers.

### Verification

```txt
npm test -- --run: 11 test files, 46 tests passed.
npm run typecheck: passed.
npm run build: passed; five Next.js routes generated.
npm run mobile:build: passed; Capacitor/Vite bundle generated.
Portrait browser QA: 390x844 and 430x932 passed for 2D source/target states.
3D browser QA: actionable source rings and piece edges rendered; zero console errors.
Known 3D warnings: Three.Clock and PCFSoftShadowMap deprecations under Three r184.
```
