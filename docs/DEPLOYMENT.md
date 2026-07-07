# Deployment Notes

This document records repository and deployment state for the Shuanglu prototype.

## Current Production: Linode Singapore

Last verified: 2026-07-06 CST

```txt
Public URL: https://shuanglu.uway.click
Public /3d: https://shuanglu.uway.click/3d
Health check: https://shuanglu.uway.click/health
Tailscale node: linode-singapore
Public IP: 139.162.57.49
Application root: /opt/apps/shuanglu
Active release: /opt/apps/shuanglu/current
Internal address: 127.0.0.1:3002
Service: shuanglu.service
Runtime user: shuanglu
Node.js: 20.20.2
Reverse proxy: Docker container nginx
Nginx host config: /home/web/conf.d/shuanglu.uway.click.conf
Certificate host directory: /home/web/certs
```

SSH is available through Tailscale. Public TCP port 22 is intentionally blocked.

```bash
ssh uway@linode-singapore
ssh root@linode-singapore
```

Tracked production templates:

```txt
ops/systemd/shuanglu.service
ops/systemd/shuanglu-certbot-renew.service
ops/systemd/shuanglu-certbot-renew.timer
ops/nginx/shuanglu.uway.click.conf
ops/scripts/deploy-certificate.sh
```

### Release Procedure

The supported release command is:

```bash
./scripts/deploy-production.sh
```

It requires:

- A clean `main` working tree.
- Local `HEAD` equal to `origin/main`.
- Node.js 20 selected through `.nvmrc`.
- Working Tailscale SSH access to `root@linode-singapore`.

The script performs:

1. Local clean-tree and revision checks.
2. Local clean install, typecheck, tests, and production build.
3. Git archive upload into a new independent release directory.
4. Server-side clean install and production build.
5. Temporary-port smoke checks for `/` and `/3d`.
6. Atomic `current` symlink switch.
7. `shuanglu.service` restart and internal HTTP check.
8. Public `/health`, `/`, and `/3d` checks.
9. Automatic restoration of the previous release if the live service fails.

Each release contains a `REVISION` file. Verify the deployed revision with:

```bash
ssh root@linode-singapore 'cat /opt/apps/shuanglu/current/REVISION'
```

### Manual Verification

```bash
./scripts/production-health-check.sh
ssh root@linode-singapore 'systemctl status shuanglu --no-pager'
ssh root@linode-singapore 'docker exec nginx nginx -t'
```

### TLS Renewal

Let's Encrypt uses the webroot `/var/www/letsencrypt`. The `shuanglu-certbot-renew.timer` unit runs the pinned `certbot/certbot:v5.6.0` container twice daily. A successful renewal runs `/usr/local/sbin/deploy-shuanglu-certificate`, which updates the certificate files mounted into the Nginx container, validates the Nginx configuration, and reloads Nginx.

Verification:

```bash
ssh root@linode-singapore 'systemctl list-timers shuanglu-certbot-renew.timer --no-pager'
ssh root@linode-singapore 'docker run --rm --network host -v /etc/letsencrypt:/etc/letsencrypt -v /home/web/letsencrypt:/var/www/letsencrypt certbot/certbot:v5.6.0 renew --dry-run --no-random-sleep-on-renew --cert-name shuanglu.uway.click'
```

### Runtime State

Online rooms are in memory only. Restarting `shuanglu.service` clears active rooms. Shuanglu currently has no production database or user-upload directory.

## GitHub

Status: synced.

- Repository: `lolouw1010/shuanglu`
- Visibility at sync time: public
- Branch: `main`
- Current verified application baseline: `0563e64d6f9ecc3afd77bb8a8363c20ac40a5353`.

The local repository excludes generated or machine-local files:

- `.next`
- `node_modules`
- `dist`
- `coverage`
- `.DS_Store`
- `.obsidian`
- `*.log`

## Verification Before Sync

Last verified before GitHub push:

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

## Historical: Aliyun GD Deployment

Status: retired after migration to Linode. The remaining sections are historical recovery and deployment records; do not use them for current releases.

Deployment target:

- Public URL: `http://47.121.182.144/`
- Server: `47.121.182.144`
- SSH user: `root`
- Application path: `/opt/shuanglu`
- Internal app address: `127.0.0.1:3002`
- Process manager: PM2
- PM2 process name: `shuanglu`
- Reverse proxy: Nginx
- Nginx config file: `/etc/nginx/conf.d/shuanglu.conf`
- Deployment source: local working-tree archive for latest visual pass; earlier deployments used local Git archives.

Runtime model:

1. Build and run the Next.js application as a Node process.
2. Bind the app to `127.0.0.1:3002`.
3. Use Nginx as the public reverse proxy on port `80`.
4. Match the IP host `47.121.182.144` in a dedicated Nginx server block.
5. Leave the existing `college.hkuway.com` server block in place.

Server commands used:

```bash
mkdir -p /opt/shuanglu
tar -xzf /tmp/shuanglu-deploy-b7b9e55.tgz -C /opt/shuanglu
cd /opt/shuanglu
npm ci
npm run build
pm2 start npm --name shuanglu -- start -- --hostname 127.0.0.1 --port 3002
pm2 save
nginx -t
systemctl reload nginx
```

Verification:

```bash
curl -I --max-time 10 http://127.0.0.1:3002/
```

Result:

```txt
HTTP/1.1 200 OK
```

```bash
curl -s --max-time 20 http://47.121.182.144/
```

Result:

```txt
The public response contains <title>双陆 Shuanglu.
```

Operational notes:

- The server's existing Nginx config already serves `college.hkuway.com`.
- The Shuanglu app uses a separate Nginx server block for `47.121.182.144`, so the existing site was not intentionally replaced.
- The server could not reliably fetch the GitHub repository directly during deployment, so the deployed package was uploaded from the local verified Git commit.
- `npm ci` reported 7 moderate severity dependency advisories. They were not auto-fixed because `npm audit fix --force` may introduce breaking changes.

## 2026-05-01 Recovery Notes

After deploying the bar re-entry UX fix, the server became unresponsive during an interrupted dependency install. The instance was rebooted from the Aliyun console.

Observed after reboot:

- Nginx was online.
- Public HTTP returned `502 Bad Gateway`.
- PM2 process `shuanglu` was repeatedly restarting.
- `pm2 logs shuanglu` showed `next: not found`, then `Bus error (core dumped)` after a partial repair attempt.

Recovery steps:

```bash
pm2 stop shuanglu
cd /opt/shuanglu
mv node_modules node_modules.broken_20260501_183014
npm ci --no-audit --no-fund
mkdir -p /opt/shuanglu_backups
mv /opt/shuanglu/node_modules.broken_* /opt/shuanglu_backups/
npm run build
pm2 restart shuanglu --update-env
pm2 save
```

Important operational lesson:

