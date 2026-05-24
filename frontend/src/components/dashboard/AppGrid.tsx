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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, 
      delayChildren: 0.3,   
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
  }
};

export default function AppGrid() {
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  const handleAppClick = (appId: string) => {
    if (appId === 'calculator') {
      setIsCalcOpen(true);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
            {APPS.map((app) => (
              <motion.div 
                key={app.id}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => handleAppClick(app.id)}
                className="group relative flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl cursor-pointer hover:bg-white/10 transition-colors shadow-sm hover:shadow-xl hover:border-white/20"
              >
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Download size={16} className="text-gray-500 hover:text-white" />
                </div>

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 ${app.bg} ${app.color}`}>
                  <app.icon size={32} strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium text-gray-300 group-hover:text-white">{app.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Render Ứng dụng Máy tính */}
      <CalculatorApp isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />
    </>
  );
}
