import React, { createContext, useContext, useState, useEffect } from 'react';
import { CountryEnum } from '../types';

interface CountryContextType {
  country: CountryEnum;
  setCountry: (country: CountryEnum) => void;
  currency: string;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

const getDefaultCountry = (): CountryEnum => {
  const saved = localStorage.getItem('preferred_country');
  if (saved === 'IN' || saved === 'US') return saved as CountryEnum;
  
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'IN';
  } catch (e) {
    // Fallback if Intl is unavailable
  }
  return 'US';
};

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [country, setCountryState] = useState<CountryEnum>(getDefaultCountry);
  const currency = country === 'IN' ? 'INR' : 'USD';

  const setCountry = (c: CountryEnum) => {
    setCountryState(c);
    localStorage.setItem('preferred_country', c);
  };

  return (
    <CountryContext.Provider value={{ country, setCountry, currency }}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (!context) throw new Error('useCountry must be used within CountryProvider');
  return context;
};
