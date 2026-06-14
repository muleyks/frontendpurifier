# Vestel Air Purifier — Expo App

A React Native (Expo) **frontend prototype** of the Vestel Air Purifier mobile
app. It's a fully interactive, animated mock with **simulated data** — there is
**no backend, no Firebase, and no real API/device calls**. An in-app **Apple
Watch** prototype is in progress.

- **Framework:** Expo SDK 54 · React Native 0.81 · React 19.1
- **Navigation:** `@react-navigation/native-stack`
- **Visuals:** `expo-linear-gradient`, `react-native-svg`, `react-native-safe-area-context`
- **State:** in-memory React Contexts (session, rooms/devices, settings, timers) + a small air-quality simulation

## What works

- **Onboarding & auth** (interactive): language, sign in (demo account pre-filled),
  create account, email verification + password reset with industry-style
  6-digit code boxes.
- **Pairing:** add device → Wi-Fi → animated progress → success / error.
- **Dashboard & device control** with **live simulated air quality** (AQI / PM2.5 /
  TVOC drift over time and react to fan speed).
- **Controls:** fan speed, sleep mode toggles, aroma (scent / intensity / diffuser
  timer), filter maintenance + replace, analytics (switchable ranges), automation
  presets + custom rules, notifications, firmware update, editable profile.
- Timer inputs use timer-app-style **MM:SS entry** (digits shift in from the right).

## Run (Docker — recommended, keeps your machine clean)

Everything runs in a container; nothing is installed on the host (dependencies
live in a Docker volume). Works on **Linux, macOS, and Windows** (Docker Desktop
or Podman). The dev server runs over **LAN** (no ngrok): phones on the **same
Wi-Fi** scan one QR pointed at this machine.

```bash
# 1. build the dev image (once)
docker compose build

# 2. install dependencies into the Docker volume (once)
docker compose run --rm app npm install

# 3. start the LAN dev server (auto-detects this machine's IP), then scan the QR
./scripts/start.sh                                          # Linux / macOS
powershell -ExecutionPolicy Bypass -File scripts\start.ps1  # Windows
```

The launcher prints the detected IP and the URL the QR should show
(`exp://<your-LAN-IP>:8081`). If that IP is wrong (VPN / multiple adapters), set
it yourself:

```bash
# Linux / macOS
REACT_NATIVE_PACKAGER_HOSTNAME=<ip> EXPO_PACKAGER_PROXY_URL=http://<ip>:8081 docker compose up
```
```powershell
# Windows PowerShell
$env:REACT_NATIVE_PACKAGER_HOSTNAME="<ip>"; $env:EXPO_PACKAGER_PROXY_URL="http://<ip>:8081"; docker compose up
```

### Other ways to preview

```bash
# Web — most stable, no phone needed
docker compose run --rm --service-ports app npm run web   # http://localhost:8081

# Tunnel — only if the phones are NOT on the same network as this machine
docker compose run --rm app npm run start:tunnel
```

### Presentation checklist (reliable live demo)

- Prefer a **known-good Wi-Fi or a phone hotspot**. Public/school Wi-Fi often
  blocks device-to-laptop traffic ("client isolation") even on the same network —
  a hotspot sidesteps that.
- Open the host firewall for port **8081** once:
  - **Linux/Fedora:** `sudo firewall-cmd --add-port=8081/tcp` (add `--permanent`, then `--reload`, to persist)
  - **Windows:** allow Docker / port 8081 in Defender Firewall (usually prompted)
  - **macOS:** normally allowed; otherwise allow Docker in System Settings → Network firewall
- **Disable VPN** on the host (it overrides the advertised IP).
- Verify the QR reads `exp://<real-LAN-IP>:8081` — not `172.17.x.x`, not a tunnel URL.
- Every phone needs an **Expo Go that supports SDK 54** (iOS installs only the
  current App Store version). Test two phones before presenting.
- Stop with `Ctrl+C` / `docker compose down`. **Avoid `docker compose down -v`** —
  `-v` deletes the `node_modules` volume (re-run step 2 if you do).
- Stuck "reloading"? `Ctrl+C` and re-run the launcher; to also wipe Metro's cache,
  add `--clear` (the `npm run start:clear` script).

## Run (native, without Docker)

Minimal path for a teammate who has Node 20+ but not Docker:

```bash
npm ci
# advertise this machine's IP so a phone can reach it:
REACT_NATIVE_PACKAGER_HOSTNAME=<ip> EXPO_PACKAGER_PROXY_URL=http://<ip>:8081 npm start
```
```powershell
# Windows PowerShell
npm ci
$env:REACT_NATIVE_PACKAGER_HOSTNAME="<ip>"; $env:EXPO_PACKAGER_PROXY_URL="http://<ip>:8081"; npm start
```

## Test & lint

```bash
docker compose run --rm app npm test     # Jest (jest-expo): air-quality sim + render smoke
docker compose run --rm app npm run lint # ESLint (eslint-config-expo)
```

## Project layout

```
App.js                  # screens, navigation, state contexts, components
src/sim/telemetry.js    # simulated air-quality engine (AQI banding + random walk)
__tests__/              # Jest tests
scripts/start.sh        # LAN launcher (Linux/macOS) — detects host IP, runs Docker
scripts/start.ps1       # LAN launcher (Windows PowerShell)
Dockerfile              # containerized dev environment
docker-compose.yml      # build / run / test commands
eslint.config.js        # flat ESLint config
```
