# Dev container for the Expo app. Host stays clean: nothing is installed on the
# host; node_modules lives in a Docker volume.
FROM node:20-bookworm

# File watching works over bind mounts only with polling.
ENV CHOKIDAR_USEPOLLING=1 \
    WATCHPACK_POLLING=true \
    EXPO_NO_TELEMETRY=1 \
    npm_config_update_notifier=false

# System libs required by the bundled React Native DevTools (Chromium shell);
# without these, `expo start` logs a libnspr4.so load error.
RUN apt-get update && apt-get install -y --no-install-recommends \
      libnspr4 libnss3 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
      libdrm2 libgbm1 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \
      libxrandr2 libasound2 libpangocairo-1.0-0 libgtk-3-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Pre-create node_modules owned by the unprivileged `node` user (uid 1000) so a
# named volume mounted there inherits writable ownership; files written to the
# bind-mounted /app (lockfile, etc.) land as uid 1000 = the host user.
RUN mkdir -p /app/node_modules && chown -R node:node /app
USER node

# Metro (8081), legacy Expo (19000-19002), Expo web (19006).
EXPOSE 8081 19000 19001 19002 19006

# Default: real-device preview over a tunnel (scan the QR with Expo Go).
CMD ["npx", "expo", "start", "--tunnel"]
