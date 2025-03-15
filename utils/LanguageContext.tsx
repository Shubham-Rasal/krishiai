import React, { createContext, useState, useContext, useEffect } from 'react';
import { I18n } from './i18n';
import { getPreferences } from './preferences';

interface LanguageContextType {
  i18n: I18n;
  changeLanguage: (language: string) => void;
  currentLanguage: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [i18n, setI18n] = useState(new I18n('en'));
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Load the language preference when the app starts
    const loadLanguagePreference = async () => {
      const prefs = await getPreferences();
      const savedLanguage = prefs.language || 'en';
      setCurrentLanguage(savedLanguage);
      setI18n(new I18n(savedLanguage));
    };

    loadLanguagePreference();
  }, []);

  const changeLanguage = (language: string) => {
    setCurrentLanguage(language);
    setI18n(new I18n(language));
  };

  return (
    <LanguageContext.Provider value={{ i18n, changeLanguage, currentLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 