- Do not leave backup directories such as `node_modules.broken_*` inside the Next.js project root. Next.js/TypeScript may scan them during build.
- If a dependency install is interrupted, prefer moving `node_modules` out of the app directory and running a clean `npm ci --no-audit --no-fund`.

Recovery verification:

```bash
curl -I --max-time 10 http://127.0.0.1:3002/
curl -I --max-time 20 http://47.121.182.144/
```

Result:

```txt
Both internal Next.js and public Nginx endpoints returned HTTP 200.
The public JavaScript bundle contains 点这里复马.
```

## 2026-05-03 Visual Board Deployment

Status: deployed.

Purpose:

- Publish the first 3D-like lacquer-board visual pass directly to Aliyun GD.
- Include the new board shell, board point styling, and future piece asset slots.

Deployment package:

```txt
/tmp/shuanglu-visual-20260502-2349.tgz
```

Server upload target:

```txt
/tmp/shuanglu-visual-20260502-2349.tgz
```

Build directory:

```txt
/opt/shuanglu_release_20260502_2349
```

Previous production backup:

```txt
/opt/shuanglu_backups/shuanglu_before_visual_20260502_2349
```

Commands used:

```bash
tar -xzf /tmp/shuanglu-visual-20260502-2349.tgz -C /opt/shuanglu_release_20260502_2349
cd /opt/shuanglu_release_20260502_2349
npm ci --no-audit --no-fund
npm run build
pm2 stop shuanglu
mv /opt/shuanglu /opt/shuanglu_backups/shuanglu_before_visual_20260502_2349
mv /opt/shuanglu_release_20260502_2349 /opt/shuanglu
cd /opt/shuanglu
pm2 restart shuanglu --update-env
pm2 save
nginx -t
systemctl reload nginx
```

Verification:

```bash
curl -I --max-time 10 http://127.0.0.1:3002/
curl -I --max-time 20 http://47.121.182.144/
curl -s --max-time 20 http://47.121.182.144/_next/static/chunks/app/page-25097f5190129d22.js
```

Result:

```txt
Internal Next.js endpoint returned HTTP 200.
Public Nginx endpoint returned HTTP 200.
PM2 process shuanglu is online.
Nginx configuration test passed.
Public JavaScript bundle contains board-scene, board-shell, board-perspective, and white-horse-idle.
```

Open deployment note:

- This deployment used the local working tree for the server cutover, then the same visual changes were committed and pushed to GitHub as `47d6f60`.

## 2026-05-03 Online Room Deployment

Status: deployed.

## 2026-06-11 Parchment 2D Interface Deployment

Status: deployed.

Purpose:

- Publish the light parchment 2D interface pass based on the approved reference composition.
- Keep the existing rules engine, AI logic, online room model, and isolated `/3d` route unchanged.

Source:

```txt
Commit: 1f588f3178bdcba40820e0d1b583a9b4a822afd4
Local workspace: /Users/lizhe/Projects/shuanglu
```

Deployment package:

```txt
/tmp/shuanglu-parchment-1f588f3.tgz
```

Server paths:

```txt
Release: /opt/shuanglu_release_parchment_20260611_2156
Backup: /opt/shuanglu_backups/shuanglu_before_parchment_20260611_2156
Production: /opt/shuanglu
```

Verification:

```txt
npx tsc --noEmit passed locally.
npm test passed locally: 10 test files, 38 tests.
npm run build passed locally.
Server npm run build passed.
PM2 process shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
Public / returned HTTP 200.
Public /3d returned HTTP 200.
Internal http://127.0.0.1:3002/ returned HTTP 200.
Public CSS contains parchment-game-shell, character-scroll-panel, topbar-icon-button, and point-action-chip.
```

Notes:

- No local web service was started.
- The deployment used a Git archive from the synced commit rather than an uncommitted working tree.

## 2026-06-11 2D State Reference Deployment

Status: deployed to Aliyun GD; GitHub synced; BigNAS push pending.

Purpose:

- Publish the refined 2D parchment state layout based on two additional state reference images.
- Reduce the 2D top HUD to round/current action plus dice.
- Move borne-off and bar state emphasis into side-panel circular tracks.

Source:

```txt
Commit: bcf8e2f13fe77cfb9b55d92f4274cbb15a522406
Local workspace: /Users/lizhe/Projects/shuanglu
```

Deployment package:

```txt
/tmp/shuanglu-2d-state-bcf8e2f.tgz
```

Server paths:

```txt
Release: /opt/shuanglu_release_2d_state_20260611_2330
Backup: /opt/shuanglu_backups/shuanglu_before_2d_state_20260611_2330
Production: /opt/shuanglu
```

Verification:

```txt
npx tsc --noEmit passed locally.
npm test passed locally: 10 test files, 38 tests.
npm run build passed locally.
Server npm run build passed.
PM2 process shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
Public / returned HTTP 200.
Public /3d returned HTTP 200.
Reference images returned HTTP 200 from /assets/concepts/.
Public CSS contains parchment-round-strip, round-status-plaque, character-track-slots, and character-track-slot-filled.
```

Git mirror note:

```txt
GitHub main: bcf8e2f
BigNAS main: f9cb3b2
```

`git push bignas main` hung twice during receive-pack. `git ls-remote bignas refs/heads/main` still responded, so the NAS remote is reachable but not currently accepting the push reliably. Retry BigNAS sync later before relying on it as current.

Resolution on 2026-06-12:

```txt
git push --progress bignas main succeeded.
GitHub main: 092ace8
BigNAS main: 092ace8
```

## 2026-06-12 Reference Portrait Deployment

Status: deployed to Aliyun GD; GitHub synced; BigNAS synced after a later retry with progress output.

Purpose:

- Replace the 2D side-panel portraits with crops from the user-provided reference UI.
- Fix the live game-state crop problem where character heads could be hidden.
- Move portrait rendering from `object-fit: cover` to `object-fit: contain` so heads and upper bodies remain visible.

Source:

```txt
Commit: bc7485d
Local workspace: /Users/lizhe/Projects/shuanglu
```

Deployment package:

```txt
/tmp/shuanglu-reference-portraits-bc7485d.tgz
```

Server paths:

```txt
Release: /opt/shuanglu_release_reference_portraits_20260612_0032
Backup: /opt/shuanglu_backups/shuanglu_before_reference_portraits_20260612_0032
Production: /opt/shuanglu
```

Verification:

```txt
npx tsc --noEmit passed locally.
npm test passed locally: 10 test files, 38 tests.
npm run build passed locally.
Server npm run build passed.
PM2 process shuanglu restarted and is online.
Nginx configuration test passed and reloaded.
Public / returned HTTP 200.
Public character portrait assets returned HTTP 200.
Created online room 818E6A for visual check.
Captured actual game-state screenshot at /tmp/shuanglu-screens/game-reference-portraits.png.
Visual check confirmed both character heads and upper bodies are visible in the live game layout.
```

