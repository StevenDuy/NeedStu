Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Starting NEEDSTU HUB System " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Di chuyển đến đúng thư mục gốc (nơi chứa file ps1)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptPath

Write-Host "`n[0/2] Cleaning old port..." -ForegroundColor Yellow
$ports = @(3000, 5000)
foreach ($port in $ports) {
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($processes) {
        foreach ($p in $processes) {
            if ($p -ne 0) {
                Write-Host "Cleaning process (PID: $p) using port $port" -ForegroundColor Gray
                Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

Write-Host "`n[1/3] Reading database configuration..." -ForegroundColor Yellow
$envPath = "backend/.env"
$dbHost = "127.0.0.1"
$dbPort = "3306"
$dbUser = "root"
$dbName = "needstu"

if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match "^DB_HOST=(.*)$") { $dbHost = $Matches[1].Trim() }
        if ($_ -match "^DB_PORT=(.*)$") { $dbPort = $Matches[1].Trim() }
        if ($_ -match "^DB_USER=(.*)$") { $dbUser = $Matches[1].Trim() }
        if ($_ -match "^DB_NAME=(.*)$") { $dbName = $Matches[1].Trim() }
    }
}
Write-Host "Database Connection: mysql://${dbUser}@${dbHost}:${dbPort}/${dbName}" -ForegroundColor Magenta

Write-Host "`n[2/3] Starting Backend..." -ForegroundColor Yellow
$backendProc = Start-Process powershell -ArgumentList "-Command cd backend; npm run dev" -NoNewWindow -PassThru

Write-Host "[3/3] Starting Frontend..." -ForegroundColor Green
$frontendProc = Start-Process powershell -ArgumentList "-Command cd frontend; npm run dev" -NoNewWindow -PassThru

Write-Host "`nBoth servers are running inside this terminal!" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "Press Ctrl+C to stop both servers." -ForegroundColor Yellow

try {
    # Keep the script active to stream logs and wait for Ctrl+C
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Host "`nStopping servers..." -ForegroundColor Red
    if ($backendProc) { Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue }
    if ($frontendProc) { Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue }
    Write-Host "Done. Both servers stopped." -ForegroundColor Gray
}
