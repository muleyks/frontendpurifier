# Cross-platform LAN launcher (Windows PowerShell).
# Detects this machine's LAN IPv4, tells Expo to advertise it (so phones can scan
# the QR and reach Metro on :8081), then starts the Docker dev server.
# Run:  powershell -ExecutionPolicy Bypass -File scripts\start.ps1
# Override:  $env:REACT_NATIVE_PACKAGER_HOSTNAME="<ip>"; powershell -File scripts\start.ps1
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

$ip = $env:REACT_NATIVE_PACKAGER_HOSTNAME
if (-not $ip) {
  $ip = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -notlike "127.*" -and
      $_.IPAddress -notlike "169.254.*" -and
      $_.PrefixOrigin -ne "WellKnown" -and
      $_.InterfaceAlias -notmatch "Loopback|vEthernet|WSL|Hyper-V|VirtualBox|VMware|Default Switch"
    } |
    Sort-Object -Property SkipAsSource |
    Select-Object -First 1).IPAddress
}

if (-not $ip) {
  Write-Host "Could not auto-detect your LAN IP."
  Write-Host "Run manually:"
  Write-Host '  $env:REACT_NATIVE_PACKAGER_HOSTNAME="<your-ip>"; $env:EXPO_PACKAGER_PROXY_URL="http://<your-ip>:8081"; docker compose up'
  exit 1
}

$env:REACT_NATIVE_PACKAGER_HOSTNAME = $ip
$env:EXPO_PACKAGER_PROXY_URL = "http://${ip}:8081"

Write-Host "LAN IP detected: $ip"
Write-Host "  -> the QR should read  exp://${ip}:8081"
Write-Host "  -> wrong IP (VPN / multiple adapters)? re-run with REACT_NATIVE_PACKAGER_HOSTNAME=<ip>"
Write-Host "  -> phones must be on the SAME Wi-Fi; allow Docker / port 8081 in Defender Firewall if prompted"
Write-Host ""

docker compose up