Source commit:

```txt
0108b27 Add online room play MVP
```

Purpose:

- Publish the first online friend-play MVP.
- Add room-code creation, joining, polling sync, server-side roll validation, and server-side move validation.

Deployment package:

```txt
/tmp/shuanglu-online-0108b27.tgz
```

Server upload target:

```txt
/tmp/shuanglu-online-0108b27.tgz
```

Build directory:

```txt
/opt/shuanglu_release_online_0108b27
```

Previous production backup:

```txt
/opt/shuanglu_backups/shuanglu_before_online_0108b27
```

Commands used:

```bash
tar -xzf /tmp/shuanglu-online-0108b27.tgz -C /opt/shuanglu_release_online_0108b27
cd /opt/shuanglu_release_online_0108b27
npm ci --no-audit --no-fund
npm run build
pm2 stop shuanglu
mv /opt/shuanglu /opt/shuanglu_backups/shuanglu_before_online_0108b27
mv /opt/shuanglu_release_online_0108b27 /opt/shuanglu
cd /opt/shuanglu
pm2 restart shuanglu --update-env
pm2 save
nginx -t
systemctl reload nginx
```

Verification:

```bash
curl -I --max-time 20 http://47.121.182.144/
curl -s --max-time 20 -X POST http://47.121.182.144/api/rooms \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"codex-white-test"}'
curl -s --max-time 20 -X POST http://47.121.182.144/api/rooms/E0FCE0 \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"codex-black-test","action":"join"}'
curl -s --max-time 20 'http://47.121.182.144/api/rooms/E0FCE0?playerId=codex-white-test'
curl -s --max-time 20 -X POST http://47.121.182.144/api/rooms/E0FCE0 \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"codex-white-test","action":"roll"}'
curl -s --max-time 20 -X POST http://47.121.182.144/api/rooms/E0FCE0 \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"codex-white-test","action":"move","from":12,"to":6}'
```

Result:

```txt
Public app endpoint returned HTTP 200.
PM2 process shuanglu is online.
Nginx configuration test passed.
POST /api/rooms created room E0FCE0 and seated creator as white.
POST /api/rooms/E0FCE0 with join seated second player as black.
GET /api/rooms/E0FCE0 returned the room to the white player.
POST roll updated currentRoll and diceSteps server-side.
POST move applied a legal white move from 12 to 6 and updated moveHistory.
```

Operational note:

- Online rooms are in-memory in the Next.js Node process. Restarting PM2 clears active rooms.

## 2026-05-04 3D Isolated Test Route Deployment

Status: deployed.

Source commit:

```txt
7f73e37 Isolate 3D table test route
```

Purpose:

- Keep the stable online play flow on `/`.
- Add the experimental 3D table scene behind `/3d` and the `3D测试` menu entry.
- Add shareable online room links using `?room=<ROOM_ID>`.

Deployment package:

```txt
/tmp/shuanglu-3d-isolated-7f73e37.tgz
```

Server build directory:

```txt
/opt/shuanglu_release_3d_isolated_7f73e37
```

Previous production backup:

```txt
/opt/shuanglu_backups/shuanglu_before_3d_isolated_7f73e37
```

Commands used:

```bash
tar -xzf /tmp/shuanglu-3d-isolated-7f73e37.tgz -C /opt/shuanglu_release_3d_isolated_7f73e37
cd /opt/shuanglu_release_3d_isolated_7f73e37
npm ci --no-audit --no-fund
npm run build
pm2 stop shuanglu
mv /opt/shuanglu /opt/shuanglu_backups/shuanglu_before_3d_isolated_7f73e37
mv /opt/shuanglu_release_3d_isolated_7f73e37 /opt/shuanglu
cd /opt/shuanglu
pm2 restart shuanglu --update-env
pm2 save
nginx -t
systemctl reload nginx
```

Verification:

```bash
curl -I --max-time 20 http://47.121.182.144/
curl -I --max-time 20 http://47.121.182.144/3d
curl -s --max-time 20 -X POST http://47.121.182.144/api/rooms \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"codex-share-test"}'
curl -I --max-time 20 'http://47.121.182.144/?room=77E484'
```

Result:

```txt
Public root path returned HTTP 200.
Public /3d path returned HTTP 200.
POST /api/rooms created room 77E484.
Public ?room=77E484 share URL returned HTTP 200.
PM2 process shuanglu is online.
Nginx configuration test passed.
```

Operational notes:

- `camera-controls@3.1.0`, pulled by the 3D dependency stack, warns that it prefers Node >=20.11.0. The server currently runs Node 18.19.1. The production build passed, but runtime QA on `/3d` is still required.
- The stable online play flow remains available on `/`; `/3d` is experimental.

## 2026-05-05 3D Horse Scale Deployment

Status: deployed after Aliyun instance reboot and recovery.

Purpose:

- Publish the `/3d` horse-to-board scale correction.
- Stop local development services so the user's laptop does not keep running the WebGL dev server.

Local actions completed:

- Stopped local project listeners on `127.0.0.1:3001` and `127.0.0.1:3004`.
- Verified no local listener remained on ports `3001` or `3004`.
- Ran local production build successfully:

```bash
npm run build
```

Result:

```txt
Next.js production build passed.
Routes include / and /3d.
```

Deployment package:

```txt
/tmp/shuanglu-3d-scale-20260505_1458.tgz
```

Server upload target:

```txt
/tmp/shuanglu-3d-scale-20260505_1458.tgz
```

Server release directory:

```txt
/opt/shuanglu_release_3d_scale_20260505_1458
```

Server actions completed before blockage:

```bash
scp /tmp/shuanglu-3d-scale-20260505_1458.tgz root@47.121.182.144:/tmp/shuanglu-3d-scale-20260505_1458.tgz
mkdir -p /opt/shuanglu_release_3d_scale_20260505_1458 /opt/shuanglu_backups
tar -xzf /tmp/shuanglu-3d-scale-20260505_1458.tgz -C /opt/shuanglu_release_3d_scale_20260505_1458
cd /opt/shuanglu_release_3d_scale_20260505_1458
npm ci --no-audit --no-fund
```

Initial blockage:

- `npm ci --no-audit --no-fund` emitted Node engine warnings already known from prior deployments, then stopped producing output.
- SSH later failed with `Connection timed out during banner exchange`.
- Public HTTP verification also timed out.
- The SSH session running `npm ci` ended with `Connection reset by peer`.

Important state boundary:

- Production PM2 cutover was not executed.
- `/opt/shuanglu` was not intentionally replaced during this attempt.
- No `pm2 restart shuanglu` or `systemctl reload nginx` command was reached.

Required recovery:

1. Reboot or recover the Aliyun instance from the provider console if SSH remains unavailable.
2. After SSH returns, inspect and stop any leftover `npm ci` process.
3. Prefer a lightweight release path because this version did not add dependencies:
   - copy `/opt/shuanglu/node_modules` into `/opt/shuanglu_release_3d_scale_20260505_1458`, or
   - run `npm ci` only after confirming the server has enough free memory and I/O headroom.
