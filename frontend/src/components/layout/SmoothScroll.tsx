"use client";

import React, { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Khởi tạo thư viện cuộn mượt (Lenis)
    const lenis = new Lenis({
      duration: 1.2, // Thời gian trượt (càng cao càng mượt/trì hoãn)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Công thức toán học tạo độ nảy như iOS
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Hàm cập nhật frame liên tục
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Dọn dẹp bộ nhớ khi chuyển trang
    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
