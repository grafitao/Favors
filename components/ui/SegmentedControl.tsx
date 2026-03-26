"use client";

import React from 'react';
import { motion } from 'motion/react';

interface SegmentedControlProps {
  options: { id: string; label: string; icon: React.ReactNode }[];
  activeId: string;
  onChange: (id: string) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, activeId, onChange }) => {
  return (
    <div className="relative flex bg-[#121212] p-1 rounded-[12px] border border-white/5 overflow-hidden min-h-[52px]">
      {/* Sliding Indicator */}
      <motion.div
        className="absolute inset-y-1 bg-white/10 rounded-[10px] shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/5"
        initial={false}
        animate={{
          x: options.findIndex(opt => opt.id === activeId) * 100 + '%',
          width: `${100 / options.length}%`,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 1
        }}
      />

      {options.map((option) => (
        <motion.button 
          key={option.id}
          whileTap={{ scale: 0.97 }}
          onClick={() => onChange(option.id)}
          className={`relative z-10 flex-1 py-2 px-1 rounded-xl font-bold transition-colors duration-300 flex items-center justify-center gap-1.5 ${
            activeId === option.id ? 'text-white' : 'text-[#666666]'
          }`}
        >
          <div className="shrink-0 flex items-center justify-center">
            {React.isValidElement(option.icon) && React.cloneElement(option.icon as React.ReactElement<any>, { 
              size: 14,
              strokeWidth: activeId === option.id ? 2 : 1.5 
            })}
          </div>
          <span className="text-[8.5px] leading-[1.1] tracking-tight uppercase text-center break-words max-w-full">
            {option.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
};
