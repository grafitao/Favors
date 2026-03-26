"use client";

import React, { useEffect, useRef } from 'react';
import { MAP_DARK_STYLE, ELECTRIC_BLUE } from '@/lib/utils';

export const GoogleMap = ({ origin, destination, originCoords, destinationCoords, nearbyDrivers }: { 
  origin: string, 
  destination: string,
  originCoords?: { lat: number, lng: number } | null,
  destinationCoords?: { lat: number, lng: number } | null,
  nearbyDrivers?: { id: number, lat: number, lng: number }[]
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || !(window as any).google) return;

    const map = new google.maps.Map(mapRef.current, {
      center: originCoords || { lat: -23.5505, lng: -46.6333 },
      zoom: 14,
      styles: MAP_DARK_STYLE,
      disableDefaultUI: true,
      backgroundColor: '#000000'
    });
    googleMapRef.current = map;

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: ELECTRIC_BLUE,
        strokeWeight: 4,
        strokeOpacity: 0.8
      },
    });

    const start = originCoords ? { lat: originCoords.lat, lng: originCoords.lng } : origin;
    const end = destinationCoords ? { lat: destinationCoords.lat, lng: destinationCoords.lng } : destination;

    if (start && end) {
      directionsService.route(
        {
          origin: start,
          destination: end,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
          }
        }
      );
    }
  }, [origin, destination, originCoords, destinationCoords]);

  useEffect(() => {
    if (!googleMapRef.current || !nearbyDrivers) return;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Add new markers
    nearbyDrivers.forEach(driver => {
      const marker = new google.maps.Marker({
        position: { lat: driver.lat, lng: driver.lng },
        map: googleMapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: ELECTRIC_BLUE,
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 1,
          scale: 4,
        },
      });
      markersRef.current.push(marker);
    });
  }, [nearbyDrivers]);

  return <div ref={mapRef} className="w-full h-full" />;
};
