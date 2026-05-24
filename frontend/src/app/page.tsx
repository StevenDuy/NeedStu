"use client";

import dynamic from 'next/dynamic';
import HeaderBanner from "@/components/layout/HeaderBanner";
import AppGrid from "@/components/dashboard/AppGrid";

// Lazy load AnimatedBackground để tăng tốc độ tải trang ban đầu (đặc biệt trên 3G)
const AnimatedBackground = dynamic(() => import('@/components/layout/AnimatedBackground'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-x-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <HeaderBanner />
        <div className="w-full">
          <AppGrid />
        </div>
      </div>
    </main>
  );
}
