import React from 'react';
import { TRANSLATIONS } from '../data/constants';

export const LanguageContext = React.createContext<{ 
  lang: 'en' | 'id', 
  setLang: (l: 'en' | 'id') => void,
  t: typeof TRANSLATIONS.en
}>({ 
  lang: 'en', 
  setLang: () => {},
  t: TRANSLATIONS.en
});
