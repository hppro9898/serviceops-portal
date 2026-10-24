@echo off
title ServiceOps portal
cd /d "%~dp0"

rem Already running? Then this is someone asking to SEE the portal, not to start a
rem second copy of it — --strictPort would refuse the port and the window would just
rem flash an error. Open the browser and get out of the way.
powershell -NoProfile -Command "try{ if((Invoke-WebRequest 'http://localhost:5199/' -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200){ Start-Process 'http://localhost:5199/'; exit 9 } }catch{ exit 0 }"
if errorlevel 9 (
  echo.
  echo   The portal is already running - opening it in your browser.
  timeout /t 2 /nobreak >nul
  exit /b
)

echo.
echo   Starting the ServiceOps portal...
echo   The browser opens by itself once it is ready.
echo.
echo   Keep this window open - closing it stops the portal.
echo.

rem index.html cannot be opened from disk: it is a Vite entry, so the pages are
rem compiled on demand, and Chrome blocks module scripts over file:// anyway.
rem Poll until the port actually answers rather than guessing a delay.
start "" powershell -NoProfile -Command "$u='http://localhost:5199/'; for($i=0;$i -lt 90;$i++){ try{ if((Invoke-WebRequest $u -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200){ Start-Process $u; break } }catch{} Start-Sleep -Milliseconds 700 }"

npx vite --port 5199 --strictPort

echo.
echo   The portal has stopped.
pause
