#!/usr/bin/env bash
# Cross-platform LAN launcher (Linux / macOS).
# Detects this machine's LAN IP, tells Expo to advertise it (so phones can scan
# the QR and reach Metro on :8081), then starts the Docker dev server.
# Override anytime:  REACT_NATIVE_PACKAGER_HOSTNAME=<ip> ./scripts/start.sh
set -euo pipefail
cd "$(dirname "$0")/.."

ip="${REACT_NATIVE_PACKAGER_HOSTNAME:-}"

if [ -z "$ip" ] && command -v ipconfig >/dev/null 2>&1; then   # macOS
  ip="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
fi
if [ -z "$ip" ] && command -v ip >/dev/null 2>&1; then         # Linux (route source IP)
  ip="$(ip route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src"){print $(i+1); exit}}')"
fi
if [ -z "$ip" ] && command -v hostname >/dev/null 2>&1; then   # fallback
  ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
fi

if [ -z "$ip" ]; then
  echo "Could not auto-detect your LAN IP."
  echo "Run manually:"
  echo "  REACT_NATIVE_PACKAGER_HOSTNAME=<your-ip> EXPO_PACKAGER_PROXY_URL=http://<your-ip>:8081 docker compose up"
  exit 1
fi

export REACT_NATIVE_PACKAGER_HOSTNAME="$ip"
export EXPO_PACKAGER_PROXY_URL="http://$ip:8081"

echo "LAN IP detected: $ip"
echo "  -> the QR should read  exp://$ip:8081"
echo "  -> wrong IP (VPN / multiple adapters)? re-run with REACT_NATIVE_PACKAGER_HOSTNAME=<ip>"
echo "  -> phones must be on the SAME Wi-Fi; open the host firewall for 8081 if needed"
echo "     (Fedora: sudo firewall-cmd --add-port=8081/tcp)"
echo

exec docker compose up
