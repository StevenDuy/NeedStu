"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Đã giảm tốc độ chuyển động xuống chậm hơn (15-20 giây) để tạo cảm giác Chill
  // Đồng thời giảm quãng đường di chuyển (x, y) để hiệu ứng mượt mà không bị chóng mặt
  const blob1Variants = {
    animate: isMobile ? {} : {
      x: [0, 100, 0, -50, 0],
      y: [0, -50, 100, 20, 0],
      scale: [1, 1.1, 1, 0.9, 1],
      transition: { duration: 15, repeat: Infinity, ease: "linear" as const }
    }
  };

  const blob2Variants = {
    animate: isMobile ? {} : {
      x: [0, -100, 50, 0],
      y: [0, 100, -50, 0],
      scale: [1, 0.9, 1.1, 1],
      transition: { duration: 18, repeat: Infinity, ease: "linear" as const }
    }
  };

  const blob3Variants = {
    animate: isMobile ? {} : {
      x: [0, 50, -100, 20, 0],
      y: [0, -50, -20, 100, 0],
      scale: [1, 1.2, 0.9, 1],
      transition: { duration: 20, repeat: Infinity, ease: "linear" as const }
    }
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-gray-950">
      
      {/* Blob 1: Xanh Dương Đậm */}
      <motion.div
        variants={blob1Variants}
        animate="animate"
        className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vh] rounded-full filter blur-[100px] opacity-30 bg-blue-600"
      />
      
      {/* Blob 2: Tím Trầm */}
      <motion.div
        variants={blob2Variants}
        animate="animate"
        className="absolute top-[20%] right-[10%] w-[50vw] h-[70vh] rounded-full filter blur-[120px] opacity-30 bg-purple-600"
      />
      
      {/* Blob 3: Xanh Cyan / Indigo */}
      <motion.div
        variants={blob3Variants}
        animate="animate"
        className="absolute -bottom-[20%] left-[20%] w-[70vw] h-[60vh] rounded-full filter blur-[120px] opacity-20 bg-indigo-500"
      />
    </div>
  );
}
