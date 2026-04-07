Write-Host "Shutting down all TrajectoryAI services..." -ForegroundColor Red

# Kill all Java processes (Spring Boot)
Stop-Process -Name "java" -ErrorAction SilentlyContinue

# Kill Python processes (AI Worker)
Stop-Process -Name "python" -ErrorAction SilentlyContinue

# Kill any lingering PowerShell windows we spawned
Get-Process | Where-Object { $_.MainWindowTitle -match "Discovery|Auth|Profile|Graph|Gateway|AI-Worker" } | Stop-Process

Write-Host "Cleanup complete." -ForegroundColor Green