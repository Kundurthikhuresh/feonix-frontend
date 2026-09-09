@echo off
:loop
call npm run dev
echo [run-forever] dev server exited, restarting in 2s...
timeout /t 2 /nobreak >nul
goto loop
