@echo off
title Stop ServiceOps portal

rem Kills whatever is listening on 5199 — the hidden logon copy has no window to close,
rem so this is the way to stop it without a restart.
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 5199 -State Listen -ErrorAction SilentlyContinue; if($c){ $c | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }; Write-Host '  Portal stopped.' } else { Write-Host '  The portal was not running.' }"

echo.
echo   Start it again with START-PORTAL.cmd, or by restarting your PC.
echo.
timeout /t 4 /nobreak >nul
