import { useState, useEffect } from 'react';

export function useIsMobile() {
  // Mặc định trả về true (ưu tiên Mobile First) để điện thoại tải nhanh nhất có thể.
  // Nếu là máy tính, nó sẽ update lại thành false ngay sau khi render xong.
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkIsMobile = () => {
      // Nhận diện Mobile/Tablet: Màn hình hẹp, màn hình quá lùn (xoay ngang), hoặc thiết bị thuần cảm ứng
      const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
      const isSmallScreen = window.innerWidth < 768 || window.innerHeight < 500;
      setIsMobile(isSmallScreen || isTouch);
    };
    
    // Kiểm tra ngay lần đầu
    checkIsMobile();
    
    // Lắng nghe thay đổi kích thước màn hình
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}