4. Build the release, then cut over PM2 only after `npm run build` succeeds.

Recovery completed:

- User rebooted the Aliyun instance from the provider side.
- SSH and public TCP connectivity recovered.
- Server uptime after recovery showed low load.
- The partial `node_modules` left by the interrupted install was incomplete and failed `next build` with `next: not found`.
- The partial dependency directory was moved out of the release root to:

```txt
/opt/shuanglu_backups/partial_node_modules/node_modules.partial_20260505_2000
```

- Copied the known-good dependency directory from current production:

```bash
cp -a /opt/shuanglu/node_modules /opt/shuanglu_release_3d_scale_20260505_1458/node_modules
```

- Rebuilt the release successfully:

```bash
cd /opt/shuanglu_release_3d_scale_20260505_1458
npm run build
```

Result:

```txt
Next.js production build passed.
Routes include / and /3d.
```

Production cutover completed:

```bash
pm2 stop shuanglu
mv /opt/shuanglu /opt/shuanglu_backups/shuanglu_before_3d_scale_20260505_2005
mv /opt/shuanglu_release_3d_scale_20260505_1458 /opt/shuanglu
cd /opt/shuanglu
pm2 restart shuanglu --update-env
pm2 save
nginx -t
systemctl reload nginx
```

Verification:

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
POST /api/rooms created room 89E372 and seated creator as white.
PM2 process shuanglu is online with cwd /opt/shuanglu.
Nginx configuration test passed.
```

Build artifact check:

```txt
.next/static/chunks/289.18259aa6c1daf79d.js contains 博物复原桌面.
.next/static/chunks/289.18259aa6c1daf79d.js contains scale:o?.4:.35.
```

Operational notes:

- Historical `shuanglu-error.log` still contains old `next: not found`, `Bus error`, and stale Server Action lines from earlier deployments. The current restart output shows `next start` ready on `127.0.0.1:3002`.
- The partial dependency directory must remain outside `/opt/shuanglu`; keeping broken dependency backups in a project root can make Next.js scan them during build.


## 2026-05-08 2D Usability Deployment

Purpose:

- Deploy the 2D board usability pass that restores clearer source selection and legal landing feedback after the bottle-shaped piece update.
- Preserve the MiniMac cloud-only runtime policy: no local Next.js service was started.

Local artifact:

```txt
/tmp/shuanglu-2d-usability-20260508-2206.tgz
```

Server release directory:

```txt
/opt/shuanglu_release_2d_usability_20260508_2206
```

Server backup directory:

```txt
/opt/shuanglu_backups/shuanglu_before_2d_usability_20260508_2206
```

Deployment method:

- Uploaded the working-tree archive to `/tmp/` on Aliyun GD.
- Extracted into a fresh release directory.
- Reused the existing production `node_modules` directory to avoid another heavy dependency install.
- Ran `npm run build` on the server.
- Replaced `/opt/shuanglu` only after the server build passed.
- Restarted only PM2 process `shuanglu`.
- Ran `nginx -t` before reloading Nginx.

Verification:

```txt
Server npm run build passed.
PM2 shuanglu is online.
Nginx configuration test passed.
http://47.121.182.144/ returned HTTP 200.
http://47.121.182.144/3d returned HTTP 200.
POST /api/rooms created room D8F1F1 and seated creator as white.
Cloud build artifacts contain 点取, 落马, and board-action-guide.
```

Non-Shuanglu services observed but not changed:

```txt
gaokao-sprint-coach online
school-application online
```

## 2026-06-15 Point/Layout Fix Deployment Attempt

Purpose:

- Deploy the 2D board point/horse coordination and portrait head-crop fix.
- Preserve gameplay logic; this was a visual-only pass.

Source state:

```txt
Working tree after local point/layout edits.
```

Local artifact:

```txt
/tmp/shuanglu-point-layout-fix-20260615214151.tgz
```

Local verification before deployment:

```txt
npx tsc --noEmit passed.
npm test passed: 10 test files, 38 tests.
npm run build passed.
```

Deployment result:

```txt
Incomplete / unverified.
```

Observed failure mode:

- The archive upload completed and the remote deployment command started.
- Remote output reached tar extraction and npm engine warnings.
- The SSH session then stopped producing output.
- A separate HTTP check to `http://47.121.182.144/` timed out after 10 seconds.
- Repeated SSH checks timed out during banner exchange.
- Local hung SSH sessions were terminated to avoid leaving Codex with active stalled processes.

Recovery requirement:

```txt
When Aliyun SSH recovers, inspect /opt/shuanglu, pm2 status, nginx status, and disk usage.
If /opt/shuanglu is incomplete or PM2 is unhealthy, restore from the latest good backup or rerun deployment.
Do not mark this visual fix as cloud-deployed until HTTP 200, PM2 online, Nginx test, and a fresh cloud screenshot are captured.
```

## 2026-06-16 Aliyun Reboot Recovery

Trigger:

- The interrupted point/layout deployment left `/opt/shuanglu` incomplete.
- After the user rebooted the server, SSH became reachable again.

Observed broken state:

```txt
/opt/shuanglu existed but had no .next directory.
PM2 process shuanglu was online but restarting repeatedly.
PM2 error log showed: sh: 1: next: not found.
Nginx was active and nginx -t passed.
Root filesystem: 40G total, 11G used, 28G available, 28% used.
```

Recovery:

```txt
pm2 stop shuanglu
mv /opt/shuanglu /opt/shuanglu_backups/shuanglu_broken_after_reboot_20260616_001132
cp -a /opt/shuanglu_backups/shuanglu_before_point_layout_fix_20260615_214256 /opt/shuanglu
pm2 restart shuanglu --update-env
pm2 save
nginx -t
systemctl reload nginx
```

Recovered runtime:

```txt
PM2 shuanglu online.
127.0.0.1:3002 returned HTTP 200.
http://47.121.182.144/ returned HTTP 200.
Cloud room A9D96C created.
Cloud screenshot captured at /tmp/shuanglu-screens/game-recovery-check-20260616001747.png.
```

Deployment rule update:

- Do not delete or replace `/opt/shuanglu` before the new release has built successfully.
- Future deploys should build in a separate release directory, then atomically switch or copy the verified release into place.
- Keep the previous complete runtime until the new runtime returns HTTP 200 through Nginx.

## 2026-06-17 Board Texture Hotfix

Purpose:

- Remove the large left/right side circles baked into the 2D parchment board texture.
- Avoid a full application deployment because only one static public PNG changed.

Changed asset:

```txt
public/assets/ui/2d-board-texture.png
```

Local verification:

```txt
npx tsc --noEmit passed.
npm test passed: 10 test files, 38 tests.
npm run build passed.
```

