import React from 'react';

export interface HiddenGem {
  id: string;
  name: string;
  category: string;
  rating: number;
  description: string;
  image: string;
  location: { lat: number; lng: number };
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
}

export interface Activity {
  id: string;
  title: string;
  icon: React.ReactNode;
  vibe: string;
}

export interface ItineraryStep {
  time: string;
  location: string;
  note: string;
  type: 'drive' | 'stop' | 'activity';
  coord?: { lat: number; lng: number };
}

export interface HourlyWeather {
  time: string;
  temp: number;
  condition: string;
  icon: React.ReactNode;
  isPeakVibe?: boolean;
}
