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
live in a Docker volume).

```bash
# 1. build the dev image (once)
docker compose build

# 2. install dependencies into the Docker volume (once)
docker compose run --rm app npm install

# 3a. preview on your phone — opens a tunnel; scan the QR with Expo Go
docker compose up

# 3b. or preview in your browser
docker compose run --rm --service-ports app npm run web   # http://localhost:8081
```

Notes:
- Use the latest **Expo Go** (it must match Expo SDK 54).
- On the same Wi-Fi you can use LAN instead of the tunnel:
  `REACT_NATIVE_PACKAGER_HOSTNAME=<your-LAN-IP> docker compose up`
  (open the port if your firewall blocks it: `sudo firewall-cmd --add-port=8081/tcp`).
- Stop with `Ctrl+C` / `docker compose down`. **Avoid `docker compose down -v`** —
  the `-v` deletes the `node_modules` volume (re-run step 2 if you do).
- Works with Podman too (`podman compose ...`).

## Run (local, without Docker)

```bash
npm install
npx expo start      # press w for web, or scan the QR with Expo Go
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
Dockerfile              # containerized dev environment
docker-compose.yml      # build / run / test commands
eslint.config.js        # flat ESLint config
```