Cloud method:

```txt
cp /opt/shuanglu/public/assets/ui/2d-board-texture.png /opt/shuanglu_backups/2d-board-texture-before-remove-side-circles-20260617_023141.png
scp public/assets/ui/2d-board-texture.png root@47.121.182.144:/opt/shuanglu/public/assets/ui/2d-board-texture.png
nginx -t
```

Runtime impact:

```txt
PM2 was not restarted.
No application code or build directory was replaced.
PM2 shuanglu remained online.
```

Verification:

```txt
Cloud room 06495C was created.
Cloud screenshot captured at /tmp/shuanglu-screens/game-remove-side-circles-20260617023305.png.
Nginx configuration test passed.
```

## 2026-06-21 Generated Dice UI Deployment

Purpose:

- Deploy six normalized faux-3D dice PNGs and render them in the live parchment HUD.

Deployment method:

- Uploaded the source archive without replacing the live runtime.
- Extracted to an independent directory under `/opt/shuanglu_releases`.
- Hard-linked the existing production `node_modules` into the release directory.
- Ran `npm run build` in the independent release directory.
- Started the release on temporary port `3102`.
- Verified the page and `dice-6.png` asset over HTTP on the temporary port.
- Stopped only PM2 process `shuanglu` after the smoke test passed.
- Moved the previous runtime to:

```txt
/opt/shuanglu_backups/shuanglu_before_dice_ui_20260621_215030
```

- Moved the verified release into `/opt/shuanglu`.
- Restarted PM2 process `shuanglu`, saved the PM2 list, tested Nginx, and reloaded Nginx.

Verification:

```txt
Local npx tsc --noEmit passed.
Local npm test passed: 10 test files, 38 tests.
Local npm run build passed.
Server npm run build passed.
Temporary release HTTP smoke test passed on 127.0.0.1:3102.
Final runtime returned HTTP 200 on 127.0.0.1:3002.
Public URL returned HTTP 200.
PM2 shuanglu is online.
Nginx configuration test passed.
Cloud room C2B3E1 rolled 5-3.
Cloud screenshot captured at /tmp/shuanglu-screens/game-dice-assets-review.png.
```

## 2026-06-13 HUD and Portrait Alignment Deployment

Purpose:

- Deploy the 2D top HUD and side portrait alignment pass after user feedback that the round/dice display and double-framed character panels still did not match the supplied reference.
- Keep gameplay logic, online room behavior, and 3D technical view behavior unchanged.
- Preserve cloud-only runtime testing on MiniMac.

Application code commit:

```txt
7a55042 Align parchment HUD and portraits
```

Final local artifact:

```txt
/tmp/shuanglu-hud-portrait-align-v2-20260613151314.tgz
```

Final installed server path:

```txt
/opt/shuanglu
```

Final server backup directory:

```txt
/opt/shuanglu_backups/shuanglu_before_hud_portrait_align_v2_20260613_151429
```

Deployment method:

- Uploaded the working-tree archive to `/tmp/` on Aliyun GD.
- Extracted into a fresh release directory.
- Reused the existing production `node_modules` directory.
- Ran `npm run build` on the server.
- Replaced `/opt/shuanglu` only after the server build passed.
- Restarted only PM2 process `shuanglu`.
- Ran `nginx -t` before reloading Nginx.

Verification:

```txt
Local npx tsc --noEmit passed.
Local npm test passed: 10 test files, 38 tests.
Local npm run build passed.
Server npm run build passed.
PM2 shuanglu is online.
Nginx configuration test passed.
Cloud room 413931 was created for final visual QA.
Cloud screenshot captured at /tmp/shuanglu-screens/game-hud-portrait-align-v2.png.
```

Non-Shuanglu services observed but not changed:

```txt
gaokao-sprint-coach online
school-application online
```

## 2026-06-15 Generated PNG UI Asset Deployment

Purpose:

- Deploy the generated parchment UI PNG asset pass to the 2D game surface.
- Keep the deployed runtime on Aliyun only; no local web service was started.
- Do not mount generated dice PNGs yet.
- Remove requests for missing horse-piece PNGs until final piece assets are available.

Source scope:

```txt
src/app/globals.css
src/components/BoardPoint.tsx
src/components/CharacterPanel.tsx
src/data/assets.ts
public/assets/characters/li-qingzhao-halfbody.png
public/assets/characters/song-emperor-halfbody.png
public/assets/ui/board-center-medallion.png
public/assets/ui/button-paper-empty.png
public/assets/ui/button-red-empty.png
public/assets/ui/command-band-empty.png
public/assets/ui/footer-nav-bar-empty.png
public/assets/ui/point-ring-empty.png
public/assets/ui/round-plaque-empty.png
public/assets/ui/side-panel-parchment-left.png
public/assets/ui/side-panel-parchment-right.png
```

Final local artifact:

```txt
/tmp/shuanglu-png-assets-cssfix-20260615033151.tgz
```

Final server backup directory:

```txt
/opt/shuanglu_backups/shuanglu_before_png_assets_cssfix_20260615_033923
```

Deployment method:

- Uploaded a working-tree archive to `/tmp/` on Aliyun GD.
- Extracted into a fresh release directory.
- Reused the existing production `node_modules` directory.
- Ran `npm run build` on the server before switching `/opt/shuanglu`.
- Restarted PM2 process `shuanglu`.
- Ran `nginx -t` before reloading Nginx.

Operational note:

- An intermediate deployment failed because `/` reached 100% disk usage while copying `node_modules`.
- Cleaned only Shuanglu-owned failed release directories, uploaded `/tmp/shuanglu-*.tgz` artifacts, and older `/opt/shuanglu_backups/shuanglu_before_*` backups.
- Kept the latest three Shuanglu backups.
- Post-cleanup root filesystem state: 28G available, 25% used.

Verification:

```txt
Local npx tsc --noEmit passed.
Local npm test passed: 10 test files, 38 tests.
Local npm run build passed.
Server npm run build passed.
PM2 shuanglu is online.
Nginx configuration test passed.
Cloud room 1248E8 was created for visual QA.
Cloud screenshot captured at /tmp/shuanglu-screens/game-png-assets-cssfix.png.
```

## 2026-06-15 2D UI Tuning Deployment

Purpose:

- Fine-tune the mounted parchment PNG interface before requesting additional image assets.
- Keep dice and horse-piece asset generation out of scope for this pass.
- Preserve cloud-only runtime testing.

Source scope:

```txt
src/app/globals.css
docs/DEV_LOG.md
docs/DEPLOYMENT.md
docs/PROJECT_STATUS.md
```

Final local artifact:

```txt
/tmp/shuanglu-ui-tuning-final-20260615172731.tgz
```

Final server backup directory:

```txt
/opt/shuanglu_backups/shuanglu_before_ui_tuning_final_20260615_172912
```

