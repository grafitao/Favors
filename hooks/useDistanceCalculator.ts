import { useState, useCallback } from 'react';
import { BASE_FEE, KM_RATE } from '@/lib/utils';

interface DistanceResult {
  distance: number;
  cost: number;
  origin_coords: { lat: number; lng: number };
  destination_coords: { lat: number; lng: number };
}

export const useDistanceCalculator = () => {
  const [deliveryFee, setDeliveryFee] = useState<number>(0);

  const calculateDistance = useCallback(async (origin: string, destination: string): Promise<DistanceResult | null> => {
    if (origin === 'A definir' || !destination) return null;

    try {
      const url = `/api/distance?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.warn("Maps API Warning:", errorData.error);
        return null;
      }

      const data = await response.json();
      const distanceInKm = data.distance;
      const cost = BASE_FEE + (distanceInKm * KM_RATE);
      return { 
        distance: distanceInKm, 
        cost,
        origin_coords: data.origin_coords,
        destination_coords: data.destination_coords
      };
    } catch (err) {
      console.error("Erro ao calcular distância:", err);
      return null;
    }
  }, []);

  return { deliveryFee, setDeliveryFee, calculateDistance };
};
