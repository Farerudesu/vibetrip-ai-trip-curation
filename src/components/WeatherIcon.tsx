import React from 'react';
import { Sun, CloudRain, Wind, Cloud } from 'lucide-react';

export const WeatherIcon = ({ type, className }: { type: string; className?: string }) => {
  switch (type) {
    case 'sun': return <Sun className={className} />;
    case 'rain': return <CloudRain className={className} />;
    case 'wind': return <Wind className={className} />;
    default: return <Cloud className={className} />;
  }
};
