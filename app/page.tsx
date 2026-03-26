"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Truck, Menu } from 'lucide-react';
import { signIn } from '@/lib/firebase';
import { TaskData } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BottomNav } from '@/components/ui/BottomNav';
import { ProposalForm } from '@/components/features/ProposalForm';
import { SearchingScreen } from '@/components/features/SearchingScreen';
import { ProfileScreen } from '@/components/features/ProfileScreen';
import { HistoryScreen } from '@/components/features/HistoryScreen';

export default function App() {
  const isMapsLoaded = useGoogleMaps();
  const { user, isAuthReady } = useAuth();

  const [view, setView] = useState<'engine' | 'history' | 'profile' | 'searching'>('engine');
  const [direction, setDirection] = useState(0);
  const viewOrder: ('engine' | 'history' | 'profile' | 'searching')[] = ['engine', 'history', 'profile', 'searching'];

  const [currentProposalId, setCurrentProposalId] = useState<string | null>(null);
  const [result, setResult] = useState<TaskData | null>(null);

  const handleViewChange = (newView: 'engine' | 'history' | 'profile' | 'searching') => {
    const currentIndex = viewOrder.indexOf(view);
    const nextIndex = viewOrder.indexOf(newView);
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setView(newView);
  };

  const handleProposalSuccess = (proposalId: string, taskResult: TaskData) => {
    setCurrentProposalId(proposalId);
    setResult(taskResult);
    handleViewChange('searching');
  };

  if (!isMapsLoaded || !isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6 text-center">
        <div className="w-20 h-20 bg-[#121212] rounded-3xl flex items-center justify-center text-[#00E5FF] mb-8 shadow-xl shadow-[#00E5FF]/10 border border-white/5">
          <Truck size={40} />
        </div>
        <h1 className="text-3xl font-black text-white mb-4 tracking-tight">App Favors</h1>
        <p className="text-[#666666] mb-10 max-w-xs leading-relaxed">
          Conecte-se para começar a pedir ou realizar favores na sua região.
        </p>
        <button 
          onClick={() => signIn()}
          className="w-full max-w-xs bg-[#00E5FF] text-black py-5 rounded-2xl font-bold text-lg shadow-xl shadow-[#00E5FF]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
          Entrar com Google
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#121212] text-white font-sans selection:bg-blue-500/30 pb-24">
        {/* Header (Hidden when searching) */}
        {view !== 'searching' && (
          <header className="bg-[#121212] sticky top-0 z-30 px-6 py-6 flex items-center justify-between">
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <Menu size={22} strokeWidth={1.5} className="text-white" />
            </button>
            <h1 className="font-medium text-base text-white absolute left-1/2 -translate-x-1/2 tracking-tight">
              {view === 'engine' ? 'Criar Nova Proposta' : 
               view === 'profile' ? 'Meu Perfil' : 'Histórico'}
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </header>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          {view === 'searching' && result && currentProposalId && (
            <motion.div
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100]"
            >
              <SearchingScreen 
                proposalId={currentProposalId}
                result={result} 
                onCancel={() => handleViewChange('engine')}
              />
            </motion.div>
          )}

          {view === 'engine' && (
            <ProposalForm direction={direction} onSuccess={handleProposalSuccess} />
          )}

          {view === 'profile' && (
            <ProfileScreen user={user} direction={direction} />
          )}

          {view === 'history' && (
            <HistoryScreen user={user} direction={direction} />
          )}
        </AnimatePresence>

        <BottomNav view={view} handleViewChange={handleViewChange} />
      </div>
    </ErrorBoundary>
  );
}