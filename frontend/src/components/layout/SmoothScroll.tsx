"use client";

import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  useEffect(() => {
    // Bỏ cuộn chuột mượt hoàn toàn trên Mobile
    if (isMobile) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [isMobile]);

  return <>{children}</>;
}
