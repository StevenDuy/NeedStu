Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🚀 KHỞI ĐỘNG HỆ THỐNG NEEDSTU HUB 🚀" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Di chuyển đến đúng thư mục gốc (nơi chứa file ps1)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptPath

Write-Host "`n[0/2] Dọn dẹp các cổng mạng cũ (nếu có)..." -ForegroundColor Yellow
$ports = @(3000, 5000)
foreach ($port in $ports) {
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($processes) {
        foreach ($p in $processes) {
            if ($p -ne 0) {
                Write-Host " Đang tắt tiến trình (PID: $p) đang dùng cổng $port..." -ForegroundColor Gray
                Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

Write-Host "`n[1/2] Đang gọi Nhà bếp (Backend) khởi động..." -ForegroundColor Yellow
# Dùng Start-Process để mở tab/cửa sổ mới, giúp bạn dễ theo dõi lỗi của Backend riêng biệt
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

Write-Host "[2/2] Đang mở cửa Phòng ăn (Frontend)..." -ForegroundColor Green
# Tương tự, mở tab/cửa sổ mới cho Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`n✅ Lệnh đã phát đi thành công!" -ForegroundColor Cyan
Write-Host "Bạn sẽ thấy 2 cửa sổ/tab Terminal mới bật lên." -ForegroundColor Gray
Write-Host "👉 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "👉 Backend:  http://localhost:5000" -ForegroundColor White
