"use client";

import React, { useEffect } from 'react';
import { MapPin } from 'lucide-react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

interface AddressAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  onAddressSelect: (address: string, lat: number, lng: number) => void;
}

export const AddressAutocomplete = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  onAddressSelect 
}: AddressAutocompleteProps) => {
  const {
    ready,
    value: inputValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "br" },
    },
    debounce: 300,
    defaultValue: value
  });

  useEffect(() => {
    if (value !== inputValue) {
      setValue(value, false);
    }
  }, [value, inputValue, setValue]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChange(e.target.value);
  };

  const handleSelect = async (suggestion: google.maps.places.AutocompletePrediction) => {
    const address = suggestion.description;
    setValue(address, false);
    onChange(address);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      onAddressSelect(address, lat, lng);
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  return (
    <div className="space-y-3 relative">
      <label className="text-[10px] font-bold text-[#666666] uppercase tracking-[0.2em] ml-1">{label}</label>
      <div className="relative">
        <input
          value={inputValue}
          onChange={handleInput}
          disabled={!ready}
          placeholder={placeholder}
          className="w-full p-4 bg-[#121212] border border-white/5 rounded-[12px] focus:ring-1 focus:ring-white/20 outline-none transition-all text-sm text-white placeholder:text-[#666666]"
        />
      </div>
      
      {status === "OK" && (
        <ul className="absolute z-50 w-full bg-[#121212] mt-2 rounded-[12px] shadow-2xl border border-white/5 overflow-hidden py-2 backdrop-blur-xl">
          {data.map((suggestion) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
            } = suggestion;

            return (
              <li
                key={place_id}
                onClick={() => handleSelect(suggestion)}
                className="px-4 py-4 hover:bg-white/5 cursor-pointer flex items-center gap-4 transition-colors border-b border-white/5 last:border-none"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#666666] shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{main_text}</p>
                  <p className="text-[11px] text-[#666666] truncate mt-0.5">{secondary_text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
