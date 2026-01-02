import { createContext, useContext, useState } from 'react';

const MUTE_LOCAL_STORAGE_KEY = 'audio_mute';
const VOLUME_LOCAL_STORAGE_KEY = 'audio_volume';
const DEFAULT_VOLUME = 50;

interface AudioSettingsContextType {
  isMuted: boolean;
  toggleMute: () => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const AudioSettingsContext = createContext<AudioSettingsContextType>({
  isMuted: false,
  toggleMute: () => {},
  volume: DEFAULT_VOLUME,
  setVolume: () => {},
});

export const useAudioSettings = () => {
  const context = useContext(AudioSettingsContext);
  if (!context) {
    throw new Error('useAudioSettings must be used within a AudioSettingsProvider');
  }
  return context;
};

export const AudioSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem(MUTE_LOCAL_STORAGE_KEY) === 'true');
  const [volume, setVolume] = useState(
    () => Number(localStorage.getItem(VOLUME_LOCAL_STORAGE_KEY)) || DEFAULT_VOLUME
  );

  const toggleMute = () => {
    setIsMuted(!isMuted);
    localStorage.setItem(MUTE_LOCAL_STORAGE_KEY, String(!isMuted));
  };

  const handleSetVolume = (volume: number) => {
    setVolume(volume);
    localStorage.setItem(VOLUME_LOCAL_STORAGE_KEY, String(volume));
  };

  return (
    <AudioSettingsContext.Provider value={{ isMuted, toggleMute, volume, setVolume: handleSetVolume }}>
      {children}
    </AudioSettingsContext.Provider>
  );
};
