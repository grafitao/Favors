"use client";

import React from 'react';
import { Check } from 'lucide-react';

export const StatusStepper = ({ status }: { status: string }) => {
  const steps = [
    { id: 'waiting', label: 'Procurando', description: 'Estamos procurando o melhor entregador...' },
    { id: 'accepted', label: 'Aceito', description: 'O entregador aceitou seu favor!' },
    { id: 'in_transit', label: 'Em Trânsito', description: 'Seu favor está sendo realizado agora.' },
    { id: 'completed', label: 'Entregue', description: 'Favor entregue! Confira seu item.' }
  ];

  const currentIndex = steps.findIndex(s => s.id === status);

  return (
    <div className="space-y-6">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIndex;
        const isActive = idx === currentIndex;
        
        return (
          <div key={step.id} className="flex gap-4 relative">
            {idx < steps.length - 1 && (
              <div className={`absolute left-[15px] top-8 bottom-0 w-[2px] ${isCompleted ? 'bg-blue-500' : 'bg-white/10'}`} />
            )}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors duration-500 ${
              isCompleted ? 'bg-blue-500 text-white' : 
              isActive ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-500' : 
              'bg-white/5 text-[#555555]'
            }`}>
              {isCompleted ? <Check size={16} strokeWidth={3} /> : <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-500 animate-pulse' : 'bg-current'}`} />}
            </div>
            <div className={`pb-4 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
              <p className="text-sm font-bold text-white uppercase tracking-widest">{step.label}</p>
              <p className="text-xs text-[#A0A0A0] mt-1 leading-relaxed">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
