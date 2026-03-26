"use client";

import React, { useState, useEffect } from 'react';
import { motion, useDragControls } from 'motion/react';
import { X, MessageCircle } from 'lucide-react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TaskData } from '@/types';
import { formatBRL } from '@/lib/utils';
import { GoogleMap } from './GoogleMap';
import { StatusStepper } from '../ui/StatusStepper';

export const SearchingScreen = ({ proposalId, result, onCancel }: { proposalId: string, result: TaskData, onCancel: () => void }) => {
  const [status, setStatus] = useState('waiting');
  const [driverName, setDriverName] = useState<string | null>(null);
  const [nearbyDrivers, setNearbyDrivers] = useState<{ id: number, lat: number, lng: number }[]>([]);
  const [snapPoint, setSnapPoint] = useState<'collapsed' | 'half' | 'expanded'>('half');
  const dragControls = useDragControls();

  const snapPoints = {
    expanded: '10%',
    half: '50%',
    collapsed: '80%'
  };

  useEffect(() => {
    if (!proposalId) return;
    const unsub = onSnapshot(doc(db, 'proposals', proposalId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStatus(data.status || 'waiting');
        setDriverName(data.driver_name || null);
      }
    });
    return () => unsub();
  }, [proposalId]);

  useEffect(() => {
    if (result.origin_coords) {
      const drivers = [1, 2, 3, 4, 5].map(id => ({
        id,
        lat: result.origin_coords!.lat + (Math.random() - 0.5) * 0.01,
        lng: result.origin_coords!.lng + (Math.random() - 0.5) * 0.01,
      }));
      setNearbyDrivers(drivers);
    }
  }, [result.origin_coords]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#000000] overflow-hidden flex flex-col">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <GoogleMap 
          origin={result.origem_validada} 
          destination={result.destino_validado}
          originCoords={result.origin_coords}
          destinationCoords={result.destination_coords}
          nearbyDrivers={status === 'waiting' ? nearbyDrivers : []}
        />
        
        {/* Radar Pulse Animation */}
        {status === 'waiting' && result.origin_coords && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              className="w-40 h-40 border-2 border-[#00E5FF] rounded-full"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
              className="w-40 h-40 border-2 border-[#00E5FF] rounded-full"
            />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      </div>

      {/* Top Status Bar */}
      <div className="relative z-20 p-6 pt-12 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onCancel}
            className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-sm font-bold text-white tracking-widest uppercase">Acompanhamento</h2>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* Bottom Sheet Card */}
      <motion.div 
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          const velocity = info.velocity.y;
          const offset = info.offset.y;
          
          if (velocity > 400 || offset > 100) {
            // Swiped down
            if (snapPoint === 'expanded') setSnapPoint('half');
            else if (snapPoint === 'half') setSnapPoint('collapsed');
          } else if (velocity < -400 || offset < -100) {
            // Swiped up
            if (snapPoint === 'collapsed') setSnapPoint('half');
            else if (snapPoint === 'half') setSnapPoint('expanded');
          }
        }}
        initial={{ y: "100%" }}
        animate={{ y: snapPoints[snapPoint] }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="mt-auto relative z-20 p-8 pt-4 bg-[#121212] rounded-t-[32px] border-t border-white/5 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] h-[90vh]"
      >
        <div 
          className="w-full h-8 flex items-center justify-center cursor-grab active:cursor-grabbing mb-4"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="w-12 h-1 bg-white/10 rounded-full" />
        </div>
        
        <div className="space-y-8 overflow-y-auto max-h-full pb-20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">{result.titulo_resumo}</h2>
              <p className="text-xs text-[#666666] font-bold uppercase tracking-widest mt-1">
                {status === 'accepted' && driverName ? `${driverName} está a caminho` : 'Status do Favor'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-[#00E5FF]">{formatBRL(result.valor_entrega || 0)}</span>
              <p className="text-[10px] text-[#666666] font-bold uppercase tracking-widest mt-1">Taxa Entrega</p>
            </div>
          </div>

          <StatusStepper status={status} />

          <div className="pt-6 border-t border-white/5 flex gap-4">
            <button 
              onClick={onCancel}
              className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white rounded-[12px] font-bold text-sm transition-colors"
            >
              {status === 'waiting' ? 'Cancelar' : 'Voltar'}
            </button>
            <button 
              disabled={!driverName}
              className="flex-[2] py-5 bg-[#00E5FF] disabled:bg-white/5 disabled:text-[#666666] text-black rounded-[12px] font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-xl shadow-[#00E5FF]/20"
            >
              <MessageCircle size={18} />
              Chat com Entregador
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
