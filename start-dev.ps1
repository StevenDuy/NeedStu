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

Write-Host "[1/2] Starting Backend..." -ForegroundColor Yellow
# Dùng Start-Process để mở tab/cửa sổ mới, giúp bạn dễ theo dõi lỗi của Backend riêng biệt
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

Write-Host "[2/2] Starting Frontend..." -ForegroundColor Green
# Tương tự, mở tab/cửa sổ mới cho Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`nCommand has been sent successfully!" -ForegroundColor Cyan
Write-Host "You will see 2 new Terminal windows/tabs." -ForegroundColor Gray
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend:  http://localhost:5000" -ForegroundColor White
