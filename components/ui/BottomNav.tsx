"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Home, Plus, History, User } from 'lucide-react';

interface BottomNavProps {
  view: 'engine' | 'history' | 'profile' | 'searching';
  handleViewChange: (view: 'engine' | 'history' | 'profile' | 'searching') => void;
}

export const BottomNav = ({ view, handleViewChange }: BottomNavProps) => {
  if (view === 'searching') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#121212] px-8 py-5 flex items-center justify-between z-40 border-t border-white/5 backdrop-blur-xl">
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => handleViewChange('engine')}
        className={`relative flex flex-col items-center gap-1.5 p-2 transition-colors ${view === 'engine' ? 'text-[#00E5FF]' : 'text-[#666666]'}`}
      >
        <Home size={22} strokeWidth={view === 'engine' ? 2.5 : 1.5} />
        <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Início</span>
      </motion.button>

      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => handleViewChange('engine')}
        className="flex flex-col items-center gap-1 text-white"
      >
        <div className="w-12 h-12 bg-[#00E5FF] rounded-full flex items-center justify-center -mt-10 shadow-[0_0_20px_rgba(0,229,255,0.3)] border border-white/10 relative overflow-hidden">
          <Plus size={24} strokeWidth={3} className="text-black" />
        </div>
        <span className="text-[8px] font-bold uppercase tracking-[0.2em] mt-2 text-[#00E5FF]">Criar</span>
      </motion.button>

      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => handleViewChange('history')}
        className={`relative flex flex-col items-center gap-1.5 p-2 transition-colors ${view === 'history' ? 'text-[#00E5FF]' : 'text-[#666666]'}`}
      >
        <History size={22} strokeWidth={view === 'history' ? 2.5 : 1.5} />
        <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Histórico</span>
      </motion.button>

      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => handleViewChange('profile')}
        className={`relative flex flex-col items-center gap-1.5 p-2 transition-colors ${view === 'profile' ? 'text-[#00E5FF]' : 'text-[#666666]'}`}
      >
        <User size={22} strokeWidth={view === 'profile' ? 2.5 : 1.5} />
        <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Perfil</span>
      </motion.button>
    </nav>
  );
};
