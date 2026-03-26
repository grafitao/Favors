"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { History, Package, MapPin, Calendar, Loader2 } from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { formatBRL } from '@/lib/utils';

interface HistoryScreenProps {
  direction: number;
  user: FirebaseUser | null;
}

export const HistoryScreen = ({ direction, user }: HistoryScreenProps) => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'proposals'),
          where('client_id', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProposals(data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);
  return (
    <motion.main
      key="history"
      custom={direction}
      initial={{ x: direction > 0 ? 50 : -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: direction < 0 ? 50 : -50, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-md mx-auto px-6 py-8"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center h-80">
          <Loader2 className="animate-spin text-[#00E5FF] mb-4" size={32} />
          <p className="text-[#555555] text-sm">Carregando histórico...</p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-[#555555] mb-6">
            <History size={32} strokeWidth={1} />
          </div>
          <h3 className="text-lg font-medium text-white tracking-tight">Nenhum histórico</h3>
          <p className="text-[#555555] text-xs mt-2 tracking-wide">Suas propostas e entregas aparecerão aqui.</p>
        </div>
      ) : (
        <div className="space-y-4 pb-20">
          <h2 className="text-xl font-bold text-white mb-6">Suas Propostas</h2>
          {proposals.map((proposal) => (
            <div key={proposal.id} className="bg-[#1A1A1A] rounded-2xl p-5 border border-white/5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg">
                    {proposal.type === 'coleta' ? 'Apenas Coleta' : `Comprar ${proposal.item_description || 'Item'}`}
                  </h3>
                  <div className="flex items-center text-[#888888] text-xs mt-1">
                    <Calendar size={12} className="mr-1" />
                    {proposal.createdAt?.toDate().toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[#00E5FF] font-black">{formatBRL(proposal.delivery_fee || 0)}</span>
                  <div className="text-[10px] text-[#888888] uppercase tracking-wider mt-1 font-bold">
                    {proposal.status === 'completed' ? 'Concluído' : proposal.status === 'waiting' ? 'Aguardando' : 'Em Andamento'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <MapPin size={14} className="text-[#555555]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#555555] uppercase font-bold tracking-wider">Origem</p>
                    <p className="text-sm text-[#CCCCCC] line-clamp-1">{proposal.origin}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <MapPin size={14} className="text-[#00E5FF]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#555555] uppercase font-bold tracking-wider">Destino</p>
                    <p className="text-sm text-[#CCCCCC] line-clamp-1">{proposal.destination}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.main>
  );
};
