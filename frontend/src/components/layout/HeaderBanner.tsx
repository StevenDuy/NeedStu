"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Settings, User, Globe, Palette, LogOut, ChevronRight, X, AlertTriangle, ShieldCheck, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/useIsMobile';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface UserType {
  id: number;
  username: string;
  email: string | null;
  phoneNumber: string | null;
  isVerified: boolean;
  verificationGraceUntil: string;
}

export default function HeaderBanner() {
  const [user, setUser] = useState<UserType | null>(null);
  
  // Modals & Popups state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Auth Wizard Form state
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerStep, setRegisterStep] = useState(1);
  
  // Input fields
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [contactInput, setContactInput] = useState(''); // email or phone
  const [loginKeyInput, setLoginKeyInput] = useState(''); // username/email/phone for login
  
  // Verification states
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  // Form messages
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const [countdownText, setCountdownText] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [shakingField, setShakingField] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);

  const triggerShake = (fields: string[]) => {
    if (fields.length === 0) return;
    if (fields.length === 1) {
      setShakingField(fields[0]);
      setTimeout(() => setShakingField(null), 500);
    } else {
      // Sequential shake logic
      setShakingField(fields[0]);
      setTimeout(() => {
        setShakingField(fields[1]);
        setTimeout(() => setShakingField(null), 500);
      }, 550);
    }
  };

  // Auto-dismiss auth error and success messages after 5 seconds
  useEffect(() => {
    if (authError) {
      const timer = setTimeout(() => {
        setAuthError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [authError]);

  useEffect(() => {
    if (authSuccess) {
      const timer = setTimeout(() => {
        setAuthSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [authSuccess]);

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('needstu_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('needstu_user');
      }
    }
  }, []);

  // Sync search input focus
  useEffect(() => {
    if (isSearchExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Reset form and errors when modal opens/closes
  useEffect(() => {
    if (isAuthModalOpen) {
      resetAuthForm();
    }
  }, [isAuthModalOpen]);

  // Handle countdown timer
  useEffect(() => {
    if (!user || !user.verificationGraceUntil) return;

    const updateTimer = () => {
      const targetTime = new Date(user.verificationGraceUntil).getTime();
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setCountdownText('Expired');
        localStorage.removeItem('needstu_user');
        setUser(null);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (days > 0) {
          setCountdownText(`${days}d ${hours}h`);
        } else {
          setCountdownText(`${hours}h ${minutes}m ${seconds}s`);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Reset auth wizard forms
  const resetAuthForm = () => {
    setUsernameInput('');
    setPasswordInput('');
    setConfirmPasswordInput('');
    setContactInput('');
    setLoginKeyInput('');
    setAuthError('');
    setAuthSuccess('');
    setIsAuthLoading(false);
    setShakingField(null);
    setInvalidFields([]);
    setRegisterStep(1);
  };

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);
    setInvalidFields([]);
    
    // Final validation
    if (!usernameInput || !passwordInput || !contactInput) {
      const missing = [];
      if (!usernameInput) missing.push('username');
      if (!passwordInput) missing.push('password');
      if (!contactInput) missing.push('contact');
      setInvalidFields(missing);
      triggerShake(missing);
      setAuthError('All fields are required');
      setIsAuthLoading(false);
      return;
    }

    if (passwordInput !== confirmPasswordInput) {
      const invalid = ['password', 'confirmPassword'];
      setInvalidFields(invalid);
      triggerShake(invalid);
      setAuthError('Passwords do not match');
      setIsAuthLoading(false);
      return;
    }

    const isEmail = contactInput.includes('@');
    const registerPayload = {
      username: usernameInput,
      password: passwordInput,
      email: isEmail ? contactInput : undefined,
      phoneNumber: !isEmail ? contactInput : undefined,
    };

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerPayload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setAuthSuccess('Account created! Logging in...');
      
      // Auto login after registration
      setTimeout(() => {
        handleAutoLogin(usernameInput, passwordInput);
      }, 1500);

    } catch (err: any) {
      const errMsg = err.message === 'Failed to fetch' 
        ? 'Server is offline. Please make sure the backend is running.' 
        : err.message;
      setAuthError(errMsg);
      const invalid = ['username', 'contact'];
      setInvalidFields(invalid);
      triggerShake(invalid);
      setIsAuthLoading(false);
    }
  };

  // Handle auto-login following registration
  const handleAutoLogin = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginKey: username, password }),
      });
      const data = await response.json();
      
      if (response.ok && data.user) {
        localStorage.setItem('needstu_user', JSON.stringify(data.user));
        setUser(data.user);
        setIsAuthModalOpen(false);
        resetAuthForm();
      }
    } catch (e) {
      setAuthError('Auto login failed. Please sign in manually.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);
    setInvalidFields([]);

    if (!loginKeyInput || !passwordInput) {
      const missing = [];
      if (!loginKeyInput) missing.push('loginKey');
      if (!passwordInput) missing.push('password');
      setInvalidFields(missing);
      triggerShake(missing);
      setAuthError('Both credentials and password are required');
      setIsAuthLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginKey: loginKeyInput, password: passwordInput }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('needstu_user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthModalOpen(false);
      resetAuthForm();
    } catch (err: any) {
      const errMsg = err.message === 'Failed to fetch' 
        ? 'Server is offline. Please make sure the backend is running.' 
        : err.message;
      setAuthError(errMsg);
      
      let invalid = ['loginKey', 'password'];
      if (errMsg === 'Account not found') {
        invalid = ['loginKey'];
      } else if (errMsg === 'Incorrect password') {
        invalid = ['password'];
      }
      
      setInvalidFields(invalid);
      triggerShake(invalid);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Send Verification OTP Code
  const handleSendOtp = async () => {
    if (!user) return;
    setOtpError('');
    setOtpMessage('');
    
    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to dispatch verification code');
      }

      setOtpSent(true);
      setOtpMessage(data.message || 'OTP Code sent successfully.');
    } catch (err: any) {
      setOtpError(err.message);
    }
  };

  // Verify OTP Code
  const handleVerifyOtp = async () => {
    if (!user || !otpCodeInput) return;
    setOtpError('');
    setOtpMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, code: otpCodeInput }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Update state and storage with new verified user info
      localStorage.setItem('needstu_user', JSON.stringify(data.user));
      setUser(data.user);
      setOtpSent(false);
      setOtpCodeInput('');
      setOtpMessage('Verification completed successfully!');
    } catch (err: any) {
      setOtpError(err.message);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: isMobile ? -20 : -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={isMobile ? { duration: 0.3, ease: 'easeOut' } : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
      className="relative w-full text-white pt-10 md:pt-12 pb-16 px-4 md:px-6 z-50 animate-fade-in"
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Verification Warning Alert Banner */}
        {user && !user.isVerified && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex flex-col sm:flex-row justify-between items-center gap-3 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} className="text-amber-400" />
              </div>
              <p className="text-sm">
                Your account is unverified! It will be deleted in <strong className="font-mono text-white text-base">{countdownText}</strong> if verification remains incomplete.
              </p>
            </div>
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="text-xs bg-amber-400 hover:bg-amber-500 text-black font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-amber-400/20 active:scale-95 cursor-pointer"
            >
              Verify Account Now
            </button>
          </motion.div>
        )}

        {/* Top Navigation Area */}
        <div className="flex justify-between items-center mb-8">
          
          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <div 
              onClick={() => {
                if (user) {
                  setIsProfileOpen(true);
                } else {
                  setIsAuthModalOpen(true);
                  setIsRegisterMode(false);
                }
              }}
              className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shadow-inner cursor-pointer hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
              title={user ? "View Profile" : "Log In"}
            >
              <User size={24} className="text-blue-100" />
            </div>
            <div className="hidden sm:block">
              {user ? (
                <>
                  <p className="text-sm text-blue-200 font-medium tracking-wide">Welcome back,</p>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    {user.username}
                    {user.isVerified ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Verified" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" title="Unverified" />
                    )}
                  </h1>
                </>
              ) : (
                <>
                  <p className="text-sm text-blue-200 font-medium tracking-wide">Unknown User</p>
                  <button 
                    onClick={() => { setIsAuthModalOpen(true); setIsRegisterMode(false); }}
                    className="text-xl font-bold text-white hover:text-blue-300 underline underline-offset-4 cursor-pointer transition-colors"
                  >
                    Not logged in
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-3">
            
            {/* Search Bar */}
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

            {/* Notification Bell */}
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
                {(!user || !user.isVerified) && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full border border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                )}
              </motion.button>

              <div 
                className={`fixed inset-0 z-40 ${isNotifOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                onClick={() => setIsNotifOpen(false)}
              />
              
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    style={{ transformOrigin: 'top right' }}
                    className="absolute right-[-10px] sm:right-0 mt-3 w-72 sm:w-80 bg-gray-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                      <h3 className="font-semibold text-white">Notifications</h3>
                      {!user && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-medium">Guest Mode</span>
                      )}
                    </div>
                    
                    <div className="flex flex-col max-h-64 overflow-y-auto">
                      {user && !user.isVerified ? (
                        <div className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 flex gap-3 bg-amber-500/5">
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 flex-shrink-0 animate-ping"></div>
                          <div>
                            <p className="text-sm text-amber-200 font-semibold">Account Expiration Alert</p>
                            <p className="text-xs text-amber-300/80 mt-0.5">Please verify your account soon. Deadline: {countdownText} remaining.</p>
                          </div>
                        </div>
                      ) : null}

                      <div className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 flex gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm text-white font-medium">Welcome to NeedStu</p>
                          <p className="text-xs text-blue-100/70 mt-0.5">Explore utilities and customize settings from the menu.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Settings Icon & Dropdown */}
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

              <div 
                className={`fixed inset-0 z-40 ${isSettingsOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                onClick={() => setIsSettingsOpen(false)}
              />
              
              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    style={{ transformOrigin: 'top right' }}
                    className="absolute right-[-10px] sm:right-0 mt-3 w-64 bg-gray-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-white/10 bg-white/5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                          <User size={18} className="text-blue-200" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm">
                            {user ? user.username : 'Guest User'}
                          </h3>
                          <p className="text-xs text-blue-200/70 truncate max-w-[150px]">
                            {user ? (user.email || user.phoneNumber) : 'Sign in to access features'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col p-2 space-y-1">
                      <div 
                        onClick={() => {
                          setIsSettingsOpen(false);
                          if (user) {
                            setIsProfileOpen(true);
                          } else {
                            setIsAuthModalOpen(true);
                            setIsRegisterMode(false);
                          }
                        }}
                        className="px-3 py-2.5 hover:bg-white/10 cursor-pointer rounded-lg transition-colors flex items-center justify-between group/item"
                      >
                        <div className="flex items-center space-x-3">
                          <User size={16} className="text-blue-200/70 group-hover/item:text-white transition-colors" />
                          <span className="text-sm text-white/90 group-hover/item:text-white transition-colors">Profile Settings</span>
                          {user && !user.isVerified && countdownText && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono animate-pulse" title="Time remaining before deletion">
                              {countdownText}
                            </span>
                          )}
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
                    
                    {user && (
                      <div className="p-2 border-t border-white/10">
                        <div 
                          onClick={() => {
                            localStorage.removeItem('needstu_user');
                            setUser(null);
                            setIsSettingsOpen(false);
                          }}
                          className="px-3 py-2.5 hover:bg-red-500/10 cursor-pointer rounded-lg transition-colors flex items-center space-x-3 group/logout"
                        >
                          <LogOut size={16} className="text-red-400/70 group-hover/logout:text-red-400 transition-colors" />
                          <span className="text-sm text-red-400/90 group-hover/logout:text-red-400 transition-colors">Log out</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Modal (Login / Interactive Registration Wizard) */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-md h-[365px] flex flex-col justify-start bg-gray-950/90 border border-white/10 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden p-6 z-10"
            >
              {/* Alert Modal Overlay (Center-aligned, click backdrop to dismiss) */}
              <AnimatePresence>
                {authSuccess && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => { setAuthSuccess(''); }}
                    className="absolute inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-6 cursor-pointer"
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 15 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 15 }}
                      transition={{ type: "spring", stiffness: 350, damping: 26 }}
                      onClick={(e) => e.stopPropagation()} // Prevent close on clicking card itself
                      className="w-full max-w-[280px] bg-gray-900 border border-white/10 p-5 rounded-2xl shadow-2xl flex flex-col items-center text-center space-y-4 cursor-default"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <ShieldCheck size={24} className="text-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-sm">Success</h4>
                        <p className="text-xs text-emerald-200/80 leading-relaxed">{authSuccess}</p>
                      </div>
                      <button
                        onClick={() => { setAuthSuccess(''); }}
                        className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer active:scale-95"
                      >
                        Dismiss
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Close Button */}
              <button 
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Toggle Form Header */}
              <div className="flex gap-4 border-b border-white/10 pb-4 mb-6">
                <button 
                  onClick={() => { setIsRegisterMode(false); resetAuthForm(); }}
                  className={`text-lg font-bold pb-2 border-b-2 transition-colors cursor-pointer ${!isRegisterMode ? 'text-blue-400 border-blue-400' : 'text-white/40 border-transparent hover:text-white/80'}`}
                >
                  Log In
                </button>
                <button 
                  onClick={() => { setIsRegisterMode(true); resetAuthForm(); }}
                  className={`text-lg font-bold pb-2 border-b-2 transition-colors cursor-pointer ${isRegisterMode ? 'text-blue-400 border-blue-400' : 'text-white/40 border-transparent hover:text-white/80'}`}
                >
                  Register
                </button>
              </div>

              {/* Login Form */}
              {!isRegisterMode ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Username/Email/Phone Input with Shake */}
                  <motion.div 
                    animate={shakingField === 'loginKey' ? { x: [0, -10, 10, -10, 10, -5, 5, 0] } : {}}
                    transition={{ duration: 0.5 }}
                    className="space-y-1 relative"
                  >
                    <label className="text-xs text-blue-200/70 font-semibold tracking-wide">Username, Email, or Phone</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input 
                        type="text"
                        required
                        value={loginKeyInput}
                        onChange={(e) => setLoginKeyInput(e.target.value)}
                        onFocus={() => setInvalidFields(prev => prev.filter(f => f !== 'loginKey'))}
                        placeholder="Enter credentials..."
                        className={`w-full bg-white/5 border rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-white/20 outline-none focus:bg-white/10 transition-all ${
                          invalidFields.includes('loginKey') 
                            ? 'border-red-500/50 focus:border-red-500 bg-red-500/5' 
                            : 'border-white/10 focus:border-blue-500'
                        }`}
                      />
                    </div>
                  </motion.div>

                  {/* Password Input with Shake */}
                  <motion.div 
                    animate={shakingField === 'password' ? { x: [0, -10, 10, -10, 10, -5, 5, 0] } : {}}
                    transition={{ duration: 0.5 }}
                    className="space-y-1 relative"
                  >
                    <label className="text-xs text-blue-200/70 font-semibold tracking-wide">Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        onFocus={() => setInvalidFields(prev => prev.filter(f => f !== 'password'))}
                        placeholder="••••••••"
                        className={`w-full bg-white/5 border rounded-2xl py-3 pl-11 pr-11 text-sm text-white placeholder-white/20 outline-none focus:bg-white/10 transition-all ${
                          invalidFields.includes('password') 
                            ? 'border-red-500/50 focus:border-red-500 bg-red-500/5' 
                            : 'border-white/10 focus:border-blue-500'
                        }`}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </motion.div>

                  <div className="relative mt-4">
                    <AnimatePresence>
                      {authError && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-max max-w-[90%] bg-red-500 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-lg z-20 pointer-events-none text-center"
                        >
                          {authError}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-red-500 w-0 h-0" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button 
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isAuthLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Logging in...
                        </>
                      ) : 'Log In'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Interactive Registration Wizard Form */
                <div className="space-y-4">
                  
                  {/* Step Indicators */}
                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-xs text-white/40">Step {registerStep} of 3</span>
                    <div className="flex gap-1">
                      <span className={`w-6 h-1 rounded-full transition-all ${registerStep >= 1 ? 'bg-blue-500' : 'bg-white/10'}`} />
                      <span className={`w-6 h-1 rounded-full transition-all ${registerStep >= 2 ? 'bg-blue-500' : 'bg-white/10'}`} />
                      <span className={`w-6 h-1 rounded-full transition-all ${registerStep >= 3 ? 'bg-blue-500' : 'bg-white/10'}`} />
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {registerStep === 1 && (
                      <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <h3 className="text-md font-medium text-white">Please enter your username</h3>
                        <motion.div 
                          animate={shakingField === 'username' ? { x: [0, -10, 10, -10, 10, -5, 5, 0] } : {}}
                          transition={{ duration: 0.5 }}
                          className="relative"
                        >
                          <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                          <input 
                            type="text"
                            required
                            placeholder="Pick a username..."
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            onFocus={() => setInvalidFields(prev => prev.filter(f => f !== 'username'))}
                            onKeyDown={(e) => { if (e.key === 'Enter' && usernameInput) setRegisterStep(2); }}
                            className={`w-full bg-white/5 border rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-white/20 outline-none focus:bg-white/10 transition-all ${
                              invalidFields.includes('username') 
                                ? 'border-red-500/50 focus:border-red-500 bg-red-500/5' 
                                : 'border-white/10 focus:border-blue-500'
                            }`}
                          />
                        </motion.div>
                        <button 
                          disabled={!usernameInput}
                          onClick={() => setRegisterStep(2)}
                          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all cursor-pointer"
                        >
                          Next Step
                        </button>
                      </motion.div>
                    )}

                    {registerStep === 2 && (
                      <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <h3 className="text-md font-medium text-white">Create a strong password</h3>
                        <motion.div 
                          animate={shakingField === 'password' ? { x: [0, -10, 10, -10, 10, -5, 5, 0] } : {}}
                          transition={{ duration: 0.5 }}
                          className="relative"
                        >
                          <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                          <input 
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Enter password..."
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            onFocus={() => setInvalidFields(prev => prev.filter(f => f !== 'password'))}
                            className={`w-full bg-white/5 border rounded-2xl py-3.5 pl-11 pr-11 text-sm text-white placeholder-white/20 outline-none focus:bg-white/10 transition-all ${
                              invalidFields.includes('password') 
                                ? 'border-red-500/50 focus:border-red-500 bg-red-500/5' 
                                : 'border-white/10 focus:border-blue-500'
                            }`}
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </motion.div>
                        <motion.div 
                          animate={shakingField === 'confirmPassword' ? { x: [0, -10, 10, -10, 10, -5, 5, 0] } : {}}
                          transition={{ duration: 0.5 }}
                          className="relative"
                        >
                          <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                          <input 
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Re-enter password..."
                            value={confirmPasswordInput}
                            onChange={(e) => setConfirmPasswordInput(e.target.value)}
                            onFocus={() => setInvalidFields(prev => prev.filter(f => f !== 'confirmPassword'))}
                            onKeyDown={(e) => { if (e.key === 'Enter' && passwordInput && confirmPasswordInput === passwordInput) setRegisterStep(3); }}
                            className={`w-full bg-white/5 border rounded-2xl py-3.5 pl-11 pr-11 text-sm text-white placeholder-white/20 outline-none focus:bg-white/10 transition-all ${
                              invalidFields.includes('confirmPassword') 
                                ? 'border-red-500/50 focus:border-red-500 bg-red-500/5' 
                                : 'border-white/10 focus:border-blue-500'
                            }`}
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </motion.div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setRegisterStep(1)}
                            className="w-1/3 bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-2xl transition-all cursor-pointer"
                          >
                            Back
                          </button>
                          <button 
                            disabled={!passwordInput || passwordInput !== confirmPasswordInput}
                            onClick={() => setRegisterStep(3)}
                            className="w-2/3 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all cursor-pointer"
                          >
                            Next Step
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {registerStep === 3 && (
                      <motion.div 
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <h3 className="text-md font-medium text-white">Enter Email or Phone number</h3>
                        <p className="text-xs text-blue-200/50">One of these is required to verify and protect your account.</p>
                        <motion.div 
                          animate={shakingField === 'contact' ? { x: [0, -10, 10, -10, 10, -5, 5, 0] } : {}}
                          transition={{ duration: 0.5 }}
                          className="relative"
                        >
                          <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                          <input 
                            type="text"
                            required
                            placeholder="email@example.com or +1234567..."
                            value={contactInput}
                            onChange={(e) => setContactInput(e.target.value)}
                            onFocus={() => setInvalidFields(prev => prev.filter(f => f !== 'contact'))}
                            className={`w-full bg-white/5 border rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-white/20 outline-none focus:bg-white/10 transition-all ${
                              invalidFields.includes('contact') 
                                ? 'border-red-500/50 focus:border-red-500 bg-red-500/5' 
                                : 'border-white/10 focus:border-blue-500'
                            }`}
                          />
                        </motion.div>
                        <div className="relative mt-2">
                          <AnimatePresence>
                            {authError && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-max max-w-[90%] bg-red-500 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-lg z-20 pointer-events-none text-center"
                              >
                                {authError}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-red-500 w-0 h-0" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setRegisterStep(2)}
                              className="w-1/3 bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-2xl transition-all cursor-pointer"
                            >
                              Back
                            </button>
                            <button 
                              disabled={!contactInput || isAuthLoading}
                              onClick={handleRegister}
                              className="w-2/3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                              {isAuthLoading ? (
                                <>
                                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Registering...
                                </>
                              ) : 'Finish Registration'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Profile / Verification Modal */}
      <AnimatePresence>
        {isProfileOpen && user && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-md bg-gray-950/90 border border-white/10 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden p-6 z-10"
            >
              <button 
                onClick={() => setIsProfileOpen(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold border-b border-white/10 pb-3 mb-4 text-white">Profile & Verification</h2>

              {otpMessage && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex gap-2 items-center">
                  <ShieldCheck size={14} className="flex-shrink-0" />
                  <span>{otpMessage}</span>
                </div>
              )}

              {otpError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-xs flex gap-2 items-center">
                  <AlertTriangle size={14} className="flex-shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <div className="space-y-4 text-sm">
                
                {/* Account Details */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                  <div>
                    <span className="text-xs text-white/40 block">Username</span>
                    <strong className="text-white text-base">{user.username}</strong>
                  </div>

                  {user.email && (
                    <div>
                      <span className="text-xs text-white/40 block">Email Address</span>
                      <strong className="text-white flex items-center gap-1.5 mt-0.5">
                        <Mail size={14} className="text-blue-300" />
                        {user.email}
                      </strong>
                    </div>
                  )}

                  {user.phoneNumber && (
                    <div>
                      <span className="text-xs text-white/40 block">Phone Number</span>
                      <strong className="text-white flex items-center gap-1.5 mt-0.5">
                        <Phone size={14} className="text-blue-300" />
                        {user.phoneNumber}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Verification Status Card */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                  <div>
                    <span className="text-xs text-white/40 block">Security Status</span>
                    <div className="flex items-center gap-2 mt-1">
                      {user.isVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <ShieldCheck size={14} /> Verified Account
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <AlertTriangle size={14} /> Unverified Account
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expiration Timer Card */}
                  <div>
                    <span className="text-xs text-white/40 block">
                      {user.isVerified ? 'Periodic Check-in Deadline' : 'Account Deletion Countdown'}
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <strong className="text-lg font-mono text-white">{countdownText}</strong>
                      <span className="text-xs text-white/40">
                        ({user.isVerified ? 'Gears extended to 180 days' : 'Expires in 7 days'})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Verification Action Block */}
                {!user.isVerified && (
                  <div className="pt-2 border-t border-white/5 mt-4 space-y-3">
                    {!otpSent ? (
                      <button 
                        onClick={handleSendOtp}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md cursor-pointer"
                      >
                        Request Verification OTP Code
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <label className="text-xs text-blue-200/70 font-semibold tracking-wide">Enter 6-Digit OTP Code</label>
                        <input 
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 123456"
                          value={otpCodeInput}
                          onChange={(e) => setOtpCodeInput(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-center text-lg font-bold font-mono text-white placeholder-white/20 outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setOtpSent(false)}
                            className="w-1/3 bg-white/5 hover:bg-white/10 text-white py-3 rounded-2xl transition-all cursor-pointer text-xs"
                          >
                            Resend Code
                          </button>
                          <button 
                            disabled={otpCodeInput.length < 6}
                            onClick={handleVerifyOtp}
                            className="w-2/3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold py-3 rounded-2xl transition-all shadow-md cursor-pointer text-xs"
                          >
                            Verify & Extend
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
