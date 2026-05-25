"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence, useDragControls, useMotionValue, useSpring } from 'framer-motion';
import { X, Minus, Plus, X as Multiply, Divide, Equal, Delete, History } from 'lucide-react';

import { useIsMobile } from '@/hooks/useIsMobile';

interface CalculatorAppProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CalculatorApp({ isOpen, onClose }: CalculatorAppProps) {
  const isMobile = useIsMobile();
  const [equation, setEquation] = useState('0');
  const [result, setResult] = useState('');
  const [isCalculated, setIsCalculated] = useState(false);
  
  // --- LỊCH SỬ TÍNH TOÁN ---
  const [history, setHistory] = useState<{ equation: string, result: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const dragControls = useDragControls();
  const historyDragControls = useDragControls(); // Thêm bộ điều khiển kéo thả cho bảng lịch sử
  const constraintsRef = React.useRef(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isComposing = React.useRef(false); // Cờ theo dõi trạng thái bộ gõ tiếng Việt (IME)

  // --- HỆ THỐNG KÉO THẢ TRỄ (SMOOTH FOLLOW) ---
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 200, mass: 0.8 };
  const smoothX = useSpring(dragX, springConfig);
  const smoothY = useSpring(dragY, springConfig);

  const handleNumber = (num: string) => {
    if (isCalculated) {
      setEquation(num);
      setResult('');
      setIsCalculated(false);
      return;
    }

    const input = inputRef.current;
    if (input && document.activeElement === input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      
      setEquation(prev => {
        if (prev === '0' && start === end && start === 1) {
          setTimeout(() => input.setSelectionRange(num.length, num.length), 0);
          return num;
        }
        const newEq = prev.slice(0, start) + num + prev.slice(end);
        setTimeout(() => input.setSelectionRange(start + num.length, start + num.length), 0);
        return newEq;
      });
    } else {
      setEquation(prev => prev === '0' ? num : prev + num);
    }
  };

  const handleOperator = (op: string) => {
    if (isCalculated) {
      setEquation(result + ' ' + op + ' ');
      setResult('');
      setIsCalculated(false);
      return;
    }

    const input = inputRef.current;
    if (input && document.activeElement === input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      
      setEquation(prev => {
        let before = prev.slice(0, start);
        const after = prev.slice(end);
        
        if (/[+\-×÷*/]\s*$/.test(before)) {
          before = before.replace(/[+\-×÷*/]\s*$/, op + ' ');
        } else {
          if (before.length > 0 && !before.endsWith(' ')) before += ' ';
          before += op + ' ';
        }
        
        const newEq = before + after;
        setTimeout(() => input.setSelectionRange(before.length, before.length), 0);
        return newEq;
      });
    } else {
      if (/[+\-×÷*/]\s*$/.test(equation)) {
        setEquation(prev => prev.replace(/[+\-×÷*/]\s*$/, op + ' '));
      } else {
        setEquation(prev => prev + ' ' + op + ' ');
      }
    }
  };

  const calculate = () => {
    if (isCalculated || !equation || equation === '0') return;
    try {
      const evalExpression = equation.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-eval
      const resultNum = eval(evalExpression);
      const resultStr = String(Number(resultNum.toFixed(8)));
      
      setResult(resultStr);
      setIsCalculated(true);
      
      // Lưu vào Lịch sử
      if (equation !== resultStr) {
        setHistory(prev => [{ equation, result: resultStr }, ...prev]);
      }
    } catch (e) {
      setResult('Error');
      setIsCalculated(true);
    }
  };

  const clear = () => {
    setEquation('0');
    setResult('');
    setIsCalculated(false);
  };

  const toggleSign = () => {
    if (isCalculated) {
      const flipped = String(-parseFloat(result));
      setResult(flipped);
      setEquation(flipped);
    } else {
      const parts = equation.split(' ');
      const last = parts[parts.length - 1];
      if (!isNaN(Number(last)) && last !== '') {
        parts[parts.length - 1] = String(-parseFloat(last));
        setEquation(parts.join(' '));
      }
    }
  };

  const deleteNumber = () => {
    if (isCalculated) {
      setEquation('0');
      setResult('');
      setIsCalculated(false);
      return;
    }

    const input = inputRef.current;
    if (input && document.activeElement === input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      
      setEquation(prev => {
        if (start === end && start > 0) {
          let before = prev.slice(0, start);
          const after = prev.slice(end);
          
          if (before.endsWith(' ')) {
            before = before.trimEnd();
            const lastChar = before.slice(-1);
            if (/[+\-×÷*/]/.test(lastChar)) {
              before = before.slice(0, -1).trimEnd();
            }
          } else {
            before = before.slice(0, -1);
          }
          
          const newEq = before + after;
          setTimeout(() => input.setSelectionRange(before.length, before.length), 0);
          return newEq === '' ? '0' : newEq;
        } else if (start !== end) {
          const newEq = prev.slice(0, start) + prev.slice(end);
          setTimeout(() => input.setSelectionRange(start, start), 0);
          return newEq === '' ? '0' : newEq;
        }
        return prev;
      });
    } else {
      setEquation(prev => prev.length > 1 ? prev.trimEnd().slice(0, -1).trimEnd() : '0');
    }
  };

  // Live Result Preview (Hiện mờ mờ kết quả khi đang gõ)
  const liveResult = React.useMemo(() => {
    if (isCalculated || !equation || equation === '0') return '';
    if (/[+\-×÷*/]\s*$/.test(equation)) return ''; // Chưa gõ xong
    try {
      const evalExpr = equation.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-eval
      const res = eval(evalExpr);
      if (isNaN(res) || !isFinite(res)) return '';
      return String(Number(res.toFixed(8)));
    } catch {
      return '';
    }
  }, [equation, isCalculated]);

  // --- LẮNG NGHE BÀN PHÍM VÀ COPY/PASTE ---
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua sự kiện toàn cục nếu người dùng đang gõ vào ô Input sửa phép tính
      if (document.activeElement?.tagName === 'INPUT') return;

      const key = e.key;
      if (/[0-9.]/.test(key)) handleNumber(key);
      else if (key === '+' || key === '-') handleOperator(key);
      else if (key === '*' || key === 'x') handleOperator('×');
      else if (key === '/') handleOperator('÷');
      else if (key === 'Enter' || key === '=') calculate();
      else if (key === 'Backspace') deleteNumber();
      else if (key === 'Escape' || key === 'Delete') clear();
    };

    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text && !isNaN(Number(text))) {
        handleNumber(text);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [isOpen, equation, result, isCalculated]); // Dependency array để luôn có state mới nhất

  return (
    <AnimatePresence>
      {isOpen && (
        <div ref={constraintsRef} className="fixed inset-0 z-[100] pointer-events-none p-2 sm:p-4 flex items-center justify-center overflow-hidden">
          
            {/* 1. VẬT THỂ ẨN (PROXY) */}
            <motion.div
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.1}
              dragTransition={{ power: 0.2, timeConstant: 200 }}
              dragControls={dragControls}
              dragListener={false}
              dragMomentum={!isMobile}
              style={{ x: dragX, y: dragY, position: 'absolute', opacity: 0, pointerEvents: 'none' }}
              className="w-full max-w-[320px] h-[580px] max-h-[90dvh]"
            />

          {/* 2. GIAO DIỆN THẬT */}
          <motion.div
            style={{ x: isMobile ? dragX : smoothX, y: isMobile ? dragY : smoothY, willChange: "transform" }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={isMobile ? { duration: 0.1 } : { type: "spring", stiffness: 400, damping: 28 }}
            className="absolute sm:relative w-full max-w-[320px] h-[580px] max-h-[90dvh] m-auto bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-[0_25px_50px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto cursor-default select-none flex flex-col"
          >
            {/* Header */}
            <div 
              onPointerDown={(e) => dragControls.start(e)}
                className="relative z-[130] flex justify-between items-center p-4 pt-5 border-b border-white/5 cursor-grab active:cursor-grabbing transition-colors touch-none shrink-0"
              >
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-white/20 rounded-full pointer-events-none" />
                <span className="text-white/70 font-medium px-2 text-sm tracking-wider pointer-events-none">CALCULATOR</span>
                <div className="flex items-center gap-2">
                  <motion.button 
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setShowHistory(!showHistory)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${showHistory ? 'bg-white/20 text-white' : 'bg-white/5 hover:bg-white/20 text-white/70 hover:text-white'}`}
                  >
                    <History size={16} />
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.85 }}
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </motion.button>
                </div>
              </div>

              {/* KHU VỰC HIỂN THỊ VÀ BÀN PHÍM */}
            <div className="relative flex-1 flex flex-col min-h-0">
              {/* Display Screen */}
              <div className="px-5 py-3 flex items-center justify-between gap-4 h-[20%] min-h-[70px] max-h-[110px] shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="decimal"
                  value={equation}
                  onFocus={() => setIsCalculated(false)}
                  onClick={() => setIsCalculated(false)}
                  onCompositionStart={() => {
                    isComposing.current = true;
                  }}
                  onCompositionEnd={(e) => {
                    isComposing.current = false;
                    // Dọn dẹp các chữ cái tiếng Việt ngay sau khi gõ xong
                    let val = e.currentTarget.value;
                    val = val.replace(/\*/g, '×').replace(/\//g, '÷');
                    let cleanVal = val.replace(/\s+/g, '');
                    cleanVal = cleanVal.replace(/[^0-9+\-×÷.]/g, '');
                    let formattedVal = cleanVal.replace(/([+\-×÷])/g, ' $1 ');
                    formattedVal = formattedVal.replace(/^\s+/, '');
                    setEquation(formattedVal);
                  }}
                  onChange={(e) => {
                    // Nếu đang dùng bộ gõ (Unikey), tạm thời cho hiển thị chữ để bộ gõ không bị lỗi tự xóa
                    if (isComposing.current) {
                      setEquation(e.target.value);
                      return;
                    }
                    
                    let val = e.target.value;
                    
                    // Chuyển dấu * và / thành ký tự đẹp
                    val = val.replace(/\*/g, '×').replace(/\//g, '÷');
                    
                    // Xóa tất cả khoảng trắng để làm sạch
                    let cleanVal = val.replace(/\s+/g, '');
                    
                    // Cấm nhập chữ: Xóa sạch mọi ký tự không phải số hoặc phép toán
                    cleanVal = cleanVal.replace(/[^0-9+\-×÷.]/g, '');
                    
                    // Gán dính dấu cách: tự động chèn đúng 1 khoảng trắng trước và sau phép toán
                    let formattedVal = cleanVal.replace(/([+\-×÷])/g, ' $1 ');
                    
                    // Cắt khoảng trắng thừa ở đầu chuỗi
                    formattedVal = formattedVal.replace(/^\s+/, '');
                    
                    setEquation(formattedVal);
                    setIsCalculated(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === '=') {
                      e.preventDefault();
                      calculate();
                      return;
                    }
                    
                    // Tránh can thiệp khi bộ gõ tiếng Việt đang hoạt động (tránh lỗi xóa chữ)
                    if (e.nativeEvent.isComposing || e.keyCode === 229) {
                      return;
                    }
                    
                    // Cấm bấm phím cách (Space) để tránh tạo khoảng trắng thừa ở cuối làm lỗi phép tính
                    if (e.key === ' ') {
                      e.preventDefault();
                      return;
                    }
                    
                    // Ngăn chặn bấm phím chữ cái hoặc ký tự đặc biệt ngay từ đầu
                    if (e.key.length === 1 && !/[0-9+\-×÷*/.]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="flex-1 min-w-0 text-white/60 text-2xl font-light bg-transparent border-none outline-none text-left cursor-text focus:text-white transition-colors"
                />
                <div className="text-white text-4xl font-light tracking-tight shrink-0 select-text cursor-text text-right flex items-center max-w-[60%] overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {isCalculated && <span className="text-white/30 mr-2 text-3xl shrink-0">=</span>}
                  {isCalculated ? result : (liveResult ? <span className="text-white/30">{liveResult}</span> : null)}
                </div>
              </div>

              {/* Keypad */}
              <div className="p-3 bg-white/5 flex-1 grid grid-cols-4 gap-2 overflow-y-auto overscroll-contain">
                <CalcBtn onClick={clear} variant="danger">AC</CalcBtn>
                <CalcBtn onClick={toggleSign} variant="info">+/-</CalcBtn>
                <CalcBtn onClick={deleteNumber} variant="warning"><Delete size={20} /></CalcBtn>
                <CalcBtn onClick={() => handleOperator('÷')} variant="divide"><Divide size={20} /></CalcBtn>

                <CalcBtn onClick={() => handleNumber('7')}>7</CalcBtn>
                <CalcBtn onClick={() => handleNumber('8')}>8</CalcBtn>
                <CalcBtn onClick={() => handleNumber('9')}>9</CalcBtn>
                <CalcBtn onClick={() => handleOperator('×')} variant="multiply"><Multiply size={20} /></CalcBtn>

                <CalcBtn onClick={() => handleNumber('4')}>4</CalcBtn>
                <CalcBtn onClick={() => handleNumber('5')}>5</CalcBtn>
                <CalcBtn onClick={() => handleNumber('6')}>6</CalcBtn>
                <CalcBtn onClick={() => handleOperator('-')} variant="subtract"><Minus size={20} /></CalcBtn>

                <CalcBtn onClick={() => handleNumber('1')}>1</CalcBtn>
                <CalcBtn onClick={() => handleNumber('2')}>2</CalcBtn>
                <CalcBtn onClick={() => handleNumber('3')}>3</CalcBtn>
                <CalcBtn onClick={() => handleOperator('+')} variant="add"><Plus size={20} /></CalcBtn>

                <CalcBtn onClick={() => handleNumber('0')} className="col-span-2">0</CalcBtn>
                <CalcBtn onClick={() => handleNumber('.')}>.</CalcBtn>
                <CalcBtn onClick={calculate} variant="primary"><Equal size={20} /></CalcBtn>
              </div>

              {/* Bảng Lịch sử */}
              <AnimatePresence>
                {showHistory && (
                  <>
                    {/* Lớp phủ vô hình bắt click ngoài */}
                    <div 
                      className="fixed inset-0 z-[120] pointer-events-auto" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHistory(false);
                      }} 
                    />
                    
                    <motion.div
                      drag="y"
                      dragControls={historyDragControls}
                      dragListener={false}
                      dragMomentum={!isMobile}
                      dragConstraints={{ top: 0, bottom: 0 }}
                      dragElastic={{ top: 0, bottom: 0.8 }}
                      onDragEnd={(e, info) => {
                        if (info.offset.y > 400) {
                          setShowHistory(false);
                        }
                      }}
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={isMobile ? { duration: 0.1 } : { type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute inset-0 z-[130] bg-gray-900/95 backdrop-blur-2xl border-t border-white/10 p-4 pt-10 overflow-y-auto flex flex-col gap-2 overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                      onClick={(e) => e.stopPropagation()}
                      onWheel={(e) => e.stopPropagation()}
                    >
                      <div 
                        className="absolute top-0 left-0 right-0 h-10 flex items-center justify-center cursor-grab active:cursor-grabbing z-10 touch-none"
                        onPointerDown={(e) => historyDragControls.start(e)}
                      >
                        <div className="w-12 h-1.5 bg-white/20 rounded-full pointer-events-none" />
                      </div>
                      {history.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-white/30 text-sm gap-2">
                          <History size={32} className="opacity-50" />
                          <span>No calculation history</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white/50 text-xs font-medium uppercase tracking-wider">History</span>
                            <button onClick={() => setHistory([])} className="text-xs text-red-400 hover:text-red-300 transition-colors bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded-full">
                              Clear All
                            </button>
                          </div>
                          {history.map((item, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => {
                                setEquation(item.equation);
                                setResult(item.result);
                                setIsCalculated(true);
                                setShowHistory(false);
                              }}
                              className="group flex items-center justify-between cursor-pointer hover:bg-white/10 p-3 pr-2 rounded-xl transition-all active:scale-[0.98]"
                            >
                              <div className="flex-1 min-w-0 flex items-center justify-between mr-2">
                                <span className="text-white/50 text-sm font-mono tracking-widest truncate mr-4" title={item.equation}>{item.equation} =</span>
                                <span className="text-white text-2xl font-light shrink-0">{item.result}</span>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setHistory(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="p-2 text-white/40 active:text-red-400 md:hover:text-red-400 active:bg-red-500/20 md:hover:bg-red-500/20 rounded-full transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                title="Delete this calculation"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function CalcBtn({ onClick, children, variant = 'default', className = '' }: any) {
  const baseStyle = "flex items-center justify-center rounded-2xl text-xl font-medium transition-all duration-200 shadow-sm active:scale-90 hover:scale-105 h-full min-h-[40px] sm:min-h-[48px] cursor-pointer";
  const variants = {
    default: "bg-white/10 hover:bg-white/20 text-white",
    secondary: "bg-gray-500/20 hover:bg-gray-400/40 text-gray-200",
    primary: "bg-orange-500 hover:bg-orange-400 text-white",
    danger: "bg-red-500 hover:bg-red-400 text-white shadow-red-500/20",
    warning: "bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/20",
    info: "bg-cyan-500 hover:bg-cyan-400 text-white shadow-cyan-500/20",
    divide: "bg-purple-500 hover:bg-purple-400 text-white shadow-purple-500/20",
    multiply: "bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20",
    subtract: "bg-pink-500 hover:bg-pink-400 text-white shadow-pink-500/20",
    add: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20",
  };
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      onPointerDown={(e) => e.preventDefault()}
      className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
