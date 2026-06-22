import { create } from 'zustand';

export type WeatherCondition = 'sunny' | 'rain' | 'fog' | 'storm';
export type TimeOfDay = 'day' | 'golden' | 'night';

interface EnvironmentState {
  weather: WeatherCondition;
  timeOfDay: TimeOfDay;
  congestionModifier: number; // percentage modifier to congestion values
  setWeather: (weather: WeatherCondition) => void;
  setTimeOfDay: (time: TimeOfDay) => void;
}

const weatherModifiers: Record<WeatherCondition, number> = {
  sunny: 0,
  rain: 25,
  fog: 15,
  storm: 40,
};

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
  weather: 'sunny',
  timeOfDay: 'day',
  congestionModifier: 0,
  setWeather: (weather) => set({
    weather,
    congestionModifier: weatherModifiers[weather],
  }),
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
}));