Deployment method:

- Uploaded a working-tree archive to `/tmp/` on Aliyun GD.
- Extracted into a fresh release directory.
- Reused the existing production `node_modules` directory.
- Ran `npm run build` on the server.
- Swapped `/opt/shuanglu` only after the server build passed.
- Restarted PM2 process `shuanglu`.
- Ran `nginx -t` before reloading Nginx.

Verification:

```txt
Local npx tsc --noEmit passed.
Local npm test passed: 10 test files, 38 tests.
Local npm run build passed.
Server npm run build passed.
PM2 shuanglu is online.
Nginx configuration test passed.
Cloud room CF6EA0 was created for visual QA.
Cloud screenshot captured at /tmp/shuanglu-screens/game-ui-tuning-final.png.
```

Cleanup:

```txt
Removed uploaded /tmp/shuanglu-*.tgz artifacts from Aliyun.
Kept the latest three Shuanglu backups.
Root filesystem after cleanup: 29G available, 25% used.
```

## 2026-06-13 Parchment Command Softening Deployment

Purpose:

- Deploy the follow-up 2D command-area visual refinement after user feedback that the small hint/command boxes still felt too rigid.
- Keep the stable 2D board and online room flow unchanged.
- Preserve cloud-only runtime testing on MiniMac.

Application code commit:

```txt
bf38063 Soften parchment command UI
```

Final local artifact:

```txt
/tmp/shuanglu-command-panel-soft-v3-20260613002059.tgz
```

Final installed server path:

```txt
/opt/shuanglu
```

Final server backup directory:

```txt
/opt/shuanglu_backups/shuanglu_before_command_panel_soft_v3_20260613_002215
```

Deployment method:

- Uploaded the working-tree archive to `/tmp/` on Aliyun GD.
- Extracted into a fresh release directory.
- Reused the existing production `node_modules` directory.
- Ran `npm run build` on the server.
- Replaced `/opt/shuanglu` only after the server build passed.
- Restarted only PM2 process `shuanglu`.
- Ran `nginx -t` before reloading Nginx.

Verification:

```txt
Local npx tsc --noEmit passed.
Local npm test passed: 10 test files, 38 tests.
Local npm run build passed.
Server npm run build passed.
PM2 shuanglu is online.
Nginx configuration test passed.
Cloud room 675921 was created for visual QA.
Cloud screenshot captured at /tmp/shuanglu-screens/game-command-panel-soft-v3.png.
```

Non-Shuanglu services observed but not changed:

```txt
gaokao-sprint-coach online
school-application online
```

## 2026-06-12 Reference Controls Deployment

Purpose:

- Deploy a closer 2D parchment UI alignment after user review.
- Remove unnecessary always-visible rule explanation panels from the active 2D screen.
- Preserve real gameplay state, online room state, legal-move highlighting, and cloud-only testing.

Source commits:

```txt
d339a6b Align 2D controls with parchment reference
16569b6 Polish parchment reference layout
6985f8d Anchor parchment scenery layer
badaa8d Prevent parchment rows from stretching
```

Final deployed commit:

```txt
badaa8d
```

Final local artifact:

```txt
/tmp/shuanglu-row-stretch-badaa8d.tgz
```

Final server release directory:

```txt
/opt/shuanglu_release_row_stretch_20260612_2028
```

Final server backup directory:

```txt
/opt/shuanglu_backups/shuanglu_before_row_stretch_20260612_2028
```

Deployment method:

- Uploaded the working-tree archive to `/tmp/` on Aliyun GD.
- Extracted into a fresh release directory.
- Reused the existing production `node_modules` directory.
- Ran `npm run build` on the server.
- Replaced `/opt/shuanglu` only after the server build passed.
- Restarted only PM2 process `shuanglu`.
- Ran `nginx -t` before reloading Nginx.

Verification:

```txt
Local npx tsc --noEmit passed.
Local npm test passed: 10 test files, 38 tests.
Local npm run build passed.
Server npm run build passed.
PM2 shuanglu is online.
Nginx configuration test passed.
http://47.121.182.144/ returned HTTP 200.
Cloud room DBDFF8 was created for visual QA.
Cloud screenshot captured at /tmp/shuanglu-screens/game-reference-final-badaa8d.png.
GitHub main and BigNAS main were both pushed through badaa8d.
```

Non-Shuanglu services observed but not changed:

```txt
gaokao-sprint-coach online
school-application online
```


## 2026-05-09 One-Window 2D Layout Deployment

Purpose:

- Deploy the 2D layout pass that reduces top HUD height, removes the fixed-width board scroll, and makes the stable 2D board playable with less viewport dragging.
- Preserve the MiniMac cloud-only runtime policy: no local Next.js service was started.

Local artifact:

```txt
/tmp/shuanglu-one-window-2d-20260509-1929.tgz
```

Server release directory:

```txt
/opt/shuanglu_release_one_window_2d_20260509_1929
```

Server backup directory:

```txt
/opt/shuanglu_backups/shuanglu_before_one_window_2d_20260509_1929
```

Deployment method:

- Uploaded the working-tree archive to `/tmp/` on Aliyun GD.
- Extracted into a fresh release directory.
- Reused the existing production `node_modules` directory.
- Ran `npm run build` on the server.
- Replaced `/opt/shuanglu` only after the server build passed.
- Restarted only PM2 process `shuanglu`.
- Ran `nginx -t` before reloading Nginx.

Verification:

```txt
Server npm run build passed.
PM2 shuanglu is online.
Nginx configuration test passed.
http://47.121.182.144/ returned HTTP 200.
http://47.121.182.144/3d returned HTTP 200.
POST /api/rooms created room C5E553 and seated creator as white.
Cloud build artifacts contain max-w-[1780px], game-compact-hud, and min-h-[clamp(6.7rem,13.2vh,9rem)].
```

Non-Shuanglu services observed but not changed:

```txt
gaokao-sprint-coach online
school-application online
```


## 2026-05-11 2D Background Art Deployment

Purpose:

- Deploy the generated Song-era study/court background image for the stable 2D interface.
- Keep the generated scene decorative and subdued so the 2D board remains readable and playable.
- Preserve the MiniMac cloud-only runtime policy: no local Next.js service was started.

Generated workspace asset:

```txt
public/assets/backgrounds/song-study-court-bg.png
```

Local artifact:

```txt
/tmp/shuanglu-2d-bg-art-20260511-2110.tgz
```

Server release directory:

```txt
/opt/shuanglu_release_2d_bg_art_20260511_2110
```

Server backup directory:

```txt
/opt/shuanglu_backups/shuanglu_before_2d_bg_art_20260511_2110
```

Deployment method:

- Uploaded the working-tree archive to `/tmp/` on Aliyun GD.
- Extracted into a fresh release directory.
- Reused the existing production `node_modules` directory.
- Ran `npm run build` on the server.
- Replaced `/opt/shuanglu` only after the server build passed.
- Restarted only PM2 process `shuanglu`.
- Ran `nginx -t` before reloading Nginx.

