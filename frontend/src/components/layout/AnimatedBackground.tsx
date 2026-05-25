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

  // Đã tắt hiệu ứng di chuyển nền theo yêu cầu để giảm giật lag và chống rối mắt
  const blob1Variants = { animate: {} };
  const blob2Variants = { animate: {} };
  const blob3Variants = { animate: {} };

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
