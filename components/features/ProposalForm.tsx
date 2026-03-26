"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Truck, FileText, AlertCircle, Send, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { TaskData } from '@/types';
import { formatBRL } from '@/lib/utils';
import { SegmentedControl } from '../ui/SegmentedControl';
import { AddressAutocomplete } from '../ui/AddressAutocomplete';
import { useDistanceCalculator } from '@/hooks/useDistanceCalculator';

interface ProposalFormProps {
  direction: number;
  onSuccess: (proposalId: string, result: TaskData) => void;
}

export const ProposalForm = ({ direction, onSuccess }: ProposalFormProps) => {
  const [tipoFavor, setTipoFavor] = useState<'coleta' | 'compra' | 'fazer_proposta'>('coleta');
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [itens, setItens] = useState('');
  const [valorEstimado, setValorEstimado] = useState<number>(0);
  const [valorDisplay, setValorDisplay] = useState('');
  const [descricao, setDescricao] = useState('');
  
  const [origemCoords, setOrigemCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinoCoords, setDestinoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isOrigemValid, setIsOrigemValid] = useState(false);
  const [isDestinoValid, setIsDestinoValid] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { deliveryFee, setDeliveryFee, calculateDistance } = useDistanceCalculator();

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const numericValue = Number(value) / 100;
    setValorEstimado(numericValue);
    setValorDisplay(numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }));
  };

  useEffect(() => {
    if (isOrigemValid && isDestinoValid && origemCoords && destinoCoords) {
      const originQuery = `${origemCoords.lat},${origemCoords.lng}`;
      const destinationQuery = `${destinoCoords.lat},${destinoCoords.lng}`;
      calculateDistance(originQuery, destinationQuery).then(data => {
        if (data) setDeliveryFee(data.cost);
      });
    } else {
      setDeliveryFee(0);
    }
  }, [isOrigemValid, isDestinoValid, origemCoords, destinoCoords]);

  const processMessage = async () => {
    if (!isOrigemValid || !isDestinoValid) {
      setError("Por favor, selecione os endereços da lista.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const originQuery = `${origemCoords!.lat},${origemCoords!.lng}`;
      const destinationQuery = `${destinoCoords!.lat},${destinoCoords!.lng}`;

      const distanceData = await calculateDistance(originQuery, destinationQuery);
      if (!distanceData) throw new Error("Erro ao calcular distância.");

      const fee = tipoFavor === 'fazer_proposta' ? valorEstimado : distanceData.cost;
      setDeliveryFee(fee);
      const itemValueNum = tipoFavor === 'compra' ? valorEstimado : 0;

      const docRef = await addDoc(collection(db, 'proposals'), {
        client_id: auth.currentUser?.uid,
        type: tipoFavor,
        origin: origem,
        destination: destino,
        origin_coords: origemCoords,
        destination_coords: destinoCoords,
        item_description: itens,
        item_value: itemValueNum,
        delivery_fee: fee,
        distance_km: distanceData.distance,
        status: 'waiting',
        createdAt: serverTimestamp()
      });

      const result: TaskData = {
        origem_validada: origem,
        destino_validado: destino,
        titulo_resumo: tipoFavor === 'coleta' ? 'Apenas Coleta' : tipoFavor === 'fazer_proposta' ? 'Proposta Customizada' : `Comprar ${itens}`,
        lista_compras: itens ? [itens] : [],
        valor_estimado_itens: itemValueNum,
        orientacoes_prestador: '',
        categoria: tipoFavor === 'compra' ? 'compras' : 'entrega',
        distancia_km: distanceData.distance,
        valor_entrega: fee,
        origin_coords: origemCoords,
        destination_coords: destinoCoords
      };

      onSuccess(docRef.id, result);
    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao publicar sua proposta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.main
      key="engine"
      custom={direction}
      initial={{ x: direction > 0 ? 50 : -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: direction < 0 ? 50 : -50, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-md mx-auto px-6 py-8"
    >
      <div className="space-y-8">
        <SegmentedControl 
          options={[
            { id: 'coleta', label: 'APENAS COLETA', icon: <Package size={14} /> },
            { id: 'compra', label: 'PRECISA COMPRAR', icon: <Truck size={14} /> },
            { id: 'fazer_proposta', label: 'FAZER PROPOSTA', icon: <FileText size={14} /> }
          ]}
          activeId={tipoFavor}
          onChange={(id) => setTipoFavor(id as 'coleta' | 'compra' | 'fazer_proposta')}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={tipoFavor}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <AddressAutocomplete
              label="ORIGEM"
              placeholder="Endereço de coleta"
              value={origem}
              onChange={(val) => {
                setOrigem(val);
                setIsOrigemValid(false);
              }}
              onAddressSelect={(addr, lat, lng) => {
                setOrigem(addr);
                setOrigemCoords({ lat, lng });
                setIsOrigemValid(true);
              }}
            />

            <AddressAutocomplete
              label="DESTINO"
              placeholder="Endereço de entrega"
              value={destino}
              onChange={(val) => {
                setDestino(val);
                setIsDestinoValid(false);
              }}
              onAddressSelect={(addr, lat, lng) => {
                setDestino(addr);
                setDestinoCoords({ lat, lng });
                setIsDestinoValid(true);
              }}
            />

            <AnimatePresence>
              {(tipoFavor === 'compra' || tipoFavor === 'fazer_proposta') && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 30 
                  }}
                  className="flex flex-col gap-4 overflow-hidden"
                >
                  {tipoFavor === 'fazer_proposta' && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-white uppercase tracking-[0.2em] ml-1">VALOR DA SUA PROPOSTA</label>
                      <input
                        type="text"
                        value={valorDisplay}
                        onChange={handleValorChange}
                        placeholder="R$ 0,00"
                        className="w-full p-4 bg-[#121212] border-0 focus:ring-1 focus:ring-[#00E5FF] rounded-[12px] outline-none transition-all text-sm font-bold text-[#00E5FF] placeholder:text-[#666666]"
                      />
                    </div>
                  )}
                  <div className="flex gap-4">
                    <div className="w-[70%] space-y-3">
                      <label className="text-[10px] font-bold text-white uppercase tracking-[0.2em] ml-1">
                        {tipoFavor === 'fazer_proposta' ? 'ITEM (OPCIONAL)' : 'ITEM'}
                      </label>
                      <input
                        type="text"
                        value={itens}
                        onChange={(e) => setItens(e.target.value)}
                        placeholder={tipoFavor === 'fazer_proposta' ? 'Ex: Documento, Chave...' : 'O que precisa comprar?'}
                        className="w-full p-4 bg-[#121212] border-0 focus:ring-1 focus:ring-[#00E5FF] rounded-[12px] outline-none transition-all text-sm text-white placeholder:text-[#666666]"
                      />
                    </div>
                    <div className="w-[30%] space-y-3">
                      <label className="text-[10px] font-bold text-white uppercase tracking-[0.2em] ml-1">
                        {tipoFavor === 'fazer_proposta' ? 'VALOR (OPCIONAL)' : 'VALOR'}
                      </label>
                      <input
                        type="text"
                        value={tipoFavor === 'fazer_proposta' ? '' : valorDisplay}
                        onChange={tipoFavor === 'fazer_proposta' ? undefined : handleValorChange}
                        disabled={tipoFavor === 'fazer_proposta'}
                        placeholder="R$ 0,00"
                        className="w-full p-4 bg-[#121212] border-0 focus:ring-1 focus:ring-[#00E5FF] rounded-[12px] outline-none transition-all text-sm font-bold text-[#00E5FF] placeholder:text-[#666666] disabled:opacity-50 disabled:text-[#666666]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-white uppercase tracking-[0.2em] ml-1">DESCRIÇÃO (OPCIONAL)</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Trazer troco para R$ 50 ou bater no portão"
                className="w-full p-4 bg-[#121212] border-0 focus:ring-1 focus:ring-[#00E5FF] rounded-[12px] outline-none transition-all resize-none text-sm text-white placeholder:text-[#666666] h-32"
              />
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-[12px] flex items-center gap-3"
            >
              <AlertCircle size={18} />
              <p className="text-xs font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {isOrigemValid && isDestinoValid && tipoFavor !== 'fazer_proposta' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-[#121212] rounded-[12px] border border-white/5 flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest">Valor da Entrega</p>
              <p className="text-xs text-[#A0A0A0] mt-1">Base + R$ 2,00/km</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-[#00E5FF]">{formatBRL(deliveryFee)}</span>
            </div>
          </motion.div>
        )}

        <div className="pt-6">
          <button
            onClick={processMessage}
            disabled={
              loading || 
              (!isOrigemValid || !isDestinoValid) ||
              (tipoFavor === 'compra' && !itens.trim()) ||
              (tipoFavor === 'fazer_proposta' && valorEstimado === 0)
            }
            className="w-full bg-[#00E5FF] text-black py-5 rounded-[12px] font-black text-lg active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-3 shadow-[0_10px_30_rgba(0,229,255,0.2)]"
          >
            {loading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                <Send size={20} />
                PUBLICAR PROPOSTA
              </>
            )}
          </button>
          {(!isOrigemValid || !isDestinoValid) && !loading && (
            <p className="text-[10px] text-center text-[#666666] mt-4 font-bold uppercase tracking-[0.2em]">
              Selecione os endereços para calcular o frete
            </p>
          )}
        </div>
      </div>
    </motion.main>
  );
};