Verification:

```txt
Server npm run build passed.
PM2 shuanglu is online.
Nginx configuration test passed.
http://47.121.182.144/ returned HTTP 200.
http://47.121.182.144/assets/backgrounds/song-study-court-bg.png returned HTTP 200, image/png, 1,805,345 bytes.
http://47.121.182.144/3d returned HTTP 200.
POST /api/rooms created room B3568C and seated creator as white.
Cloud build artifacts contain song-study-court-bg and game-shell-bg.
```

Non-Shuanglu services observed but not changed:

```txt
gaokao-sprint-coach online
school-application online
```


## 2026-05-12 Background Visibility Fix Deployment

Purpose:

- Make the generated 2D background visibly present after user feedback that the previous deployment looked unchanged.
- Apply the generated scene to both the main menu and stable 2D game shell while preserving board readability.

Local artifact:

```txt
/tmp/shuanglu-bg-visible-20260512-1238.tgz
```

Server release directory:

```txt
/opt/shuanglu_release_bg_visible_20260512_1238
```

Server backup directory:

```txt
/opt/shuanglu_backups/shuanglu_before_bg_visible_20260512_1238
```

Verification:

```txt
Server npm run build passed.
PM2 shuanglu is online.
Nginx configuration test passed.
http://47.121.182.144/ returned HTTP 200.
http://47.121.182.144/assets/backgrounds/song-study-court-bg.png returned HTTP 200.
POST /api/rooms created room BE4ABC and seated creator as white.
Cloud build artifacts contain menu-shell-bg and the generated background reference.
```

Non-Shuanglu services observed but not changed:

```txt
gaokao-sprint-coach online
school-application online
```

## 2026-05-13 Side Character Decoration Deployment

Purpose:

- Replace the full-page generated 2D background treatment with left/right decorative character layers.
- Keep the center playfield dark, readable, and focused on board interaction.
- Preserve the MiniMac cloud-only runtime policy: no local Next.js service was started.

Local artifact:

```txt
/tmp/shuanglu-side-decor-20260513-0114.tgz
```

Server release directory:

```txt
/opt/shuanglu_release_side_decor_20260513_0114
```

Server backup directory:

```txt
/opt/shuanglu_backups/shuanglu_before_side_decor_20260513_0114
```

New public assets:

```txt
public/assets/decor/song-left-observers.png
public/assets/decor/song-right-observer.png
```

Deployment method:

- Uploaded the working-tree archive to `/tmp/` on Aliyun GD.
- Extracted into a fresh release directory.
- Reused the existing production `node_modules` directory.
- Ran `npm run build` on the server.
- Replaced `/opt/shuanglu` only after the server build passed.
- Restarted only PM2 process `shuanglu`.
- Ran `nginx -t` before reloading Nginx.

Verification:

```txt
Server npm run build passed.
PM2 shuanglu is online.
Nginx configuration test passed.
http://47.121.182.144/ returned HTTP 200.
http://47.121.182.144/assets/decor/song-left-observers.png returned HTTP 200, image/png, 836,987 bytes.
http://47.121.182.144/assets/decor/song-right-observer.png returned HTTP 200, image/png, 814,863 bytes.
POST /api/rooms created room 0A1EC4 and seated creator as white.
```

Non-Shuanglu services observed but not changed:

```txt
gaokao-sprint-coach online
school-application online
```

## 2026-05-16 2D Horse Rack Layout Deployment

Purpose:

- Replace the visually stacked 2D horse layout with smaller, individually readable pieces.
- Keep point selection and legal landing labels clear while improving the board's playability.
- Preserve the MiniMac cloud-only runtime policy: no local Next.js service was started.

Local artifact:

```txt
/tmp/shuanglu-2d-piece-rack-20260516-1116.tgz
```

Server release directory:

```txt
/opt/shuanglu_release_2d_piece_rack_20260516_1116
```

Server backup directory:

```txt
/opt/shuanglu_backups/shuanglu_before_2d_piece_rack_20260516_1116
```

Deployment method:

- Uploaded the working-tree archive to `/tmp/` on Aliyun GD.
- Extracted into a fresh release directory.
- Reused the existing production `node_modules` directory.
- Ran `npm run build` on the server.
- Replaced `/opt/shuanglu` only after the server build passed.
- Restarted only PM2 process `shuanglu`.
- Ran `nginx -t` before reloading Nginx.

Verification:

```txt
Server npm run build passed.
PM2 shuanglu is online.
Nginx configuration test passed.
http://47.121.182.144/ returned HTTP 200.
POST /api/rooms created room 6E9FAF and seated creator as white.
Cloud static CSS contains `piece-rack`.
```

Non-Shuanglu services observed but not changed:

```txt
gaokao-sprint-coach online
school-application online
```

## 2026-05-17 Expert AI Deployment

Purpose:

- Deploy the Human vs AI upgrade with full-turn move planning and deterministic tactical evaluation.
- Keep the current 2D interface unchanged while improving the black AI opponent.
- Preserve the MiniMac cloud-only runtime policy: no local Next.js service was started.

Local artifact:

```txt
/tmp/shuanglu-expert-ai-20260517-2229.tgz
```

Server release directory:

```txt
/opt/shuanglu_release_expert_ai_20260517_2229
```

Server backup directory:

```txt
/opt/shuanglu_backups/shuanglu_before_expert_ai_20260517_2229
```

Deployment method:

- Uploaded the working-tree archive to `/tmp/` on Aliyun GD.
- Extracted into a fresh release directory.
- Reused the existing production `node_modules` directory.
- Ran `npm run build` on the server.
- Replaced `/opt/shuanglu` only after the server build passed.
- Restarted only PM2 process `shuanglu`.
- Ran `nginx -t` before reloading Nginx.

Verification:

```txt
Server npm run build passed.
PM2 shuanglu is online.
Nginx configuration test passed.
http://47.121.182.144/ returned HTTP 200.
POST /api/rooms created room 67DF0C and seated creator as white.
Cloud static JavaScript contains `enterFromBar` AI weighting.
Cloud static JavaScript contains `aiProfile:"expert"` for the black AI opponent.
```

Non-Shuanglu services observed but not changed:

```txt
gaokao-sprint-coach online
school-application online
```

## 2026-05-18 Black Move Trace Deployment

Purpose:

- Deploy UI that explicitly lists every black AI move after an AI turn.
- Highlight the same black move path on the 2D board using numbered source/target chips.
- Preserve the MiniMac cloud-only runtime policy: no local Next.js service was started.

Local artifact:

```txt
/tmp/shuanglu-black-move-trace-20260518-1005.tgz
```

Server release directory:

```txt
/opt/shuanglu_release_black_move_trace_20260518_1005
```

Server backup directory:

