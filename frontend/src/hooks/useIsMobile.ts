import { useState, useEffect } from 'react';

export function useIsMobile() {
  // Mặc định trả về true (ưu tiên Mobile First) để điện thoại tải nhanh nhất có thể.
  // Nếu là máy tính, nó sẽ update lại thành false ngay sau khi render xong.
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Kiểm tra ngay lần đầu
    checkIsMobile();
    
    // Lắng nghe thay đổi kích thước màn hình
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}
