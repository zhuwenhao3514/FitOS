@echo off
cd /d "%~dp0"
echo Starting FitOS on http://localhost:4173
echo Keep this window open while using the app.
%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause

