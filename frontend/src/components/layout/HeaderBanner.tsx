"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Settings, User, Globe, Palette, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useIsMobile } from '@/hooks/useIsMobile';

export default function HeaderBanner() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isSearchExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchExpanded]);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: isMobile ? -20 : -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={isMobile ? { duration: 0.3, ease: 'easeOut' } : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
      className="relative w-full text-white pt-10 md:pt-12 pb-16 px-4 md:px-6 z-50"
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Top Navigation Area */}
        <div className="flex justify-between items-center mb-8">
          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shadow-inner">
              <User size={24} className="text-blue-100" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm text-blue-200 font-medium tracking-wide">Welcome back,</p>
              <h1 className="text-xl font-bold text-white">Student User</h1>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-3">
            {/* Expandable Search Bar */}
            <motion.div 
              initial={false}
              animate={{ width: isSearchExpanded ? 180 : 42 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              whileHover={!isSearchExpanded ? { scale: 1.1, y: -3 } : {}}
              whileTap={!isSearchExpanded ? { scale: 0.95 } : {}}
              onClick={() => { if (!isSearchExpanded) setIsSearchExpanded(true); }}
              className={`group flex items-center rounded-full border shadow-sm transition-colors overflow-hidden h-[42px] flex-shrink-0 ${
                isSearchExpanded 
                  ? 'bg-white/10 border-white/20 hover:shadow-lg' 
                  : 'bg-white/5 border-white/10 hover:bg-white/20 hover:shadow-lg cursor-pointer'
              }`}
            >
              <div className="w-[40px] h-[40px] flex items-center justify-center flex-shrink-0 relative z-10">
                <Search size={20} className={`transition-colors ${isSearchExpanded ? 'text-white' : 'text-blue-100 group-hover:text-white'}`} />
              </div>
              
              <input
                ref={inputRef}
                disabled={!isSearchExpanded}
                type="text"
                placeholder="Search apps..."
                className="bg-transparent border-none outline-none text-sm text-white placeholder-blue-200/50 w-full pr-4 h-full"
                style={{ opacity: isSearchExpanded ? 1 : 0, transition: 'opacity 0.2s ease-in-out' }}
                onBlur={() => setIsSearchExpanded(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsSearchExpanded(false);
                }}
              />
            </motion.div>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <motion.button 
                onClick={() => {
                  setIsNotifOpen(prev => !prev);
                  if (!isNotifOpen) setIsSettingsOpen(false);
                }}
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className={`cursor-pointer p-2.5 rounded-full border transition-colors shadow-sm hover:shadow-lg relative z-50 group ${
                  isNotifOpen ? 'bg-white/20 border-white/30' : 'bg-white/5 border-white/10 hover:bg-white/20'
                }`}
              >
                <Bell size={20} className={`transition-colors ${isNotifOpen ? 'text-white' : 'text-blue-100 group-hover:text-white'}`} />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              </motion.button>

              {/* Lớp nền tàng hình để bấm ra ngoài sẽ tự đóng Popup */}
              <div 
                className={`fixed inset-0 z-40 ${isNotifOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                onClick={() => setIsNotifOpen(false)}
              />
              
              {/* Bảng Popup Thông báo (Luôn Render để tránh khựng, dùng pointer-events để ẩn) */}
              <motion.div
                initial={false}
                animate={{ 
                  opacity: isNotifOpen ? 1 : 0, 
                  scale: isNotifOpen ? 1 : 0.8, 
                  y: isNotifOpen ? 0 : 10, 
                  filter: isNotifOpen ? "blur(0px)" : "blur(10px)" 
                }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                style={{ transformOrigin: 'top right' }}
                className={`absolute right-[-10px] sm:right-0 mt-3 w-72 sm:w-80 bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 ${
                  isNotifOpen ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
              >
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <h3 className="font-semibold text-white">Notifications</h3>
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium">3 New</span>
                </div>
                
                <div className="flex flex-col">
                  <div className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 flex gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-white font-medium">Math Assignment Due</p>
                      <p className="text-xs text-blue-100/70 mt-0.5 line-clamp-2">Calculus chapter 4 exercises are due in 2 hours.</p>
                      <p className="text-[10px] text-blue-200/50 mt-1.5">10 mins ago</p>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 flex gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-white font-medium">System Update</p>
                      <p className="text-xs text-blue-100/70 mt-0.5 line-clamp-2">NeedStu Hub v2.0 features have been unlocked.</p>
                      <p className="text-[10px] text-blue-200/50 mt-1.5">1 hour ago</p>
                    </div>
                  </div>

                  <div className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors flex gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-white font-medium">Grade Updated</p>
                      <p className="text-xs text-blue-100/70 mt-0.5 line-clamp-2">Your recent Physics mid-term score was published.</p>
                      <p className="text-[10px] text-blue-200/50 mt-1.5">Yesterday</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white/5 hover:bg-white/15 transition-colors cursor-pointer text-center border-t border-white/10">
                  <span className="text-xs font-medium text-blue-300">View all notifications</span>
                </div>
              </motion.div>
            </div>

            {/* Settings Dropdown */}
            <div className="relative">
              <motion.button 
                onClick={() => {
                  setIsSettingsOpen(prev => !prev);
                  if (!isSettingsOpen) setIsNotifOpen(false);
                }}
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className={`cursor-pointer p-2.5 rounded-full border transition-colors shadow-sm hover:shadow-lg relative z-50 group ${
                  isSettingsOpen ? 'bg-white/20 border-white/30' : 'bg-white/5 border-white/10 hover:bg-white/20'
                }`}
              >
                <Settings size={20} className={`transition-colors ${isSettingsOpen ? 'text-white' : 'text-blue-100 group-hover:text-white'}`} />
              </motion.button>

              {/* Lớp nền tàng hình để đóng Popup */}
              <div 
                className={`fixed inset-0 z-40 ${isSettingsOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                onClick={() => setIsSettingsOpen(false)}
              />
              
              {/* Bảng Popup Cài đặt (Luôn Render để tránh khựng, dùng pointer-events để ẩn) */}
              <motion.div
                initial={false}
                animate={{ 
                  opacity: isSettingsOpen ? 1 : 0, 
                  scale: isSettingsOpen ? 1 : 0.8, 
                  y: isSettingsOpen ? 0 : 10, 
                  filter: isSettingsOpen ? "blur(0px)" : "blur(10px)" 
                }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                style={{ transformOrigin: 'top right' }}
                className={`absolute right-[-10px] sm:right-0 mt-3 w-64 bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 ${
                  isSettingsOpen ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
              >
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                      <User size={18} className="text-blue-200" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">Student User</h3>
                      <p className="text-xs text-blue-200/70">student@needstu.com</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col p-2 space-y-1">
                  <div className="px-3 py-2.5 hover:bg-white/10 cursor-pointer rounded-lg transition-colors flex items-center justify-between group/item">
                    <div className="flex items-center space-x-3">
                      <User size={16} className="text-blue-200/70 group-hover/item:text-white transition-colors" />
                      <span className="text-sm text-white/90 group-hover/item:text-white transition-colors">Profile Settings</span>
                    </div>
                    <ChevronRight size={14} className="text-white/30 group-hover/item:text-white/70" />
                  </div>
                  
                  <div className="px-3 py-2.5 hover:bg-white/10 cursor-pointer rounded-lg transition-colors flex items-center justify-between group/item">
                    <div className="flex items-center space-x-3">
                      <Globe size={16} className="text-blue-200/70 group-hover/item:text-white transition-colors" />
                      <span className="text-sm text-white/90 group-hover/item:text-white transition-colors">Language (EN)</span>
                    </div>
                    <ChevronRight size={14} className="text-white/30 group-hover/item:text-white/70" />
                  </div>

                  <div className="px-3 py-2.5 hover:bg-white/10 cursor-pointer rounded-lg transition-colors flex items-center justify-between group/item">
                    <div className="flex items-center space-x-3">
                      <Palette size={16} className="text-blue-200/70 group-hover/item:text-white transition-colors" />
                      <span className="text-sm text-white/90 group-hover/item:text-white transition-colors">Appearance</span>
                    </div>
                    <ChevronRight size={14} className="text-white/30 group-hover/item:text-white/70" />
                  </div>
                </div>
                
                <div className="p-2 border-t border-white/10">
                  <div className="px-3 py-2.5 hover:bg-red-500/10 cursor-pointer rounded-lg transition-colors flex items-center space-x-3 group/logout">
                    <LogOut size={16} className="text-red-400/70 group-hover/logout:text-red-400 transition-colors" />
                    <span className="text-sm text-red-400/90 group-hover/logout:text-red-400 transition-colors">Log out</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
