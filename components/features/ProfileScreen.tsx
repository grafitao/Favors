"use client";

import React from 'react';
import { motion } from 'motion/react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface ProfileScreenProps {
  user: FirebaseUser;
  direction: number;
}

export const ProfileScreen = ({ user, direction }: ProfileScreenProps) => {
  return (
    <motion.main
      key="profile"
      custom={direction}
      initial={{ x: direction > 0 ? 50 : -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: direction < 0 ? 50 : -50, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-md mx-auto px-6 py-12"
    >
      <div className="flex flex-col items-center text-center mb-12">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-6 border-2 border-white/10 shadow-2xl">
          <img 
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
            alt={user.displayName || ''} 
            className="w-full h-full object-cover grayscale" 
          />
        </div>
        <h2 className="text-2xl font-medium text-white tracking-tight">{user.displayName}</h2>
        <p className="text-[#A0A0A0] text-xs font-medium mt-1 tracking-wide">{user.email}</p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => auth.signOut()}
          className="w-full bg-white/5 text-white py-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-white/10 transition-all border border-white/5"
        >
          Sair da Conta
        </button>
      </div>
    </motion.main>
  );
};
