import { createContext, useContext, useState } from 'react';

const MUTE_LOCAL_STORAGE_KEY = 'audio_mute';

interface AudioSettingsContextType {
  isMuted: boolean;
  toggleMute: () => void;
}

const AudioSettingsContext = createContext<AudioSettingsContextType>({
  isMuted: false,
  toggleMute: () => {},
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

  const toggleMute = () => {
    setIsMuted(!isMuted);
    localStorage.setItem(MUTE_LOCAL_STORAGE_KEY, String(!isMuted));
  };

  return (
    <AudioSettingsContext.Provider value={{ isMuted, toggleMute }}>{children}</AudioSettingsContext.Provider>
  );
};