```txt
/opt/shuanglu_backups/shuanglu_before_black_move_trace_20260518_1005
```

Deployment method:

- Uploaded the working-tree archive to `/tmp/` on Aliyun GD.
- Extracted into a fresh release directory.
- Reused the existing production `node_modules` directory.
- Ran `npm run build` on the server.
- Replaced `/opt/shuanglu` only after the server build passed.
- Restarted only PM2 process `shuanglu`.
- Ran `nginx -t` before reloading Nginx.

Verification:

```txt
Server npm run build passed.
PM2 shuanglu is online.
Nginx configuration test passed.
http://47.121.182.144/ returned HTTP 200.
POST /api/rooms created room 5180FC and seated creator as white.
Cloud static JavaScript contains `黑方刚走`.
Cloud static CSS/JavaScript contains `ai-trail-chip`.
```

Non-Shuanglu services observed but not changed:

```txt
gaokao-sprint-coach online
school-application online
```


## 2026-05-21 Expert AI Pressure Deployment

Purpose:

- Deploy a stronger Human vs AI expert profile after playtest feedback that the AI was too passive and easy to beat.
- Add heuristic pressure for tactical hitting, bar containment, re-entry blocking, consecutive made-point runs, and more aggressive tempo while preserving the stable 2D UI.
- Preserve the MiniMac cloud-only runtime policy: no local Next.js service was started.

Local artifact:

```txt
/tmp/shuanglu-ai-pressure-20260521-2314.tgz
```

Server release directory:

```txt
/opt/shuanglu_release_ai_pressure_20260521_2314
```

Server backup directory:

```txt
/opt/shuanglu_backups/shuanglu_before_ai_pressure_20260521_2314
```

Deployment method:

- Uploaded the working-tree archive to `/tmp/` on Aliyun GD.
- Extracted into a fresh release directory.
- Reused the existing production `node_modules` directory.
- Ran `npm run build` on the server.
- Replaced `/opt/shuanglu` only after the server build passed.
- Restarted only PM2 process `shuanglu`.
- Ran `nginx -t` before reloading Nginx.

Verification:

```txt
Local npm test passed: 9 test files, 35 tests.
Server npm run build passed.
PM2 shuanglu is online.
Nginx configuration test passed.
http://47.121.182.144/ returned HTTP 200.
POST /api/rooms created room A23741 and seated creator as white.
Cloud static JavaScript contains `entryBlock`.
Cloud static JavaScript contains `longestPrime`.
```

Non-Shuanglu services observed but not changed:

```txt
gaokao-sprint-coach online
school-application online
```

## 2026-05-22 Automatic Pass Notice Deployment

Purpose:

- Deploy clearer turn-pass messaging after playtest confusion about white turns ending before re-entry or before all dice appeared to be used.
- Preserve rule behavior: a turn still ends when no legal move exists for the current dice.
- Make blocked bar re-entry and unusable remaining dice explicit in local, AI, and online play.
- Preserve the MiniMac cloud-only runtime policy: no local Next.js service was started.

Local artifact:

```txt
/tmp/shuanglu-auto-pass-notice-20260522-0130.tgz
```

Server release directory:

```txt
/opt/shuanglu_release_auto_pass_notice_20260522_0130
```

Server backup directory:

```txt
/opt/shuanglu_backups/shuanglu_before_auto_pass_notice_20260522_0130
```

Deployment method:

- Uploaded the working-tree archive to `/tmp/` on Aliyun GD.
- Extracted into a fresh release directory.
- Reused the existing production `node_modules` directory.
- Ran `npm run build` on the server.
- Replaced `/opt/shuanglu` only after the server build passed.
- Restarted only PM2 process `shuanglu`.
- Ran `nginx -t` before reloading Nginx.

Verification:

```txt
Local npx tsc --noEmit passed.
Local npm test passed: 10 test files, 38 tests.
Server npm run build passed.
PM2 shuanglu is online.
Nginx configuration test passed.
http://47.121.182.144/ returned HTTP 200.
POST /api/rooms created room DDBF99 and seated creator as white.
Cloud static/server artifacts contain `没有可复马入口`.
Cloud static/server artifacts contain `剩余步数`.
```

Non-Shuanglu services observed but not changed:

```txt
gaokao-sprint-coach online
school-application online
```

## 2026-05-30 Documentation Sync Note

Purpose:

- Record that the live game endpoint remains available while the repository is being synchronized to GitHub with updated documentation.
- No server restart or deployment was required for this documentation-only note.

Verification:

```txt
http://47.121.182.144/ returned HTTP 200.
Stable playable route: /
3D visual spike route: /3d
```

## 2026-05-31 BigNAS Git Mirror

Purpose:

- Add a NAS-hosted Git mirror for the Shuanglu program in addition to GitHub.
- Remote host alias: `uway-nas` in local SSH config.
- NAS repository path: `/var/services/homes/louieadmin/git/shuanglu.git`.
- Local Git remote name: `bignas`.

Verification plan:

```txt
git push bignas main
git ls-remote bignas
```

## 2026-06-12 Parchment Design Alignment Deployment

Purpose:

- Deploy the 2D parchment design-alignment pass based on the supplied reference UI.
- Keep the live game dynamic and playable; do not replace the board with a static image.
- Preserve cloud-only testing on MiniMac.

Source commits:

```txt
8724c84 Align 2D game layout with design reference
d7c0da8 Refine parchment board layout
686e497 Show full parchment top banner
6b26384 Crop parchment banner status artwork
60488ae Remove banner crop edge
```

Final deployed commit:

```txt
60488ae
```

Final local artifact:

```txt
/tmp/shuanglu-banner-edge-60488ae.tgz
```

Final server release directory:

```txt
/opt/shuanglu_release_banner_edge_20260612_1550
```

Final server backup directory:

```txt
/opt/shuanglu_backups/shuanglu_before_banner_edge_20260612_1550
```

Deployment method:

- Uploaded the working-tree archive to `/tmp/` on Aliyun GD.
- Extracted into a fresh release directory.
- Reused the existing production `node_modules` directory.
- Ran `npm run build` on the server.
- Replaced `/opt/shuanglu` only after the server build passed.
- Restarted only PM2 process `shuanglu`.
- Ran `nginx -t` before reloading Nginx.

Verification:

```txt
Local npx tsc --noEmit passed.
Local npm test passed: 10 test files, 38 tests.
Local npm run build passed.
Server npm run build passed.
PM2 shuanglu is online.
Nginx configuration test passed.
http://47.121.182.144/ returned HTTP 200.
Cloud room 4B2FE4 was created for visual QA.
Cloud screenshot captured at /tmp/shuanglu-screens/game-design-alignment-edge-final.png.
GitHub main and BigNAS main were both pushed to 60488ae.
```

Non-Shuanglu services observed but not changed:

```txt
gaokao-sprint-coach online
school-application online
```
