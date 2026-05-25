"use client";

import React, { useState } from 'react';
import { Calculator, Clock, Calendar, BookOpen, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import CalculatorApp from '@/components/modules/CalculatorApp';

const APPS = [
  { id: 'calculator', name: 'Calculator', icon: Calculator, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { id: 'clock', name: 'Smart Clock', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'timetable', name: 'Timetable', icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'notebook', name: 'Notebook', icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10' },
];

import { useIsMobile } from '@/hooks/useIsMobile';

export default function AppGrid() {
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const isMobile = useIsMobile();

  const containerVariants = isMobile ? {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  } : {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
  };

  const itemVariants = isMobile ? {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
  } : {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  const wrapperAnim = isMobile 
    ? { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, ease: 'easeOut' } }
    : { initial: { opacity: 0, y: 60 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } };

  const handleAppClick = (appId: string) => {
    if (appId === 'calculator') {
      setIsCalcOpen(prev => !prev);
    }
  };

  return (
    <>
      <motion.div 
        {...wrapperAnim}
        className="relative z-20 -mt-8 bg-black/30 backdrop-blur-2xl rounded-t-[2.5rem] px-6 pt-12 pb-32 min-h-screen border-t border-white/10 shadow-[0_-15px_40px_rgba(0,0,0,0.3)]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-6 select-none">
            <h2 className="text-xl font-bold text-gray-100">Student Utilities</h2>
            <span className="text-sm text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">View All</span>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none"
          >
            {APPS.map((app) => {
              const isActive = app.id === 'calculator' && isCalcOpen;
              return (
              <motion.div 
                key={app.id}
                variants={itemVariants}
                whileTap={{ scale: 0.95 }} 
                onClick={() => handleAppClick(app.id)}
                className={`group relative flex flex-col items-center justify-center p-6 border backdrop-blur-md rounded-2xl cursor-pointer transition-all duration-300 shadow-sm 
                  ${isActive 
                    ? 'bg-white/10 border-white/10 shadow-[0_0_30px_rgba(251,146,60,0.15)]' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:shadow-xl hover:border-white/20'
                  }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 
                  ${isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110 -translate-y-1' : `${app.bg} ${app.color} group-hover:scale-110 group-hover:-translate-y-1`}
                `}>
                  <app.icon size={32} strokeWidth={isActive ? 2 : 1.5} />
                </div>
                <span className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-orange-400 font-bold' : 'text-gray-300 group-hover:text-white'}`}>
                  {app.name}
                </span>
              </motion.div>
            )})}
          </motion.div>
        </div>
      </motion.div>

      {/* Render Ứng dụng Máy tính */}
      <CalculatorApp isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />
    </>
  );
}
