"use client";

import { useState, useEffect } from 'react';

export const useGoogleMaps = () => {
  const [isMapsLoaded, setIsMapsLoaded] = useState(false);

  useEffect(() => {
    if ((window as any).google) {
      setIsMapsLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsMapsLoaded(true));
      return;
    }

    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        const apiKey = data.apiKey;
        if (apiKey) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
          script.async = true;
          script.onload = () => setIsMapsLoaded(true);
          document.head.appendChild(script);
        } else {
          console.error("Google Maps API key not found.");
        }
      })
      .catch(err => console.error("Failed to fetch config:", err));
  }, []);

  return isMapsLoaded;
};
